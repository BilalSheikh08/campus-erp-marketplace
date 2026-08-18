"""Vendor applications and approval state."""

import uuid

from django.conf import settings
from django.core.exceptions import ValidationError
from django.db import models
from django.utils import timezone


class Vendor(models.Model):
    """A campus provider linked one-to-one with its owning user."""

    class VendorType(models.TextChoices):
        CANTEEN = "canteen", "Canteen"
        STATIONERY = "stationery", "Stationery"
        HOSTEL_SUPPLY = "hostel_supply", "Hostel Supply"

    class ApprovalStatus(models.TextChoices):
        PENDING = "pending", "Pending"
        APPROVED = "approved", "Approved"
        REJECTED = "rejected", "Rejected"

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="vendor_profile",
    )
    business_name = models.CharField(max_length=150)
    vendor_type = models.CharField(max_length=30, choices=VendorType.choices)
    approval_status = models.CharField(
        max_length=20,
        choices=ApprovalStatus.choices,
        default=ApprovalStatus.PENDING,
        db_index=True,
    )
    description = models.TextField(blank=True)
    contact_number = models.CharField(max_length=20, blank=True)
    approved_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="vendor_approvals",
    )
    approved_at = models.DateTimeField(null=True, blank=True)
    rejection_reason = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["vendor_type", "approval_status"]),
            models.Index(fields=["approval_status", "created_at"]),
        ]

    def __str__(self):
        return f"{self.business_name} ({self.get_approval_status_display()})"

    @staticmethod
    def _ensure_admin(actor):
        if not (
            actor
            and actor.is_authenticated
            and (actor.is_superuser or actor.role == "admin")
        ):
            raise ValidationError("Only an administrator can review vendors.")

    def approve(self, actor):
        """Approve a pending application and promote its user to Vendor."""
        self._ensure_admin(actor)
        if self.approval_status != self.ApprovalStatus.PENDING:
            raise ValidationError("Only pending vendor applications can be approved.")

        self.approval_status = self.ApprovalStatus.APPROVED
        self.approved_by = actor
        self.approved_at = timezone.now()
        self.rejection_reason = ""
        self.save(
            update_fields=[
                "approval_status",
                "approved_by",
                "approved_at",
                "rejection_reason",
                "updated_at",
            ]
        )

        if self.user.role != self.user.Role.VENDOR:
            self.user.role = self.user.Role.VENDOR
            self.user.save(update_fields=["role"])

    def reject(self, actor, reason=""):
        """Reject a pending application and persist the review reason."""
        self._ensure_admin(actor)
        if self.approval_status != self.ApprovalStatus.PENDING:
            raise ValidationError("Only pending vendor applications can be rejected.")

        self.approval_status = self.ApprovalStatus.REJECTED
        self.approved_by = None
        self.approved_at = None
        self.rejection_reason = reason.strip()
        self.save(
            update_fields=[
                "approval_status",
                "approved_by",
                "approved_at",
                "rejection_reason",
                "updated_at",
            ]
        )
