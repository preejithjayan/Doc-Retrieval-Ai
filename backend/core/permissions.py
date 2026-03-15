from rest_framework.permissions import BasePermission

ROLE_HIERARCHY = {
    'VIEWER': 1,
    'ANALYST': 2,
    'MANAGER': 3,
    'ADMIN': 4,
}


class RolePermission(BasePermission):
    allowed_roles = ()

    def has_permission(self, request, view):
        user = request.user
        if not user or not user.is_authenticated or not user.role:
            return False
        return user.role.code in self.allowed_roles


class MinimumRolePermission(BasePermission):
    minimum_role = 'VIEWER'

    def has_permission(self, request, view):
        user = request.user
        if not user or not user.is_authenticated or not user.role:
            return False
        return ROLE_HIERARCHY.get(user.role.code, 0) >= ROLE_HIERARCHY.get(self.minimum_role, 0)


class IsAdmin(RolePermission):
    allowed_roles = ('ADMIN',)


class IsManagerOrAbove(MinimumRolePermission):
    minimum_role = 'MANAGER'


class IsAnalystOrAbove(MinimumRolePermission):
    minimum_role = 'ANALYST'


class IsViewerOrAbove(MinimumRolePermission):
    minimum_role = 'VIEWER'
