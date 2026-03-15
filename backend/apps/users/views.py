from django.contrib.auth import get_user_model
from rest_framework import generics

from apps.users.serializers import ProfileSerializer, UserManagementSerializer, UserSerializer
from core.permissions import IsAdmin, IsViewerOrAbove

User = get_user_model()


class CurrentUserView(generics.RetrieveUpdateAPIView):
    serializer_class = ProfileSerializer
    permission_classes = [IsViewerOrAbove]

    def get_object(self):
        return self.request.user


class UserListCreateView(generics.ListCreateAPIView):
    serializer_class = UserManagementSerializer
    permission_classes = [IsAdmin]
    search_fields = ['email', 'first_name', 'last_name', 'role__code']
    ordering_fields = ['created_at', 'email']

    def get_queryset(self):
        queryset = User.objects.select_related('role').all()
        role = (self.request.query_params.get('role') or '').strip().upper()
        if role and role != 'ALL':
            queryset = queryset.filter(role__code=role)
        return queryset


class UserDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = User.objects.select_related('role').all()
    serializer_class = UserManagementSerializer
    permission_classes = [IsAdmin]
