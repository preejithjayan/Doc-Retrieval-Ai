from django.urls import path

from apps.embeddings.views import CreateEmbeddingView

urlpatterns = [
    path('create', CreateEmbeddingView.as_view(), name='embedding-create'),
]
