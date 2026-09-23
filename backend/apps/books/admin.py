from django.contrib import admin

from .models import BookTransaction, BookTransactionStatusLog


@admin.register(BookTransaction)
class BookTransactionAdmin(admin.ModelAdmin):
    list_display = ("id", "listing", "buyer", "seller", "status", "created_at", "confirmed_at")
    list_filter = ("status",)
    search_fields = ("listing__title", "buyer__email", "seller__email")
    readonly_fields = ("id", "created_at", "confirmed_at", "completed_at", "cancelled_at", "updated_at")


@admin.register(BookTransactionStatusLog)
class BookTransactionStatusLogAdmin(admin.ModelAdmin):
    list_display = ("transaction", "status", "changed_by", "created_at")
    list_filter = ("status",)
    search_fields = ("transaction__listing__title", "changed_by__email")
    readonly_fields = ("id", "created_at")
