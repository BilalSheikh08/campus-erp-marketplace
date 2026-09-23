"""Cart and order records for the server-authoritative checkout workflow."""

import uuid

from django.conf import settings
from django.core.exceptions import ValidationError
from django.core.validators import MinValueValidator
from django.db import models
from django.db.models import Q

from apps.listings.models import Listing
from apps.vendors.models import Vendor


class Cart(models.Model):
    """The one active cart owned by an authenticated user."""

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="cart",
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-updated_at", "-id"]

    def __str__(self):
        return f"Cart for {self.user.email}"


class CartItem(models.Model):
    """A positive requested quantity for one Listing in a Cart."""

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    cart = models.ForeignKey(Cart, on_delete=models.CASCADE, related_name="items")
    listing = models.ForeignKey(
        Listing,
        on_delete=models.CASCADE,
        related_name="cart_items",
    )
    quantity = models.PositiveIntegerField(validators=[MinValueValidator(1)])
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["created_at", "id"]
        constraints = [
            models.UniqueConstraint(
                fields=["cart", "listing"],
                name="orders_cart_listing_unique",
            ),
            models.CheckConstraint(
                check=Q(quantity__gt=0),
                name="orders_cart_item_quantity_positive",
            ),
        ]
        indexes = [
            models.Index(
                fields=["cart", "created_at"],
                name="orders_cartitem_cart_idx",
            ),
            models.Index(
                fields=["listing"],
                name="orders_cartitem_listing_idx",
            ),
        ]

    def __str__(self):
        return f"{self.quantity} x {self.listing.title}"


class Order(models.Model):
    """A single-vendor order created by the transactional checkout service."""

    class Status(models.TextChoices):
        PLACED = "placed", "Placed"
        CONFIRMED = "confirmed", "Confirmed"
        READY = "ready", "Ready"
        COMPLETED = "completed", "Completed"
        CANCELLED = "cancelled", "Cancelled"
        DISPUTED = "disputed", "Disputed"

    class PaymentMethod(models.TextChoices):
        MOCK = "mock", "Mock Payment"
        CAMPUS_WALLET = "campus_wallet", "Campus Wallet"
        CASH_ON_PICKUP = "cash_on_pickup", "Cash on Pickup"

    class PaymentStatus(models.TextChoices):
        PENDING = "pending", "Pending"
        PAID = "paid", "Paid"
        FAILED = "failed", "Failed"
        REFUNDED = "refunded", "Refunded"

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.PROTECT,
        related_name="orders",
    )
    total_amount = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        validators=[MinValueValidator(0)],
    )
    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.PLACED,
        db_index=True,
    )
    pickup_slot = models.CharField(max_length=100, blank=True)
    payment_method = models.CharField(max_length=30, choices=PaymentMethod.choices)
    payment_status = models.CharField(
        max_length=20,
        choices=PaymentStatus.choices,
        default=PaymentStatus.PENDING,
        db_index=True,
    )
    payment_reference = models.CharField(max_length=100, blank=True)
    stock_restored_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at", "-id"]
        indexes = [
            models.Index(
                fields=["user", "created_at"],
                name="orders_order_user_idx",
            ),
            models.Index(
                fields=["status", "created_at"],
                name="orders_order_status_idx",
            ),
            models.Index(
                fields=["payment_status", "created_at"],
                name="orders_order_payment_idx",
            ),
        ]
        constraints = [
            models.CheckConstraint(
                check=Q(total_amount__gte=0),
                name="orders_total_amount_non_negative",
            ),
        ]

    @property
    def payment_ref(self):
        """Compatibility alias for the historical payment_ref terminology."""
        return self.payment_reference

    @payment_ref.setter
    def payment_ref(self, value):
        self.payment_reference = value

    def __str__(self):
        return f"Order {self.id}"


class OrderItem(models.Model):
    """Immutable-at-the-API order line with historical price snapshots."""

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name="items")
    listing = models.ForeignKey(
        Listing,
        on_delete=models.PROTECT,
        related_name="order_items",
    )
    vendor = models.ForeignKey(
        Vendor,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="order_items",
    )
    title_snapshot = models.CharField(max_length=150)
    vendor_name_snapshot = models.CharField(max_length=150, blank=True)
    quantity = models.PositiveIntegerField(validators=[MinValueValidator(1)])
    price_at_order = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        validators=[MinValueValidator(0)],
    )
    subtotal = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        validators=[MinValueValidator(0)],
    )

    class Meta:
        ordering = ["id"]
        constraints = [
            models.CheckConstraint(
                check=Q(quantity__gt=0),
                name="orders_order_item_quantity_positive",
            ),
            models.CheckConstraint(
                check=Q(price_at_order__gte=0),
                name="orders_order_item_price_non_negative",
            ),
            models.CheckConstraint(
                check=Q(subtotal__gte=0),
                name="orders_order_item_subtotal_non_negative",
            ),
        ]

    def __str__(self):
        return f"{self.quantity} x {self.title_snapshot}"

    def save(self, *args, **kwargs):
        if self.pk:
            previous = type(self).objects.filter(pk=self.pk).first()
            if previous is not None:
                immutable_fields = (
                    "order_id",
                    "listing_id",
                    "vendor_id",
                    "title_snapshot",
                    "vendor_name_snapshot",
                    "quantity",
                    "price_at_order",
                    "subtotal",
                )
                if any(
                    getattr(previous, field) != getattr(self, field)
                    for field in immutable_fields
                ):
                    raise ValidationError(
                        "Order item history cannot be changed after checkout."
                    )
        return super().save(*args, **kwargs)


class OrderStatusLog(models.Model):
    """Persistent order state history, independent of notification delivery."""

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    order = models.ForeignKey(
        Order,
        on_delete=models.CASCADE,
        related_name="status_logs",
    )
    status = models.CharField(max_length=20, choices=Order.Status.choices)
    changed_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="order_status_changes",
    )
    note = models.CharField(max_length=500, blank=True)
    changed_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["changed_at", "id"]
        indexes = [
            models.Index(
                fields=["order", "changed_at"],
                name="orders_statuslog_order_idx",
            ),
        ]

    def __str__(self):
        return f"{self.order_id}: {self.status}"
