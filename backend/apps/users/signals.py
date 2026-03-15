from django.db.models.signals import post_migrate
from django.dispatch import receiver

from apps.users.models import Role


@receiver(post_migrate)
def seed_roles(sender, **kwargs):
    if sender.label != 'users':
        return

    defaults = [
        {'code': Role.Code.ADMIN, 'name': 'Administrator', 'description': 'Full system control.', 'priority': 4},
        {'code': Role.Code.MANAGER, 'name': 'Manager', 'description': 'Document governance and analytics access.', 'priority': 3},
        {'code': Role.Code.ANALYST, 'name': 'Analyst', 'description': 'Document processing and chatbot querying.', 'priority': 2},
        {'code': Role.Code.VIEWER, 'name': 'Viewer', 'description': 'Read-only semantic search and chatbot access.', 'priority': 1},
    ]
    for role_data in defaults:
        Role.objects.update_or_create(code=role_data['code'], defaults=role_data)
