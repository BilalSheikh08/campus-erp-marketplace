"""Serializers for hostel request API endpoints."""

from rest_framework import serializers
from apps.listings.models import Listing
from apps.users.models import User
from .models import HostelRequest, HostelRequestStatusLog


class HostelRequestStatusLogSerializer(serializers.ModelSerializer):
    """Audit log entry for a hostel request status change."""

    changed_by_email = serializers.CharField(source="changed_by.email", read_only=True)
    changed_by_name = serializers.CharField(source="changed_by.name", read_only=True)

    class Meta:
        model = HostelRequestStatusLog
        fields = ["id", "status", "changed_by_email", "changed_by_name", "note", "created_at"]
        read_only_fields = ["id", "changed_by_email", "changed_by_name", "created_at"]


class HostelRequestSerializer(serializers.ModelSerializer):
    """Hostel request with related information."""

    student_name = serializers.CharField(source="student.name", read_only=True)
    student_email = serializers.CharField(source="student.email", read_only=True)
    listing_title = serializers.CharField(source="listing.title", read_only=True)
    listing_price = serializers.DecimalField(
        source="listing.price", read_only=True, max_digits=12, decimal_places=2
    )
    warden_name = serializers.CharField(source="assigned_warden.name", read_only=True, allow_null=True)
    warden_email = serializers.CharField(source="assigned_warden.email", read_only=True, allow_null=True)
    status_logs = HostelRequestStatusLogSerializer(many=True, read_only=True)
    total_value = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = HostelRequest
        fields = [
            "id",
            "student",
            "student_name",
            "student_email",
            "listing",
            "listing_title",
            "listing_price",
            "quantity",
            "total_value",
            "required_by_date",
            "special_instructions",
            "status",
            "assigned_warden",
            "warden_name",
            "warden_email",
            "warden_notes",
            "status_logs",
            "created_at",
            "updated_at",
        ]
        read_only_fields = [
            "id",
            "student",
            "student_name",
            "student_email",
            "listing_title",
            "listing_price",
            "warden_name",
            "warden_email",
            "status_logs",
            "created_at",
            "updated_at",
        ]

    def get_total_value(self, obj):
        """Calculate total value of the request."""
        return obj.listing.price * obj.quantity


class HostelRequestCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating a new hostel request."""

    class Meta:
        model = HostelRequest
        fields = [
            "listing",
            "quantity",
            "required_by_date",
            "special_instructions",
        ]

    def validate_listing(self, value):
        """Ensure listing is hostel_supply and request_only."""
        if value.category_type != Listing.Category.HOSTEL_SUPPLY:
            raise serializers.ValidationError("Listing must be a hostel supply.")
        try:
            detail = value.hostel_supply_detail
            if not detail.request_only:
                raise serializers.ValidationError(
                    "This hostel supply can be purchased directly, not requested."
                )
        except value.hostel_supply_detail.model.DoesNotExist:
            raise serializers.ValidationError("Listing does not have hostel supply details.")
        if value.status != Listing.Status.ACTIVE:
            raise serializers.ValidationError("Listing is not available.")
        return value

    def validate_quantity(self, value):
        """Ensure positive quantity."""
        if value <= 0:
            raise serializers.ValidationError("Quantity must be positive.")
        return value


class HostelRequestTransitionSerializer(serializers.Serializer):
    """Serializer for hostel request status transitions."""

    target_status = serializers.ChoiceField(choices=HostelRequest.Status.choices)
    note = serializers.CharField(required=False, allow_blank=True)

    def validate_target_status(self, value):
        """Validate that target status is a valid choice."""
        valid_statuses = [s[0] for s in HostelRequest.Status.choices]
        if value not in valid_statuses:
            raise serializers.ValidationError(f"Invalid status: {value}")
        return value
