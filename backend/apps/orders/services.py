"""Transactional cart, checkout, and order state services."""

from collections import defaultdict
from decimal import Decimal

from django.db import transaction
from django.utils import timezone

from apps.inventory.models import Inventory
from apps.inventory.services import (
    InventoryOperationError,
    decrease_stock,
    increase_stock,
)
from apps.listings.models import HostelSupplyDetail, Listing
from apps.core.permissions import IsApprovedVendor

from apps.notifications.services import notify_order_transition
from .models import Cart, CartItem, Order, OrderItem, OrderStatusLog
from .payments import PaymentStrategyError, process_payment, refund_payment


class OrderOperationError(ValueError):
    """Raised when a cart or order operation violates a domain rule."""


def _positive_quantity(quantity):
    if isinstance(quantity, bool) or not isinstance(quantity, int) or quantity <= 0:
        raise OrderOperationError("Quantity must be a positive integer.")
    return quantity


def _load_listing(listing_or_pk):
    listing_pk = getattr(listing_or_pk, "pk", listing_or_pk)
    try:
        return (
            Listing.objects.select_for_update()
            .select_related(
                "vendor",
                "vendor__user",
                "inventory",
                "hostel_supply_detail",
            )
            .get(pk=listing_pk)
        )
    except Listing.DoesNotExist as exc:
        raise OrderOperationError("The Listing no longer exists.") from exc


def _inventory_for_listing(listing):
    try:
        return listing.inventory
    except Inventory.DoesNotExist as exc:
        raise OrderOperationError(
            "This Listing does not have purchasable Inventory."
        ) from exc


def _validate_purchase_listing(listing_or_pk):
    """Lock and validate one Listing for cart or checkout use."""
    listing = _load_listing(listing_or_pk)
    if listing.status != Listing.Status.ACTIVE:
        raise OrderOperationError("Only active Listings can be purchased.")
    if listing.category_type == Listing.Category.BOOK:
        raise OrderOperationError(
            "Book Listings use the separate seller workflow and cannot be purchased here."
        )
    if listing.category_type not in Listing.VENDOR_CATEGORY_MAP:
        raise OrderOperationError("This Listing is not a purchasable vendor Listing.")
    if listing.vendor_id is None:
        raise OrderOperationError("A purchasable Listing must have a Vendor.")

    vendor = listing.vendor
    if vendor.approval_status != vendor.ApprovalStatus.APPROVED:
        raise OrderOperationError("The Listing Vendor must be approved.")
    if vendor.user.role != vendor.user.Role.VENDOR:
        raise OrderOperationError("The Listing Vendor account is not active.")
    expected_type = Listing.VENDOR_CATEGORY_MAP[listing.category_type]
    if vendor.vendor_type != expected_type:
        raise OrderOperationError("The Listing domain does not match its Vendor.")

    if listing.category_type == Listing.Category.HOSTEL_SUPPLY:
        try:
            detail = listing.hostel_supply_detail
        except HostelSupplyDetail.DoesNotExist:
            detail = None
        if detail is not None and detail.request_only:
            raise OrderOperationError(
                "Request-only Hostel Supply Listings cannot be purchased in the cart."
            )

    return listing, _inventory_for_listing(listing)


def get_or_create_cart(user):
    cart, _ = Cart.objects.get_or_create(user=user)
    return cart


def add_to_cart(user, listing, quantity):
    quantity = _positive_quantity(quantity)
    with transaction.atomic():
        cart, _ = Cart.objects.get_or_create(user=user)
        cart = Cart.objects.select_for_update().get(pk=cart.pk)
        listing, inventory = _validate_purchase_listing(listing)
        try:
            item = CartItem.objects.select_for_update().get(
                cart=cart,
                listing_id=listing.pk,
            )
            new_quantity = item.quantity + quantity
        except CartItem.DoesNotExist:
            item = CartItem(cart=cart, listing=listing, quantity=quantity)
            new_quantity = quantity

        if new_quantity > inventory.available_quantity:
            raise OrderOperationError("The requested quantity exceeds available stock.")
        item.quantity = new_quantity
        item.save(update_fields=["quantity", "updated_at"] if item.pk else None)
        cart.save(update_fields=["updated_at"])
        return item


