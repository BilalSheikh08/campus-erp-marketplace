"""Inventory model, service, and API tests."""

from decimal import Decimal

import pytest
from django.core.exceptions import ValidationError
from django.db import IntegrityError, transaction
from rest_framework.test import APIClient
from rest_framework_simplejwt.tokens import RefreshToken

from apps.listings.models import CanteenDetail, Listing
from apps.users.models import User
from apps.vendors.models import Vendor

from ..models import Inventory
from ..services import (
    InventoryOperationError,
    adjust_stock,
    decrease_stock,
    increase_stock,
    release_reserved_stock,
    reserve_stock,
    update_inventory,
)


@pytest.fixture
def api_client():
    return APIClient()


@pytest.fixture
def admin(db):
    return User.objects.create_superuser(
        email="inventory-admin@example.com",
        password="StrongPass!123",
        name="Inventory Admin",
    )


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


def authenticate(client, user):
    refresh = RefreshToken.for_user(user)
    client.credentials(HTTP_AUTHORIZATION=f"Bearer {refresh.access_token}")


def make_listing(vendor, *, title="Inventory Listing", status=Listing.Status.ACTIVE):
    listing = Listing.objects.create(
        vendor=vendor,
        title=title,
        description="Stockable listing",
        price=Decimal("25.00"),
        category_type=Listing.Category.CANTEEN,
        status=status,
    )
    CanteenDetail.objects.create(listing=listing)
    return listing


@pytest.fixture
def approved_canteen(admin):
    user, vendor = make_vendor(
        email="inventory-owner@example.com",
        name="Inventory Owner",
        vendor_type=Vendor.VendorType.CANTEEN,
        admin=admin,
    )
    return user, vendor, make_listing(vendor)


@pytest.mark.django_db
def test_inventory_uses_uuid_and_calculates_stock_state(approved_canteen):
    _, vendor, listing = approved_canteen
    inventory = Inventory.objects.create(
        listing=listing,
        quantity=12,
        reserved_quantity=2,
        low_stock_threshold=10,
    )

    assert inventory.id.version == 4
    assert inventory.listing.vendor_id == vendor.id
    assert inventory.available_quantity == 10
    assert inventory.stock_status == Inventory.StockStatus.LOW_STOCK
    assert inventory.is_purchasable is True

    inventory.quantity = 0
    inventory.reserved_quantity = 0
    inventory.save()
    assert inventory.stock_status == Inventory.StockStatus.OUT_OF_STOCK
    assert inventory.is_purchasable is False

    inventory.quantity = 11
    inventory.save()
    assert inventory.stock_status == Inventory.StockStatus.IN_STOCK


@pytest.mark.django_db
def test_inventory_is_one_to_one_and_rejects_reserved_over_quantity(approved_canteen):
    _, _, listing = approved_canteen
    Inventory.objects.create(listing=listing, quantity=5)

    with pytest.raises(ValidationError):
        Inventory.objects.create(listing=listing, quantity=5)

    with pytest.raises(ValidationError):
        Inventory.objects.create(
            listing=listing,
            quantity=2,
            reserved_quantity=3,
        )


@pytest.mark.django_db
def test_inventory_rejects_book_listings(admin):
    student = User.objects.create_user(
        email="inventory-book-seller@example.com",
        password="StrongPass!123",
        name="Book Seller",
    )
    listing = Listing.objects.create(
        title="Book without inventory",
        price=Decimal("100.00"),
        category_type=Listing.Category.BOOK,
    )

    with pytest.raises(ValidationError):
        Inventory.objects.create(listing=listing)

    assert student.role == User.Role.STUDENT


@pytest.mark.django_db
def test_inventory_requires_approved_matching_vendor(admin):
    pending_user, pending_vendor = make_vendor(
        email="pending-inventory@example.com",
        name="Pending Inventory",
        vendor_type=Vendor.VendorType.CANTEEN,
        status=Vendor.ApprovalStatus.PENDING,
    )
    approved_user, approved_vendor = make_vendor(
        email="approved-inventory@example.com",
        name="Approved Inventory",
        vendor_type=Vendor.VendorType.CANTEEN,
        admin=admin,
    )
    listing = make_listing(approved_vendor)

    # Simulate an approval being revoked after the Listing was created.
    Vendor.objects.filter(pk=approved_vendor.pk).update(
        approval_status=Vendor.ApprovalStatus.REJECTED,
    )
    listing.refresh_from_db()
    with pytest.raises(ValidationError):
        Inventory.objects.create(listing=listing)

    assert pending_user.role == User.Role.STUDENT
    assert approved_user.role == User.Role.VENDOR
    assert pending_vendor.vendor_type == Vendor.VendorType.CANTEEN


