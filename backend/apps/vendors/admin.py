"""Django admin configuration for vendor applications."""

from django.contrib import admin

from .models import Vendor


@admin.register(Vendor)
class VendorAdmin(admin.ModelAdmin):
    list_display = (
        "business_name",
        "user",
        "vendor_type",
        "approval_status",
        "approved_by",
        "created_at",
    )
    list_filter = ("vendor_type", "approval_status")
    search_fields = ("business_name", "user__email", "user__name")
    readonly_fields = (
        "approval_status",
        "approved_by",
        "approved_at",
        "rejection_reason",
        "created_at",
        "updated_at",
    )
