from django.contrib import admin

from .models import Notification


@admin.register(Notification)
class NotificationAdmin(admin.ModelAdmin):
    list_display = ("id", "user", "notification_type", "category", "is_read", "created_at")
    list_filter = ("notification_type", "category", "is_read")
    search_fields = ("message", "user__email", "user__name")
    readonly_fields = ("id", "created_at")
