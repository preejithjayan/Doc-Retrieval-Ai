from django.contrib.auth import get_user_model
from rest_framework import serializers

from apps.users.models import Role

User = get_user_model()


class RoleSerializer(serializers.ModelSerializer):
    class Meta:
        model = Role
        fields = ['id', 'code', 'name', 'description', 'priority']


class UserSerializer(serializers.ModelSerializer):
    role = RoleSerializer(read_only=True)
    role_code = serializers.CharField(source='role.code', read_only=True)
    full_name = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ['id', 'email', 'first_name', 'last_name', 'full_name', 'role', 'role_code', 'created_at', 'last_login']

    def get_full_name(self, obj):
        full_name = f'{obj.first_name} {obj.last_name}'.strip()
        return full_name or obj.email.split('@')[0]


class UserManagementSerializer(serializers.ModelSerializer):
    role_code = serializers.ChoiceField(choices=Role.Code.choices, write_only=True)
    role = RoleSerializer(read_only=True)
    password = serializers.CharField(write_only=True, required=False, min_length=8)
    full_name = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = User
        fields = [
            'id',
            'email',
            'first_name',
            'last_name',
            'full_name',
            'password',
            'role',
            'role_code',
            'is_active',
            'created_at',
            'last_login',
        ]
        read_only_fields = ['id', 'created_at']

    def get_full_name(self, obj):
        full_name = f'{obj.first_name} {obj.last_name}'.strip()
        return full_name or obj.email.split('@')[0]

    def create(self, validated_data):
        role_code = validated_data.pop('role_code')
        password = validated_data.pop('password', None) or 'ChangeMe123!'
        role = Role.objects.get(code=role_code)
        return User.objects.create_user(password=password, role=role, **validated_data)

    def update(self, instance, validated_data):
        role_code = validated_data.pop('role_code', None)
        password = validated_data.pop('password', None)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        if role_code:
            instance.role = Role.objects.get(code=role_code)
        if password:
            instance.set_password(password)
        instance.save()
        return instance


class ProfileSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=False, min_length=8)
    role = RoleSerializer(read_only=True)
    role_code = serializers.CharField(source='role.code', read_only=True)
    full_name = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = User
        fields = [
            'id',
            'email',
            'first_name',
            'last_name',
            'full_name',
            'password',
            'role',
            'role_code',
            'created_at',
            'last_login',
        ]
        read_only_fields = ['id', 'role', 'role_code', 'created_at']

    def get_full_name(self, obj):
        full_name = f'{obj.first_name} {obj.last_name}'.strip()
        return full_name or obj.email.split('@')[0]

    def update(self, instance, validated_data):
        password = validated_data.pop('password', None)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        if password:
            instance.set_password(password)
        instance.save()
        return instance
