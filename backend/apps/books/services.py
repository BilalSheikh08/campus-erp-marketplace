"""Transactional services for the second-hand book marketplace."""

from django.db import IntegrityError, transaction
from django.db.models import Q
from django.utils import timezone

from apps.listings.models import BookDetail, Listing
from apps.notifications.models import Notification
from apps.notifications.services import create_notification

from .models import BookTransaction, BookTransactionStatusLog


class BookOperationError(ValueError):
    """Raised when a book marketplace operation violates a domain rule."""


class BookPermissionError(BookOperationError):
    """Raised when an authenticated student is not allowed to perform an action."""


def _require_student(user):
    if not user or not user.is_authenticated or user.role != user.Role.STUDENT:
        raise BookOperationError("Only Students can use the book marketplace workflow.")


def _lock_book_listing(listing_id):
    try:
        return (
            Listing.objects.select_for_update()
            .select_related("book_detail", "book_detail__seller")
            .get(pk=listing_id)
        )
    except Listing.DoesNotExist as exc:
        raise BookOperationError("Book Listing not found.") from exc


def _write_log(transaction_obj, actor, status, note=""):
    return BookTransactionStatusLog.objects.create(
        transaction=transaction_obj,
        status=status,
        changed_by=actor,
        note=note,
    )


def reserve_book(buyer, listing_id):
    """Reserve one available book with a row lock and an active-listing constraint."""
    _require_student(buyer)
    with transaction.atomic():
        listing = _lock_book_listing(listing_id)
        if listing.category_type != Listing.Category.BOOK:
            raise BookOperationError("The selected Listing is not a book.")
        if listing.status != Listing.Status.ACTIVE:
            raise BookOperationError("This book is no longer available.")

        try:
            detail = listing.book_detail
        except BookDetail.DoesNotExist as exc:
            raise BookOperationError("This Listing has no book details.") from exc

        if detail.seller_id == buyer.pk:
            raise BookOperationError("You cannot reserve your own book.")
        if not detail.is_available:
            raise BookOperationError("This book has already been sold.")

        active = BookTransaction.objects.filter(
            listing=listing,
            status__in=BookTransaction.ACTIVE_STATUSES,
        ).first()
        if active is not None:
            if active.buyer_id == buyer.pk:
                raise BookOperationError("You already have an active reservation for this book.")
            raise BookOperationError("This book is already reserved by another student.")

        try:
            book_tx = BookTransaction.objects.create(
                listing=listing,
                buyer=buyer,
                seller=detail.seller,
                status=BookTransaction.Status.RESERVED,
            )
        except IntegrityError as exc:
            raise BookOperationError("This book was reserved by another student. Please refresh.") from exc

        _write_log(book_tx, buyer, BookTransaction.Status.RESERVED, "Book reserved by buyer.")
        create_notification(
            detail.seller,
            Notification.NotificationType.BOOK,
            f"Book {_short_id(listing.pk)} was reserved by {buyer.name}.",
            category="book",
        )
        create_notification(
            buyer,
            Notification.NotificationType.BOOK,
            f"Your reservation for '{listing.title}' is active.",
            category="book",
        )
        return book_tx


