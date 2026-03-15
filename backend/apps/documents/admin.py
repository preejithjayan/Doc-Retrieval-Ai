from django.contrib import admin

from apps.documents.models import Document, DocumentChunk


class DocumentChunkInline(admin.TabularInline):
    model = DocumentChunk
    extra = 0
    readonly_fields = ('chunk_index', 'vector_id', 'created_at')


@admin.register(Document)
class DocumentAdmin(admin.ModelAdmin):
    list_display = ('file_name', 'uploaded_by', 'status', 'file_type', 'is_scanned', 'upload_time')
    search_fields = ('file_name', 'uploaded_by__email')
    list_filter = ('status', 'file_type', 'is_scanned')
    inlines = [DocumentChunkInline]


@admin.register(DocumentChunk)
class DocumentChunkAdmin(admin.ModelAdmin):
    list_display = ('document', 'chunk_index', 'vector_id', 'created_at')
    search_fields = ('document__file_name', 'chunk_text')
