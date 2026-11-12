from django.contrib import admin

from .models import ContactInquiry


@admin.register(ContactInquiry)
class ContactInquiryAdmin(admin.ModelAdmin):
    list_display = ("created_at", "department", "name", "email", "status")
    list_filter = ("status", "department", "created_at")
    search_fields = ("name", "email", "student_id", "message")
    readonly_fields = ("id", "user", "name", "email", "student_id", "department", "message", "created_at", "updated_at")
    list_editable = ("status",)
    ordering = ("-created_at",)