def confirm_book_sale(seller, listing_id):
    """Confirm the active reservation and permanently mark the Listing as sold."""
    _require_student(seller)
    with transaction.atomic():
        listing = _lock_book_listing(listing_id)
        if listing.category_type != Listing.Category.BOOK:
            raise BookOperationError("The selected Listing is not a book.")
        detail = listing.book_detail
        if detail.seller_id != seller.pk:
            raise BookPermissionError("Only the seller can confirm this sale.")
        if listing.status != Listing.Status.ACTIVE or not detail.is_available:
            raise BookOperationError("This book is no longer available for sale.")

        book_tx = (
            BookTransaction.objects.select_for_update()
            .filter(listing=listing, status=BookTransaction.Status.RESERVED)
            .select_related("buyer", "seller")
            .first()
        )
        if book_tx is None:
            raise BookOperationError("There is no active reservation to confirm.")

        now = timezone.now()
        detail.is_available = False
        detail.save(update_fields=["is_available"])
        listing.status = Listing.Status.SOLD
        listing.save(update_fields=["status", "updated_at"])
        book_tx.status = BookTransaction.Status.CONFIRMED
        book_tx.confirmed_at = now
        book_tx.save(update_fields=["status", "confirmed_at", "updated_at"])
        _write_log(book_tx, seller, BookTransaction.Status.CONFIRMED, "Seller confirmed the sale.")

        message = f"Sale confirmed for '{listing.title}'."
        create_notification(book_tx.buyer, Notification.NotificationType.BOOK, message, category="book")
        create_notification(book_tx.seller, Notification.NotificationType.BOOK, message, category="book")
        return book_tx


def complete_book_transaction(actor, transaction_id):
    """Mark a confirmed book handoff as completed for buyer or seller."""
    _require_student(actor)
    with transaction.atomic():
        try:
            book_tx = (
                BookTransaction.objects.select_for_update()
                .select_related("listing", "buyer", "seller")
                .get(pk=transaction_id)
            )
        except BookTransaction.DoesNotExist as exc:
            raise BookOperationError("Book transaction not found.") from exc

        if actor.pk not in {book_tx.buyer_id, book_tx.seller_id}:
            raise BookPermissionError("You are not a participant in this book transaction.")
        if book_tx.status != BookTransaction.Status.CONFIRMED:
            raise BookOperationError("Only a confirmed sale can be completed.")

        book_tx.status = BookTransaction.Status.COMPLETED
        book_tx.completed_at = timezone.now()
        book_tx.save(update_fields=["status", "completed_at", "updated_at"])
        _write_log(book_tx, actor, BookTransaction.Status.COMPLETED, "Book handoff completed.")

        other = book_tx.seller if actor.pk == book_tx.buyer_id else book_tx.buyer
        create_notification(
            other,
            Notification.NotificationType.BOOK,
            f"Book transaction for '{book_tx.listing.title}' is completed.",
            category="book",
        )
        return book_tx


def cancel_book_reservation(actor, transaction_id):
    """Cancel an unconfirmed reservation by either transaction participant."""
    _require_student(actor)
    with transaction.atomic():
        try:
            book_tx = (
                BookTransaction.objects.select_for_update()
                .select_related("listing", "buyer", "seller")
                .get(pk=transaction_id)
            )
        except BookTransaction.DoesNotExist as exc:
            raise BookOperationError("Book transaction not found.") from exc

        if actor.pk not in {book_tx.buyer_id, book_tx.seller_id}:
            raise BookPermissionError("You are not a participant in this book transaction.")
        if book_tx.status != BookTransaction.Status.RESERVED:
            raise BookOperationError("Only a pending reservation can be cancelled.")

        book_tx.status = BookTransaction.Status.CANCELLED
        book_tx.cancelled_at = timezone.now()
        book_tx.save(update_fields=["status", "cancelled_at", "updated_at"])
        _write_log(book_tx, actor, BookTransaction.Status.CANCELLED, "Reservation cancelled.")

        recipient = book_tx.seller if actor.pk == book_tx.buyer_id else book_tx.buyer
        create_notification(
            recipient,
            Notification.NotificationType.BOOK,
            f"Reservation for '{book_tx.listing.title}' was cancelled.",
            category="book",
        )
        return book_tx


def visible_transactions_for(user):
    """Return book transactions owned by the buyer or seller."""
    if not user or not user.is_authenticated:
        return BookTransaction.objects.none()
    return (
        BookTransaction.objects.select_related(
            "listing",
            "buyer",
            "seller",
            "listing__book_detail",
        )
        .prefetch_related("status_logs__changed_by")
        .filter(Q(buyer_id=user.pk) | Q(seller_id=user.pk))
    )


def _short_id(value):
    return str(value)[:8].upper()