def set_cart_item_quantity(user, item_pk, quantity):
    quantity = _positive_quantity(quantity)
    with transaction.atomic():
        item = (
            CartItem.objects.select_for_update()
            .select_related("cart")
            .get(pk=item_pk, cart__user_id=user.pk)
        )
        listing, inventory = _validate_purchase_listing(item.listing_id)
        if quantity > inventory.available_quantity:
            raise OrderOperationError("The requested quantity exceeds available stock.")
        item.quantity = quantity
        item.listing = listing
        item.save(update_fields=["quantity", "updated_at"])
        return item


def remove_cart_item(user, item_pk):
    try:
        item = CartItem.objects.get(pk=item_pk, cart__user_id=user.pk)
    except CartItem.DoesNotExist as exc:
        raise OrderOperationError("Cart item not found.") from exc
    item.delete()


def clear_cart(user):
    cart = get_or_create_cart(user)
    cart.items.all().delete()
    cart.save(update_fields=["updated_at"])
    return cart


def _payment_method_is_valid(payment_method):
    if payment_method not in Order.PaymentMethod.values:
        raise OrderOperationError("Unsupported payment method.")


def checkout_cart(user, *, payment_method, pickup_slot=""):
    """Create one server-priced Order per Vendor and consume stock atomically."""
    _payment_method_is_valid(payment_method)
    if pickup_slot is None:
        pickup_slot = ""

    try:
        with transaction.atomic():
            cart, _ = Cart.objects.get_or_create(user=user)
            cart = Cart.objects.select_for_update().get(pk=cart.pk)
            cart_items = list(
                CartItem.objects.select_for_update()
                .filter(cart=cart)
                .order_by("listing_id", "id")
            )
            if not cart_items:
                raise OrderOperationError("Your cart is empty.")

            prepared = []
            for cart_item in cart_items:
                listing, inventory = _validate_purchase_listing(cart_item.listing_id)
                if cart_item.quantity > inventory.available_quantity:
                    raise OrderOperationError(
                        f"Insufficient available stock for {listing.title}."
                    )
                prepared.append((cart_item, listing, inventory))

            # All checkouts acquire Listing and Inventory locks in this order.
            prepared.sort(key=lambda value: str(value[1].pk))
            for cart_item, listing, inventory in prepared:
                try:
                    decrease_stock(inventory, cart_item.quantity)
                except InventoryOperationError as exc:
                    raise OrderOperationError(
                        f"Unable to reserve stock for {listing.title}: {exc}"
                    ) from exc

            grouped = defaultdict(list)
            for cart_item, listing, _inventory in prepared:
                grouped[listing.vendor_id].append((cart_item, listing))

            orders = []
            for vendor_id in sorted(grouped, key=str):
                lines = grouped[vendor_id]
                total = Decimal("0.00")
                line_values = []
                for cart_item, listing in lines:
                    subtotal = (listing.price * cart_item.quantity).quantize(
                        Decimal("0.01")
                    )
                    total += subtotal
                    line_values.append((cart_item, listing, subtotal))

                try:
                    payment = process_payment(payment_method)
                except PaymentStrategyError as exc:
                    raise OrderOperationError(str(exc)) from exc

                order = Order.objects.create(
                    user=user,
                    total_amount=total,
                    status=Order.Status.PLACED,
                    pickup_slot=pickup_slot,
                    payment_method=payment_method,
                    payment_status=payment.status,
                    payment_reference=payment.reference,
                )
                for cart_item, listing, subtotal in line_values:
                    OrderItem.objects.create(
                        order=order,
                        listing=listing,
                        vendor=listing.vendor,
                        title_snapshot=listing.title,
                        vendor_name_snapshot=listing.vendor.business_name,
                        quantity=cart_item.quantity,
                        price_at_order=listing.price,
                        subtotal=subtotal,
                    )
                OrderStatusLog.objects.create(
                    order=order,
                    status=Order.Status.PLACED,
                    changed_by=user,
                    note="Order placed during checkout.",
                )
                notify_order_transition(order, user, Order.Status.PLACED)
                orders.append(order)

            cart.items.all().delete()
            cart.save(update_fields=["updated_at"])
            return orders
    except Cart.DoesNotExist as exc:
        raise OrderOperationError("Your cart is empty.") from exc


