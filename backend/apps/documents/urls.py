from django.urls import path

from apps.documents.views import (
    DocumentDetailView,
    DocumentListView,
    DocumentProcessView,
    DocumentUploadView,
    SemanticSearchView,
)

urlpatterns = [
    path('upload', DocumentUploadView.as_view(), name='document-upload'),
    path('list', DocumentListView.as_view(), name='document-list'),
    path('search', SemanticSearchView.as_view(), name='document-search'),
    path('process', DocumentProcessView.as_view(), name='document-process'),
    path('<uuid:pk>', DocumentDetailView.as_view(), name='document-detail'),
]
