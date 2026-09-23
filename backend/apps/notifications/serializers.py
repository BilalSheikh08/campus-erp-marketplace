"""Notification serializers with read-state-only mutation."""

from rest_framework import serializers

from .models import Notification


class NotificationSerializer(serializers.ModelSerializer):
    """Expose immutable server-generated content and only the read flag."""

    class Meta:
        model = Notification
        fields = (
            "id",
            "user",
            "message",
            "notification_type",
            "category",
            "is_read",
            "created_at",
        )
        read_only_fields = (
            "id",
            "user",
            "message",
            "notification_type",
            "category",
            "created_at",
        )

    def to_internal_value(self, data):
        extra_fields = set(data) - {"is_read"}
        if extra_fields:
            raise serializers.ValidationError(
                {"detail": "Only is_read can be changed."}
            )
        return super().to_internal_value(data)

    def validate(self, attrs):
        if set(attrs) - {"is_read"}:
            raise serializers.ValidationError(
                {"detail": "Only is_read can be changed."}
            )
        return attrs

    def update(self, instance, validated_data):
        instance.is_read = validated_data.get("is_read", instance.is_read)
        instance.save(update_fields=["is_read"])
        return instance
