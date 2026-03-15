from rest_framework import serializers


class CreateEmbeddingSerializer(serializers.Serializer):
    document_id = serializers.UUIDField()
