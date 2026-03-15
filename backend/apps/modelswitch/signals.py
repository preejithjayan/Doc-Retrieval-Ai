from django.db.models.signals import post_migrate
from django.dispatch import receiver

from apps.modelswitch.models import ActiveModel
from services.model_router import MODEL_REGISTRY


@receiver(post_migrate)
def seed_models(sender, **kwargs):
    if sender.label != 'modelswitch':
        return

    active_model_name = ActiveModel.objects.filter(is_active=True).values_list('model_name', flat=True).first()
    for name, payload in MODEL_REGISTRY.items():
        ActiveModel.objects.update_or_create(
            model_name=name,
            defaults={
                'model_type': payload['model_type'],
                'hardware_requirement': payload['hardware_requirement'],
                'identifier': payload['identifier'],
                'provider': 'huggingface',
                'is_active': active_model_name == name if active_model_name else name == 'Phi',
            },
        )
    if not ActiveModel.objects.filter(is_active=True).exists():
        first = ActiveModel.objects.first()
        if first:
            first.is_active = True
            first.save(update_fields=['is_active', 'updated_at'])