def visible_orders_for(user):
    queryset = Order.objects.select_related("user").prefetch_related(
        "items__listing",
        "items__vendor",
        "status_logs__changed_by",
    )
    if user.is_superuser or user.role == user.Role.ADMIN:
        return queryset
    if user.role == user.Role.STUDENT:
        return queryset.filter(user_id=user.pk)
    if IsApprovedVendor.user_is_approved(user):
        return queryset.filter(items__vendor__user_id=user.pk).distinct()
    return queryset.none()


def _is_admin(user):
    return bool(user and (user.is_superuser or user.role == user.Role.ADMIN))




def _is_order_vendor(user, order):
    return bool(
        IsApprovedVendor.user_is_approved(user)
        and order.items.filter(vendor__user_id=user.pk).exists()
    )


ALLOWED_TRANSITIONS = {
    Order.Status.PLACED: {Order.Status.CONFIRMED, Order.Status.CANCELLED},
    Order.Status.CONFIRMED: {Order.Status.READY, Order.Status.CANCELLED},
    Order.Status.READY: {Order.Status.COMPLETED, Order.Status.DISPUTED},
    Order.Status.DISPUTED: {Order.Status.COMPLETED, Order.Status.CANCELLED},
}


def _restore_order_stock(order):
    if order.stock_restored_at is not None:
        return
    items = order.items.select_related("listing").order_by("listing_id")
    for item in items:
        try:
            inventory = Inventory.objects.get(listing_id=item.listing_id)
            increase_stock(inventory, item.quantity)
        except Inventory.DoesNotExist as exc:
            raise OrderOperationError(
                f"Inventory for {item.title_snapshot} is no longer available."
            ) from exc
        except InventoryOperationError as exc:
            raise OrderOperationError(
                f"Unable to restore stock for {item.title_snapshot}: {exc}"
            ) from exc
    order.stock_restored_at = timezone.now()

def transition_order(order, actor, *, target_status, note=""):
    """Apply one authorized state transition and its audit log atomically."""
    if target_status not in Order.Status.values:
        raise OrderOperationError("Unknown order status.")
    with transaction.atomic():
        locked = Order.objects.select_for_update().get(pk=order.pk)
        allowed = ALLOWED_TRANSITIONS.get(locked.status, set())
        if target_status not in allowed:
            raise OrderOperationError(
                f"Order cannot transition from {locked.status} to {target_status}."
            )

        admin = _is_admin(actor)
        student_owner = locked.user_id == actor.pk and actor.role == actor.Role.STUDENT
        vendor_owner = _is_order_vendor(actor, locked)

        authorized = False
        if admin:
            authorized = True
        elif student_owner:
            authorized = (
                target_status == Order.Status.CANCELLED
                and locked.status in {Order.Status.PLACED, Order.Status.CONFIRMED}
            ) or (
                target_status == Order.Status.COMPLETED
                and locked.status == Order.Status.READY
            ) or (
                target_status == Order.Status.DISPUTED
                and locked.status == Order.Status.READY
            )
        elif vendor_owner:
            authorized = (
                target_status == Order.Status.CONFIRMED
                and locked.status == Order.Status.PLACED
            ) or (
                target_status == Order.Status.READY
                and locked.status == Order.Status.CONFIRMED
            )

        if not authorized:
            raise OrderOperationError(
                "You are not allowed to apply this order transition."
            )

        if target_status == Order.Status.CANCELLED:
            _restore_order_stock(locked)
            locked.payment_status = refund_payment(locked.payment_status)

        locked.status = target_status
        update_fields = ["status", "updated_at"]
        if target_status == Order.Status.CANCELLED:
            update_fields.extend(["stock_restored_at", "payment_status"])
        locked.save(update_fields=update_fields)
        OrderStatusLog.objects.create(
            order=locked,
            status=target_status,
            changed_by=actor,
            note=note or f"Order transitioned to {target_status}.",
        )
        notify_order_transition(locked, actor, target_status, note)
        return locked
