"""Django Admin views for carts, orders, and immutable order history."""

from django.contrib import admin

from .models import Cart, CartItem, Order, OrderItem, OrderStatusLog


@admin.register(Cart)
class CartAdmin(admin.ModelAdmin):
    list_display = ("id", "user", "updated_at", "created_at")
    search_fields = ("user__email", "user__name")
    readonly_fields = ("id", "user", "created_at", "updated_at")

    def has_add_permission(self, request):
        return False

    def has_delete_permission(self, request, obj=None):
        return False


@admin.register(CartItem)
class CartItemAdmin(admin.ModelAdmin):
    list_display = ("cart", "listing", "quantity", "created_at", "updated_at")
    search_fields = ("cart__user__email", "listing__title")
    list_filter = ("listing__category_type", "listing__status")
    readonly_fields = (
        "id",
        "cart",
        "listing",
        "quantity",
        "created_at",
        "updated_at",
    )

    def has_add_permission(self, request):
        return False

    def has_change_permission(self, request, obj=None):
        return False

    def has_delete_permission(self, request, obj=None):
        return False


@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "user",
        "total_amount",
        "status",
        "payment_method",
        "payment_status",
        "created_at",
    )
    list_filter = ("status", "payment_method", "payment_status")
    search_fields = ("id", "user__email", "user__name", "payment_reference")
    readonly_fields = (
        "id",
        "user",
        "total_amount",
        "status",
        "pickup_slot",
        "payment_method",
        "payment_status",
        "payment_reference",
        "stock_restored_at",
        "created_at",
        "updated_at",
    )

    def has_add_permission(self, request):
        return False

    def has_delete_permission(self, request, obj=None):
        return False


@admin.register(OrderItem)
class OrderItemAdmin(admin.ModelAdmin):
    list_display = (
        "order",
        "title_snapshot",
        "vendor_name_snapshot",
        "quantity",
        "price_at_order",
        "subtotal",
    )
    search_fields = ("order__id", "title_snapshot", "vendor_name_snapshot")
    readonly_fields = (
        "id",
        "order",
        "listing",
        "vendor",
        "title_snapshot",
        "vendor_name_snapshot",
        "quantity",
        "price_at_order",
        "subtotal",
    )

    def has_add_permission(self, request):
        return False

    def has_change_permission(self, request, obj=None):
        return False

    def has_delete_permission(self, request, obj=None):
        return False


@admin.register(OrderStatusLog)
class OrderStatusLogAdmin(admin.ModelAdmin):
    list_display = ("order", "status", "changed_by", "changed_at")
    list_filter = ("status",)
    search_fields = ("order__id", "changed_by__email", "note")
    readonly_fields = ("id", "order", "status", "changed_by", "note", "changed_at")

    def has_add_permission(self, request):
        return False

    def has_change_permission(self, request, obj=None):
        return False

    def has_delete_permission(self, request, obj=None):
        return False
