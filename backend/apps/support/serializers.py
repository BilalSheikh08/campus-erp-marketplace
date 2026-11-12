from rest_framework import serializers

from .models import ContactInquiry


class ContactInquirySerializer(serializers.ModelSerializer):
    class Meta:
        model = ContactInquiry
        fields = (
            "id",
            "name",
            "email",
            "student_id",
            "department",
            "message",
            "status",
            "created_at",
            "updated_at",
        )
        read_only_fields = ("id", "status", "created_at", "updated_at")

    def validate_department(self, value):
        allowed = {"general", "canteen", "stationery", "hostel", "vendor"}
        if value not in allowed:
            raise serializers.ValidationError("Choose a valid campus department.")
        return value


class ContactInquiryAdminSerializer(ContactInquirySerializer):
    status = serializers.ChoiceField(choices=ContactInquiry.Status.choices)

    class Meta(ContactInquirySerializer.Meta):
        read_only_fields = ("id", "created_at", "updated_at")
