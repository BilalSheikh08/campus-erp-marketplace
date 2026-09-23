"""Hostel request models for student requests and warden fulfillment."""

import uuid
from django.conf import settings
from django.core.validators import MinValueValidator
from django.db import models
from django.utils import timezone

from apps.listings.models import HostelSupplyDetail, Listing
from apps.users.models import User


class HostelRequest(models.Model):
    """A student's request for hostel supplies requiring warden approval."""

    class Status(models.TextChoices):
        SUBMITTED = "submitted", "Submitted"
        PENDING_APPROVAL = "pending_approval", "Pending Approval"
        APPROVED = "approved", "Approved"
        REJECTED = "rejected", "Rejected"
        FULFILLED = "fulfilled", "Fulfilled"
        CANCELLED = "cancelled", "Cancelled"

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    student = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="hostel_requests",
        limit_choices_to={"role": User.Role.STUDENT},
    )
    listing = models.ForeignKey(
        Listing,
        on_delete=models.PROTECT,
        related_name="hostel_requests",
        limit_choices_to={"category_type": Listing.Category.HOSTEL_SUPPLY},
    )
    quantity = models.PositiveIntegerField(validators=[MinValueValidator(1)])
    required_by_date = models.DateField()
    special_instructions = models.TextField(blank=True)

    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.SUBMITTED,
        db_index=True,
    )
    assigned_warden = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="assigned_hostel_requests",
        limit_choices_to={"role": User.Role.WARDEN},
    )
    warden_notes = models.TextField(blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at", "-id"]
        indexes = [
            models.Index(fields=["student", "status"]),
            models.Index(fields=["assigned_warden", "status"]),
            models.Index(fields=["status", "-created_at"]),
        ]

    def __str__(self):
        return f"Hostel Request {self.id.hex[:8]} - {self.listing.title}"


class HostelRequestStatusLog(models.Model):
    """Audit trail for hostel request status changes."""

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    request = models.ForeignKey(
        HostelRequest,
        on_delete=models.CASCADE,
        related_name="status_logs",
    )
    status = models.CharField(max_length=20, choices=HostelRequest.Status.choices)
    changed_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.PROTECT,
        related_name="hostel_request_status_changes",
    )
    note = models.TextField(blank=True)
    created_at = models.DateTimeField(default=timezone.now)

    class Meta:
        ordering = ["created_at"]

    def __str__(self):
        return f"{self.request.id.hex[:8]} → {self.status} by {self.changed_by.email}"
