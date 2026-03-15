from django.urls import path

from apps.chatbot.views import ChatHistoryView, ChatQueryView

urlpatterns = [
    path('query', ChatQueryView.as_view(), name='chat-query'),
    path('history', ChatHistoryView.as_view(), name='chat-history'),
]
