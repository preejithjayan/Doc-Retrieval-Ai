from rest_framework import serializers

from apps.documents.models import Document, DocumentChunk
from utils.file_utils import ALLOWED_EXTENSIONS


class DocumentUploadSerializer(serializers.ModelSerializer):
    class Meta:
        model = Document
        fields = ['id', 'file_path']

    def validate_file_path(self, file):
        extension = '.' + file.name.split('.')[-1].lower()
        if extension not in ALLOWED_EXTENSIONS:
            raise serializers.ValidationError('Unsupported file type.')
        if file.size > 25 * 1024 * 1024:
            raise serializers.ValidationError('Maximum file size is 25MB.')
        return file

    def create(self, validated_data):
        file = validated_data['file_path']
        return Document.objects.create(
            file_name=file.name,
            file_path=file,
            uploaded_by=self.context['request'].user,
        )


class DocumentChunkSerializer(serializers.ModelSerializer):
    class Meta:
        model = DocumentChunk
        fields = ['id', 'chunk_index', 'chunk_text', 'metadata']


class DocumentSerializer(serializers.ModelSerializer):
    uploaded_by_email = serializers.EmailField(source='uploaded_by.email', read_only=True)
    chunks = DocumentChunkSerializer(many=True, read_only=True)
    file_size = serializers.SerializerMethodField()
    file_url = serializers.SerializerMethodField()
    file_extension = serializers.SerializerMethodField()
    has_embeddings = serializers.SerializerMethodField()

    class Meta:
        model = Document
        fields = [
            'id',
            'file_name',
            'file_path',
            'file_url',
            'file_extension',
            'file_size',
            'uploaded_by',
            'uploaded_by_email',
            'upload_time',
            'updated_at',
            'status',
            'file_type',
            'is_scanned',
            'extracted_text',
            'cleaned_text',
            'processing_log',
            'processing_progress',
            'chunk_count',
            'has_embeddings',
            'metadata',
            'chunks',
        ]

    def get_file_size(self, obj):
        try:
            return obj.file_path.size
        except Exception:
            return 0

    def get_file_url(self, obj):
        request = self.context.get('request')
        try:
            url = obj.file_path.url
        except Exception:
            return None
        return request.build_absolute_uri(url) if request else url

    def get_file_extension(self, obj):
        parts = obj.file_name.rsplit('.', 1)
        if len(parts) < 2:
            return ''
        return parts[-1].lower()

    def get_has_embeddings(self, obj):
        return obj.chunk_count > 0


class DocumentProcessSerializer(serializers.Serializer):
    document_id = serializers.UUIDField(required=True)
    run_async = serializers.BooleanField(default=True)


class SemanticSearchSerializer(serializers.Serializer):
    query = serializers.CharField()
    top_k = serializers.IntegerField(default=5, min_value=1, max_value=20)
