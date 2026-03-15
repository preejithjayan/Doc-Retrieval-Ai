import uuid

from django.db import models


class ActiveModel(models.Model):
    class ModelType(models.TextChoices):
        HIGH_END = 'HIGH_END', 'High End'
        LOW_END = 'LOW_END', 'Low End'

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    model_name = models.CharField(max_length=120, unique=True)
    model_type = models.CharField(max_length=32, choices=ModelType.choices)
    hardware_requirement = models.CharField(max_length=255)
    identifier = models.CharField(max_length=255)
    provider = models.CharField(max_length=64, default='huggingface')
    temperature = models.FloatField(default=0.1)
    max_tokens = models.PositiveIntegerField(default=350)
    is_active = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-is_active', 'model_type', 'model_name']

    def __str__(self):
        state = 'active' if self.is_active else 'inactive'
        return f'{self.model_name} ({state})'
