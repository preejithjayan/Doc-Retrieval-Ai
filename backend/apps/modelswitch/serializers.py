from rest_framework import serializers

from apps.modelswitch.models import ActiveModel


class ActiveModelSerializer(serializers.ModelSerializer):
    class Meta:
        model = ActiveModel
        fields = [
            'id',
            'model_name',
            'model_type',
            'hardware_requirement',
            'identifier',
            'provider',
            'temperature',
            'max_tokens',
            'is_active',
        ]


class SwitchModelSerializer(serializers.Serializer):
    model_name = serializers.CharField()
