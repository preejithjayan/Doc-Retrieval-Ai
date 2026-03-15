from django.contrib import admin

from apps.ocr.models import OCRResult


@admin.register(OCRResult)
class OCRResultAdmin(admin.ModelAdmin):
    list_display = ('document', 'confidence_score', 'created_at')
    search_fields = ('document__file_name', 'extracted_text')
