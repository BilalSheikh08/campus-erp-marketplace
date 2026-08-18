"""Nested serializers and ownership validation for catalog listings."""

from django.db import transaction
from rest_framework import serializers

from apps.core.permissions import IsApprovedVendor
from apps.vendors.models import Vendor

from .models import (
    BookDetail,
    CanteenDetail,
    HostelSupplyDetail,
    Listing,
    StationeryDetail,
)


class CanteenDetailSerializer(serializers.ModelSerializer):
    class Meta:
        model = CanteenDetail
        fields = (
            "is_veg",
            "prep_time_minutes",
            "available_from",
            "available_to",
        )


class StationeryDetailSerializer(serializers.ModelSerializer):
    class Meta:
        model = StationeryDetail
        fields = ("sku", "unit", "barcode")

    def validate_barcode(self, value):
        return value or None


class HostelSupplyDetailSerializer(serializers.ModelSerializer):
    class Meta:
        model = HostelSupplyDetail
        fields = ("request_only", "supply_category")


class BookDetailSerializer(serializers.ModelSerializer):
    seller = serializers.UUIDField(source="seller_id", read_only=True, allow_null=True)
    seller_name = serializers.CharField(source="seller.name", read_only=True)

    class Meta:
        model = BookDetail
        fields = (
            "seller",
            "seller_name",
            "condition",
            "author",
            "subject",
            "edition",
        )


