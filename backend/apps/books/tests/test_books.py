"""Second-hand book marketplace API and transaction lifecycle tests."""

from decimal import Decimal

import pytest
from django.db import IntegrityError
from rest_framework.test import APIClient
from rest_framework_simplejwt.tokens import RefreshToken

from apps.listings.models import BookDetail, Listing
from apps.notifications.models import Notification
from apps.users.models import User

from ..models import BookTransaction, BookTransactionStatusLog


@pytest.fixture
def api_client():
    return APIClient()


@pytest.fixture
def seller(db):
    return User.objects.create_user(
        email="book-seller@example.com",
        password="StrongPass!123",
        name="Book Seller",
        role=User.Role.STUDENT,
    )


@pytest.fixture
def buyer(db):
    return User.objects.create_user(
        email="book-buyer@example.com",
        password="StrongPass!123",
        name="Book Buyer",
        role=User.Role.STUDENT,
    )


def authenticate(client, user):
    refresh = RefreshToken.for_user(user)
    client.credentials(HTTP_AUTHORIZATION=f"Bearer {refresh.access_token}")


def make_book(seller, *, title="Operating Systems"):
    listing = Listing.objects.create(
        title=title,
        description="Clean used textbook",
        price=Decimal("450.00"),
        category_type=Listing.Category.BOOK,
        status=Listing.Status.ACTIVE,
    )
    detail = BookDetail.objects.create(
        listing=listing,
        seller=seller,
        condition=BookDetail.Condition.GOOD,
        author="Test Author",
        subject="CSE",
        edition="4th",
    )
    return listing, detail


@pytest.mark.django_db
def test_browse_books_only_returns_available_books(api_client, seller):
    listing, _detail = make_book(seller)
    unavailable, unavailable_detail = make_book(seller, title="Unavailable")
    unavailable_detail.is_available = False
    unavailable_detail.save(update_fields=["is_available"])
    unavailable.status = Listing.Status.SOLD
    unavailable.save(update_fields=["status", "updated_at"])

    response = api_client.get("/api/books/")
    assert response.status_code == 200
    assert response.data["count"] == 1
    assert response.data["results"][0]["id"] == str(listing.id)


@pytest.mark.django_db
def test_student_can_create_book_without_vendor(api_client, seller):
    authenticate(api_client, seller)
    response = api_client.post(
        "/api/books/",
        {
            "title": "Database Systems",
            "description": "Annotated but clean",
            "price": "300.00",
            "condition": "good",
            "author": "Author",
            "subject": "DBMS",
            "edition": "3rd",
        },
        format="json",
    )
    assert response.status_code == 201
    listing = Listing.objects.get(pk=response.data["id"])
    assert listing.vendor_id is None
    assert listing.category_type == Listing.Category.BOOK
    assert listing.book_detail.seller_id == seller.id


@pytest.mark.django_db
def test_reserve_then_confirm_then_complete(api_client, seller, buyer):
    listing, detail = make_book(seller)
    authenticate(api_client, buyer)

    reserve_response = api_client.post(f"/api/books/{listing.id}/reserve/")
    assert reserve_response.status_code == 201
    transaction_id = reserve_response.data["id"]
    assert BookTransaction.objects.get(pk=transaction_id).status == BookTransaction.Status.RESERVED
    assert Notification.objects.filter(user=seller, notification_type=Notification.NotificationType.BOOK).exists()

    authenticate(api_client, seller)
    confirm_response = api_client.post(f"/api/books/{listing.id}/confirm-sale/")
    assert confirm_response.status_code == 200
    listing.refresh_from_db()
    detail.refresh_from_db()
    assert listing.status == Listing.Status.SOLD
    assert detail.is_available is False
    assert BookTransaction.objects.get(pk=transaction_id).status == BookTransaction.Status.CONFIRMED

    authenticate(api_client, buyer)
    complete_response = api_client.post(f"/api/books/transactions/{transaction_id}/complete/")
    assert complete_response.status_code == 200
    tx = BookTransaction.objects.get(pk=transaction_id)
    assert tx.status == BookTransaction.Status.COMPLETED
    assert BookTransactionStatusLog.objects.filter(transaction=tx).count() == 3


@pytest.mark.django_db
def test_cannot_reserve_own_book(api_client, seller):
    listing, _detail = make_book(seller)
    authenticate(api_client, seller)
    response = api_client.post(f"/api/books/{listing.id}/reserve/")
    assert response.status_code == 400


@pytest.mark.django_db
def test_non_seller_confirm_is_forbidden(api_client, seller, buyer):
    listing, _detail = make_book(seller)
    authenticate(api_client, buyer)
    api_client.post(f"/api/books/{listing.id}/reserve/")

    response = api_client.post(f"/api/books/{listing.id}/confirm-sale/")
    assert response.status_code == 403
    assert listing.book_detail.is_available is True


@pytest.mark.django_db
def test_non_participant_transaction_action_is_forbidden(api_client, seller, buyer):
    listing, _detail = make_book(seller)
    authenticate(api_client, buyer)
    reserve_response = api_client.post(f"/api/books/{listing.id}/reserve/")
    transaction_id = reserve_response.data["id"]

    outsider = User.objects.create_user(
        email="book-outsider@example.com",
        password="StrongPass!123",
        name="Outsider",
        role=User.Role.STUDENT,
    )
    authenticate(api_client, outsider)
    response = api_client.post(f"/api/books/transactions/{transaction_id}/cancel/")
    assert response.status_code == 403


@pytest.mark.django_db
def test_single_active_reservation_per_listing_at_database_level(seller, buyer):
    listing, detail = make_book(seller)
    first = BookTransaction.objects.create(
        listing=listing,
        buyer=buyer,
        seller=seller,
        status=BookTransaction.Status.RESERVED,
    )
    second_buyer = User.objects.create_user(
        email="second-book-buyer@example.com",
        password="StrongPass!123",
        name="Second Buyer",
        role=User.Role.STUDENT,
    )
    with pytest.raises(IntegrityError):
        BookTransaction.objects.create(
            listing=listing,
            buyer=second_buyer,
            seller=detail.seller,
            status=BookTransaction.Status.CONFIRMED,
        )
    assert first.status == BookTransaction.Status.RESERVED
