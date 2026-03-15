from django.conf import settings
from django.contrib.auth import get_user_model
from django.contrib.auth.tokens import default_token_generator
from django.core.mail import send_mail
from django.utils.encoding import force_bytes, force_str
from django.utils.http import urlsafe_base64_decode, urlsafe_base64_encode
from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework_simplejwt.tokens import RefreshToken

from apps.users.models import Role
from apps.users.serializers import UserSerializer

User = get_user_model()


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)
    confirm_password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ['email', 'first_name', 'last_name', 'password', 'confirm_password']

    def validate(self, attrs):
        if attrs['password'] != attrs['confirm_password']:
            raise serializers.ValidationError({'confirm_password': 'Passwords do not match.'})
        return attrs

    def create(self, validated_data):
        validated_data.pop('confirm_password')
        viewer_role = Role.objects.filter(code=Role.Code.VIEWER).first()
        return User.objects.create_user(role=viewer_role, **validated_data)


class LoginSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        token['email'] = user.email
        token['role'] = user.role_code
        return token

    def validate(self, attrs):
        data = super().validate(attrs)
        data['user'] = UserSerializer(self.user).data
        return data


class LogoutSerializer(serializers.Serializer):
    refresh = serializers.CharField()

    def save(self, **kwargs):
        try:
            token = RefreshToken(self.validated_data['refresh'])
            token.blacklist()
        except Exception as exc:
            raise serializers.ValidationError({'refresh': 'Invalid refresh token.'}) from exc


class PasswordResetRequestSerializer(serializers.Serializer):
    email = serializers.EmailField()

    def save(self):
        user = User.objects.filter(email=self.validated_data['email']).first()
        if not user:
            return
        uid = urlsafe_base64_encode(force_bytes(user.pk))
        token = default_token_generator.make_token(user)
        reset_url = f"{settings.FRONTEND_URL}/password-reset/confirm?uid={uid}&token={token}"
        send_mail(
            subject='Reset your password',
            message=f'Use this link to reset your password: {reset_url}',
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[self.validated_data['email']],
            fail_silently=True,
        )


class PasswordResetConfirmSerializer(serializers.Serializer):
    uid = serializers.CharField()
    token = serializers.CharField()
    new_password = serializers.CharField(min_length=8)

    def save(self):
        try:
            uid = force_str(urlsafe_base64_decode(self.validated_data['uid']))
            user = User.objects.get(pk=uid)
        except Exception as exc:
            raise serializers.ValidationError({'uid': 'Invalid password reset link.'}) from exc
        if not default_token_generator.check_token(user, self.validated_data['token']):
            raise serializers.ValidationError({'token': 'Invalid or expired token.'})
        user.set_password(self.validated_data['new_password'])
        user.save(update_fields=['password'])
        return user
