"""Business logic services for hostel requests."""

from django.db import transaction

from apps.inventory.models import Inventory
from apps.inventory.services import InventoryOperationError, decrease_stock, increase_stock
from apps.listings.models import Listing

from .models import HostelRequest, HostelRequestStatusLog
from apps.notifications.services import notify_hostel_request_transition


class HostelRequestOperationError(ValueError):
    """Raised when a hostel request operation violates a domain rule."""


def submit_hostel_request(student, listing, quantity, required_by_date, special_instructions=""):
    """
    Create a new hostel supply request from a student.

    Args:
        student: User instance (must be student)
        listing: Listing instance (must be hostel_supply, request_only)
        quantity: Positive integer
        required_by_date: Date when supply is needed
        special_instructions: Optional instructions

    Returns:
        HostelRequest instance

    Raises:
        HostelRequestOperationError: If request cannot be created
    """
    if student.role != student.Role.STUDENT:
        raise HostelRequestOperationError("Only students can submit hostel requests.")

    if listing.category_type != Listing.Category.HOSTEL_SUPPLY:
        raise HostelRequestOperationError("Listing must be a hostel supply.")

    if listing.status != Listing.Status.ACTIVE:
        raise HostelRequestOperationError("Hostel supply is not available.")

    try:
        detail = listing.hostel_supply_detail
        if not detail.request_only:
            raise HostelRequestOperationError(
                "This hostel supply can be purchased directly, not requested."
            )
    except listing.hostel_supply_detail.model.DoesNotExist:
        raise HostelRequestOperationError("Listing does not have hostel supply details.")

    if quantity <= 0:
        raise HostelRequestOperationError("Quantity must be positive.")

    with transaction.atomic():
        request = HostelRequest.objects.create(
            student=student,
            listing=listing,
            quantity=quantity,
            required_by_date=required_by_date,
            special_instructions=special_instructions,
            status=HostelRequest.Status.SUBMITTED,
        )

        HostelRequestStatusLog.objects.create(
            request=request,
            status=HostelRequest.Status.SUBMITTED,
            changed_by=student,
            note="Request submitted by student.",
        )

        return request


ALLOWED_TRANSITIONS = {
    HostelRequest.Status.SUBMITTED: {
        HostelRequest.Status.PENDING_APPROVAL,
        HostelRequest.Status.CANCELLED,
    },
    HostelRequest.Status.PENDING_APPROVAL: {
        HostelRequest.Status.APPROVED,
        HostelRequest.Status.REJECTED,
        HostelRequest.Status.CANCELLED,
    },
    HostelRequest.Status.APPROVED: {
        HostelRequest.Status.FULFILLED,
        HostelRequest.Status.CANCELLED,
    },
    HostelRequest.Status.REJECTED: set(),
    HostelRequest.Status.FULFILLED: set(),
    HostelRequest.Status.CANCELLED: set(),
}


def _is_admin(user):
    """Check if user is admin."""
    return bool(user and (user.is_superuser or user.role == user.Role.ADMIN))


def _is_request_student(user, request):
    """Check if user is the student who submitted the request."""
    return request.student_id == user.pk and user.role == user.Role.STUDENT


def _is_assigned_warden(user, request):
    """Check if user is the warden assigned to manage this request."""
    if user.role != user.Role.WARDEN:
        return False
    # Warden can manage if assigned or if unassigned and warden's role is present
    return request.assigned_warden_id == user.pk or request.assigned_warden_id is None


