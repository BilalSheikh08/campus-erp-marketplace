"""Inventory records and derived stock availability for vendor listings."""

import uuid

from django.core.exceptions import ValidationError
from django.core.validators import MinValueValidator
from django.db import models
from django.db.models import F, Q

from apps.listings.models import Listing


class Inventory(models.Model):
    """On-hand stock for one eligible, vendor-backed Listing."""

    class StockStatus(models.TextChoices):
        IN_STOCK = "in_stock", "In Stock"
        LOW_STOCK = "low_stock", "Low Stock"
        OUT_OF_STOCK = "out_of_stock", "Out of Stock"

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    listing = models.OneToOneField(
        Listing,
        on_delete=models.CASCADE,
        related_name="inventory",
    )
    quantity = models.PositiveIntegerField(
        default=0,
        validators=[MinValueValidator(0)],
    )
    reserved_quantity = models.PositiveIntegerField(
        default=0,
        validators=[MinValueValidator(0)],
    )
    low_stock_threshold = models.PositiveIntegerField(
        default=10,
        validators=[MinValueValidator(0)],
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __init__(self, *args, **kwargs):
        legacy_threshold = kwargs.pop("threshold", None)
        if legacy_threshold is not None:
            current_threshold = kwargs.get("low_stock_threshold")
            if (
                current_threshold is not None
                and current_threshold != legacy_threshold
            ):
                raise TypeError(
                    "threshold and low_stock_threshold must agree."
                )
            kwargs["low_stock_threshold"] = legacy_threshold
        super().__init__(*args, **kwargs)

    class Meta:
        ordering = ["-updated_at", "-id"]
        constraints = [
            models.CheckConstraint(
                check=Q(quantity__gte=0),
                name="inventory_quantity_non_negative",
            ),
            models.CheckConstraint(
                check=Q(reserved_quantity__gte=0),
                name="inventory_reserved_non_negative",
            ),
            models.CheckConstraint(
                check=Q(low_stock_threshold__gte=0),
                name="inventory_threshold_non_negative",
            ),
            models.CheckConstraint(
                check=Q(reserved_quantity__lte=F("quantity")),
                name="inventory_reserved_lte_quantity",
            ),
        ]

    def __str__(self):
        return f"Inventory for {self.listing.title}"

    @property
    def available_quantity(self):
        """Stock that is not currently held by a reservation."""
        return self.quantity - self.reserved_quantity

    @property
    def threshold(self):
        """Compatibility alias for the historical inventory terminology."""
        return self.low_stock_threshold

    @threshold.setter
    def threshold(self, value):
        self.low_stock_threshold = value

    @property
    def stock_status(self):
        """Return a derived status based on currently available stock."""
        if self.available_quantity <= 0:
            return self.StockStatus.OUT_OF_STOCK
        if self.available_quantity <= self.low_stock_threshold:
            return self.StockStatus.LOW_STOCK
        return self.StockStatus.IN_STOCK

    @property
    def is_purchasable(self):
        """Whether this stock can currently participate in a purchase."""
        return bool(
            self.listing.status == Listing.Status.ACTIVE
            and self.available_quantity > 0
        )

    def clean(self):
        super().clean()
        if self.listing_id is None:
            return

        listing = self.listing
        if listing.category_type == Listing.Category.BOOK:
            raise ValidationError(
                {"listing": "Book Listings cannot have Inventory records."}
            )
        if listing.category_type not in Listing.VENDOR_CATEGORY_MAP:
            raise ValidationError(
                {"listing": "Inventory requires a vendor-backed Listing domain."}
            )
        if listing.vendor_id is None:
            raise ValidationError(
                {"listing": "Inventory requires a Listing with a Vendor."}
            )

        vendor = listing.vendor
        if vendor.approval_status != vendor.ApprovalStatus.APPROVED:
            raise ValidationError(
                {"listing": "The Listing Vendor must be approved."}
            )
        if vendor.user.role != vendor.user.Role.VENDOR:
            raise ValidationError(
                {"listing": "The Listing Vendor account is not active."}
            )
        expected_type = Listing.VENDOR_CATEGORY_MAP[listing.category_type]
        if vendor.vendor_type != expected_type:
            raise ValidationError(
                {"listing": "The Listing domain does not match the Vendor type."}
            )
        if self.reserved_quantity > self.quantity:
            raise ValidationError(
                {"reserved_quantity": "Reserved stock cannot exceed quantity."}
            )

    def save(self, *args, **kwargs):
        self.full_clean()
        return super().save(*args, **kwargs)
