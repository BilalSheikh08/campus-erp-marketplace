"""Shared catalog API and domain validation tests."""

from decimal import Decimal

import pytest
from django.core.exceptions import ValidationError
from django.db import IntegrityError, transaction
from rest_framework.test import APIClient
from rest_framework_simplejwt.tokens import RefreshToken

from apps.users.models import User
from apps.vendors.models import Vendor

from ..models import BookDetail, CanteenDetail, Listing, StationeryDetail


@pytest.fixture
def api_client():
    return APIClient()


@pytest.fixture
def student(db):
    return User.objects.create_user(
        email="book-seller@example.com",
        password="StrongPass!123",
        name="Book Seller",
    )


@pytest.fixture
def second_student(db):
    return User.objects.create_user(
        email="other-student@example.com",
        password="StrongPass!123",
        name="Other Student",
    )


@pytest.fixture
def admin(db):
    return User.objects.create_superuser(
        email="catalog-admin@example.com",
        password="StrongPass!123",
        name="Catalog Admin",
    )


def authenticate(client, user):
    refresh = RefreshToken.for_user(user)
    client.credentials(HTTP_AUTHORIZATION=f"Bearer {refresh.access_token}")


def make_vendor(*, email, name, vendor_type, status=Vendor.ApprovalStatus.APPROVED, admin=None):
    user = User.objects.create_user(
        email=email,
        password="StrongPass!123",
        name=name,
    )
    vendor = Vendor.objects.create(
        user=user,
        business_name=f"{name} Business",
        vendor_type=vendor_type,
        approval_status=status,
    )
    if status == Vendor.ApprovalStatus.APPROVED:
        vendor.approved_by = admin
        vendor.save(update_fields=["approved_by"])
        user.role = User.Role.VENDOR
        user.save(update_fields=["role"])
    return user, vendor


def canteen_payload(**overrides):
    payload = {
        "title": "Vegetable Rice",
        "description": "Fresh lunch bowl",
        "price": "65.00",
        "category_type": "canteen",
        "canteen_detail": {
            "is_veg": True,
            "prep_time_minutes": 15,
            "available_from": "09:00:00",
            "available_to": "15:00:00",
        },
    }
    payload.update(overrides)
    return payload


def stationery_payload(**overrides):
    payload = {
        "title": "A4 Notebook",
        "description": "Ruled notebook",
        "price": "80.00",
        "category_type": "stationery",
        "stationery_detail": {
            "sku": "NOTEBOOK-A4-001",
            "unit": "piece",
            "barcode": "890000000001",
        },
    }
    payload.update(overrides)
    return payload


def hostel_payload(**overrides):
    payload = {
        "title": "Laundry Detergent",
        "description": "Campus hostel supply",
        "price": "120.00",
        "category_type": "hostel_supply",
        "hostel_supply_detail": {
            "request_only": True,
            "supply_category": "cleaning",
        },
    }
    payload.update(overrides)
    return payload


def book_payload(**overrides):
    payload = {
        "title": "Operating Systems",
        "description": "Second-hand textbook",
        "price": "350.00",
        "category_type": "book",
        "book_detail": {
            "condition": "good",
            "author": "A. Author",
            "subject": "Computer Science",
            "edition": "3rd",
        },
    }
    payload.update(overrides)
    return payload


@pytest.mark.django_db
def test_listing_uses_uuid_and_rejects_negative_price(student):
    listing = Listing.objects.create(
        title="Free Book",
        price=Decimal("0.00"),
        category_type=Listing.Category.BOOK,
    )
    assert listing.id.version == 4

    with pytest.raises(ValidationError):
        Listing.objects.create(
            title="Invalid Price",
            price=Decimal("-1.00"),
            category_type=Listing.Category.BOOK,
        )


