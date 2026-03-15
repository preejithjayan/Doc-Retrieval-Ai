from rest_framework.response import Response
from rest_framework.views import APIView

from apps.documents.models import Document
from apps.embeddings.serializers import CreateEmbeddingSerializer
from core.permissions import IsAnalystOrAbove
from services.document_pipeline import DocumentPipelineService


class CreateEmbeddingView(APIView):
    permission_classes = [IsAnalystOrAbove]

    def post(self, request):
        serializer = CreateEmbeddingSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        document = Document.objects.get(pk=serializer.validated_data['document_id'])
        processed = DocumentPipelineService().process_document(document)
        return Response({'success': True, 'document_id': str(processed.id), 'chunk_count': processed.chunk_count})
