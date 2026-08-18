"""Cart, checkout, and order lifecycle coverage."""

from decimal import Decimal

import pytest
from django.db import IntegrityError, transaction
from rest_framework.test import APIClient
from rest_framework_simplejwt.tokens import RefreshToken

from apps.inventory.models import Inventory
from apps.inventory.services import increase_stock
from apps.listings.models import (
    BookDetail,
    CanteenDetail,
    HostelSupplyDetail,
    Listing,
    StationeryDetail,
)
from apps.users.models import User
from apps.vendors.models import Vendor

from ..models import Cart, CartItem, Order, OrderItem, OrderStatusLog
from ..services import (
    ALLOWED_TRANSITIONS,
    OrderOperationError,
    checkout_cart,
    transition_order,
)


@pytest.fixture
def api_client():
    return APIClient()


@pytest.fixture
def admin(db):
    return User.objects.create_superuser(
        email="orders-admin@example.com",
        password="StrongPass!123",
        name="Orders Admin",
    )


@pytest.fixture
def student(db):
    return User.objects.create_user(
        email="orders-student@example.com",
        password="StrongPass!123",
        name="Orders Student",
    )


def authenticate(client, user):
    refresh = RefreshToken.for_user(user)
    client.credentials(HTTP_AUTHORIZATION=f"Bearer {refresh.access_token}")


def make_vendor(*, admin, email, name, vendor_type=Vendor.VendorType.CANTEEN):
    user = User.objects.create_user(
        email=email,
        password="StrongPass!123",
        name=name,
    )
    vendor = Vendor.objects.create(
        user=user,
        business_name=f"{name} Business",
        vendor_type=vendor_type,
        approval_status=Vendor.ApprovalStatus.APPROVED,
        approved_by=admin,
    )
    user.role = User.Role.VENDOR
    user.save(update_fields=["role"])
    return user, vendor


def make_listing(vendor, *, title="Lunch", price="25.00", status=Listing.Status.ACTIVE):
    listing = Listing.objects.create(
        vendor=vendor,
        title=title,
        description="Purchasable test listing",
        price=Decimal(price),
        category_type=Listing.Category.CANTEEN,
        status=status,
    )
    CanteenDetail.objects.create(listing=listing, is_veg=True)
    return listing


def make_stationery_listing(vendor, *, title="Notebook", price="10.00"):
    listing = Listing.objects.create(
        vendor=vendor,
        title=title,
        description="Stationery test listing",
        price=Decimal(price),
        category_type=Listing.Category.STATIONERY,
    )
    StationeryDetail.objects.create(
        listing=listing,
        sku=f"SKU-{listing.pk}",
        unit="piece",
    )
    return listing


def make_book(student, *, title="Used Book"):
    listing = Listing.objects.create(
        title=title,
        description="Student book",
        price=Decimal("12.00"),
        category_type=Listing.Category.BOOK,
    )
    BookDetail.objects.create(
        listing=listing,
        seller=student,
        condition=BookDetail.Condition.GOOD,
    )
    return listing


def make_request_only_listing(vendor):
    listing = Listing.objects.create(
        vendor=vendor,
        title="Hostel Kit",
        description="Request-only supply",
        price=Decimal("40.00"),
        category_type=Listing.Category.HOSTEL_SUPPLY,
    )
    HostelSupplyDetail.objects.create(
        listing=listing,
        request_only=True,
        supply_category="kit",
    )
    return listing


@pytest.fixture
def approved_canteen(admin):
    vendor_user, vendor = make_vendor(
        admin=admin,
        email="canteen-owner@example.com",
        name="Canteen Owner",
    )
    listing = make_listing(vendor)
    inventory = Inventory.objects.create(listing=listing, quantity=10)
    return vendor_user, vendor, listing, inventory


@pytest.mark.django_db
def test_cart_is_owned_and_duplicate_adds_increment(api_client, student, approved_canteen):
    _vendor_user, _vendor, listing, _inventory = approved_canteen
    authenticate(api_client, student)

    response = api_client.post(
        "/api/cart/items/",
        {"listing": str(listing.pk), "quantity": 2},
        format="json",
    )
    assert response.status_code == 201
    response = api_client.post(
        "/api/cart/items/",
        {"listing": str(listing.pk), "quantity": 3},
        format="json",
    )
    assert response.status_code == 201
    assert response.data["quantity"] == 5
    assert Cart.objects.get(user=student).items.count() == 1


