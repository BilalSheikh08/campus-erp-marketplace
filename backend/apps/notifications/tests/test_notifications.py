"""Notification and real-time contract tests."""

import pytest
from django.db import transaction
from rest_framework.test import APIClient
from rest_framework_simplejwt.tokens import RefreshToken

from apps.notifications.models import Notification
from apps.notifications.services import create_notification
from apps.users.models import User


@pytest.fixture
def api_client():
    return APIClient()


def authenticate(client, user):
    refresh = RefreshToken.for_user(user)
    client.credentials(HTTP_AUTHORIZATION=f"Bearer {refresh.access_token}")


@pytest.fixture
def student(db):
    return User.objects.create_user(
        email="notif-student@example.com",
        password="StrongPass!123",
        name="Notif Student",
        role=User.Role.STUDENT,
    )


@pytest.fixture
def other_user(db):
    return User.objects.create_user(
        email="other-user@example.com",
        password="StrongPass!123",
        name="Other",
        role=User.Role.STUDENT,
    )


@pytest.mark.django_db
def test_notification_create_own_only(api_client, student):
    authenticate(api_client, student)
    n = Notification.objects.create(user=student, message="Test message")
    response = api_client.get(f"/api/notifications/{n.id}/")
    assert response.status_code == 200
    assert response.data["message"] == "Test message"


@pytest.mark.django_db
def test_notification_list_own_only(api_client, student, other_user):
    Notification.objects.create(user=student, message="Mine")
    Notification.objects.create(user=other_user, message="Theirs")
    authenticate(api_client, student)
    response = api_client.get("/api/notifications/")
    assert response.status_code == 200
    messages = [item["message"] for item in response.data["results"]]
    assert messages == ["Mine"]


@pytest.mark.django_db
def test_notification_cross_user_403(api_client, student, other_user):
    notification = Notification.objects.create(user=other_user, message="Secret")
    authenticate(api_client, student)
    response = api_client.patch(
        f"/api/notifications/{notification.id}/",
        {"is_read": True},
        format="json",
    )
    assert response.status_code == 403
    notification.refresh_from_db()
    assert notification.is_read is False


@pytest.mark.django_db
def test_notification_unread_count_exact(api_client, student):
    Notification.objects.create(user=student, message="A", is_read=False)
    Notification.objects.create(user=student, message="B", is_read=False)
    Notification.objects.create(user=student, message="C", is_read=True)
    Notification.objects.create(user=User.objects.create_user(email="other@e.com", name="Other"), message="Other")
    authenticate(api_client, student)
    response = api_client.get("/api/notifications/unread-count/")
    assert response.status_code == 200
    assert response.data == {"unread_count": 2}


@pytest.mark.django_db
def test_notification_mark_own_read(api_client, student):
    notification = Notification.objects.create(user=student, message="X", is_read=False)
    authenticate(api_client, student)
    response = api_client.patch(
        f"/api/notifications/{notification.id}/",
        {"is_read": True},
        format="json",
    )
    assert response.status_code == 200
    notification.refresh_from_db()
    assert notification.is_read is True


@pytest.mark.django_db
def test_notification_unauthenticated_rejected(api_client, student):
    notification = Notification.objects.create(user=student, message="X")
    assert api_client.get("/api/notifications/").status_code == 401
    assert api_client.patch(
        f"/api/notifications/{notification.id}/",
        {"is_read": True},
        format="json",
    ).status_code == 401


@pytest.mark.django_db
def test_notification_404_not_found(api_client, student):
    authenticate(api_client, student)
    response = api_client.get("/api/notifications/00000000-0000-0000-0000-000000000000/")
    assert response.status_code == 404


@pytest.mark.django_db
def test_notification_pagination_and_filters(api_client, student):
    for index in range(25):
        Notification.objects.create(
            user=student,
            message=f"Msg {index}",
            is_read=index >= 20,
            category="order" if index % 2 == 0 else "hostel",
        )
    authenticate(api_client, student)

    page = api_client.get("/api/notifications/?page_size=10")
    assert page.status_code == 200
    assert page.data["count"] == 25
    assert len(page.data["results"]) == 10

    unread = api_client.get("/api/notifications/?unread=true&category=order&page_size=100")
    assert unread.status_code == 200
    assert unread.data["count"] == 10
    assert all(item["is_read"] is False for item in unread.data["results"])
    assert all(item["category"] == "order" for item in unread.data["results"])


@pytest.mark.django_db
def test_server_does_not_expose_notification_post(api_client, student):
    authenticate(api_client, student)
    response = api_client.post(
        "/api/notifications/",
        {"message": "forged"},
        format="json",
    )
    assert response.status_code == 405
    assert Notification.objects.count() == 0


@pytest.mark.django_db
def test_notification_transaction_rollback(student):
    assert Notification.objects.count() == 0
    with pytest.raises(RuntimeError):
        with transaction.atomic():
            create_notification(
                student,
                Notification.NotificationType.SYSTEM,
                "Transient",
            )
            raise RuntimeError("force rollback")
    assert Notification.objects.count() == 0

