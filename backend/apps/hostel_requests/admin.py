"""Django admin registration for hostel requests."""

from django.contrib import admin
from .models import HostelRequest, HostelRequestStatusLog


@admin.register(HostelRequest)
class HostelRequestAdmin(admin.ModelAdmin):
    list_display = [
        "id",
        "student",
        "listing",
        "quantity",
        "required_by_date",
        "status",
        "assigned_warden",
        "created_at",
    ]
    list_filter = ["status", "created_at", "required_by_date"]
    search_fields = ["student__email", "listing__title", "id"]
    date_hierarchy = "created_at"
    list_select_related = ["student", "listing", "assigned_warden"]


@admin.register(HostelRequestStatusLog)
class HostelRequestStatusLogAdmin(admin.ModelAdmin):
    list_display = [
        "request",
        "status",
        "changed_by",
        "created_at",
    ]
    list_filter = ["status", "created_at"]
    search_fields = ["request__id", "changed_by__email"]
    date_hierarchy = "created_at"