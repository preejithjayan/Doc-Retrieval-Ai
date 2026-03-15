from rest_framework.response import Response
from rest_framework.views import APIView

from apps.chatbot.serializers import ChatHistorySerializer, ChatQuerySerializer
from core.pagination import StandardResultsSetPagination
from core.permissions import IsViewerOrAbove
from services.rag_service import RAGService


class ChatQueryView(APIView):
    permission_classes = [IsViewerOrAbove]

    def post(self, request):
        serializer = ChatQuerySerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        payload = RAGService().answer_query(
            user=request.user,
            query=serializer.validated_data['query'],
            top_k=serializer.validated_data['top_k'],
            conversation_id=serializer.validated_data.get('conversation_id') or None,
            document_id=serializer.validated_data.get('document_id'),
        )
        return Response({'success': True, **payload})


class ChatHistoryView(APIView):
    permission_classes = [IsViewerOrAbove]

    def get(self, request):
        history = RAGService().get_history(
            request.user,
            conversation_id=request.query_params.get('conversation_id'),
        )
        paginator = StandardResultsSetPagination()
        page = paginator.paginate_queryset(history, request)
        serialized = ChatHistorySerializer(page, many=True).data
        return paginator.get_paginated_response(serialized)
