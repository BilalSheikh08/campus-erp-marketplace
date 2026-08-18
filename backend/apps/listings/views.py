"""Public catalog browsing and owner-controlled Listing lifecycle APIs."""

from decimal import Decimal, InvalidOperation
from uuid import UUID

from django.db.models import Q
from rest_framework import generics
from rest_framework.exceptions import ValidationError
from rest_framework.pagination import PageNumberPagination
from rest_framework.permissions import AllowAny, IsAuthenticated

from apps.core.permissions import IsOwnerOrAdmin

from .models import Listing
from .serializers import ListingSerializer


class ListingPagination(PageNumberPagination):
    """Bounded page-number pagination for catalog responses."""

    page_size = 20
    page_size_query_param = "page_size"
    max_page_size = 100


class ListingQuerysetMixin:
    """Build optimized, consistently ordered Listing querysets."""

    @staticmethod
    def _category_value(value):
        return Listing.LEGACY_CATEGORY_ALIASES.get(value, value)

    def _filter_category(self, queryset):
        raw_category = next(
            (
                self.request.query_params.get(key)
                for key in ("category", "domain", "category_type")
                if self.request.query_params.get(key) is not None
            ),
            None,
        )
        if raw_category is None:
            return queryset
        category = self._category_value(raw_category)
        if category not in Listing.Category.values:
            raise ValidationError({"category": "Unknown listing category."})
        return queryset.filter(category_type=category)

    def _filter_status(self, queryset, default_active=True):
        raw_status = self.request.query_params.get("status")
        if raw_status is None:
            raw_status = self.request.query_params.get("availability")
        if raw_status in (None, "", "all"):
            return (
                queryset.filter(status=Listing.Status.ACTIVE)
                if default_active
                else queryset
            )
        if raw_status == "available":
            raw_status = Listing.Status.ACTIVE
        if raw_status not in Listing.Status.values:
            raise ValidationError({"status": "Unknown listing status."})
        return queryset.filter(status=raw_status)

    def _filter_prices(self, queryset):
        for parameter, lookup in (("min_price", "price__gte"), ("max_price", "price__lte")):
            raw_value = self.request.query_params.get(parameter)
            if raw_value in (None, ""):
                continue
            try:
                value = Decimal(raw_value)
            except (InvalidOperation, TypeError):
                raise ValidationError({parameter: "Enter a valid decimal price."})
            if value < 0:
                raise ValidationError({parameter: "Price cannot be negative."})
            queryset = queryset.filter(**{lookup: value})
        return queryset

    def _filter_vendor(self, queryset):
        raw_vendor = self.request.query_params.get("vendor") or self.request.query_params.get(
            "vendor_id"
        )
        if raw_vendor in (None, ""):
            return queryset
        try:
            vendor_id = UUID(str(raw_vendor))
        except (TypeError, ValueError):
            raise ValidationError({"vendor": "Enter a valid Vendor UUID."})
        return queryset.filter(vendor_id=vendor_id)

    def _filter_search(self, queryset):
        search = self.request.query_params.get("search", "").strip()
        if not search:
            return queryset
        return queryset.filter(
            Q(title__icontains=search)
            | Q(description__icontains=search)
            | Q(vendor__business_name__icontains=search)
            | Q(book_detail__author__icontains=search)
            | Q(book_detail__subject__icontains=search)
            | Q(book_detail__edition__icontains=search)
        ).distinct()

    def catalog_queryset(self, *, default_active=True):
        queryset = (
            Listing.objects.select_related(
                "vendor",
                "vendor__user",
                "canteen_detail",
                "stationery_detail",
                "hostel_supply_detail",
                "book_detail",
                "book_detail__seller",
                "inventory",
            )
            .all()
            .order_by("-created_at", "-id")
        )
        queryset = self._filter_status(queryset, default_active=default_active)
        queryset = self._filter_category(queryset)
        queryset = self._filter_prices(queryset)
        queryset = self._filter_vendor(queryset)
        return self._filter_search(queryset)


class ListingListCreateView(ListingQuerysetMixin, generics.ListCreateAPIView):
    """Browse public catalog entries or create one for the current owner."""

    serializer_class = ListingSerializer
    pagination_class = ListingPagination

    def get_permissions(self):
        if self.request.method in {"GET", "HEAD", "OPTIONS"}:
            return [AllowAny()]
        return [IsAuthenticated()]

    def get_queryset(self):
        return self.catalog_queryset(default_active=True)


class ListingDetailView(ListingQuerysetMixin, generics.RetrieveUpdateDestroyAPIView):
    """Retrieve a listing publicly; only its owner or an Admin can mutate it."""

    serializer_class = ListingSerializer
    lookup_field = "pk"

    def get_permissions(self):
        if self.request.method in {"GET", "HEAD", "OPTIONS"}:
            return [AllowAny()]
        return [IsAuthenticated(), IsOwnerOrAdmin()]

    def get_queryset(self):
        # Detail retrieval must continue to work after safe deactivation.
        return self.catalog_queryset(default_active=False)

    def perform_destroy(self, instance):
        """Deactivate rather than delete catalog history."""
        instance.status = Listing.Status.INACTIVE
        instance.save(update_fields=["status", "updated_at"])