class ListingSerializer(serializers.ModelSerializer):
    """Create, represent, and safely update one shared catalog Listing."""

    vendor = serializers.UUIDField(source="vendor_id", read_only=True, allow_null=True)
    vendor_name = serializers.CharField(
        source="vendor.business_name",
        read_only=True,
        allow_null=True,
    )
    canteen_detail = CanteenDetailSerializer(required=False)
    stationery_detail = StationeryDetailSerializer(required=False)
    hostel_supply_detail = HostelSupplyDetailSerializer(required=False)
    book_detail = BookDetailSerializer(required=False)
    stock_status = serializers.SerializerMethodField()
    is_purchasable = serializers.SerializerMethodField()

    detail_keys = (
        "canteen_detail",
        "stationery_detail",
        "hostel_supply_detail",
        "book_detail",
    )
    category_detail_keys = {
        Listing.Category.CANTEEN: "canteen_detail",
        Listing.Category.STATIONERY: "stationery_detail",
        Listing.Category.HOSTEL_SUPPLY: "hostel_supply_detail",
        Listing.Category.BOOK: "book_detail",
    }

    class Meta:
        model = Listing
        fields = (
            "id",
            "vendor",
            "vendor_name",
            "title",
            "description",
            "price",
            "category_type",
            "status",
            "image_url",
            "canteen_detail",
            "stationery_detail",
            "hostel_supply_detail",
            "book_detail",
            "stock_status",
            "is_purchasable",
            "created_at",
            "updated_at",
        )
        read_only_fields = (
            "id",
            "vendor",
            "vendor_name",
            "status",
            "created_at",
            "updated_at",
        )

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        if self.instance is not None:
            self.fields["category_type"].read_only = True

    @staticmethod
    def _get_inventory(instance):
        try:
            return instance.inventory
        except AttributeError:
            return None

    def get_stock_status(self, instance):
        inventory = self._get_inventory(instance)
        if inventory is not None:
            return inventory.stock_status
        if instance.category_type == Listing.Category.BOOK:
            return None
        return "out_of_stock"

    def get_is_purchasable(self, instance):
        inventory = self._get_inventory(instance)
        return bool(inventory and inventory.is_purchasable)

    @staticmethod
    def _normalize_category(value):
        if value is None:
            return value
        return Listing.LEGACY_CATEGORY_ALIASES.get(value, value)

    def to_internal_value(self, data):
        """Accept design-era aliases while storing one canonical category."""
        normalized = data.copy()
        category_value = normalized.get("category_type")

        for alias_key in ("domain", "category"):
            alias_value = normalized.get(alias_key)
            if alias_value is None:
                continue
            alias_value = self._normalize_category(alias_value)
            if category_value is not None:
                category_value = self._normalize_category(category_value)
                if category_value != alias_value:
                    raise serializers.ValidationError(
                        {"category_type": "Category aliases must agree."}
                    )
            else:
                category_value = alias_value

        if category_value is not None:
            normalized["category_type"] = self._normalize_category(category_value)
        return super().to_internal_value(normalized)

    def validate_price(self, value):
        if value < 0:
            raise serializers.ValidationError("Price cannot be negative.")
        return value

    def _reject_protected_input(self):
        protected = {
            "vendor",
            "vendor_id",
            "seller",
            "seller_id",
            "owner",
            "owner_id",
            "approval_status",
            "approved_by",
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

        for detail_key in self.detail_keys:
            detail_data = self.initial_data.get(detail_key)
            if isinstance(detail_data, dict):
                nested_supplied = {"seller", "seller_id"}.intersection(detail_data)
                if nested_supplied:
                    raise serializers.ValidationError(
                        {
                            f"{detail_key}.{field}": "Seller ownership is managed by the server."
                            for field in sorted(nested_supplied)
                        }
                    )

    def validate(self, attrs):
        self._reject_protected_input()
        request = self.context.get("request")
        user = getattr(request, "user", None)
        if user is None or not user.is_authenticated:
            raise serializers.ValidationError(
                {"detail": "An authenticated user is required."}
            )

        if self.instance is not None:
            if any(
                key in self.initial_data
                for key in ("category_type", "category", "domain")
            ):
                raise serializers.ValidationError(
                    {"category_type": "A Listing domain cannot be changed."}
                )
            category = self.instance.category_type
            supplied_details = set(self.detail_keys).intersection(attrs)
            expected_detail = self.category_detail_keys[category]
            unrelated = supplied_details - {expected_detail}
            if unrelated:
                raise serializers.ValidationError(
                    {
                        key: "This detail does not match the Listing domain."
                        for key in sorted(unrelated)
                    }
                )
            return attrs

        category = attrs.get("category_type")
        if category is None:
            raise serializers.ValidationError({"category_type": "This field is required."})

        expected_detail = self.category_detail_keys[category]
        supplied_details = set(self.detail_keys).intersection(attrs)
        if expected_detail not in supplied_details:
            raise serializers.ValidationError(
                {expected_detail: "The matching domain detail is required."}
            )
        unrelated = supplied_details - {expected_detail}
        if unrelated:
            raise serializers.ValidationError(
                {
                    key: "This detail does not match the Listing domain."
                    for key in sorted(unrelated)
                }
            )

        if category == Listing.Category.BOOK:
            if user.role != user.Role.STUDENT:
                raise serializers.ValidationError(
                    {"category_type": "Only Students can create book listings."}
                )
        else:
            if not IsApprovedVendor.user_is_approved(user):
                raise serializers.ValidationError(
                    {"category_type": "An approved Vendor account is required."}
                )
            vendor = getattr(user, "vendor_profile", None)
            expected_vendor_type = Listing.VENDOR_CATEGORY_MAP[category]
            if vendor.vendor_type != expected_vendor_type:
                raise serializers.ValidationError(
                    {"category_type": "The Listing domain does not match your Vendor type."}
                )

        return attrs

    def create(self, validated_data):
        request_user = self.context["request"].user
        category = validated_data["category_type"]
        detail_key = self.category_detail_keys[category]
        detail_data = validated_data.pop(detail_key)

        vendor = None
        detail_model = {
            "canteen_detail": CanteenDetail,
            "stationery_detail": StationeryDetail,
            "hostel_supply_detail": HostelSupplyDetail,
            "book_detail": BookDetail,
        }[detail_key]

        with transaction.atomic():
            if category != Listing.Category.BOOK:
                vendor = request_user.vendor_profile
            listing = Listing.objects.create(vendor=vendor, **validated_data)
            detail_kwargs = {"listing": listing, **detail_data}
            if category == Listing.Category.BOOK:
                detail_kwargs["seller"] = request_user
            detail_model.objects.create(**detail_kwargs)
        return listing

    def update(self, instance, validated_data):
        detail_data_by_key = {
            key: validated_data.pop(key)
            for key in self.detail_keys
            if key in validated_data
        }
        detail_models = {
            "canteen_detail": CanteenDetail,
            "stationery_detail": StationeryDetail,
            "hostel_supply_detail": HostelSupplyDetail,
            "book_detail": BookDetail,
        }

        with transaction.atomic():
            for field, value in validated_data.items():
                setattr(instance, field, value)
            instance.save()

            for detail_key, detail_data in detail_data_by_key.items():
                detail_model = detail_models[detail_key]
                try:
                    detail = getattr(instance, detail_key)
                except detail_model.DoesNotExist:
                    detail = detail_model(listing=instance)
                for field, value in detail_data.items():
                    setattr(detail, field, value)
                detail.save()
        return instance
