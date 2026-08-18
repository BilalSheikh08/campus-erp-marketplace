"""Vendor application and approval workflow tests."""

from types import SimpleNamespace

import pytest
from django.db import IntegrityError
from rest_framework.test import APIClient
from rest_framework_simplejwt.tokens import RefreshToken

from apps.core.permissions import IsApprovedVendor
from apps.users.models import User

from ..models import Vendor


@pytest.fixture
def api_client():
    return APIClient()


@pytest.fixture
def student(db):
    return User.objects.create_user(
        email="applicant@example.com",
        password="StrongPass!123",
        name="Vendor Applicant",
    )


@pytest.fixture
def second_student(db):
    return User.objects.create_user(
        email="second-applicant@example.com",
        password="StrongPass!123",
        name="Second Applicant",
    )


@pytest.fixture
def admin(db):
    return User.objects.create_superuser(
        email="admin@example.com",
        password="StrongPass!123",
        name="Platform Admin",
    )


def authenticate(client, user):
    refresh = RefreshToken.for_user(user)
    client.credentials(HTTP_AUTHORIZATION=f"Bearer {refresh.access_token}")


def application_payload(**overrides):
    payload = {
        "business_name": "Campus Fresh Foods",
        "vendor_type": Vendor.VendorType.CANTEEN,
        "description": "Fresh campus meals.",
        "contact_number": "9876543210",
    }
    payload.update(overrides)
    return payload


@pytest.mark.django_db
def test_student_can_submit_pending_application(api_client, student):
    authenticate(api_client, student)

    response = api_client.post(
        "/api/vendors/apply/",
        application_payload(),
        format="json",
    )

    assert response.status_code == 201
    vendor = Vendor.objects.get(user=student)
    assert response.data["id"] == str(vendor.id)
    assert response.data["approval_status"] == Vendor.ApprovalStatus.PENDING
    assert vendor.approval_status == Vendor.ApprovalStatus.PENDING
    assert vendor.approved_by is None
    assert student.role == User.Role.STUDENT


@pytest.mark.django_db
def test_duplicate_application_is_rejected(api_client, student):
    authenticate(api_client, student)
    first_response = api_client.post(
        "/api/vendors/apply/",
        application_payload(),
        format="json",
    )
    second_response = api_client.post(
        "/api/vendors/apply/",
        application_payload(business_name="Another Business"),
        format="json",
    )

    assert first_response.status_code == 201
    assert second_response.status_code == 400
    assert Vendor.objects.filter(user=student).count() == 1


@pytest.mark.django_db
def test_invalid_vendor_type_is_rejected(api_client, student):
    authenticate(api_client, student)

    response = api_client.post(
        "/api/vendors/apply/",
        application_payload(vendor_type="bookstore"),
        format="json",
    )

    assert response.status_code == 400
    assert not Vendor.objects.filter(user=student).exists()


@pytest.mark.django_db
def test_vendor_profile_can_be_retrieved_and_updated_while_pending(
    api_client, student
):
    authenticate(api_client, student)
    api_client.post(
        "/api/vendors/apply/",
        application_payload(),
        format="json",
    )

    get_response = api_client.get("/api/vendors/me/")
    patch_response = api_client.patch(
        "/api/vendors/me/",
        {
            "business_name": "Updated Campus Fresh",
            "contact_number": "9000000000",
            "vendor_type": Vendor.VendorType.HOSTEL_SUPPLY,
            "approval_status": Vendor.ApprovalStatus.APPROVED,
        },
        format="json",
    )

    assert get_response.status_code == 200
    assert patch_response.status_code == 200
    vendor = Vendor.objects.get(user=student)
    assert vendor.business_name == "Updated Campus Fresh"
    assert vendor.contact_number == "9000000000"
    assert vendor.vendor_type == Vendor.VendorType.HOSTEL_SUPPLY
    assert vendor.approval_status == Vendor.ApprovalStatus.PENDING


