"""Inventory management serializers with ownership and domain validation."""

from django.core.exceptions import ValidationError as DjangoValidationError
from django.db import IntegrityError, transaction
from rest_framework import serializers

from apps.core.permissions import IsApprovedVendor
from apps.listings.models import Listing

from .models import Inventory
from .services import InventoryOperationError, update_inventory


class InventorySerializer(serializers.ModelSerializer):
    listing = serializers.PrimaryKeyRelatedField(queryset=Listing.objects.all())
    vendor = serializers.UUIDField(
        source="listing.vendor_id",
        read_only=True,
        allow_null=True,
    )
    vendor_name = serializers.CharField(
        source="listing.vendor.business_name",
        read_only=True,
        allow_null=True,
    )
    available_quantity = serializers.IntegerField(read_only=True)
    stock_status = serializers.CharField(read_only=True)
    is_purchasable = serializers.BooleanField(read_only=True)
    threshold = serializers.IntegerField(
        source="low_stock_threshold",
        required=False,
    )

    class Meta:
        model = Inventory
        fields = (
            "id",
            "listing",
            "vendor",
            "vendor_name",
            "quantity",
            "reserved_quantity",
            "available_quantity",
            "low_stock_threshold",
            "threshold",
            "stock_status",
            "is_purchasable",
            "created_at",
            "updated_at",
        )
        read_only_fields = (
            "id",
            "vendor",
            "vendor_name",
            "reserved_quantity",
            "available_quantity",
            "stock_status",
            "is_purchasable",
            "created_at",
            "updated_at",
        )

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        if self.instance is not None:
            self.fields["listing"].read_only = True

    @staticmethod
    def _is_admin(user):
        return bool(
            user
            and user.is_authenticated
            and (user.is_superuser or user.role == user.Role.ADMIN)
        )

    @classmethod
    def _validate_listing(cls, listing):
        if listing.category_type == Listing.Category.BOOK:
            raise serializers.ValidationError(
                {"listing": "Book Listings cannot have Inventory records."}
            )
        if listing.category_type not in Listing.VENDOR_CATEGORY_MAP:
            raise serializers.ValidationError(
                {"listing": "Inventory requires a vendor-backed Listing domain."}
            )
        if listing.vendor_id is None:
            raise serializers.ValidationError(
                {"listing": "Inventory requires a Listing with a Vendor."}
            )

        vendor = listing.vendor
        if vendor.approval_status != vendor.ApprovalStatus.APPROVED:
            raise serializers.ValidationError(
                {"listing": "The Listing Vendor must be approved."}
            )
        if vendor.user.role != vendor.user.Role.VENDOR:
            raise serializers.ValidationError(
                {"listing": "The Listing Vendor account is not active."}
            )
        if vendor.vendor_type != Listing.VENDOR_CATEGORY_MAP[listing.category_type]:
            raise serializers.ValidationError(
                {"listing": "The Listing domain does not match the Vendor type."}
            )

    def _reject_protected_input(self):
        protected = {
            "vendor",
            "vendor_id",
            "owner",
            "owner_id",
            "seller",
            "seller_id",
            "approval_status",
            "approved_by",
            "reserved_quantity",
            "available_quantity",
            "stock_status",
            "is_purchasable",
            "status",
        }
        supplied = protected.intersection(self.initial_data.keys())
        if supplied:
            raise serializers.ValidationError(
                {
                    field: "This field is managed by the server."
                    for field in sorted(supplied)
                }
            )
        if self.instance is not None and "listing" in self.initial_data:
            raise serializers.ValidationError(
                {"listing": "An Inventory Listing cannot be changed."}
            )

    def validate(self, attrs):
        self._reject_protected_input()
        canonical_threshold = self.initial_data.get("low_stock_threshold")
        legacy_threshold = self.initial_data.get("threshold")
        if canonical_threshold is not None and legacy_threshold is not None:
            try:
                thresholds_agree = int(canonical_threshold) == int(legacy_threshold)
            except (TypeError, ValueError):
                thresholds_agree = True
            if not thresholds_agree:
                raise serializers.ValidationError(
                    {"low_stock_threshold": "Threshold aliases must agree."}
                )

        request = self.context.get("request")
        user = getattr(request, "user", None)
        if user is None or not user.is_authenticated:
            raise serializers.ValidationError(
                {"detail": "An authenticated user is required."}
            )

        if self.instance is not None:
            if not attrs and not self.partial:
                raise serializers.ValidationError(
                    {"detail": "At least one editable field is required."}
                )
            return attrs

        listing = attrs.get("listing")
        if listing is None:
            raise serializers.ValidationError({"listing": "This field is required."})
        self._validate_listing(listing)
        if Inventory.objects.filter(listing_id=listing.pk).exists():
            raise serializers.ValidationError(
                {"listing": "This Listing already has an Inventory record."}
            )

        is_owner = bool(
            listing.vendor_id is not None
            and listing.vendor.user_id == user.pk
            and IsApprovedVendor.user_is_approved(user)
        )
        if not self._is_admin(user) and not is_owner:
            raise serializers.ValidationError(
                {"listing": "You may only manage Inventory for your own Vendor Listing."}
            )
        return attrs

    def create(self, validated_data):
        try:
            with transaction.atomic():
                return Inventory.objects.create(**validated_data)
        except (DjangoValidationError, IntegrityError) as exc:
            if isinstance(exc, DjangoValidationError):
                detail = exc.message_dict if hasattr(exc, "message_dict") else exc.messages
            else:
                detail = {"listing": "This Listing already has an Inventory record."}
            raise serializers.ValidationError(detail) from exc

    def update(self, instance, validated_data):
        try:
            return update_inventory(
                instance,
                quantity=validated_data.get("quantity"),
                low_stock_threshold=validated_data.get("low_stock_threshold"),
            )
        except InventoryOperationError as exc:
            raise serializers.ValidationError({"detail": str(exc)}) from exc


class StockAdjustmentSerializer(serializers.Serializer):
    """Validate a non-zero administrative stock delta."""

    quantity_change = serializers.IntegerField()
    reason = serializers.CharField(required=False, allow_blank=True, max_length=500)

    def validate_quantity_change(self, value):
        if value == 0:
            raise serializers.ValidationError(
                "quantity_change must be a non-zero integer."
            )
        return value
