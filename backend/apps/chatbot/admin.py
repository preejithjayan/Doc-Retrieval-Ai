from django.contrib import admin

from apps.chatbot.models import ChatHistory


@admin.register(ChatHistory)
class ChatHistoryAdmin(admin.ModelAdmin):
    list_display = ('user', 'model_name', 'conversation_id', 'timestamp')
    search_fields = ('user__email', 'query', 'response')
