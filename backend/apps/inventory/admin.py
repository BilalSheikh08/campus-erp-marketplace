"""Django Admin registration for Inventory records."""

from django.contrib import admin

from .models import Inventory


@admin.register(Inventory)
class InventoryAdmin(admin.ModelAdmin):
    list_display = (
        "listing",
        "vendor_name",
        "quantity",
        "reserved_quantity",
        "available_quantity_display",
        "low_stock_threshold",
        "stock_status_display",
        "updated_at",
    )
    list_filter = ("listing__category_type", "listing__status")
    search_fields = (
        "listing__title",
        "listing__vendor__business_name",
    )
    readonly_fields = (
        "id",
        "vendor_name",
        "reserved_quantity",
        "available_quantity_display",
        "stock_status_display",
        "created_at",
        "updated_at",
    )

    def get_queryset(self, request):
        return super().get_queryset(request).select_related(
            "listing",
            "listing__vendor",
        )

    @admin.display(description="Vendor")
    def vendor_name(self, obj):
        return obj.listing.vendor.business_name

    @admin.display(description="Available")
    def available_quantity_display(self, obj):
        return obj.available_quantity

    @admin.display(description="Stock status")
    def stock_status_display(self, obj):
        return obj.stock_status

    def get_readonly_fields(self, request, obj=None):
        fields = super().get_readonly_fields(request, obj)
        if obj is not None:
            return (*fields, "listing")
        return fields
