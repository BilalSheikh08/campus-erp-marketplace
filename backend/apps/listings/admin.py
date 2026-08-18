"""Django admin configuration for shared catalog entries."""

from django.contrib import admin

from .models import (
    BookDetail,
    CanteenDetail,
    HostelSupplyDetail,
    Listing,
    StationeryDetail,
)


@admin.register(Listing)
class ListingAdmin(admin.ModelAdmin):
    list_display = (
        "title",
        "category_type",
        "vendor",
        "price",
        "status",
        "created_at",
    )
    list_filter = ("category_type", "status")
    search_fields = (
        "title",
        "description",
        "vendor__business_name",
        "book_detail__author",
        "book_detail__subject",
    )
    readonly_fields = ("id", "vendor", "status", "created_at", "updated_at")


@admin.register(CanteenDetail)
class CanteenDetailAdmin(admin.ModelAdmin):
    list_display = ("listing", "is_veg", "prep_time_minutes", "available_from", "available_to")
    list_filter = ("is_veg",)
    search_fields = ("listing__title",)
    readonly_fields = ("listing",)


@admin.register(StationeryDetail)
class StationeryDetailAdmin(admin.ModelAdmin):
    list_display = ("listing", "sku", "unit", "barcode")
    search_fields = ("sku", "barcode", "listing__title")
    readonly_fields = ("listing",)


@admin.register(HostelSupplyDetail)
class HostelSupplyDetailAdmin(admin.ModelAdmin):
    list_display = ("listing", "supply_category", "request_only")
    list_filter = ("request_only",)
    search_fields = ("supply_category", "listing__title")
    readonly_fields = ("listing",)


@admin.register(BookDetail)
class BookDetailAdmin(admin.ModelAdmin):
    list_display = ("listing", "seller", "condition", "author", "subject", "edition")
    list_filter = ("condition",)
    search_fields = (
        "listing__title",
        "author",
        "subject",
        "edition",
        "seller__email",
        "seller__name",
    )
    readonly_fields = ("listing", "seller")
