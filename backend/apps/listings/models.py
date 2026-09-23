"""Shared catalog listings and domain-specific listing details."""

import uuid

from django.conf import settings
from django.core.exceptions import ValidationError
from django.core.validators import MinValueValidator
from django.db import models
from django.db.models import Q

from apps.vendors.models import Vendor


class Listing(models.Model):
    """A catalog item shared by all four marketplace domains."""

    class Category(models.TextChoices):
        CANTEEN = "canteen", "Canteen"
        STATIONERY = "stationery", "Stationery"
        HOSTEL_SUPPLY = "hostel_supply", "Hostel Supply"
        BOOK = "book", "Book"

    class Status(models.TextChoices):
        ACTIVE = "active", "Active"
        INACTIVE = "inactive", "Inactive"
        SOLD_OUT = "sold_out", "Sold Out"
        SOLD = "sold", "Sold"

    # Compatibility names for callers following the design artifact.
    Domain = Category
    CATEGORY_CHOICES = Category.choices
    STATUS_CHOICES = Status.choices

    VENDOR_CATEGORY_MAP = {
        Category.CANTEEN: Vendor.VendorType.CANTEEN,
        Category.STATIONERY: Vendor.VendorType.STATIONERY,
        Category.HOSTEL_SUPPLY: Vendor.VendorType.HOSTEL_SUPPLY,
    }

    LEGACY_CATEGORY_ALIASES = {
        "canteen_item": Category.CANTEEN,
        "stationery_item": Category.STATIONERY,
    }

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    vendor = models.ForeignKey(
        Vendor,
        on_delete=models.CASCADE,
        related_name="listings",
        null=True,
        blank=True,
    )
    title = models.CharField(max_length=150)
    description = models.TextField(blank=True)
    price = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        validators=[MinValueValidator(0)],
    )
    category_type = models.CharField(max_length=30, choices=Category.choices)
    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.ACTIVE,
        db_index=True,
    )
    image_url = models.URLField(max_length=500, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at", "-id"]
        indexes = [
            models.Index(fields=["vendor"]),
            models.Index(fields=["category_type", "status"]),
            models.Index(fields=["status", "created_at"]),
        ]
        constraints = [
            models.CheckConstraint(
                check=Q(price__gte=0),
                name="listing_price_non_negative",
            ),
        ]

    def __str__(self):
        return self.title

    def clean(self):
        super().clean()
        if self.category_type == self.Category.BOOK:
            if self.vendor_id is not None:
                raise ValidationError(
                    {"vendor": "Book listings cannot be assigned to a Vendor."}
                )
            return

        if self.category_type in self.VENDOR_CATEGORY_MAP:
            if self.vendor_id is None:
                raise ValidationError(
                    {"vendor": "Vendor-backed listings require a Vendor."}
                )
            vendor = self.vendor
            if vendor.approval_status != Vendor.ApprovalStatus.APPROVED:
                raise ValidationError(
                    {"vendor": "The Vendor must be approved before listing."}
                )
            if vendor.user.role != vendor.user.Role.VENDOR:
                raise ValidationError(
                    {"vendor": "The Vendor account is not active."}
                )
            expected_type = self.VENDOR_CATEGORY_MAP[self.category_type]
            if vendor.vendor_type != expected_type:
                raise ValidationError(
                    {"category_type": "The listing domain does not match the Vendor type."}
                )

    def save(self, *args, **kwargs):
        self.category_type = self.LEGACY_CATEGORY_ALIASES.get(
            self.category_type,
            self.category_type,
        )
        self.full_clean()
        return super().save(*args, **kwargs)


class ListingDetailBase(models.Model):
    """Shared validation for one-to-one domain detail records."""

    expected_category = None

    class Meta:
        abstract = True

    def clean(self):
        super().clean()
        if self.listing_id is None:
            return
        if self.listing.category_type != self.expected_category:
            raise ValidationError(
                {"listing": "This detail type does not match the listing domain."}
            )

    def save(self, *args, **kwargs):
        # Keep domain validation here while allowing database uniqueness
        # constraints to report duplicate one-to-one rows consistently.
        self.full_clean(validate_unique=False)
        return super().save(*args, **kwargs)


class CanteenDetail(ListingDetailBase):
    """Food-specific fields for a canteen Listing."""

    expected_category = Listing.Category.CANTEEN

    listing = models.OneToOneField(
        Listing,
        on_delete=models.CASCADE,
        primary_key=True,
        related_name="canteen_detail",
    )
    is_veg = models.BooleanField(default=True)
    prep_time_minutes = models.PositiveIntegerField(
        null=True,
        blank=True,
        validators=[MinValueValidator(1)],
    )
    available_from = models.TimeField(null=True, blank=True)
    available_to = models.TimeField(null=True, blank=True)

    class Meta:
        constraints = [
            models.CheckConstraint(
                check=Q(prep_time_minutes__isnull=True)
                | Q(prep_time_minutes__gte=1),
                name="canteen_prep_time_positive",
            ),
        ]

    def clean(self):
        super().clean()
        if (
            self.available_from is not None
            and self.available_to is not None
            and self.available_from > self.available_to
        ):
            raise ValidationError(
                {"available_to": "Availability must end after it starts."}
            )


class StationeryDetail(ListingDetailBase):
    """Stationery identification and unit metadata."""

    expected_category = Listing.Category.STATIONERY

    listing = models.OneToOneField(
        Listing,
        on_delete=models.CASCADE,
        primary_key=True,
        related_name="stationery_detail",
    )
    sku = models.CharField(max_length=64, unique=True)
    unit = models.CharField(max_length=30)
    barcode = models.CharField(
        max_length=64,
        unique=True,
        null=True,
        blank=True,
    )

    def clean(self):
        super().clean()
        if self.barcode == "":
            self.barcode = None


class HostelSupplyDetail(ListingDetailBase):
    """Metadata for supplies that may later participate in requests."""

    expected_category = Listing.Category.HOSTEL_SUPPLY

    listing = models.OneToOneField(
        Listing,
        on_delete=models.CASCADE,
        primary_key=True,
        related_name="hostel_supply_detail",
    )
    request_only = models.BooleanField(default=True)
    supply_category = models.CharField(max_length=100, blank=True)


class BookDetail(ListingDetailBase):
    """Student-owned second-hand book metadata."""

    class Condition(models.TextChoices):
        NEW = "new", "New"
        LIKE_NEW = "like_new", "Like New"
        GOOD = "good", "Good"
        FAIR = "fair", "Fair"
        WORN = "worn", "Worn"

    expected_category = Listing.Category.BOOK

    listing = models.OneToOneField(
        Listing,
        on_delete=models.CASCADE,
        primary_key=True,
        related_name="book_detail",
    )
    seller = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="book_listings",
    )
    condition = models.CharField(max_length=20, choices=Condition.choices)
    author = models.CharField(max_length=150, blank=True)
    subject = models.CharField(max_length=100, blank=True)
    edition = models.CharField(max_length=50, blank=True)
    is_available = models.BooleanField(default=True, db_index=True)

    def clean(self):
        super().clean()
        if self.seller_id is not None and self.seller.role != self.seller.Role.STUDENT:
            raise ValidationError({"seller": "Only Students can sell books."})
