"""Serializers for vendor applications, profiles, and review actions."""

from rest_framework import serializers

from .models import Vendor


class VendorSerializer(serializers.ModelSerializer):
    """Safe vendor representation with protected workflow fields."""

    user = serializers.PrimaryKeyRelatedField(read_only=True)
    user_email = serializers.EmailField(source="user.email", read_only=True)
    user_name = serializers.CharField(source="user.name", read_only=True)
    approved_by = serializers.PrimaryKeyRelatedField(read_only=True, allow_null=True)

    class Meta:
        model = Vendor
        fields = (
            "id",
            "user",
            "user_email",
            "user_name",
            "business_name",
            "vendor_type",
            "approval_status",
            "description",
            "contact_number",
            "approved_by",
            "approved_at",
            "rejection_reason",
            "created_at",
            "updated_at",
        )
        read_only_fields = (
            "id",
            "user",
            "user_email",
            "user_name",
            "approval_status",
            "approved_by",
            "approved_at",
            "rejection_reason",
            "created_at",
            "updated_at",
        )

    def validate(self, attrs):
        request = self.context.get("request")
        user = getattr(request, "user", None)

        if self.instance is None:
            if user is None or not user.is_authenticated:
                raise serializers.ValidationError(
                    {"user": "An authenticated user is required."}
                )
            if Vendor.objects.filter(user=user).exists():
                raise serializers.ValidationError(
                    {"user": "This user already has a vendor application."}
                )
            if user.role != user.Role.STUDENT:
                raise serializers.ValidationError(
                    {"user": "Only Student accounts can submit vendor applications."}
                )
        elif self.instance.approval_status == Vendor.ApprovalStatus.REJECTED:
            raise serializers.ValidationError(
                "Rejected applications cannot be edited. Submit a new application workflow when enabled."
            )
        elif (
            self.instance.approval_status == Vendor.ApprovalStatus.APPROVED
            and "vendor_type" in attrs
        ):
            raise serializers.ValidationError(
                {"vendor_type": "Approved vendor types cannot be changed."}
            )

        return attrs

    def create(self, validated_data):
        return Vendor.objects.create(
            user=self.context["request"].user,
            **validated_data,
        )


class VendorRejectionSerializer(serializers.Serializer):
    reason = serializers.CharField(
        required=False,
        allow_blank=True,
        max_length=1000,
    )
