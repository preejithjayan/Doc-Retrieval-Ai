from collections import Counter
from datetime import timedelta

from django.contrib.auth import get_user_model
from django.db.models import Avg, Count
from django.db.models.functions import TruncDate, TruncWeek
from django.utils import timezone
from django.utils.dateparse import parse_date
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.chatbot.models import ChatHistory
from apps.documents.models import Document
from core.permissions import IsViewerOrAbove
from services.model_router import ModelRouterService

User = get_user_model()


class AnalyticsOverviewView(APIView):
    permission_classes = [IsViewerOrAbove]

    def _get_storage_used_bytes(self):
        total = 0
        for document in Document.objects.only('file_path'):
            try:
                total += document.file_path.size
            except Exception:
                continue
        return total

    def _get_date_window(self):
        now = timezone.now()
        date_from = parse_date(self.request.query_params.get('date_from') or '') or (now.date() - timedelta(days=29))
        date_to = parse_date(self.request.query_params.get('date_to') or '') or now.date()
        return date_from, date_to

    def get(self, request):
        now = timezone.now()
        date_from, date_to = self._get_date_window()
        twelve_weeks_ago = now - timedelta(weeks=11)
        chats_in_range = ChatHistory.objects.filter(timestamp__date__gte=date_from, timestamp__date__lte=date_to)
        documents_in_range = Document.objects.filter(upload_time__date__gte=date_from, upload_time__date__lte=date_to)
        documents_by_status = list(Document.objects.values('status').annotate(total=Count('id')).order_by())
        users_by_role = list(User.objects.values('role__code').annotate(total=Count('id')).order_by())
        queries_per_day = list(
            chats_in_range
            .annotate(day=TruncDate('timestamp'))
            .values('day')
            .annotate(total=Count('id'))
            .order_by('day')
        )
        documents_per_week = list(
            Document.objects.filter(upload_time__gte=twelve_weeks_ago)
            .annotate(week=TruncWeek('upload_time'))
            .values('week')
            .annotate(total=Count('id'))
            .order_by('week')
        )
        queries_by_model = list(
            chats_in_range.exclude(model_name='')
            .values('model_name')
            .annotate(total=Count('id'))
            .order_by('-total')
        )
        recent_chats = list(
            ChatHistory.objects.select_related('user')
            .order_by('-timestamp')[:5]
            .values('id', 'conversation_id', 'query', 'timestamp', 'model_name', 'user__email', 'citations')
        )
        recent_documents = list(
            Document.objects.select_related('uploaded_by')
            .order_by('-upload_time')[:5]
            .values('id', 'file_name', 'upload_time', 'status', 'uploaded_by__email', 'file_type', 'chunk_count')
        )
        top_documents_counter = Counter()
        for chat in chats_in_range.values('citations'):
            for citation in chat['citations'] or []:
                key = citation.get('file_name') or citation.get('document_id')
                if key:
                    top_documents_counter[key] += 1
        top_retrieved_documents = [
            {'label': name, 'total': total}
            for name, total in top_documents_counter.most_common(5)
        ]
        recent_activity = sorted(
            [
                {
                    'id': f"chat-{item['id']}",
                    'type': 'chat_query',
                    'title': item['query'],
                    'actor': item['user__email'],
                    'meta': item['model_name'],
                    'timestamp': item['timestamp'],
                }
                for item in recent_chats
            ]
            + [
                {
                    'id': f"document-{item['id']}",
                    'type': 'document_upload',
                    'title': item['file_name'],
                    'actor': item['uploaded_by__email'],
                    'meta': item['status'],
                    'timestamp': item['upload_time'],
                }
                for item in recent_documents
            ],
            key=lambda item: item['timestamp'],
            reverse=True,
        )[:5]
        model = ModelRouterService().get_current_model()
        average_response_time = ChatHistory.objects.exclude(response_time_ms__isnull=True).aggregate(avg=Avg('response_time_ms'))['avg']
        return Response(
            {
                'success': True,
                'overview': {
                    'total_users': User.objects.count(),
                    'active_users': User.objects.filter(is_active=True).count(),
                    'total_documents': Document.objects.count(),
                    'processed_documents': Document.objects.filter(status=Document.Status.PROCESSED).count(),
                    'chat_queries': ChatHistory.objects.count(),
                    'queries_today': ChatHistory.objects.filter(timestamp__date=now.date()).count(),
                    'active_model': model.model_name if model else None,
                    'average_response_time_ms': round(average_response_time, 2) if average_response_time else 0,
                    'storage_used_bytes': self._get_storage_used_bytes(),
                    'date_from': date_from.isoformat(),
                    'date_to': date_to.isoformat(),
                },
                'documents_by_status': documents_by_status,
                'users_by_role': users_by_role,
                'queries_per_day': [
                    {'date': item['day'].isoformat(), 'total': item['total']}
                    for item in queries_per_day
                ],
                'documents_per_week': [
                    {'week': item['week'].date().isoformat(), 'total': item['total']}
                    for item in documents_per_week
                ],
                'queries_by_model': [
                    {'model_name': item['model_name'] or 'Unknown', 'total': item['total']}
                    for item in queries_by_model
                ],
                'queries_over_time': [
                    {'date': item['day'].isoformat(), 'total': item['total']}
                    for item in queries_per_day
                ],
                'model_usage_distribution': [
                    {'label': item['model_name'] or 'Unknown', 'total': item['total']}
                    for item in queries_by_model
                ],
                'top_retrieved_documents': top_retrieved_documents,
                'recent_documents': recent_documents,
                'recent_queries': recent_chats,
                'recent_activity': recent_activity,
                'documents_uploaded_in_range': documents_in_range.count(),
                'queries_in_range': chats_in_range.count(),
            }
        )
