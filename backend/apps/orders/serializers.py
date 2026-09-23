"""Safe cart and order representations with server-owned monetary fields."""

from rest_framework import serializers

from apps.listings.models import Listing

from .models import Cart, CartItem, Order, OrderItem, OrderStatusLog


class CartItemSerializer(serializers.ModelSerializer):
    listing_id = serializers.UUIDField(source="listing.pk", read_only=True)
    title = serializers.CharField(source="listing.title", read_only=True)
    category_type = serializers.CharField(source="listing.category_type", read_only=True)
    listing_status = serializers.CharField(source="listing.status", read_only=True)
    unit_price = serializers.DecimalField(
        source="listing.price",
        max_digits=10,
        decimal_places=2,
        read_only=True,
    )
    subtotal = serializers.SerializerMethodField()

    class Meta:
        model = CartItem
        fields = (
            "id",
            "listing_id",
            "title",
            "category_type",
            "listing_status",
            "quantity",
            "unit_price",
            "subtotal",
            "created_at",
            "updated_at",
        )
        read_only_fields = fields

    def get_subtotal(self, instance):
        return instance.listing.price * instance.quantity


class CartSerializer(serializers.ModelSerializer):
    items = CartItemSerializer(many=True, read_only=True)

    class Meta:
        model = Cart
        fields = ("id", "items", "created_at", "updated_at")
        read_only_fields = fields


class CartItemCreateSerializer(serializers.Serializer):
    listing = serializers.PrimaryKeyRelatedField(queryset=Listing.objects.all())
    quantity = serializers.IntegerField(min_value=1)

    def validate(self, attrs):
        unexpected = set(self.initial_data) - {"listing", "quantity"}
        if unexpected:
            raise serializers.ValidationError(
                {
                    field: "This field is not accepted for cart items."
                    for field in sorted(unexpected)
                }
            )
        return attrs


class CartItemUpdateSerializer(serializers.Serializer):
    quantity = serializers.IntegerField(min_value=1)

    def validate(self, attrs):
        unexpected = set(self.initial_data) - {"quantity"}
        if unexpected:
            raise serializers.ValidationError(
                {
                    field: "Only quantity can be changed."
                    for field in sorted(unexpected)
                }
            )
        return attrs


class CheckoutSerializer(serializers.Serializer):
    payment_method = serializers.ChoiceField(choices=Order.PaymentMethod.choices)
    pickup_slot = serializers.CharField(required=False, allow_blank=True, max_length=100)

    def validate(self, attrs):
        protected = {
            "user",
            "user_id",
            "vendor",
            "vendor_id",
            "listing",
            "listing_id",
            "items",
            "quantity",
            "price",
            "unit_price",
            "subtotal",
            "total",
            "total_amount",
            "status",
            "inventory",
            "payment_status",
            "payment_reference",
        }
        supplied = protected.intersection(self.initial_data)
        if supplied:
            raise serializers.ValidationError(
                {
                    field: "This field is managed by the server."
                    for field in sorted(supplied)
                }
            )
        return attrs


class OrderItemSerializer(serializers.ModelSerializer):
    listing_id = serializers.UUIDField(source="listing.pk", read_only=True)
    vendor_id = serializers.UUIDField(source="vendor.pk", read_only=True, allow_null=True)

    class Meta:
        model = OrderItem
        fields = (
            "id",
            "listing_id",
            "vendor_id",
            "title_snapshot",
            "vendor_name_snapshot",
            "quantity",
            "price_at_order",
            "subtotal",
        )
        read_only_fields = fields


class OrderStatusLogSerializer(serializers.ModelSerializer):
    changed_by_id = serializers.UUIDField(
        source="changed_by.pk",
        read_only=True,
        allow_null=True,
    )

    class Meta:
        model = OrderStatusLog
        fields = ("id", "status", "changed_by_id", "note", "changed_at")
        read_only_fields = fields


class OrderSerializer(serializers.ModelSerializer):
    purchaser_id = serializers.UUIDField(source="user_id", read_only=True)
    payment_ref = serializers.CharField(source="payment_reference", read_only=True)
    items = OrderItemSerializer(many=True, read_only=True)
    status_logs = OrderStatusLogSerializer(many=True, read_only=True)

    class Meta:
        model = Order
        fields = (
            "id",
            "purchaser_id",
            "total_amount",
            "status",
            "pickup_slot",
            "payment_method",
            "payment_status",
            "payment_reference",
            "payment_ref",
            "stock_restored_at",
            "items",
            "status_logs",
            "created_at",
            "updated_at",
        )
        read_only_fields = fields


class OrderTransitionSerializer(serializers.Serializer):
    target_status = serializers.ChoiceField(choices=Order.Status.choices)
    note = serializers.CharField(required=False, allow_blank=True, max_length=500)

    def validate(self, attrs):
        unexpected = set(self.initial_data) - {"target_status", "note"}
        if unexpected:
            raise serializers.ValidationError(
                {
                    field: "Only target_status and note are accepted."
                    for field in sorted(unexpected)
                }
            )
        return attrs
