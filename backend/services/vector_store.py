from django.conf import settings


class VectorStoreService:
    collection_name = 'document_chunks'

    def __init__(self):
        import chromadb

        self.client = chromadb.PersistentClient(path=settings.CHROMA_DIR)
        self.collection = self.client.get_or_create_collection(name=self.collection_name)

    def upsert_chunks(self, document, chunks, embeddings):
        ids = [f'{document.id}:{index}' for index in range(len(chunks))]
        metadatas = [
            {
                'document_id': str(document.id),
                'file_name': document.file_name,
                'chunk_index': index,
                'uploaded_by': document.uploaded_by.email,
            }
            for index in range(len(chunks))
        ]
        self.collection.upsert(ids=ids, documents=chunks, embeddings=embeddings, metadatas=metadatas)
        return ids

    def delete_document_chunks(self, document_id):
        self.collection.delete(where={'document_id': str(document_id)})

    def query(self, query_embedding, top_k=5, where=None):
        results = self.collection.query(query_embeddings=[query_embedding], n_results=top_k, where=where or None)
        matches = []
        documents = results.get('documents', [[]])[0]
        metadatas = results.get('metadatas', [[]])[0]
        distances = results.get('distances', [[]])[0]
        ids = results.get('ids', [[]])[0]
        for document, metadata, distance, item_id in zip(documents, metadatas, distances, ids):
            matches.append(
                {
                    'id': item_id,
                    'text': document,
                    'metadata': metadata,
                    'score': round(1 / (1 + float(distance)), 4),
                }
            )
        return matches
