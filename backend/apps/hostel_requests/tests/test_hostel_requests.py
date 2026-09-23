"""Phase F hostel request tests — creation, ownership, state machine, inventory, audit."""
from apps.users.models import User
import pytest
from decimal import Decimal
from rest_framework.test import APIClient
from rest_framework_simplejwt.tokens import RefreshToken

from apps.vendors.models import Vendor
from apps.listings.models import Listing, HostelSupplyDetail
from apps.inventory.models import Inventory
from apps.hostel_requests.models import HostelRequest, HostelRequestStatusLog
from apps.hostel_requests.services import submit_hostel_request, transition_hostel_request, HostelRequestOperationError


@pytest.fixture
def api_client():
    return APIClient()


def authenticate(client, user):
    refresh = RefreshToken.for_user(user)
    client.credentials(HTTP_AUTHORIZATION=f"Bearer {refresh.access_token}")


@pytest.fixture
def admin(db):
    return User.objects.create_superuser(
        email="hostel-admin@example.com", password="StrongPass!123", name="Hostel Admin"
    )


@pytest.fixture
def student(db):
    return User.objects.create_user(
        email="hostel-student@example.com", password="StrongPass!123", name="Hostel Student", role=User.Role.STUDENT
    )


@pytest.fixture
def warden(db):
    return User.objects.create_user(
        email="hostel-warden@example.com", password="StrongPass!123", name="Hostel Warden", role=User.Role.WARDEN
    )


@pytest.fixture
def hostel_listing(db, admin):
    vendor_user = User.objects.create_user(
        email="hostel-vendor@example.com", password="StrongPass!123", name="Hostel Vendor", role=User.Role.STUDENT
    )
    vendor = Vendor.objects.create(
        user=vendor_user, business_name="Hostel Business",
        vendor_type=Vendor.VendorType.HOSTEL_SUPPLY, approval_status=Vendor.ApprovalStatus.APPROVED, approved_by=admin
    )
    vendor_user.role = User.Role.VENDOR
    vendor_user.save(update_fields=["role"])
    listing = Listing.objects.create(
        vendor=vendor, title="Hostel Supply", description="For hostel",
        price=Decimal("10.00"), category_type=Listing.Category.HOSTEL_SUPPLY,
        status=Listing.Status.ACTIVE,
    )
    HostelSupplyDetail.objects.create(listing=listing, request_only=True)
    Inventory.objects.create(listing=listing, quantity=20)
    return listing


@pytest.mark.django_db
def test_create_hostel_request_success(api_client, student, hostel_listing):
    authenticate(api_client, student)
    resp = api_client.post("/api/hostel-requests/", {
        "listing": str(hostel_listing.id),
        "quantity": 2,
        "required_by_date": "2026-10-01",
        "special_instructions": "Please deliver early",
    }, format="json")
    assert resp.status_code == 201
    assert resp.data["status"] == "submitted"
    assert resp.data["student_name"] == student.name


@pytest.mark.django_db
def test_create_rejects_non_hostel_supply(api_client, student, hostel_listing, admin):
    # Create a canteen listing (not hostel)
    # Create a canteen listing with correct vendor type
    canteen_user = User.objects.create_user(email="canteen-v@x.com", password="x", name="C", role=User.Role.VENDOR)
    canteen_vendor = Vendor.objects.create(user=canteen_user, business_name="C", vendor_type=Vendor.VendorType.CANTEEN, approval_status=Vendor.ApprovalStatus.APPROVED, approved_by=admin)
    canteen_user.role = User.Role.VENDOR; canteen_user.save(update_fields=["role"])
    other = Listing.objects.create(
        vendor=canteen_vendor, title="Canteen", price=Decimal("5"),
        category_type=Listing.Category.CANTEEN, status=Listing.Status.ACTIVE,
    )
    from apps.listings.models import CanteenDetail
    CanteenDetail.objects.create(listing=other)
    authenticate(api_client, student)
    resp = api_client.post("/api/hostel-requests/", {
        "listing": str(other.id), "quantity": 1, "required_by_date": "2026-10-01"
    }, format="json")
    assert resp.status_code == 400
    assert "hostel supply" in str(resp.data).lower() or "listing" in str(resp.data).lower()


@pytest.mark.django_db
def test_state_machine_valid_transitions(api_client, student, warden, hostel_listing):
    req = submit_hostel_request(student, hostel_listing, 1, "2026-10-01")
    # Student can cancel from submitted
    transition_hostel_request(req, student, target_status=HostelRequest.Status.CANCELLED, note="cancel")
    req.refresh_from_db()
    assert req.status == "cancelled"


@pytest.mark.django_db
def test_warden_detail_route_exists(api_client, warden, hostel_listing, student):
    req = submit_hostel_request(student, hostel_listing, 1, "2026-10-01")
    # Auto-assign warden on pending approval
    transition_hostel_request(req, warden, target_status=HostelRequest.Status.PENDING_APPROVAL, note="assign")
    req.refresh_from_db()
    assert req.assigned_warden_id == warden.id
    authenticate(api_client, warden)
    resp = api_client.get(f"/api/hostel-requests/warden/{req.id}/")
    assert resp.status_code == 200
    assert resp.data["id"] == str(req.id)


@pytest.mark.django_db
def test_inventory_deducted_on_approve_restored_on_cancel(api_client, student, warden, hostel_listing, admin):
    req = submit_hostel_request(student, hostel_listing, 3, "2026-10-01")
    transition_hostel_request(req, warden, target_status=HostelRequest.Status.PENDING_APPROVAL, note="")
    transition_hostel_request(req, warden, target_status=HostelRequest.Status.APPROVED, note="approve")
    inv = Inventory.objects.get(listing=hostel_listing)
    assert inv.quantity == 17  # 20 - 3
    # Warden cannot cancel approved; only admin can per authorization rules.
    # We verify inventory restoration requires admin cancellation.
    transition_hostel_request(req, admin, target_status=HostelRequest.Status.CANCELLED, note="admin cancel")
    inv.refresh_from_db()
    assert inv.quantity == 20  # restored


@pytest.mark.django_db
def test_audit_log_created_on_transition(api_client, student, warden, hostel_listing):
    req = submit_hostel_request(student, hostel_listing, 1, "2026-10-01")
    transition_hostel_request(req, warden, target_status=HostelRequest.Status.PENDING_APPROVAL, note="approve")
    assert req.status_logs.count() >= 2
    log = req.status_logs.latest("created_at")
    assert log.status == "pending_approval"


@pytest.mark.django_db
def test_warden_cannot_approve_own_unassigned_after_assign(api_client, warden, hostel_listing, student):
    req = submit_hostel_request(student, hostel_listing, 1, "2026-10-01")
    authenticate(api_client, warden)
    # Warden A claims unassigned request; Warden B must NOT manage assigned request (403).
    authenticate(api_client, warden)
    resp_claim = api_client.post(f"/api/hostel-requests/{req.id}/transition/", {
        "target_status": "pending_approval", "note": "claim"
    }, format="json")
    assert resp_claim.status_code == 200
    req.refresh_from_db()
    assert req.assigned_warden_id == warden.id
    other_warden = User.objects.create_user(email="other-warden@example.com", password="x", name="Other", role=User.Role.WARDEN)
    authenticate(api_client, other_warden)
    # Warden B tries to apply a transition on a request assigned to A; must be rejected.
    resp_trans = api_client.post(f"/api/hostel-requests/{req.id}/transition/", {
        "target_status": "rejected", "note": "bad"
    }, format="json")
    assert resp_trans.status_code == 403
