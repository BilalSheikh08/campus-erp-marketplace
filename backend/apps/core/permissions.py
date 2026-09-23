"""Reusable role and ownership permissions for domain APIs."""

from rest_framework.permissions import BasePermission


class IsRole(BasePermission):
    """Base permission for a fixed set of user roles."""

    roles = frozenset()
    message = "Your account role does not have access to this resource."

    def __init__(self, *roles):
        if roles:
            self.roles = frozenset(roles)

    def has_permission(self, request, view):
        user = request.user
        return bool(
            user
            and user.is_authenticated
            and (user.role in self.roles or user.is_superuser)
        )


class IsStudent(IsRole):
    roles = frozenset({"student"})


class IsVendor(IsRole):
    roles = frozenset({"vendor"})


class IsApprovedVendor(BasePermission):
    """Require a Vendor user with an approved vendor profile."""

    message = "Your vendor account must be approved before using this resource."

    @classmethod
    def user_is_approved(cls, user):
        """Return whether a user owns an approved Vendor profile."""
        if not user or not user.is_authenticated or user.role != "vendor":
            return False
        vendor = getattr(user, "vendor_profile", None)
        return bool(vendor and vendor.approval_status == "approved")

    def has_permission(self, request, view):
        return self.user_is_approved(request.user)


class IsInventoryManager(BasePermission):
    """Allow approved Vendor owners and Admins to manage Inventory."""

    message = "Only an approved Vendor or Admin can manage Inventory."

    def has_permission(self, request, view):
        user = request.user
        if not user or not user.is_authenticated:
            return False
        if user.is_superuser or user.role == "admin":
            return True
        return IsApprovedVendor.user_is_approved(user)


class IsOrderParticipant(BasePermission):
    """Allow Students, approved Vendors, and Admins to use order APIs."""

    message = "Only a Student, approved Vendor, or Admin can use orders."

    def has_permission(self, request, view):
        user = request.user
        if not user or not user.is_authenticated:
            return False
        if user.is_superuser or user.role == "admin":
            return True
        if user.role == "student":
            return True
        return IsApprovedVendor.user_is_approved(user)


class IsWarden(IsRole):
    roles = frozenset({"warden"})


class IsAdmin(IsRole):
    roles = frozenset({"admin"})


class IsOwnerOrAdmin(BasePermission):
    """Allow an object owner or an administrator to access an object."""

    message = "You do not have permission to access this resource."

    def has_permission(self, request, view):
        user = request.user
        return bool(user and user.is_authenticated)

    def has_object_permission(self, request, view, obj):
        user = request.user
        if user.is_superuser or user.role == "admin":
            return True
        if obj is user or getattr(obj, "pk", None) == user.pk:
            return True

        owner_id = getattr(obj, "user_id", None)
        if owner_id is None:
            owner = getattr(obj, "user", None)
            owner_id = getattr(owner, "pk", None)
        if owner_id is None:
            vendor = getattr(obj, "vendor", None)
            owner_id = getattr(vendor, "user_id", None)
            if owner_id is None:
                vendor_user = getattr(vendor, "user", None)
                owner_id = getattr(vendor_user, "pk", None)
        if owner_id is None:
            owner_id = getattr(obj, "seller_id", None)
        if owner_id is None:
            book_detail = getattr(obj, "book_detail", None)
            owner_id = getattr(book_detail, "seller_id", None)
        if owner_id is None:
            listing = getattr(obj, "listing", None)
            listing_vendor = getattr(listing, "vendor", None)
            owner_id = getattr(listing_vendor, "user_id", None)
            if owner_id is None:
                vendor_user = getattr(listing_vendor, "user", None)
                owner_id = getattr(vendor_user, "pk", None)

        return owner_id == user.pk