@pytest.mark.django_db
def test_inventory_services_lock_and_preserve_stock_invariants(approved_canteen):
    _, _, listing = approved_canteen
    inventory = Inventory.objects.create(
        listing=listing,
        quantity=10,
        low_stock_threshold=2,
    )

    updated = increase_stock(inventory, 5)
    assert updated.quantity == 15

    updated = reserve_stock(updated, 4)
    assert updated.reserved_quantity == 4
    assert updated.available_quantity == 11

    updated = decrease_stock(updated, 6)
    assert updated.quantity == 9
    assert updated.reserved_quantity == 4
    assert updated.available_quantity == 5

    updated = release_reserved_stock(updated, 3)
    assert updated.reserved_quantity == 1

    with pytest.raises(InventoryOperationError):
        decrease_stock(updated, 9)
    with pytest.raises(InventoryOperationError):
        release_reserved_stock(updated, 3)
    with pytest.raises(InventoryOperationError):
        increase_stock(updated, 0)


@pytest.mark.django_db
def test_reservation_and_consumption_require_active_listing(approved_canteen):
    _, _, listing = approved_canteen
    inventory = Inventory.objects.create(listing=listing, quantity=5)
    listing.status = Listing.Status.INACTIVE
    listing.save(update_fields=["status", "updated_at"])
    inventory.refresh_from_db()

    with pytest.raises(InventoryOperationError):
        reserve_stock(inventory, 1)
    with pytest.raises(InventoryOperationError):
        decrease_stock(inventory, 1)

    # Administrative adjustments remain available for inactive stock.
    assert adjust_stock(inventory, 2).quantity == 7


@pytest.mark.django_db
def test_update_inventory_rejects_quantity_below_reserved(approved_canteen):
    _, _, listing = approved_canteen
    inventory = Inventory.objects.create(
        listing=listing,
        quantity=8,
        reserved_quantity=3,
        low_stock_threshold=2,
    )

    with pytest.raises(InventoryOperationError):
        update_inventory(inventory, quantity=2)
    updated = update_inventory(inventory, quantity=9, low_stock_threshold=4)
    assert updated.quantity == 9
    assert updated.low_stock_threshold == 4


@pytest.mark.django_db
def test_inventory_list_create_and_owner_scope(api_client, approved_canteen, admin):
    owner, _, listing = approved_canteen
    authenticate(api_client, owner)
    create_response = api_client.post(
        "/api/inventory/",
        {"listing": str(listing.id), "quantity": 20, "low_stock_threshold": 5},
        format="json",
    )
    assert create_response.status_code == 201
    assert create_response.data["vendor"] == str(listing.vendor_id)
    assert create_response.data["available_quantity"] == 20
    assert create_response.data["stock_status"] == Inventory.StockStatus.IN_STOCK
    assert create_response.data["is_purchasable"] is True

    list_response = api_client.get("/api/inventory/")
    assert list_response.status_code == 200
    assert len(list_response.data) == 1
    assert "reserved_quantity" in list_response.data[0]

    other_user, _ = make_vendor(
        email="other-inventory-owner@example.com",
        name="Other Inventory Owner",
        vendor_type=Vendor.VendorType.CANTEEN,
        admin=admin,
    )
    authenticate(api_client, other_user)
    assert len(api_client.get("/api/inventory/").data) == 0


@pytest.mark.django_db
def test_admin_can_create_and_list_any_eligible_inventory(api_client, approved_canteen, admin):
    _, _, listing = approved_canteen
    authenticate(api_client, admin)

    response = api_client.post(
        "/api/inventory/",
        {
            "listing": str(listing.id),
            "quantity": 3,
            "vendor": str(admin.id),
        },
        format="json",
    )
    assert response.status_code == 400
    assert "vendor" in response.data

    response = api_client.post(
        "/api/inventory/",
        {"listing": str(listing.id), "quantity": 3},
        format="json",
    )
    assert response.status_code == 201
    assert len(api_client.get("/api/inventory/").data) == 1


