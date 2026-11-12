import uuid

from django.conf import settings
from django.db import models


class ContactInquiry(models.Model):
    class Status(models.TextChoices):
        NEW = "new", "New"
        IN_PROGRESS = "in_progress", "In progress"
        RESOLVED = "resolved", "Resolved"

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        related_name="contact_inquiries",
        null=True,
        blank=True,
    )
    name = models.CharField(max_length=150)
    email = models.EmailField()
    student_id = models.CharField(max_length=64, blank=True)
    department = models.CharField(max_length=30, default="general")
    message = models.TextField(max_length=5000)
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.NEW)
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at", "-id"]

    def __str__(self):
        return f"{self.department}: {self.name} ({self.status})"
