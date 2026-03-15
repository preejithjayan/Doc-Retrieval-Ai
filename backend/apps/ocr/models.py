import uuid

from django.db import models


class OCRResult(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    document = models.OneToOneField('documents.Document', on_delete=models.CASCADE, related_name='ocr_result')
    extracted_text = models.TextField()
    confidence_score = models.FloatField(default=0)
    structured_output = models.JSONField(default=dict, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f'OCR for {self.document.file_name}'
