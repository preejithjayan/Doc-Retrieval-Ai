from django.urls import path

from apps.authentication.views import (
    LoginView,
    LogoutView,
    PasswordResetConfirmView,
    PasswordResetRequestView,
    RefreshView,
    RegisterView,
    SessionValidationView,
)

urlpatterns = [
    path('register', RegisterView.as_view(), name='auth-register'),
    path('login', LoginView.as_view(), name='auth-login'),
    path('logout', LogoutView.as_view(), name='auth-logout'),
    path('refresh', RefreshView.as_view(), name='auth-refresh'),
    path('password-reset', PasswordResetRequestView.as_view(), name='auth-password-reset'),
    path('password-reset/confirm', PasswordResetConfirmView.as_view(), name='auth-password-reset-confirm'),
    path('session', SessionValidationView.as_view(), name='auth-session'),
]