@pytest.mark.django_db
def test_all_domain_details_validate_and_are_one_to_one(admin):
    vendor_user, canteen_vendor = make_vendor(
        email="canteen@example.com",
        name="Canteen Owner",
        vendor_type=Vendor.VendorType.CANTEEN,
        admin=admin,
    )
    canteen = Listing.objects.create(
        vendor=canteen_vendor,
        title="Meal",
        price=10,
        category_type=Listing.Category.CANTEEN,
    )
    CanteenDetail.objects.create(listing=canteen, is_veg=True)
    with pytest.raises(IntegrityError):
        with transaction.atomic():
            CanteenDetail.objects.create(listing=canteen, is_veg=False)

    stationery_vendor_user, stationery_vendor = make_vendor(
        email="stationery@example.com",
        name="Stationery Owner",
        vendor_type=Vendor.VendorType.STATIONERY,
        admin=admin,
    )
    stationery = Listing.objects.create(
        vendor=stationery_vendor,
        title="Pen",
        price=5,
        category_type=Listing.Category.STATIONERY,
    )
    StationeryDetail.objects.create(listing=stationery, sku="PEN-001", unit="piece")

    book_seller = User.objects.create_user(
        email="direct-book@example.com",
        password="StrongPass!123",
        name="Direct Seller",
    )
    book = Listing.objects.create(
        title="Algorithms",
        price=50,
        category_type=Listing.Category.BOOK,
    )
    detail = BookDetail.objects.create(
        listing=book,
        seller=book_seller,
        condition=BookDetail.Condition.GOOD,
    )
    assert detail.seller_id == book_seller.id
    assert vendor_user.role == User.Role.VENDOR
    assert stationery_vendor_user.role == User.Role.VENDOR


@pytest.mark.django_db
def test_invalid_vendor_and_detail_relationships_are_rejected(admin, student):
    _, canteen_vendor = make_vendor(
        email="relationship-canteen@example.com",
        name="Relationship Canteen",
        vendor_type=Vendor.VendorType.CANTEEN,
        admin=admin,
    )
    with pytest.raises(ValidationError):
        Listing.objects.create(
            vendor=None,
            title="Missing Vendor",
            price=10,
            category_type=Listing.Category.CANTEEN,
        )
    with pytest.raises(ValidationError):
        Listing.objects.create(
            vendor=canteen_vendor,
            title="Wrong Vendor Domain",
            price=10,
            category_type=Listing.Category.STATIONERY,
        )

    book = Listing.objects.create(
        title="Book",
        price=10,
        category_type=Listing.Category.BOOK,
    )
    with pytest.raises(ValidationError):
        CanteenDetail.objects.create(listing=book)

    student.role = User.Role.VENDOR
    student.save(update_fields=["role"])
    with pytest.raises(ValidationError):
        BookDetail.objects.create(
            listing=book,
            seller=student,
            condition=BookDetail.Condition.GOOD,
        )


@pytest.mark.django_db
def test_approved_matching_vendor_can_create_each_vendor_domain(api_client, admin):
    canteen_user, _ = make_vendor(
        email="api-canteen@example.com",
        name="API Canteen",
        vendor_type=Vendor.VendorType.CANTEEN,
        admin=admin,
    )
    authenticate(api_client, canteen_user)
    canteen_response = api_client.post(
        "/api/listings/", canteen_payload(), format="json"
    )
    assert canteen_response.status_code == 201
    assert canteen_response.data["vendor"] is not None
    assert canteen_response.data["canteen_detail"]["is_veg"] is True

    stationery_user, _ = make_vendor(
        email="api-stationery@example.com",
        name="API Stationery",
        vendor_type=Vendor.VendorType.STATIONERY,
        admin=admin,
    )
    authenticate(api_client, stationery_user)
    stationery_response = api_client.post(
        "/api/listings/", stationery_payload(), format="json"
    )
    assert stationery_response.status_code == 201

    hostel_user, _ = make_vendor(
        email="api-hostel@example.com",
        name="API Hostel",
        vendor_type=Vendor.VendorType.HOSTEL_SUPPLY,
        admin=admin,
    )
    authenticate(api_client, hostel_user)
    hostel_response = api_client.post(
        "/api/listings/", hostel_payload(), format="json"
    )
    assert hostel_response.status_code == 201


@pytest.mark.django_db
def test_pending_rejected_and_mismatched_vendors_cannot_create(api_client, admin):
    pending_user, _ = make_vendor(
        email="pending-listing@example.com",
        name="Pending Listing",
        vendor_type=Vendor.VendorType.CANTEEN,
        status=Vendor.ApprovalStatus.PENDING,
    )
    authenticate(api_client, pending_user)
    pending_response = api_client.post(
        "/api/listings/", canteen_payload(), format="json"
    )
    assert pending_response.status_code == 400

    rejected_user, _ = make_vendor(
        email="rejected-listing@example.com",
        name="Rejected Listing",
        vendor_type=Vendor.VendorType.CANTEEN,
        status=Vendor.ApprovalStatus.REJECTED,
    )
    authenticate(api_client, rejected_user)
    rejected_response = api_client.post(
        "/api/listings/", canteen_payload(), format="json"
    )
    assert rejected_response.status_code == 400

    mismatched_user, _ = make_vendor(
        email="mismatch-listing@example.com",
        name="Mismatch Listing",
        vendor_type=Vendor.VendorType.STATIONERY,
        admin=admin,
    )
    authenticate(api_client, mismatched_user)
    mismatch_response = api_client.post(
        "/api/listings/", canteen_payload(), format="json"
    )
    assert mismatch_response.status_code == 400


