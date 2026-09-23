"""Second-hand book transaction records built on the shared Listing engine."""

import uuid

from django.conf import settings
from django.core.exceptions import ValidationError
from django.db import models
from django.db.models import Q
from django.utils import timezone

from apps.listings.models import BookDetail, Listing


class BookTransaction(models.Model):
    """A reservation/sale lifecycle between one student buyer and seller."""

    class Status(models.TextChoices):
        RESERVED = "reserved", "Reserved"
        CONFIRMED = "confirmed", "Sale Confirmed"
        COMPLETED = "completed", "Completed"
        CANCELLED = "cancelled", "Cancelled"

    ACTIVE_STATUSES = (Status.RESERVED, Status.CONFIRMED)

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    listing = models.ForeignKey(
        Listing,
        on_delete=models.PROTECT,
        related_name="book_transactions",
    )
    buyer = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.PROTECT,
        related_name="book_purchases",
    )
    seller = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.PROTECT,
        related_name="book_sales",
    )
    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.RESERVED,
        db_index=True,
    )
    created_at = models.DateTimeField(auto_now_add=True)
    confirmed_at = models.DateTimeField(null=True, blank=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    cancelled_at = models.DateTimeField(null=True, blank=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at", "-id"]
        constraints = [
            models.UniqueConstraint(
                fields=["listing"],
                condition=Q(status__in=["reserved", "confirmed"]),
                name="books_one_active_tx_per_listing",
            ),
        ]
        indexes = [
            models.Index(fields=["listing", "status"], name="books_tx_listing_status_idx"),
            models.Index(fields=["buyer", "status"], name="books_tx_buyer_status_idx"),
            models.Index(fields=["seller", "status"], name="books_tx_seller_status_idx"),
        ]

    def clean(self):
        super().clean()
        if self.listing.category_type != Listing.Category.BOOK:
            raise ValidationError({"listing": "BookTransaction requires a book Listing."})
        try:
            detail = self.listing.book_detail
        except BookDetail.DoesNotExist as exc:
            raise ValidationError({"listing": "The Listing has no BookDetail."}) from exc
        if self.seller_id != detail.seller_id:
            raise ValidationError({"seller": "Seller must own the book Listing."})
        if self.buyer_id == self.seller_id:
            raise ValidationError({"buyer": "A seller cannot buy their own book."})

    def save(self, *args, **kwargs):
        self.full_clean(validate_unique=False)
        return super().save(*args, **kwargs)

    def __str__(self):
        return f"Book transaction {self.id} ({self.status})"


class BookTransactionStatusLog(models.Model):
    """Immutable audit trail for buyer/seller book transaction changes."""

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    transaction = models.ForeignKey(
        BookTransaction,
        on_delete=models.CASCADE,
        related_name="status_logs",
    )
    status = models.CharField(max_length=20, choices=BookTransaction.Status.choices)
    changed_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="book_transaction_status_changes",
    )
    note = models.CharField(max_length=500, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["created_at", "id"]
        indexes = [
            models.Index(fields=["transaction", "created_at"], name="books_tx_log_idx"),
        ]

    def __str__(self):
        return f"{self.transaction_id}: {self.status}"
