"""API serializers for second-hand books and transactions."""

from rest_framework import serializers

from apps.listings.models import BookDetail, Listing

from .models import BookTransaction, BookTransactionStatusLog


class BookSerializer(serializers.ModelSerializer):
    seller_id = serializers.UUIDField(source="book_detail.seller_id", read_only=True)
    seller_name = serializers.CharField(source="book_detail.seller.name", read_only=True)
    condition = serializers.CharField(source="book_detail.condition", read_only=True)
    author = serializers.CharField(source="book_detail.author", read_only=True)
    subject = serializers.CharField(source="book_detail.subject", read_only=True)
    edition = serializers.CharField(source="book_detail.edition", read_only=True)
    is_available = serializers.BooleanField(source="book_detail.is_available", read_only=True)

    class Meta:
        model = Listing
        fields = (
            "id",
            "title",
            "description",
            "price",
            "image_url",
            "status",
            "seller_id",
            "seller_name",
            "condition",
            "author",
            "subject",
            "edition",
            "is_available",
            "created_at",
            "updated_at",
        )
        read_only_fields = fields


class BookCreateSerializer(serializers.Serializer):
    title = serializers.CharField(max_length=150)
    description = serializers.CharField(required=False, allow_blank=True)
    price = serializers.DecimalField(max_digits=10, decimal_places=2, min_value=0)
    image_url = serializers.URLField(required=False, allow_blank=True, allow_null=True)
    condition = serializers.ChoiceField(choices=BookDetail.Condition.choices)
    author = serializers.CharField(max_length=150, required=False, allow_blank=True)
    subject = serializers.CharField(max_length=100, required=False, allow_blank=True)
    edition = serializers.CharField(max_length=50, required=False, allow_blank=True)


class BookTransactionSerializer(serializers.ModelSerializer):
    listing_title = serializers.CharField(source="listing.title", read_only=True)
    price = serializers.DecimalField(source="listing.price", max_digits=10, decimal_places=2, read_only=True)
    buyer_name = serializers.CharField(source="buyer.name", read_only=True)
    seller_name = serializers.CharField(source="seller.name", read_only=True)

    class Meta:
        model = BookTransaction
        fields = (
            "id",
            "listing",
            "listing_title",
            "price",
            "buyer",
            "buyer_name",
            "seller",
            "seller_name",
            "status",
            "created_at",
            "confirmed_at",
            "completed_at",
            "cancelled_at",
            "updated_at",
        )
        read_only_fields = fields


class BookTransactionStatusLogSerializer(serializers.ModelSerializer):
    changed_by_name = serializers.CharField(source="changed_by.name", read_only=True)

    class Meta:
        model = BookTransactionStatusLog
        fields = ("id", "status", "note", "changed_by", "changed_by_name", "created_at")
        read_only_fields = fields
