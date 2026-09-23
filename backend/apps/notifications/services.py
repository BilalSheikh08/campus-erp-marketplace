"""Notification service layer and real-time delivery bridge."""

from datetime import timedelta

from asgiref.sync import async_to_sync
from channels.layers import get_channel_layer
from django.db import transaction
from django.utils import timezone

from .models import Notification


def _user_group(user_id):
    return f"user_notifications_{user_id}"


def _serialize_notification(notification):
    return {
        "id": str(notification.id),
        "user": str(notification.user_id),
        "message": notification.message,
        "notification_type": notification.notification_type,
        "category": notification.category,
        "is_read": notification.is_read,
        "created_at": notification.created_at.isoformat(),
    }


def _deliver_notification(notification):
    """Send one already-committed notification to its user WebSocket group."""
    channel_layer = get_channel_layer()
    if channel_layer is None:
        return

    try:
        async_to_sync(channel_layer.group_send)(
            _user_group(notification.user_id),
            {
                "type": "notification.message",
                "notification": _serialize_notification(notification),
            },
        )
    except Exception:
        # REST persistence is the source of truth; a transient WebSocket
        # delivery failure must not break the business transaction.
        return


def create_notification(user, notification_type, message, category=""):
    """Create a server-controlled notification and deliver it after commit."""
    notification = Notification.objects.create(
        user=user,
        notification_type=notification_type,
        message=message,
        category=category,
    )
    transaction.on_commit(lambda: _deliver_notification(notification))
    return notification


def get_unread_count(user):
    """Return the exact unread count for one user."""
    return user.notifications.filter(is_read=False).count()


def _short_id(value):
    return str(value)[:8].upper()


def notify_order_transition(order, actor, target_status, note=""):
    """Notify the student and each vendor affected by an order transition."""
    suffix = f" Note: {note}" if note else ""
    message = f"Order {_short_id(order.id)} is now {target_status}.{suffix}"
    recipients = {order.user_id: order.user}

    for item in order.items.select_related("vendor__user"):
        vendor_user = getattr(item.vendor, "user", None)
        if vendor_user is not None:
            recipients.setdefault(vendor_user.pk, vendor_user)

    notifications = []
    for recipient in recipients.values():
        notifications.append(
            create_notification(
                user=recipient,
                notification_type=Notification.NotificationType.ORDER,
                message=message,
                category="order",
            )
        )
    return notifications


def notify_hostel_request_transition(request, actor, target_status, note=""):
    """Notify the request student and the assigned warden."""
    suffix = f" Note: {note}" if note else ""
    message = (
        f"Hostel request {_short_id(request.id)} is now {target_status}."
        f"{suffix}"
    )
    notifications = [
        create_notification(
            user=request.student,
            notification_type=Notification.NotificationType.HOSTEL,
            message=message,
            category="hostel",
        )
    ]
    if request.assigned_warden is not None:
        notifications.append(
            create_notification(
                user=request.assigned_warden,
                notification_type=Notification.NotificationType.HOSTEL,
                message=message,
                category="hostel",
            )
        )
    return notifications


def notify_low_stock(inventory):
    """Create a deduplicated low-stock alert for the owning vendor."""
    listing = inventory.listing
    vendor_user = getattr(getattr(listing, "vendor", None), "user", None)
    if vendor_user is None or inventory.available_quantity > inventory.low_stock_threshold:
        return None

    marker = f"[{listing.pk}]"
    message = (
        f"Low stock {marker}: {listing.title} has "
        f"{inventory.available_quantity} available unit(s)."
    )
    recent_cutoff = timezone.now() - timedelta(minutes=10)
    existing = Notification.objects.filter(
        user=vendor_user,
        notification_type=Notification.NotificationType.INVENTORY,
        category="inventory",
        message=message,
        created_at__gte=recent_cutoff,
    ).exists()
    if existing:
        return None

    return create_notification(
        user=vendor_user,
        notification_type=Notification.NotificationType.INVENTORY,
        message=message,
        category="inventory",
    )