@pytest.mark.django_db
def test_only_admin_can_list_and_approve_vendors(api_client, student, admin):
    authenticate(api_client, student)
    application_response = api_client.post(
        "/api/vendors/apply/",
        application_payload(),
        format="json",
    )
    vendor_id = application_response.data["id"]

    student_list_response = api_client.get("/api/vendors/")
    student_approve_response = api_client.post(
        f"/api/vendors/{vendor_id}/approve/",
        format="json",
    )

    assert student_list_response.status_code == 403
    assert student_approve_response.status_code == 403

    authenticate(api_client, admin)
    admin_list_response = api_client.get(
        "/api/vendors/?approval_status=pending&vendor_type=canteen"
    )
    approve_response = api_client.post(
        f"/api/vendors/{vendor_id}/approve/",
        format="json",
    )

    assert admin_list_response.status_code == 200
    assert len(admin_list_response.data) == 1
    assert approve_response.status_code == 200
    assert approve_response.data["approval_status"] == Vendor.ApprovalStatus.APPROVED

    student.refresh_from_db()
    vendor = Vendor.objects.get(pk=vendor_id)
    assert student.role == User.Role.VENDOR
    assert vendor.approved_by_id == admin.id
    assert vendor.approved_at is not None


@pytest.mark.django_db
def test_approved_vendor_cannot_change_type_or_be_approved_twice(
    api_client, student, admin
):
    authenticate(api_client, student)
    application_response = api_client.post(
        "/api/vendors/apply/",
        application_payload(),
        format="json",
    )
    vendor_id = application_response.data["id"]

    authenticate(api_client, admin)
    first_approve_response = api_client.post(
        f"/api/vendors/{vendor_id}/approve/",
        format="json",
    )
    second_approve_response = api_client.post(
        f"/api/vendors/{vendor_id}/approve/",
        format="json",
    )

    authenticate(api_client, student)
    type_update_response = api_client.patch(
        "/api/vendors/me/",
        {"vendor_type": Vendor.VendorType.STATIONERY},
        format="json",
    )

    assert first_approve_response.status_code == 200
    assert second_approve_response.status_code == 400
    assert type_update_response.status_code == 400


@pytest.mark.django_db
def test_admin_rejection_persists_reason_and_is_terminal(
    api_client, second_student, admin
):
    authenticate(api_client, second_student)
    application_response = api_client.post(
        "/api/vendors/apply/",
        application_payload(vendor_type=Vendor.VendorType.STATIONERY),
        format="json",
    )
    vendor_id = application_response.data["id"]

    authenticate(api_client, admin)
    reject_response = api_client.post(
        f"/api/vendors/{vendor_id}/reject/",
        {"reason": "Please provide a valid campus operating permit."},
        format="json",
    )
    approve_response = api_client.post(
        f"/api/vendors/{vendor_id}/approve/",
        format="json",
    )

    assert reject_response.status_code == 200
    assert approve_response.status_code == 400
    vendor = Vendor.objects.get(pk=vendor_id)
    second_student.refresh_from_db()
    assert vendor.approval_status == Vendor.ApprovalStatus.REJECTED
    assert vendor.rejection_reason == "Please provide a valid campus operating permit."
    assert second_student.role == User.Role.STUDENT


@pytest.mark.django_db
def test_approved_vendor_permission_requires_role_and_status(student):
    request = SimpleNamespace(user=student)
    permission = IsApprovedVendor()

    vendor = Vendor.objects.create(
        user=student,
        business_name="Pending Business",
        vendor_type=Vendor.VendorType.CANTEEN,
    )
    assert not permission.has_permission(request, None)

    student.role = User.Role.VENDOR
    student.save(update_fields=["role"])
    assert not permission.has_permission(request, None)

    vendor.approval_status = Vendor.ApprovalStatus.APPROVED
    vendor.save(update_fields=["approval_status"])
    assert permission.has_permission(request, None)


@pytest.mark.django_db
def test_vendor_one_to_one_constraint_prevents_duplicate_rows(student):
    Vendor.objects.create(
        user=student,
        business_name="First Business",
        vendor_type=Vendor.VendorType.CANTEEN,
    )

    with pytest.raises(IntegrityError):
        Vendor.objects.create(
            user=student,
            business_name="Duplicate Business",
            vendor_type=Vendor.VendorType.STATIONERY,
        )
