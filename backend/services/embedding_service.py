from functools import lru_cache

from django.conf import settings

from services.chunking import chunk_text


@lru_cache(maxsize=1)
def get_embedding_model():
    from sentence_transformers import SentenceTransformer

    return SentenceTransformer(settings.EMBEDDING_MODEL_NAME)


class EmbeddingService:
    def create_embeddings(self, texts):
        if not texts:
            return []
        model = get_embedding_model()
        vectors = model.encode(texts, normalize_embeddings=True)
        return [vector.tolist() for vector in vectors]

    def chunk_and_embed(self, text):
        chunks = chunk_text(text)
        embeddings = self.create_embeddings(chunks)
        return chunks, embeddings
