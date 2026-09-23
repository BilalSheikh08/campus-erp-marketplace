"""Analytics endpoint permission and aggregation coverage."""

from decimal import Decimal

import pytest
from rest_framework.test import APIClient
from rest_framework_simplejwt.tokens import RefreshToken

from apps.listings.models import CanteenDetail, Listing
from apps.orders.models import Order, OrderItem
from apps.users.models import User
from apps.vendors.models import Vendor


@pytest.fixture
def api_client():
    return APIClient()


def authenticate(client, user):
    refresh = RefreshToken.for_user(user)
    client.credentials(HTTP_AUTHORIZATION=f"Bearer {refresh.access_token}")


def make_vendor(db, *, email="analytics-vendor@example.com"):
    user = User.objects.create_user(
        email=email,
        password="StrongPass!123",
        name="Analytics Vendor",
        role=User.Role.VENDOR,
    )
    vendor = Vendor.objects.create(
        user=user,
        business_name="Analytics Canteen",
        vendor_type=Vendor.VendorType.CANTEEN,
        approval_status=Vendor.ApprovalStatus.APPROVED,
    )
    return user, vendor


@pytest.mark.django_db
def test_vendor_analytics_permission_is_role_scoped(api_client, db):
    student = User.objects.create_user(
        email="analytics-student@example.com",
        password="StrongPass!123",
        name="Analytics Student",
        role=User.Role.STUDENT,
    )
    authenticate(api_client, student)
    assert api_client.get("/api/analytics/vendor/").status_code == 403


@pytest.mark.django_db
def test_vendor_analytics_returns_completed_revenue(api_client, db):
    vendor_user, vendor = make_vendor(db)
    listing = Listing.objects.create(
        vendor=vendor,
        title="Analytics Lunch",
        description="Lunch",
        price=Decimal("80.00"),
        category_type=Listing.Category.CANTEEN,
        status=Listing.Status.ACTIVE,
    )
    CanteenDetail.objects.create(listing=listing, is_veg=True)
    student = User.objects.create_user(
        email="analytics-customer@example.com",
        password="StrongPass!123",
        name="Customer",
        role=User.Role.STUDENT,
    )
    order = Order.objects.create(
        user=student,
        total_amount=Decimal("160.00"),
        status=Order.Status.COMPLETED,
        pickup_slot="12:30",
        payment_method=Order.PaymentMethod.MOCK,
        payment_status=Order.PaymentStatus.PAID,
        payment_reference="TEST-ANALYTICS",
    )
    OrderItem.objects.create(
        order=order,
        listing=listing,
        vendor=vendor,
        title_snapshot=listing.title,
        vendor_name_snapshot=vendor.business_name,
        quantity=2,
        price_at_order=listing.price,
        subtotal=Decimal("160.00"),
    )

    authenticate(api_client, vendor_user)
    response = api_client.get("/api/analytics/vendor/")
    assert response.status_code == 200
    assert response.data["summary"]["orders"] == 1
    assert response.data["summary"]["completed_orders"] == 1
    assert response.data["summary"]["items_sold"] == 2
    assert response.data["summary"]["revenue"] == 160.0


@pytest.mark.django_db
def test_admin_analytics_is_not_available_to_vendor(api_client, db):
    vendor_user, _vendor = make_vendor(db, email="admin-analytics-vendor@example.com")
    authenticate(api_client, vendor_user)
    assert api_client.get("/api/analytics/admin/").status_code == 403
