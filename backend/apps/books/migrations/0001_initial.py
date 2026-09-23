# Generated manually to keep the portable project bundle migration-complete.
import django.db.models.deletion
import uuid
from django.conf import settings
from django.db import migrations, models
from django.db.models import Q


class Migration(migrations.Migration):
    initial = True

    dependencies = [
        ("listings", "0002_bookdetail_is_available"),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name="BookTransaction",
            fields=[
                ("id", models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ("status", models.CharField(choices=[
                    ("reserved", "Reserved"),
                    ("confirmed", "Sale Confirmed"),
                    ("completed", "Completed"),
                    ("cancelled", "Cancelled"),
                ], db_index=True, default="reserved", max_length=20)),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("confirmed_at", models.DateTimeField(blank=True, null=True)),
                ("completed_at", models.DateTimeField(blank=True, null=True)),
                ("cancelled_at", models.DateTimeField(blank=True, null=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
                ("buyer", models.ForeignKey(on_delete=django.db.models.deletion.PROTECT, related_name="book_purchases", to=settings.AUTH_USER_MODEL)),
                ("listing", models.ForeignKey(on_delete=django.db.models.deletion.PROTECT, related_name="book_transactions", to="listings.listing")),
                ("seller", models.ForeignKey(on_delete=django.db.models.deletion.PROTECT, related_name="book_sales", to=settings.AUTH_USER_MODEL)),
            ],
            options={"ordering": ["-created_at", "-id"]},
        ),
        migrations.CreateModel(
            name="BookTransactionStatusLog",
            fields=[
                ("id", models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ("status", models.CharField(choices=[
                    ("reserved", "Reserved"),
                    ("confirmed", "Sale Confirmed"),
                    ("completed", "Completed"),
                    ("cancelled", "Cancelled"),
                ], max_length=20)),
                ("note", models.CharField(blank=True, max_length=500)),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("changed_by", models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name="book_transaction_status_changes", to=settings.AUTH_USER_MODEL)),
                ("transaction", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="status_logs", to="books.booktransaction")),
            ],
            options={"ordering": ["created_at", "id"]},
        ),
        migrations.AddConstraint(
            model_name="booktransaction",
            constraint=models.UniqueConstraint(
                condition=Q(status__in=["reserved", "confirmed"]),
                fields=("listing",),
                name="books_one_active_tx_per_listing",
            ),
        ),
        migrations.AddIndex(
            model_name="booktransaction",
            index=models.Index(fields=["listing", "status"], name="books_tx_listing_status_idx"),
        ),
        migrations.AddIndex(
            model_name="booktransaction",
            index=models.Index(fields=["buyer", "status"], name="books_tx_buyer_status_idx"),
        ),
        migrations.AddIndex(
            model_name="booktransaction",
            index=models.Index(fields=["seller", "status"], name="books_tx_seller_status_idx"),
        ),
        migrations.AddIndex(
            model_name="booktransactionstatuslog",
            index=models.Index(fields=["transaction", "created_at"], name="books_tx_log_idx"),
        ),
    ]
