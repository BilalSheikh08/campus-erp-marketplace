"""Live ORM analytics for vendor and admin dashboards."""

from datetime import date, timedelta
from decimal import Decimal

from django.db.models import Count, F, Q, Sum
from django.db.models.functions import TruncDate
from django.utils import timezone
from rest_framework.exceptions import ValidationError

from apps.hostel_requests.models import HostelRequest
from apps.inventory.models import Inventory
from apps.listings.models import Listing
from apps.orders.models import Order, OrderItem
from apps.users.models import User
from apps.vendors.models import Vendor
from apps.books.models import BookTransaction


class AnalyticsService:
    """Read-only aggregate queries; no analytics persistence is required."""

    @staticmethod
    def parse_range(params):
        end = timezone.localdate()
        start = end - timedelta(days=29)
        raw_start = params.get("start_date")
        raw_end = params.get("end_date")

        if raw_start:
            try:
                start = date.fromisoformat(raw_start)
            except ValueError as exc:
                raise ValidationError({"start_date": "Use YYYY-MM-DD."}) from exc
        if raw_end:
            try:
                end = date.fromisoformat(raw_end)
            except ValueError as exc:
                raise ValidationError({"end_date": "Use YYYY-MM-DD."}) from exc
        if start > end:
            raise ValidationError({"detail": "start_date cannot be after end_date."})
        return start, end

    @staticmethod
    def _completed_revenue(queryset):
        value = queryset.filter(order__status=Order.Status.COMPLETED).aggregate(total=Sum("subtotal"))["total"]
        return value or Decimal("0.00")

    @staticmethod
    def _serialize_series(queryset):
        return [
            {
                "date": row["day"].isoformat(),
                "orders": row["orders"],
                "revenue": float(row["revenue"] or 0),
            }
            for row in queryset
        ]

    @classmethod
    def vendor_dashboard(cls, user, params):
        if not user.is_superuser and user.role != User.Role.VENDOR:
            raise PermissionError("Only vendors can access vendor analytics.")
        try:
            vendor = user.vendor_profile
        except Vendor.DoesNotExist as exc:
            raise PermissionError("Vendor profile not found.") from exc
        if vendor.approval_status != Vendor.ApprovalStatus.APPROVED:
            raise PermissionError("Your vendor account must be approved before viewing analytics.")

        start, end = cls.parse_range(params)
        date_filter = {"order__created_at__date__gte": start, "order__created_at__date__lte": end}
        items = OrderItem.objects.filter(vendor=vendor, **date_filter)
        orders = Order.objects.filter(items__vendor=vendor, created_at__date__gte=start, created_at__date__lte=end).distinct()
        completed_items = items.filter(order__status=Order.Status.COMPLETED)
        revenue = cls._completed_revenue(items)

        sales_by_day = (
            completed_items.annotate(day=TruncDate("order__created_at"))
            .values("day")
            .annotate(orders=Count("order", distinct=True), revenue=Sum("subtotal"))
            .order_by("day")
        )
        top_items = (
            completed_items.values("listing_id", "title_snapshot")
            .annotate(quantity=Sum("quantity"), revenue=Sum("subtotal"))
            .order_by("-revenue", "title_snapshot")[:8]
        )
        order_status = orders.values("status").annotate(count=Count("id")).order_by("status")
        inventory = Inventory.objects.filter(listing__vendor=vendor).select_related("listing")
        low_stock = inventory.annotate(available=F("quantity") - F("reserved_quantity")).filter(
            available__lte=F("low_stock_threshold")
        ).count()
        items_sold = completed_items.aggregate(total=Sum("quantity"))["total"] or 0

        return {
            "period": {"start_date": start.isoformat(), "end_date": end.isoformat()},
            "summary": {
                "orders": orders.count(),
                "completed_orders": orders.filter(status=Order.Status.COMPLETED).count(),
                "pending_orders": orders.filter(status__in=[Order.Status.PLACED, Order.Status.CONFIRMED, Order.Status.READY]).count(),
                "revenue": float(revenue),
                "items_sold": items_sold,
                "low_stock_items": low_stock,
            },
            "sales_by_day": cls._serialize_series(sales_by_day),
            "top_items": [
                {"listing_id": str(row["listing_id"]), "title": row["title_snapshot"], "quantity": row["quantity"], "revenue": float(row["revenue"] or 0)}
                for row in top_items
            ],
            "order_status": [{"status": row["status"], "count": row["count"]} for row in order_status],
        }

    @classmethod
    def admin_dashboard(cls, user, params):
        if not user.is_superuser and user.role != User.Role.ADMIN:
            raise PermissionError("Only admins can access admin analytics.")

        start, end = cls.parse_range(params)
        orders = Order.objects.filter(created_at__date__gte=start, created_at__date__lte=end)
        completed_items = OrderItem.objects.filter(
            order__status=Order.Status.COMPLETED,
            order__created_at__date__gte=start,
            order__created_at__date__lte=end,
        )
        revenue = cls._completed_revenue(completed_items)

        sales_by_day = (
            completed_items.annotate(day=TruncDate("order__created_at"))
            .values("day")
            .annotate(orders=Count("order", distinct=True), revenue=Sum("subtotal"))
            .order_by("day")
        )
        top_items = (
            completed_items.values("listing_id", "title_snapshot")
            .annotate(quantity=Sum("quantity"), revenue=Sum("subtotal"))
            .order_by("-revenue", "title_snapshot")[:10]
        )
        category_sales = (
            completed_items.values("listing__category_type")
            .annotate(quantity=Sum("quantity"), revenue=Sum("subtotal"))
            .order_by("listing__category_type")
        )
        order_status = orders.values("status").annotate(count=Count("id")).order_by("status")

        hostel_requests = HostelRequest.objects.filter(
            created_at__date__gte=start,
            created_at__date__lte=end,
        ).values("status").annotate(count=Count("id")).order_by("status")

        book_transactions = BookTransaction.objects.filter(
            created_at__date__gte=start,
            created_at__date__lte=end,
        ).values("status").annotate(count=Count("id")).order_by("status")
        book_revenue = BookTransaction.objects.filter(
            status__in=[BookTransaction.Status.CONFIRMED, BookTransaction.Status.COMPLETED],
            created_at__date__gte=start,
            created_at__date__lte=end,
        ).aggregate(total=Sum("listing__price"))["total"] or Decimal("0.00")

        inventory = Inventory.objects.select_related("listing", "listing__vendor", "listing__vendor__user")
        low_stock_items = inventory.annotate(available=F("quantity") - F("reserved_quantity")).filter(available__lte=F("low_stock_threshold"))
        role_counts = User.objects.values("role").annotate(count=Count("id")).order_by("role")

        return {
            "period": {"start_date": start.isoformat(), "end_date": end.isoformat()},
            "summary": {
                "orders": orders.count(),
                "completed_orders": orders.filter(status=Order.Status.COMPLETED).count(),
                "pending_orders": orders.filter(status__in=[Order.Status.PLACED, Order.Status.CONFIRMED, Order.Status.READY]).count(),
                "cancelled_orders": orders.filter(status=Order.Status.CANCELLED).count(),
                "revenue": float(revenue),
                "book_sales_value": float(book_revenue),
                "hostel_requests": HostelRequest.objects.filter(created_at__date__gte=start, created_at__date__lte=end).count(),
                "low_stock_items": low_stock_items.count(),
            },
            "sales_by_day": cls._serialize_series(sales_by_day),
            "top_items": [
                {"listing_id": str(row["listing_id"]), "title": row["title_snapshot"], "quantity": row["quantity"], "revenue": float(row["revenue"] or 0)}
                for row in top_items
            ],
            "category_sales": [
                {"category": row["listing__category_type"], "quantity": row["quantity"], "revenue": float(row["revenue"] or 0)}
                for row in category_sales
            ],
            "order_status": [{"status": row["status"], "count": row["count"]} for row in order_status],
            "hostel_request_status": [{"status": row["status"], "count": row["count"]} for row in hostel_requests],
            "book_transaction_status": [{"status": row["status"], "count": row["count"]} for row in book_transactions],
            "users_by_role": [{"role": row["role"], "count": row["count"]} for row in role_counts],
        }