@pytest.mark.django_db
def test_inventory_rejects_books_and_cross_vendor_creation(api_client, approved_canteen):
    owner, _, listing = approved_canteen
    book_listing = Listing.objects.create(
        title="Student book",
        price=Decimal("40.00"),
        category_type=Listing.Category.BOOK,
    )
    authenticate(api_client, owner)
    book_response = api_client.post(
        "/api/inventory/",
        {"listing": str(book_listing.id)},
        format="json",
    )
    assert book_response.status_code == 400

    other_user, _ = make_vendor(
        email="cross-vendor-inventory@example.com",
        name="Cross Vendor",
        vendor_type=Vendor.VendorType.CANTEEN,
        admin=None,
    )
    authenticate(api_client, other_user)
    response = api_client.post(
        "/api/inventory/",
        {"listing": str(listing.id)},
        format="json",
    )
    assert response.status_code == 400


@pytest.mark.django_db
def test_inventory_update_protects_listing_and_reserved_fields(api_client, approved_canteen):
    owner, _, listing = approved_canteen
    inventory = Inventory.objects.create(listing=listing, quantity=10)
    authenticate(api_client, owner)

    response = api_client.patch(
        f"/api/inventory/{inventory.id}/",
        {"quantity": 8, "low_stock_threshold": 3},
        format="json",
    )
    assert response.status_code == 200
    inventory.refresh_from_db()
    assert inventory.quantity == 8
    assert inventory.low_stock_threshold == 3

    protected_response = api_client.patch(
        f"/api/inventory/{inventory.id}/",
        {"listing": str(listing.id), "reserved_quantity": 2},
        format="json",
    )
    assert protected_response.status_code == 400


@pytest.mark.django_db
def test_stock_adjustment_endpoint_is_transactional_and_validates_delta(
    api_client, approved_canteen
):
    owner, _, listing = approved_canteen
    inventory = Inventory.objects.create(listing=listing, quantity=4)
    authenticate(api_client, owner)

    response = api_client.post(
        f"/api/inventory/{inventory.id}/adjust/",
        {"quantity_change": 3, "reason": "Delivery received"},
        format="json",
    )
    assert response.status_code == 200
    assert response.data["quantity"] == 7

    response = api_client.post(
        f"/api/inventory/{inventory.id}/adjust/",
        {"quantity_change": -8},
        format="json",
    )
    assert response.status_code == 400
    inventory.refresh_from_db()
    assert inventory.quantity == 7

    response = api_client.post(
        f"/api/inventory/{inventory.id}/adjust/",
        {"quantity_change": 0},
        format="json",
    )
    assert response.status_code == 400


@pytest.mark.django_db
def test_inventory_endpoints_require_approved_vendor_or_admin(api_client, approved_canteen):
    _, _, listing = approved_canteen
    student = User.objects.create_user(
        email="inventory-student@example.com",
        password="StrongPass!123",
        name="Inventory Student",
    )
    authenticate(api_client, student)
    assert api_client.get("/api/inventory/").status_code == 403
    assert api_client.post(
        "/api/inventory/",
        {"listing": str(listing.id)},
        format="json",
    ).status_code == 403


@pytest.mark.django_db
def test_listing_public_response_exposes_safe_availability_only(api_client, approved_canteen):
    _, _, listing = approved_canteen
    response = api_client.get(f"/api/listings/{listing.id}/")
    assert response.status_code == 200
    assert response.data["stock_status"] == Inventory.StockStatus.OUT_OF_STOCK
    assert response.data["is_purchasable"] is False
    assert "quantity" not in response.data
    assert "reserved_quantity" not in response.data

    Inventory.objects.create(listing=listing, quantity=6, low_stock_threshold=2)
    response = api_client.get(f"/api/listings/{listing.id}/")
    assert response.data["stock_status"] == Inventory.StockStatus.IN_STOCK
    assert response.data["is_purchasable"] is True

    listing.status = Listing.Status.INACTIVE
    listing.save(update_fields=["status", "updated_at"])
    response = api_client.get(f"/api/listings/{listing.id}/")
    assert response.data["is_purchasable"] is False


@pytest.mark.django_db
def test_book_listing_has_no_inventory_availability(api_client):
    listing = Listing.objects.create(
        title="No stock book",
        price=Decimal("50.00"),
        category_type=Listing.Category.BOOK,
    )
    response = api_client.get(f"/api/listings/{listing.id}/")
    assert response.status_code == 200
    assert response.data["stock_status"] is None
    assert response.data["is_purchasable"] is False
