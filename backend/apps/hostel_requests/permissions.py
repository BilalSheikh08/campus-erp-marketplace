"""Permission classes for hostel request access control."""

from rest_framework.permissions import BasePermission
from apps.users.models import User


class IsStudent(BasePermission):
    """Allow only students."""

    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and request.user.role == User.Role.STUDENT


class IsWarden(BasePermission):
    """Allow only wardens."""

    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and request.user.role == User.Role.WARDEN


class IsWardenOrAdmin(BasePermission):
    """Allow wardens or admins."""

    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        return request.user.role in [User.Role.WARDEN, User.Role.ADMIN] or request.user.is_superuser


class IsRequestCreator(BasePermission):
    """Allow only the student who created the request."""

    def has_object_permission(self, request, view, obj):
        return obj.student_id == request.user.pk


class IsRequestWardenOrAdmin(BasePermission):
    """Allow the assigned warden or admin to manage the request."""

    def has_object_permission(self, request, view, obj):
        if request.user.is_superuser or request.user.role == User.Role.ADMIN:
            return True
        if request.user.role == User.Role.WARDEN:
            # Warden can see requests assigned to them or unassigned hostel supply requests
            return obj.assigned_warden_id == request.user.pk or obj.assigned_warden_id is None
        return False
