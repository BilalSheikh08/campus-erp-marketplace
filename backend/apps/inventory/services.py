"""Transactional stock operations shared by inventory and future order code."""

from django.core.exceptions import ValidationError as DjangoValidationError
from django.db import transaction

from .models import Inventory


class InventoryOperationError(ValueError):
    """Raised when a requested stock operation cannot be completed."""


def _inventory_pk(inventory):
    inventory_pk = getattr(inventory, "pk", inventory)
    if inventory_pk is None:
        raise InventoryOperationError("A saved Inventory record is required.")
    return inventory_pk


def _positive_amount(amount):
    if isinstance(amount, bool) or not isinstance(amount, int) or amount <= 0:
        raise InventoryOperationError("The stock amount must be a positive integer.")
    return amount


def _non_negative_integer(value, field_name):
    if isinstance(value, bool) or not isinstance(value, int) or value < 0:
        raise InventoryOperationError(
            f"{field_name} must be a non-negative integer."
        )
    return value


def _lock_inventory(inventory):
    """Reload an Inventory row while its caller holds an atomic transaction."""
    return (
        Inventory.objects.select_for_update()
        .select_related("listing", "listing__vendor", "listing__vendor__user")
        .get(pk=_inventory_pk(inventory))
    )


def _save_locked(inventory, *fields):
    try:
        inventory.save(update_fields=[*fields, "updated_at"])
    except DjangoValidationError as exc:
        raise InventoryOperationError(exc.messages) from exc


def increase_stock(inventory, amount):
    """Add on-hand stock, preserving any existing reservations."""
    amount = _positive_amount(amount)
    with transaction.atomic():
        locked = _lock_inventory(inventory)
        locked.quantity += amount
        _save_locked(locked, "quantity")
        return locked


def decrease_stock(inventory, amount):
    """Consume available stock for a future purchase operation."""
    amount = _positive_amount(amount)
    with transaction.atomic():
        locked = _lock_inventory(inventory)
        if locked.listing.status != locked.listing.Status.ACTIVE:
            raise InventoryOperationError(
                "Stock cannot be consumed from an inactive Listing."
            )
        if amount > locked.available_quantity:
            raise InventoryOperationError("Insufficient available stock.")
        locked.quantity -= amount
        _save_locked(locked, "quantity")
        return locked


def reserve_stock(inventory, amount):
    """Hold available stock for a future purchase without deducting on-hand stock."""
    amount = _positive_amount(amount)
    with transaction.atomic():
        locked = _lock_inventory(inventory)
        if locked.listing.status != locked.listing.Status.ACTIVE:
            raise InventoryOperationError(
                "Stock cannot be reserved for an inactive Listing."
            )
        if amount > locked.available_quantity:
            raise InventoryOperationError("Insufficient available stock to reserve.")
        locked.reserved_quantity += amount
        _save_locked(locked, "reserved_quantity")
        return locked


def release_reserved_stock(inventory, amount):
    """Return previously reserved stock to the available pool."""
    amount = _positive_amount(amount)
    with transaction.atomic():
        locked = _lock_inventory(inventory)
        if amount > locked.reserved_quantity:
            raise InventoryOperationError(
                "Cannot release more stock than is reserved."
            )
        locked.reserved_quantity -= amount
        _save_locked(locked, "reserved_quantity")
        return locked


def adjust_stock(inventory, quantity_change):
    """Apply an administrative quantity delta, including on inactive Listings."""
    if (
        isinstance(quantity_change, bool)
        or not isinstance(quantity_change, int)
        or quantity_change == 0
    ):
        raise InventoryOperationError(
            "quantity_change must be a non-zero integer."
        )

    with transaction.atomic():
        locked = _lock_inventory(inventory)
        new_quantity = locked.quantity + quantity_change
        if new_quantity < locked.reserved_quantity:
            raise InventoryOperationError(
                "The adjustment cannot reduce quantity below reserved stock."
            )
        if new_quantity < 0:
            raise InventoryOperationError("Quantity cannot become negative.")
        locked.quantity = new_quantity
        _save_locked(locked, "quantity")
        return locked


def update_inventory(inventory, *, quantity=None, low_stock_threshold=None):
    """Atomically set editable inventory fields for a management PATCH."""
    if quantity is None and low_stock_threshold is None:
        raise InventoryOperationError("At least one inventory field is required.")
    if quantity is not None:
        quantity = _non_negative_integer(quantity, "quantity")
    if low_stock_threshold is not None:
        low_stock_threshold = _non_negative_integer(
            low_stock_threshold,
            "low_stock_threshold",
        )

    with transaction.atomic():
        locked = _lock_inventory(inventory)
        if quantity is not None and quantity < locked.reserved_quantity:
            raise InventoryOperationError(
                "Quantity cannot be lower than reserved stock."
            )
        changed_fields = []
        if quantity is not None and quantity != locked.quantity:
            locked.quantity = quantity
            changed_fields.append("quantity")
        if (
            low_stock_threshold is not None
            and low_stock_threshold != locked.low_stock_threshold
        ):
            locked.low_stock_threshold = low_stock_threshold
            changed_fields.append("low_stock_threshold")
        if changed_fields:
            _save_locked(locked, *changed_fields)
        return locked
