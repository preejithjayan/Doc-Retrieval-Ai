import uuid

from django.conf import settings
from django.db import models

from utils.file_utils import document_upload_path


class Document(models.Model):
    class Status(models.TextChoices):
        UPLOADED = 'UPLOADED', 'Uploaded'
        PROCESSING = 'PROCESSING', 'Processing'
        PROCESSED = 'PROCESSED', 'Processed'
        FAILED = 'FAILED', 'Failed'

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    file_name = models.CharField(max_length=255)
    file_path = models.FileField(upload_to=document_upload_path)
    uploaded_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='documents')
    upload_time = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    status = models.CharField(max_length=32, choices=Status.choices, default=Status.UPLOADED)
    file_type = models.CharField(max_length=32, blank=True)
    is_scanned = models.BooleanField(default=False)
    extracted_text = models.TextField(blank=True)
    cleaned_text = models.TextField(blank=True)
    processing_log = models.TextField(blank=True)
    processing_progress = models.PositiveSmallIntegerField(default=0)
    chunk_count = models.PositiveIntegerField(default=0)
    metadata = models.JSONField(default=dict, blank=True)

    class Meta:
        ordering = ['-upload_time']

    def __str__(self):
        return self.file_name


class DocumentChunk(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    document = models.ForeignKey(Document, on_delete=models.CASCADE, related_name='chunks')
    chunk_text = models.TextField()
    chunk_index = models.PositiveIntegerField()
    embedding_vector = models.JSONField(default=list, blank=True)
    vector_id = models.CharField(max_length=255, blank=True)
    metadata = models.JSONField(default=dict, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['document', 'chunk_index']
        unique_together = ('document', 'chunk_index')

    def __str__(self):
        return f'{self.document.file_name} [{self.chunk_index}]'
