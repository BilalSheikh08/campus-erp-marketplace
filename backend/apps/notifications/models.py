"""Persistent user-scoped notifications."""

import uuid

from django.conf import settings
from django.db import models


class Notification(models.Model):
    """A server-generated notification owned by exactly one user."""

    class NotificationType(models.TextChoices):
        ORDER = "order", "Order"
        HOSTEL = "hostel", "Hostel Request"
        INVENTORY = "inventory", "Inventory"
        BOOK = "book", "Book Marketplace"
        SYSTEM = "system", "System"

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="notifications",
        db_index=True,
    )
    message = models.CharField(max_length=500)
    notification_type = models.CharField(
        max_length=20,
        choices=NotificationType.choices,
        default=NotificationType.SYSTEM,
        db_index=True,
    )
    category = models.CharField(max_length=30, blank=True, default="")
    is_read = models.BooleanField(default=False, db_index=True)
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)

    class Meta:
        ordering = ["-created_at", "-id"]
        indexes = [
            models.Index(fields=["user", "is_read"], name="notif_user_read_idx"),
            models.Index(fields=["created_at"], name="notif_created_idx"),
        ]

    def __str__(self):
        return f"Notification {self.id} for {self.user.email}"
