"""API and model tests for Phase 2 authentication."""

import pytest
from django.core.cache import cache
from rest_framework.test import APIClient

from apps.core.permissions import IsAdmin, IsOwnerOrAdmin, IsStudent, IsVendor, IsWarden
from apps.users.models import User


@pytest.fixture(autouse=True)
def clear_throttle_cache():
    cache.clear()
    yield
    cache.clear()


@pytest.fixture
def api_client():
    return APIClient()


@pytest.fixture
def user(db):
    return User.objects.create_user(
        email="student@example.com",
        password="StrongPass!123",
        name="Test Student",
        phone="9876543210",
        hostel_room="A-101",
    )


def authenticate(client, user):
    response = client.post(
        "/api/auth/login/",
        {"email": user.email, "password": "StrongPass!123"},
        format="json",
    )
    assert response.status_code == 200
    client.credentials(HTTP_AUTHORIZATION=f"Bearer {response.data['access']}")
    return response.data


@pytest.mark.django_db
def test_user_manager_uses_uuid_and_hashes_password():
    user = User.objects.create_user(
        email="Person@Example.com ",
        password="StrongPass!123",
        name="A Person",
    )

    assert user.id.version == 4
    assert user.email == "person@example.com"
    assert user.check_password("StrongPass!123")
    assert user.password != "StrongPass!123"
    assert user.role == User.Role.STUDENT


@pytest.mark.django_db
def test_registration_returns_tokens_and_never_exposes_password(api_client):
    response = api_client.post(
        "/api/auth/register/",
        {
            "email": "new.student@example.com",
            "name": "New Student",
            "password": "StrongPass!123",
            "password_confirmation": "StrongPass!123",
            "phone": "9876543211",
            "hostel_room": "B-202",
        },
        format="json",
    )

    assert response.status_code == 201
    assert response.data["user"]["role"] == User.Role.STUDENT
    assert response.data["access"]
    assert response.data["refresh"]
    assert "password" not in response.data["user"]
    assert "password_confirmation" not in response.data["user"]
    assert User.objects.filter(email="new.student@example.com").exists()


@pytest.mark.django_db
def test_public_registration_cannot_assign_elevated_role(api_client):
    response = api_client.post(
        "/api/auth/register/",
        {
            "email": "fake.admin@example.com",
            "name": "Fake Admin",
            "role": User.Role.ADMIN,
            "password": "StrongPass!123",
            "password_confirmation": "StrongPass!123",
        },
        format="json",
    )

    assert response.status_code == 400
    assert not User.objects.filter(email="fake.admin@example.com").exists()


@pytest.mark.django_db
def test_login_uses_email_and_returns_safe_user(api_client, user):
    response = api_client.post(
        "/api/auth/login/",
        {"email": "STUDENT@example.com", "password": "StrongPass!123"},
        format="json",
    )

    assert response.status_code == 200
    assert response.data["user"]["id"] == str(user.id)
    assert response.data["user"]["email"] == user.email
    assert "password" not in response.data["user"]


@pytest.mark.django_db
def test_refresh_rotation_and_logout_blacklist(api_client, user):
    login_data = authenticate(api_client, user)
    refresh = login_data["refresh"]

    refresh_response = api_client.post(
        "/api/auth/token/refresh/",
        {"refresh": refresh},
        format="json",
    )
    assert refresh_response.status_code == 200
    rotated_refresh = refresh_response.data["refresh"]
    assert rotated_refresh != refresh

    api_client.credentials(HTTP_AUTHORIZATION=f"Bearer {login_data['access']}")
    logout_response = api_client.post(
        "/api/auth/logout/",
        {"refresh": rotated_refresh},
        format="json",
    )
    assert logout_response.status_code == 204

    reuse_response = api_client.post(
        "/api/auth/token/refresh/",
        {"refresh": rotated_refresh},
        format="json",
    )
    assert reuse_response.status_code == 401


@pytest.mark.django_db
def test_profile_can_update_safe_fields_only(api_client, user):
    authenticate(api_client, user)

    response = api_client.patch(
        "/api/auth/me/",
        {
            "name": "Updated Student",
            "phone": "9000000000",
            "hostel_room": "C-303",
            "email": "attacker@example.com",
            "role": User.Role.ADMIN,
        },
        format="json",
    )

    assert response.status_code == 200
    user.refresh_from_db()
    assert user.name == "Updated Student"
    assert user.phone == "9000000000"
    assert user.hostel_room == "C-303"
    assert user.email == "student@example.com"
    assert user.role == User.Role.STUDENT


@pytest.mark.django_db
def test_password_change_requires_current_password_and_hashes_new_password(api_client, user):
    authenticate(api_client, user)

    invalid_response = api_client.post(
        "/api/auth/password/change/",
        {
            "old_password": "wrong-password",
            "new_password": "NewStrongPass!123",
            "new_password_confirmation": "NewStrongPass!123",
        },
        format="json",
    )
    assert invalid_response.status_code == 400

    valid_response = api_client.post(
        "/api/auth/password/change/",
        {
            "old_password": "StrongPass!123",
            "new_password": "NewStrongPass!123",
            "new_password_confirmation": "NewStrongPass!123",
        },
        format="json",
    )
    assert valid_response.status_code == 200
    assert "password" not in valid_response.data["user"]

    user.refresh_from_db()
    assert user.check_password("NewStrongPass!123")
    assert not user.check_password("StrongPass!123")


@pytest.mark.django_db
def test_role_permissions_and_owner_permission(user):
    vendor = User.objects.create_user(
        email="vendor@example.com",
        password="StrongPass!123",
        name="Vendor",
        role=User.Role.VENDOR,
    )
    warden = User.objects.create_user(
        email="warden@example.com",
        password="StrongPass!123",
        name="Warden",
        role=User.Role.WARDEN,
    )
    admin = User.objects.create_superuser(
        email="admin@example.com",
        password="StrongPass!123",
        name="Admin",
    )

    assert IsStudent().has_permission(type("Request", (), {"user": user})(), None)
    assert IsVendor().has_permission(type("Request", (), {"user": vendor})(), None)
    assert IsWarden().has_permission(type("Request", (), {"user": warden})(), None)
    assert IsAdmin().has_permission(type("Request", (), {"user": admin})(), None)
    assert not IsAdmin().has_permission(type("Request", (), {"user": user})(), None)

    owner_permission = IsOwnerOrAdmin()
    owner_request = type("Request", (), {"user": user})()
    other_request = type("Request", (), {"user": vendor})()
    assert owner_permission.has_object_permission(owner_request, None, user)
    assert not owner_permission.has_object_permission(other_request, None, user)
    assert owner_permission.has_object_permission(
        type("Request", (), {"user": admin})(), None, user
    )