@pytest.mark.django_db
def test_notification_type_filter_uses_server_type(api_client, student):
    Notification.objects.create(
        user=student,
        message="Order update",
        notification_type=Notification.NotificationType.ORDER,
        category="order",
    )
    Notification.objects.create(
        user=student,
        message="Book update",
        notification_type=Notification.NotificationType.BOOK,
        category="book",
    )
    authenticate(api_client, student)
    response = api_client.get("/api/notifications/?notification_type=book")
    assert response.status_code == 200
    assert response.data["count"] == 1
    assert response.data["results"][0]["notification_type"] == Notification.NotificationType.BOOK


@pytest.mark.django_db
def test_notification_rejects_immutable_field_mutation(api_client, student):
    notification = Notification.objects.create(user=student, message="Original")
    authenticate(api_client, student)
    response = api_client.patch(
        f"/api/notifications/{notification.id}/",
        {"message": "Forged", "is_read": True},
        format="json",
    )
    assert response.status_code == 400
    notification.refresh_from_db()
    assert notification.message == "Original"
    assert notification.is_read is False

@pytest.mark.django_db
def test_order_transition_notification_reaches_order_participants(student, other_user):
    from decimal import Decimal
    from apps.listings.models import CanteenDetail, Listing
    from apps.orders.models import Order, OrderItem
    from apps.vendors.models import Vendor
    from apps.notifications.services import notify_order_transition

    vendor_user = User.objects.create_user(
        email="order-notif-vendor@example.com",
        password="StrongPass!123",
        name="Order Vendor",
        role=User.Role.VENDOR,
    )
    vendor = Vendor.objects.create(
        user=vendor_user,
        business_name="Order Vendor Business",
        vendor_type=Vendor.VendorType.CANTEEN,
        approval_status=Vendor.ApprovalStatus.APPROVED,
    )
    listing = Listing.objects.create(
        vendor=vendor,
        title="Order Test Item",
        description="Item",
        price=Decimal("50.00"),
        category_type=Listing.Category.CANTEEN,
    )
    CanteenDetail.objects.create(listing=listing, is_veg=True)
    order = Order.objects.create(
        user=student,
        total_amount=Decimal("50.00"),
        status=Order.Status.PLACED,
        pickup_slot="12:00",
        payment_method=Order.PaymentMethod.MOCK,
        payment_status=Order.PaymentStatus.PAID,
    )
    OrderItem.objects.create(
        order=order,
        listing=listing,
        vendor=vendor,
        title_snapshot=listing.title,
        vendor_name_snapshot=vendor.business_name,
        quantity=1,
        price_at_order=listing.price,
        subtotal=listing.price,
    )

    notifications = notify_order_transition(order, student, Order.Status.CONFIRMED)
    assert len(notifications) == 2
    assert Notification.objects.filter(user=student, notification_type=Notification.NotificationType.ORDER).count() == 1
    assert Notification.objects.filter(user=vendor_user, notification_type=Notification.NotificationType.ORDER).count() == 1
    assert "confirmed" in Notification.objects.get(user=student).message
    assert not Notification.objects.filter(user=other_user, notification_type=Notification.NotificationType.ORDER).exists()


@pytest.mark.django_db
def test_hostel_transition_notification_reaches_student_and_assigned_warden(student):
    from datetime import date
    from decimal import Decimal
    from apps.hostel_requests.models import HostelRequest
    from apps.listings.models import HostelSupplyDetail, Listing
    from apps.notifications.services import notify_hostel_request_transition
    from apps.vendors.models import Vendor

    warden = User.objects.create_user(
        email="hostel-notif-warden@example.com",
        password="StrongPass!123",
        name="Hostel Warden",
        role=User.Role.WARDEN,
    )
    vendor_user = User.objects.create_user(
        email="hostel-notif-vendor@example.com",
        password="StrongPass!123",
        name="Supply Vendor",
        role=User.Role.VENDOR,
    )
    vendor = Vendor.objects.create(
        user=vendor_user,
        business_name="Supply Vendor Business",
        vendor_type=Vendor.VendorType.HOSTEL_SUPPLY,
        approval_status=Vendor.ApprovalStatus.APPROVED,
    )
    listing = Listing.objects.create(
        vendor=vendor,
        title="Hostel Kit",
        description="Kit",
        price=Decimal("75.00"),
        category_type=Listing.Category.HOSTEL_SUPPLY,
    )
    HostelSupplyDetail.objects.create(listing=listing, request_only=True)
    request = HostelRequest.objects.create(
        student=student,
        listing=listing,
        quantity=1,
        required_by_date=date.today(),
        assigned_warden=warden,
        status=HostelRequest.Status.PENDING_APPROVAL,
    )

    notifications = notify_hostel_request_transition(request, warden, HostelRequest.Status.APPROVED)
    assert len(notifications) == 2
    assert Notification.objects.filter(user=student, notification_type=Notification.NotificationType.HOSTEL).count() == 1
    assert Notification.objects.filter(user=warden, notification_type=Notification.NotificationType.HOSTEL).count() == 1
