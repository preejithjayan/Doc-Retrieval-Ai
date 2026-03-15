from django.urls import path

from apps.users.views import CurrentUserView, UserDetailView, UserListCreateView

urlpatterns = [
    path('me', CurrentUserView.as_view(), name='current-user'),
    path('', UserListCreateView.as_view(), name='user-list-create'),
    path('<uuid:pk>', UserDetailView.as_view(), name='user-detail'),
]
