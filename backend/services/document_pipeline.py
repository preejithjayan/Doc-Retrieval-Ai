from django.db import transaction

from apps.documents.models import Document, DocumentChunk
from apps.ocr.models import OCRResult
from services.document_parser import DocumentParserService
from services.embedding_service import EmbeddingService
from services.vector_store import VectorStoreService


class DocumentPipelineService:
    def __init__(self):
        self.parser = DocumentParserService()
        self.embedding_service = EmbeddingService()
        self.vector_store = VectorStoreService()

    @transaction.atomic
    def process_document(self, document):
        document.status = Document.Status.PROCESSING
        document.processing_progress = 10
        document.processing_log = 'Starting ingestion pipeline.'
        document.save(update_fields=['status', 'processing_progress', 'processing_log', 'updated_at'])

        extraction = self.parser.extract(document)
        if not extraction.normalized_text:
            raise ValueError('No text could be extracted from the supplied file.')

        chunks, embeddings = self.embedding_service.chunk_and_embed(extraction.normalized_text)
        if not chunks:
            raise ValueError('Document was parsed but no chunks were produced.')

        DocumentChunk.objects.filter(document=document).delete()
        self.vector_store.delete_document_chunks(document.id)
        vector_ids = self.vector_store.upsert_chunks(document, chunks, embeddings)

        chunk_objects = [
            DocumentChunk(
                document=document,
                chunk_text=chunk,
                chunk_index=index,
                embedding_vector=embedding,
                vector_id=vector_ids[index],
                metadata={'length': len(chunk)},
            )
            for index, (chunk, embedding) in enumerate(zip(chunks, embeddings))
        ]
        DocumentChunk.objects.bulk_create(chunk_objects)

        if extraction.used_ocr:
            OCRResult.objects.update_or_create(
                document=document,
                defaults={
                    'extracted_text': extraction.normalized_text,
                    'confidence_score': extraction.ocr_confidence or 0,
                    'structured_output': extraction.ocr_payload or {},
                },
            )

        document.file_type = extraction.file_type or document.file_type
        document.extracted_text = extraction.raw_text
        document.cleaned_text = extraction.normalized_text
        document.is_scanned = extraction.used_ocr
        document.chunk_count = len(chunks)
        document.status = Document.Status.PROCESSED
        document.processing_progress = 100
        document.processing_log = f'Processed successfully. Generated {len(chunks)} chunks.'
        document.metadata = {
            **document.metadata,
            'used_ocr': extraction.used_ocr,
            'ocr_confidence': extraction.ocr_confidence,
        }
        document.save()
        return document