@pytest.mark.django_db
def test_cart_rejects_book_request_only_and_missing_inventory(
    api_client,
    student,
    admin,
    approved_canteen,
):
    _vendor_user, vendor, _listing, _inventory = approved_canteen
    _hostel_user, hostel_vendor = make_vendor(
        admin=admin,
        email="hostel-owner@example.com",
        name="Hostel Owner",
        vendor_type=Vendor.VendorType.HOSTEL_SUPPLY,
    )
    authenticate(api_client, student)

    book = make_book(student)
    response = api_client.post(
        "/api/cart/items/",
        {"listing": str(book.pk), "quantity": 1},
        format="json",
    )
    assert response.status_code == 400

    request_only = make_request_only_listing(hostel_vendor)
    Inventory.objects.create(listing=request_only, quantity=4)
    response = api_client.post(
        "/api/cart/items/",
        {"listing": str(request_only.pk), "quantity": 1},
        format="json",
    )
    assert response.status_code == 400

    no_inventory = make_listing(vendor, title="Not stocked")
    response = api_client.post(
        "/api/cart/items/",
        {"listing": str(no_inventory.pk), "quantity": 1},
        format="json",
    )
    assert response.status_code == 400


@pytest.mark.django_db
def test_checkout_snapshots_price_deducts_stock_and_clears_cart(
    api_client,
    student,
    approved_canteen,
):
    _vendor_user, _vendor, listing, inventory = approved_canteen
    authenticate(api_client, student)
    api_client.post(
        "/api/cart/items/",
        {"listing": str(listing.pk), "quantity": 3},
        format="json",
    )

    response = api_client.post(
        "/api/orders/checkout/",
        {
            "payment_method": Order.PaymentMethod.MOCK,
            "pickup_slot": "12:30",
            "total_amount": "0.01",
        },
        format="json",
    )
    assert response.status_code == 400
    assert inventory.quantity == 10

    response = api_client.post(
        "/api/orders/checkout/",
        {"payment_method": Order.PaymentMethod.MOCK, "pickup_slot": "12:30"},
        format="json",
    )
    assert response.status_code == 201
    order = Order.objects.get(user=student)
    item = order.items.get()
    assert order.total_amount == Decimal("75.00")
    assert item.price_at_order == Decimal("25.00")
    assert item.subtotal == Decimal("75.00")
    assert order.payment_status == Order.PaymentStatus.PAID
    assert order.status_logs.count() == 1
    assert inventory.__class__.objects.get(pk=inventory.pk).quantity == 7
    assert not CartItem.objects.filter(cart__user=student).exists()

    listing.price = Decimal("99.00")
    listing.save(update_fields=["price", "updated_at"])
    item.refresh_from_db()
    assert item.price_at_order == Decimal("25.00")
    assert item.subtotal == Decimal("75.00")


@pytest.mark.django_db
def test_checkout_splits_mixed_vendor_cart(api_client, student, admin, approved_canteen):
    _vendor_user, _vendor, first_listing, _inventory = approved_canteen
    _other_user, other_vendor = make_vendor(
        admin=admin,
        email="second-vendor@example.com",
        name="Second Vendor",
        vendor_type=Vendor.VendorType.STATIONERY,
    )
    second_listing = make_stationery_listing(other_vendor)
    Inventory.objects.create(listing=second_listing, quantity=5)

    authenticate(api_client, student)
    for listing in (first_listing, second_listing):
        response = api_client.post(
            "/api/cart/items/",
            {"listing": str(listing.pk), "quantity": 1},
            format="json",
        )
        assert response.status_code == 201

    response = api_client.post(
        "/api/orders/checkout/",
        {"payment_method": Order.PaymentMethod.CASH_ON_PICKUP},
        format="json",
    )
    assert response.status_code == 201
    assert len(response.data["orders"]) == 2
    assert Order.objects.filter(user=student).count() == 2
    assert set(Order.objects.values_list("payment_status", flat=True)) == {
        Order.PaymentStatus.PENDING
    }


