import uuid
from time import perf_counter

from apps.chatbot.models import ChatHistory
from services.embedding_service import EmbeddingService
from services.model_router import ModelRouterService
from services.vector_store import VectorStoreService


class RAGService:
    def __init__(self):
        self.embedding_service = EmbeddingService()
        self.vector_store = VectorStoreService()
        self.model_router = ModelRouterService()

    def semantic_search(self, query, top_k=5, document_id=None):
        query_vector = self.embedding_service.create_embeddings([query])[0]
        where = {'document_id': str(document_id)} if document_id else None
        results = self.vector_store.query(query_vector, top_k=top_k, where=where)
        citations = []
        for item in results:
            metadata = item['metadata'] or {}
            citations.append(
                {
                    'document_id': metadata.get('document_id'),
                    'file_name': metadata.get('file_name'),
                    'chunk_index': metadata.get('chunk_index'),
                    'reference': f"Chunk {metadata.get('chunk_index', 0) + 1}",
                    'score': item['score'],
                    'snippet': item['text'][:400],
                }
            )
        return citations

    def answer_query(self, user, query, top_k=5, conversation_id=None, document_id=None):
        conversation_id = conversation_id or str(uuid.uuid4())
        citations = self.semantic_search(query, top_k=top_k, document_id=document_id)
        context = "\n\n".join(
            f"[{citation['file_name']} chunk {citation['chunk_index']}] {citation['snippet']}"
            for citation in citations
        )
        memory_items = list(
            ChatHistory.objects.filter(user=user, conversation_id=conversation_id)
            .order_by('-timestamp')[:5]
            .values('query', 'response')
        )
        memory_items.reverse()
        memory_text = "\n".join(
            f"User: {item['query']}\nAssistant: {item['response']}" for item in memory_items
        )
        prompt = (
            'You are a retrieval-augmented assistant. Use only the supplied document context when answering. '
            'If the answer is not in the context, say so clearly. Cite documents by filename when possible.\n\n'
            f"Conversation Memory:\n{memory_text or 'No prior turns.'}\n\n"
            f"Document Context:\n{context or 'No matching context found.'}\n\n"
            f"Question:\n{query}\n\n"
            'Answer:'
        )
        current_model = self.model_router.get_current_model()
        started_at = perf_counter()
        answer = self.model_router.generate(prompt, citations=citations)
        response_time_ms = round((perf_counter() - started_at) * 1000, 2)
        history = ChatHistory.objects.create(
            user=user,
            query=query,
            response=answer,
            conversation_id=conversation_id,
            citations=citations,
            model_name=current_model.model_name if current_model else 'Distilled',
            response_time_ms=response_time_ms,
        )
        return {
            'conversation_id': conversation_id,
            'answer': answer,
            'citations': citations,
            'history_id': str(history.id),
            'model_name': history.model_name,
            'response_time_ms': response_time_ms,
        }

    def get_history(self, user, conversation_id=None):
        history = ChatHistory.objects.filter(user=user)
        if conversation_id:
            history = history.filter(conversation_id=conversation_id)
        return history.order_by('-timestamp')
