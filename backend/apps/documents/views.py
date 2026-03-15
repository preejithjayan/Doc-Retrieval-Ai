from django.db.models import Q
from django.shortcuts import get_object_or_404
from django.utils.dateparse import parse_date
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import filters
from rest_framework import generics, status
from rest_framework.exceptions import ValidationError
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.documents.models import Document
from apps.documents.serializers import (
    DocumentProcessSerializer,
    DocumentSerializer,
    DocumentUploadSerializer,
    SemanticSearchSerializer,
)
from apps.documents.tasks import process_document_task
from core.pagination import StandardResultsSetPagination
from core.permissions import IsAnalystOrAbove, IsManagerOrAbove, IsViewerOrAbove
from services.document_pipeline import DocumentPipelineService
from services.rag_service import RAGService


class DocumentQueryMixin:
    def get_filtered_queryset(self):
        queryset = Document.objects.select_related('uploaded_by').all()
        query = (self.request.query_params.get('q') or self.request.query_params.get('search') or '').strip()
        status_filter = (self.request.query_params.get('status') or '').strip().upper()
        file_type = (self.request.query_params.get('file_type') or '').strip().lower()
        date_from = parse_date(self.request.query_params.get('date_from') or '')
        date_to = parse_date(self.request.query_params.get('date_to') or '')

        if query:
            queryset = queryset.filter(
                Q(file_name__icontains=query) | Q(uploaded_by__email__icontains=query)
            )
        if status_filter and status_filter != 'ALL':
            queryset = queryset.filter(status=status_filter)
        if file_type and file_type != 'all':
            queryset = queryset.filter(file_type__iexact=file_type)
        if date_from:
            queryset = queryset.filter(upload_time__date__gte=date_from)
        if date_to:
            queryset = queryset.filter(upload_time__date__lte=date_to)
        return queryset


class DocumentUploadView(generics.CreateAPIView):
    serializer_class = DocumentUploadSerializer
    permission_classes = [IsAnalystOrAbove]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        document = serializer.save()
        return Response({'success': True, 'document': DocumentSerializer(document).data}, status=status.HTTP_201_CREATED)


class DocumentListView(DocumentQueryMixin, generics.ListAPIView):
    serializer_class = DocumentSerializer
    permission_classes = [IsViewerOrAbove]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['status', 'file_type', 'is_scanned']
    search_fields = ['file_name', 'uploaded_by__email']
    ordering_fields = ['upload_time', 'status', 'file_name']

    def get_queryset(self):
        return self.get_filtered_queryset()


class DocumentDetailView(generics.RetrieveDestroyAPIView):
    queryset = Document.objects.select_related('uploaded_by').prefetch_related('chunks').all()
    serializer_class = DocumentSerializer

    def get_permissions(self):
        if self.request.method == 'DELETE':
            return [IsManagerOrAbove()]
        return [IsViewerOrAbove()]


class DocumentProcessView(APIView):
    permission_classes = [IsAnalystOrAbove]

    def post(self, request):
        serializer = DocumentProcessSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        document = get_object_or_404(Document, pk=serializer.validated_data['document_id'])
        if serializer.validated_data['run_async']:
            task = process_document_task.delay(str(document.id))
            document.metadata = {**document.metadata, 'task_id': task.id}
            document.save(update_fields=['metadata', 'updated_at'])
            return Response({'success': True, 'task_id': task.id, 'document_id': str(document.id)})

        try:
            processed = DocumentPipelineService().process_document(document)
        except Exception as exc:
            document.status = Document.Status.FAILED
            document.processing_progress = 100
            document.processing_log = f'Processing failed: {exc}'
            document.save(update_fields=['status', 'processing_progress', 'processing_log', 'updated_at'])
            raise ValidationError({'detail': str(exc)}) from exc
        return Response({'success': True, 'document': DocumentSerializer(processed).data})


class SemanticSearchView(DocumentQueryMixin, APIView):
    permission_classes = [IsViewerOrAbove]

    def get(self, request):
        semantic_query = (request.query_params.get('query') or '').strip()
        if semantic_query:
            serializer = SemanticSearchSerializer(data=request.query_params)
            serializer.is_valid(raise_exception=True)
            results = RAGService().semantic_search(
                serializer.validated_data['query'],
                top_k=serializer.validated_data['top_k'],
                document_id=request.query_params.get('document_id'),
            )
            return Response({'success': True, 'results': results})

        paginator = StandardResultsSetPagination()
        queryset = self.get_filtered_queryset()
        page = paginator.paginate_queryset(queryset, request)
        serializer = DocumentSerializer(page, many=True, context={'request': request})
        return paginator.get_paginated_response(serializer.data)