@pytest.mark.django_db
def test_student_book_listing_derives_seller_and_rejects_overrides(
    api_client, student, admin
):
    authenticate(api_client, student)
    response = api_client.post("/api/listings/", book_payload(), format="json")
    assert response.status_code == 201
    listing = Listing.objects.get(pk=response.data["id"])
    assert listing.vendor_id is None
    assert listing.book_detail.seller_id == student.id
    assert response.data["book_detail"]["seller"] == str(student.id)

    override = api_client.post(
        "/api/listings/",
        book_payload(vendor=str(admin.id)),
        format="json",
    )
    assert override.status_code == 400


@pytest.mark.django_db
def test_public_catalog_search_filters_and_pagination(api_client, admin):
    canteen_user, canteen_vendor = make_vendor(
        email="filter-canteen@example.com",
        name="Filter Canteen",
        vendor_type=Vendor.VendorType.CANTEEN,
        admin=admin,
    )
    for index in range(3):
        listing = Listing.objects.create(
            vendor=canteen_vendor,
            title=f"Filter Meal {index}",
            description="Searchable lunch",
            price=Decimal(str(20 + index * 10)),
            category_type=Listing.Category.CANTEEN,
        )
        CanteenDetail.objects.create(listing=listing)

    other_listing = Listing.objects.create(
        vendor=canteen_vendor,
        title="Hidden Meal",
        price=200,
        category_type=Listing.Category.CANTEEN,
        status=Listing.Status.INACTIVE,
    )
    CanteenDetail.objects.create(listing=other_listing)

    response = api_client.get(
        "/api/listings/?search=Searchable&min_price=25&max_price=45&page_size=1"
    )
    assert response.status_code == 200
    assert response.data["count"] == 2
    assert len(response.data["results"]) == 1

    vendor_response = api_client.get(
        f"/api/listings/?vendor={canteen_vendor.id}&category=canteen"
    )
    assert vendor_response.status_code == 200
    assert vendor_response.data["count"] == 3

    inactive_response = api_client.get(
        "/api/listings/?availability=inactive"
    )
    assert inactive_response.status_code == 200
    assert inactive_response.data["count"] == 1


@pytest.mark.django_db
def test_owner_admin_update_and_delete_are_authorized(
    api_client, student, second_student, admin
):
    authenticate(api_client, student)
    create_response = api_client.post("/api/listings/", book_payload(), format="json")
    listing_id = create_response.data["id"]

    authenticate(api_client, second_student)
    forbidden_update = api_client.patch(
        f"/api/listings/{listing_id}/",
        {"title": "Not Mine"},
        format="json",
    )
    forbidden_delete = api_client.delete(f"/api/listings/{listing_id}/")
    assert forbidden_update.status_code == 403
    assert forbidden_delete.status_code == 403

    authenticate(api_client, student)
    update_response = api_client.patch(
        f"/api/listings/{listing_id}/",
        {"title": "Updated Title", "price": "375.00"},
        format="json",
    )
    assert update_response.status_code == 200
    assert update_response.data["title"] == "Updated Title"

    authenticate(api_client, admin)
    delete_response = api_client.delete(f"/api/listings/{listing_id}/")
    assert delete_response.status_code == 204
    listing = Listing.objects.get(pk=listing_id)
    assert listing.status == Listing.Status.INACTIVE

    public_detail = api_client.get(f"/api/listings/{listing_id}/")
    assert public_detail.status_code == 200
    assert public_detail.data["status"] == Listing.Status.INACTIVE


@pytest.mark.django_db
def test_category_alias_is_normalized(api_client, student):
    authenticate(api_client, student)
    payload = book_payload()
    payload.pop("category_type")
    payload["domain"] = "book"
    response = api_client.post("/api/listings/", payload, format="json")
    assert response.status_code == 201
    assert response.data["category_type"] == Listing.Category.BOOK
