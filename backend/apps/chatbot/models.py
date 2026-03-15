import uuid

from django.conf import settings
from django.db import models


class ChatHistory(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='chat_history')
    conversation_id = models.CharField(max_length=64, db_index=True)
    query = models.TextField()
    response = models.TextField()
    citations = models.JSONField(default=list, blank=True)
    model_name = models.CharField(max_length=120, blank=True)
    response_time_ms = models.FloatField(null=True, blank=True)
    timestamp = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-timestamp']

    def __str__(self):
        return f'{self.user.email} @ {self.timestamp:%Y-%m-%d %H:%M}'
