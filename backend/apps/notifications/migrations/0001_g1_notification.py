# Generated manually to preserve the G1 schema in the portable project bundle.
import uuid

from django.conf import settings
import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):
    initial = True

    dependencies = [migrations.swappable_dependency(settings.AUTH_USER_MODEL)]

    operations = [
        migrations.CreateModel(
            name="Notification",
            fields=[
                ("id", models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ("message", models.CharField(max_length=500)),
                ("notification_type", models.CharField(choices=[
                    ("order", "Order"),
                    ("hostel", "Hostel Request"),
                    ("inventory", "Inventory"),
                    ("book", "Book Marketplace"),
                    ("system", "System"),
                ], db_index=True, default="system", max_length=20)),
                ("category", models.CharField(blank=True, default="", max_length=30)),
                ("is_read", models.BooleanField(db_index=True, default=False)),
                ("created_at", models.DateTimeField(auto_now_add=True, db_index=True)),
                ("user", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="notifications", to=settings.AUTH_USER_MODEL, db_index=True)),
            ],
            options={
                "ordering": ["-created_at", "-id"],
            },
        ),
        migrations.AddIndex(
            model_name="notification",
            index=models.Index(fields=["user", "is_read"], name="notif_user_read_idx"),
        ),
        migrations.AddIndex(
            model_name="notification",
            index=models.Index(fields=["created_at"], name="notif_created_idx"),
        ),
    ]
