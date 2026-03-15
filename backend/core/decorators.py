from functools import wraps

from rest_framework.exceptions import PermissionDenied



def role_required(*roles):
    def decorator(func):
        @wraps(func)
        def wrapped(self, request, *args, **kwargs):
            user = request.user
            if not user.is_authenticated or not user.role or user.role.code not in roles:
                raise PermissionDenied('You do not have permission to perform this action.')
            return func(self, request, *args, **kwargs)

        return wrapped

    return decorator