def transition_hostel_request(request_obj, actor, *, target_status, note=""):
    """
    Apply an authorized hostel request state transition atomically.

    Args:
        request_obj: HostelRequest instance
        actor: User instance performing the transition
        target_status: Target status string
        note: Optional transition note

    Raises:
        HostelRequestOperationError: If transition not allowed or unauthorized
    """
    if target_status not in HostelRequest.Status.values:
        raise HostelRequestOperationError("Unknown hostel request status.")

    with transaction.atomic():
        locked = HostelRequest.objects.select_for_update().get(pk=request_obj.pk)
        allowed = ALLOWED_TRANSITIONS.get(locked.status, set())

        if target_status not in allowed:
            raise HostelRequestOperationError(
                f"Request cannot transition from {locked.status} to {target_status}."
            )

        # Check authorization
        admin = _is_admin(actor)
        is_student = _is_request_student(actor, locked)
        is_warden = _is_assigned_warden(actor, locked)

        authorized = False

        if admin:
            authorized = True
        elif is_student:
            # Students can only cancel their own requests
            authorized = (
                target_status == HostelRequest.Status.CANCELLED
                and locked.status in {
                    HostelRequest.Status.SUBMITTED,
                    HostelRequest.Status.PENDING_APPROVAL,
                }
            )
        elif is_warden:
            # Wardens can approve/reject pending requests and mark fulfilled
            authorized = (
                target_status == HostelRequest.Status.APPROVED
                and locked.status == HostelRequest.Status.PENDING_APPROVAL
            ) or (
                target_status == HostelRequest.Status.REJECTED
                and locked.status == HostelRequest.Status.PENDING_APPROVAL
            ) or (
                target_status == HostelRequest.Status.FULFILLED
                and locked.status == HostelRequest.Status.APPROVED
            )

            # Wardens can also mark as pending approval (auto-assign)
            authorized = authorized or (
                target_status == HostelRequest.Status.PENDING_APPROVAL
                and locked.status == HostelRequest.Status.SUBMITTED
            )

        if not authorized:
            raise HostelRequestOperationError(
                "You are not allowed to apply this request transition."
            )

        # Handle inventory on approval
        if target_status == HostelRequest.Status.APPROVED and locked.status != HostelRequest.Status.APPROVED:
            try:
                inventory = Inventory.objects.select_for_update().get(
                    listing_id=locked.listing_id
                )
                decrease_stock(inventory, locked.quantity)
            except Inventory.DoesNotExist:
                raise HostelRequestOperationError(
                    f"Inventory for {locked.listing.title} is not available."
                )
            except InventoryOperationError as exc:
                raise HostelRequestOperationError(
                    f"Unable to reserve stock: {exc}"
                )

        # Handle inventory restoration on cancellation from APPROVED
        if target_status == HostelRequest.Status.CANCELLED and locked.status == HostelRequest.Status.APPROVED:
            try:
                inventory = Inventory.objects.select_for_update().get(
                    listing_id=locked.listing_id
                )
                increase_stock(inventory, locked.quantity)
            except Inventory.DoesNotExist:
                raise HostelRequestOperationError(
                    f"Cannot restore inventory: {locked.listing.title} not found."
                )
            except InventoryOperationError as exc:
                raise HostelRequestOperationError(f"Cannot restore inventory: {exc}")

        # Update request status and assign warden if needed
        locked.status = target_status
        if is_warden and locked.assigned_warden_id is None:
            locked.assigned_warden = actor
        locked.save(update_fields=["status", "assigned_warden", "updated_at"])

        # Create audit log
        HostelRequestStatusLog.objects.create(
            request=locked,
            status=target_status,
            changed_by=actor,
            note=note,
        )

        # Notification (same transaction — rolls back if domain fails)
        notify_hostel_request_transition(locked, actor, target_status, note)

        return locked


def visible_requests_for(user):
    """
    Return queryset of hostel requests visible to the user based on their role.

    Args:
        user: User instance

    Returns:
        QuerySet of HostelRequest instances
    """
    queryset = HostelRequest.objects.select_related(
        "student",
        "listing",
        "assigned_warden",
    ).prefetch_related("status_logs__changed_by")

    if user.is_superuser or user.role == user.Role.ADMIN:
        return queryset

    if user.role == user.Role.STUDENT:
        return queryset.filter(student_id=user.pk)

    if user.role == user.Role.WARDEN:
        # Wardens see requests assigned to them or unassigned requests
        from django.db.models import Q
        return queryset.filter(
            Q(assigned_warden_id=user.pk) | Q(assigned_warden_id__isnull=True)
        )

    return queryset.none()
