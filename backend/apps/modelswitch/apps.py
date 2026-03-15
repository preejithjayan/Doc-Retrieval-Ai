from django.apps import AppConfig


class ModelswitchConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'apps.modelswitch'
    label = 'modelswitch'

    def ready(self):
        from . import signals  # noqa: F401
