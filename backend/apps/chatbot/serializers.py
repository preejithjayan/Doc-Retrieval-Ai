from rest_framework import serializers

from apps.chatbot.models import ChatHistory


class ChatQuerySerializer(serializers.Serializer):
    query = serializers.CharField()
    top_k = serializers.IntegerField(default=5, min_value=1, max_value=20)
    conversation_id = serializers.CharField(required=False, allow_blank=True)
    document_id = serializers.UUIDField(required=False, allow_null=True)


class ChatHistorySerializer(serializers.ModelSerializer):
    class Meta:
        model = ChatHistory
        fields = ['id', 'conversation_id', 'query', 'response', 'citations', 'model_name', 'response_time_ms', 'timestamp']
