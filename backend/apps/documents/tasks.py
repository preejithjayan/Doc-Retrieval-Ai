from celery import shared_task

from apps.documents.models import Document
from services.document_pipeline import DocumentPipelineService


@shared_task(bind=True, autoretry_for=(Exception,), retry_backoff=True, max_retries=3)
def process_document_task(self, document_id):
    document = Document.objects.get(pk=document_id)
    try:
        processed = DocumentPipelineService().process_document(document)
        return {'document_id': str(processed.id), 'status': processed.status}
    except Exception as exc:
        document.status = Document.Status.FAILED
        document.processing_log = f'Processing failed: {exc}'
        document.processing_progress = 100
        document.save(update_fields=['status', 'processing_log', 'processing_progress', 'updated_at'])
        raise
