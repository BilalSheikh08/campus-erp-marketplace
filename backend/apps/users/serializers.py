"""Serializers for user registration, authentication, and profile updates."""

from django.contrib.auth import password_validation
from django.core.exceptions import ValidationError
from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

from .models import User


class UserSerializer(serializers.ModelSerializer):
    """Safe public representation of an authenticated user."""

    class Meta:
        model = User
        fields = (
            "id",
            "email",
            "name",
            "role",
            "phone",
            "hostel_room",
            "is_active",
            "date_joined",
        )
        read_only_fields = (
            "id",
            "email",
            "role",
            "is_active",
            "date_joined",
        )


class RegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)
    password_confirmation = serializers.CharField(write_only=True, min_length=8)
    role = serializers.ChoiceField(
        choices=User.Role.choices,
        required=False,
        default=User.Role.STUDENT,
    )

    class Meta:
        model = User
        fields = (
            "email",
            "name",
            "role",
            "phone",
            "hostel_room",
            "password",
            "password_confirmation",
        )

    def validate_email(self, value):
        return value.strip().lower()

    def validate_role(self, value):
        if value != User.Role.STUDENT:
            raise serializers.ValidationError(
                "Only student accounts can be created through public registration."
            )
        return value

    def validate(self, attrs):
        password = attrs.get("password")
        if password != attrs.get("password_confirmation"):
            raise serializers.ValidationError(
                {"password_confirmation": "Passwords do not match."}
            )

        candidate = User(
            email=attrs.get("email"),
            name=attrs.get("name"),
        )
        try:
            password_validation.validate_password(password, user=candidate)
        except ValidationError as exc:
            raise serializers.ValidationError({"password": list(exc.messages)}) from exc
        return attrs

    def create(self, validated_data):
        validated_data.pop("password_confirmation")
        password = validated_data.pop("password")
        return User.objects.create_user(password=password, **validated_data)


class LoginSerializer(TokenObtainPairSerializer):
    """Issue JWTs and include the safe current-user representation."""

    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        token["role"] = user.role
        token["email"] = user.email
        return token

    def validate(self, attrs):
        username_field = self.username_field
        if username_field in attrs and isinstance(attrs[username_field], str):
            attrs[username_field] = attrs[username_field].strip().lower()
        data = super().validate(attrs)
        data["user"] = UserSerializer(self.user).data
        return data


class ProfileSerializer(serializers.ModelSerializer):
    """Allow safe profile fields while protecting identity and role fields."""

    class Meta:
        model = User
        fields = (
            "id",
            "email",
            "name",
            "role",
            "phone",
            "hostel_room",
            "is_active",
            "date_joined",
        )
        read_only_fields = (
            "id",
            "email",
            "role",
            "is_active",
            "date_joined",
        )


class PasswordChangeSerializer(serializers.Serializer):
    old_password = serializers.CharField(write_only=True)
    new_password = serializers.CharField(write_only=True, min_length=8)
    new_password_confirmation = serializers.CharField(write_only=True, min_length=8)

    def validate_old_password(self, value):
        if not self.context["request"].user.check_password(value):
            raise serializers.ValidationError("The current password is incorrect.")
        return value

    def validate(self, attrs):
        if attrs["new_password"] != attrs["new_password_confirmation"]:
            raise serializers.ValidationError(
                {"new_password_confirmation": "Passwords do not match."}
            )
        try:
            password_validation.validate_password(
                attrs["new_password"],
                user=self.context["request"].user,
            )
        except ValidationError as exc:
            raise serializers.ValidationError({"new_password": list(exc.messages)}) from exc
        return attrs

    def save(self, **kwargs):
        user = self.context["request"].user
        user.set_password(self.validated_data["new_password"])
        user.save(update_fields=["password"])
        return user