@pytest.mark.django_db
def test_checkout_failure_keeps_cart_and_stock(api_client, student, approved_canteen):
    _vendor_user, _vendor, listing, inventory = approved_canteen
    authenticate(api_client, student)
    api_client.post(
        "/api/cart/items/",
        {"listing": str(listing.pk), "quantity": 4},
        format="json",
    )
    inventory.quantity = 2
    inventory.save(update_fields=["quantity", "updated_at"])

    response = api_client.post(
        "/api/orders/checkout/",
        {"payment_method": Order.PaymentMethod.MOCK},
        format="json",
    )
    assert response.status_code == 400
    assert Order.objects.count() == 0
    assert CartItem.objects.filter(cart__user=student).count() == 1
    inventory.refresh_from_db()
    assert inventory.quantity == 2


@pytest.mark.django_db
def test_cancellation_restores_stock_once_and_refunds_mock_payment(
    student,
    approved_canteen,
):
    _vendor_user, _vendor, listing, inventory = approved_canteen
    CartItem.objects.create(
        cart=Cart.objects.create(user=student),
        listing=listing,
        quantity=2,
    )
    order = checkout_cart(student, payment_method=Order.PaymentMethod.MOCK)[0]
    inventory.refresh_from_db()
    assert inventory.quantity == 8

    cancelled = transition_order(
        order,
        student,
        target_status=Order.Status.CANCELLED,
    )
    assert cancelled.status == Order.Status.CANCELLED
    assert cancelled.payment_status == Order.PaymentStatus.REFUNDED
    assert cancelled.stock_restored_at is not None
    inventory.refresh_from_db()
    assert inventory.quantity == 10

    with pytest.raises(OrderOperationError):
        transition_order(order, student, target_status=Order.Status.CANCELLED)
    inventory.refresh_from_db()
    assert inventory.quantity == 10


@pytest.mark.django_db
def test_vendor_fulfillment_and_student_completion_follow_state_machine(
    student,
    approved_canteen,
):
    vendor_user, _vendor, listing, _inventory = approved_canteen
    CartItem.objects.create(
        cart=Cart.objects.create(user=student),
        listing=listing,
        quantity=1,
    )
    order = checkout_cart(student, payment_method=Order.PaymentMethod.CASH_ON_PICKUP)[0]

    assert set(ALLOWED_TRANSITIONS[Order.Status.PLACED]) == {
        Order.Status.CONFIRMED,
        Order.Status.CANCELLED,
    }
    order = transition_order(order, vendor_user, target_status=Order.Status.CONFIRMED)
    order = transition_order(order, vendor_user, target_status=Order.Status.READY)
    order = transition_order(order, student, target_status=Order.Status.COMPLETED)
    assert order.status == Order.Status.COMPLETED
    assert order.status_logs.count() == 4
    with pytest.raises(OrderOperationError):
        transition_order(order, student, target_status=Order.Status.CANCELLED)


@pytest.mark.django_db
def test_order_visibility_isolated_between_students_and_vendor(
    api_client,
    student,
    admin,
    approved_canteen,
):
    vendor_user, _vendor, listing, _inventory = approved_canteen
    other_student = User.objects.create_user(
        email="other-orders-student@example.com",
        password="StrongPass!123",
        name="Other Student",
    )
    CartItem.objects.create(
        cart=Cart.objects.create(user=student),
        listing=listing,
        quantity=1,
    )
    order = checkout_cart(student, payment_method=Order.PaymentMethod.MOCK)[0]

    authenticate(api_client, other_student)
    assert api_client.get("/api/orders/").status_code == 200
    assert api_client.get("/api/orders/").data == []
    assert api_client.get(f"/api/orders/{order.pk}/").status_code == 404

    authenticate(api_client, vendor_user)
    response = api_client.get("/api/orders/")
    assert response.status_code == 200
    assert len(response.data) == 1

    authenticate(api_client, admin)
    response = api_client.get("/api/orders/")
    assert response.status_code == 200
    assert len(response.data) == 1


@pytest.mark.django_db
def test_cart_and_order_database_constraints(student, approved_canteen):
    _vendor_user, _vendor, listing, _inventory = approved_canteen
    cart = Cart.objects.create(user=student)
    CartItem.objects.create(cart=cart, listing=listing, quantity=1)
    with pytest.raises(IntegrityError):
        with transaction.atomic():
            CartItem.objects.create(cart=cart, listing=listing, quantity=1)

    with pytest.raises(IntegrityError):
        with transaction.atomic():
            CartItem.objects.create(cart=cart, listing=listing, quantity=0)


def test_payment_methods_are_explicit():
    assert set(Order.PaymentMethod.values) == {
        "mock",
        "campus_wallet",
        "cash_on_pickup",
    }
