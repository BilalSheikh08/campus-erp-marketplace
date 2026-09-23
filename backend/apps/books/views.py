"""REST endpoints for the second-hand book marketplace."""

from decimal import Decimal, InvalidOperation

from django.db import transaction
from django.db.models import Q
from rest_framework import mixins, status, viewsets
from rest_framework.decorators import action
from rest_framework.exceptions import PermissionDenied, ValidationError
from rest_framework.pagination import PageNumberPagination
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response

from apps.core.permissions import IsStudent
from apps.listings.models import BookDetail, Listing

from .models import BookTransaction
from .serializers import BookCreateSerializer, BookSerializer, BookTransactionSerializer
from .services import (
    BookOperationError,
    BookPermissionError,
    cancel_book_reservation,
    complete_book_transaction,
    confirm_book_sale,
    reserve_book,
    visible_transactions_for,
)


class BookPagination(PageNumberPagination):
    page_size = 20
    page_size_query_param = "page_size"
    max_page_size = 100


class BookViewSet(mixins.ListModelMixin, mixins.RetrieveModelMixin, viewsets.GenericViewSet):
    """Browse available books and expose seller/buyer transaction actions."""

    lookup_field = "pk"
    serializer_class = BookSerializer
    pagination_class = BookPagination

    def get_permissions(self):
        action = getattr(self, "action", None)
        if action in {"list", "retrieve"}:
            return [AllowAny()]
        if action in {"create", "reserve", "confirm_sale", "complete", "cancel", "my_listings", "my_transactions"}:
            return [IsAuthenticated(), IsStudent()]
        return [IsAuthenticated()]

    def _base_queryset(self):
        return (
            Listing.objects.select_related(
                "book_detail",
                "book_detail__seller",
            )
            .filter(category_type=Listing.Category.BOOK)
            .order_by("-created_at", "-id")
        )

    def get_queryset(self):
        queryset = self._base_queryset()
        if getattr(self, "action", None) == "list":
            availability = self.request.query_params.get("available", "true").lower()
            if availability not in {"false", "0", "no", "all"}:
                queryset = queryset.filter(
                    status=Listing.Status.ACTIVE,
                    book_detail__is_available=True,
                )

            condition = self.request.query_params.get("condition")
            if condition:
                if condition not in BookDetail.Condition.values:
                    raise ValidationError({"condition": "Unknown book condition."})
                queryset = queryset.filter(book_detail__condition=condition)

            search = self.request.query_params.get("search", "").strip()
            if search:
                queryset = queryset.filter(
                    Q(title__icontains=search)
                    | Q(description__icontains=search)
                    | Q(book_detail__author__icontains=search)
                    | Q(book_detail__subject__icontains=search)
                    | Q(book_detail__edition__icontains=search)
                    | Q(book_detail__seller__name__icontains=search)
                ).distinct()

            for parameter, lookup in (("min_price", "price__gte"), ("max_price", "price__lte")):
                value = self.request.query_params.get(parameter)
                if not value:
                    continue
                try:
                    decimal_value = Decimal(value)
                except (InvalidOperation, TypeError):
                    raise ValidationError({parameter: "Enter a valid decimal price."})
                if decimal_value < 0:
                    raise ValidationError({parameter: "Price cannot be negative."})
                queryset = queryset.filter(**{lookup: decimal_value})

        return queryset

    def list(self, request, *args, **kwargs):
        response = super().list(request, *args, **kwargs)
        return response

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        if instance.status != Listing.Status.ACTIVE:
            if not request.user.is_authenticated:
                # Keep inactive book history private from anonymous browsing.
                raise PermissionDenied("This book is no longer publicly available.")
            seller_id = getattr(instance.book_detail, "seller_id", None)
            related = BookTransaction.objects.filter(listing=instance, buyer=request.user).exists()
            if request.user.pk != seller_id and not related and request.user.role != request.user.Role.ADMIN:
                raise PermissionDenied("This book is no longer publicly available.")
        return Response(self.get_serializer(instance).data)

    def create(self, request, *args, **kwargs):
        serializer = BookCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data
        with transaction.atomic():
            listing = Listing.objects.create(
                vendor=None,
                title=data["title"],
                description=data.get("description", ""),
                price=data["price"],
                category_type=Listing.Category.BOOK,
                status=Listing.Status.ACTIVE,
                image_url=data.get("image_url"),
            )
            BookDetail.objects.create(
                listing=listing,
                seller=request.user,
                condition=data["condition"],
                author=data.get("author", ""),
                subject=data.get("subject", ""),
                edition=data.get("edition", ""),
                is_available=True,
            )
        output = BookSerializer(
            listing,
            context=self.get_serializer_context(),
        )
        return Response(output.data, status=status.HTTP_201_CREATED)

    @action(detail=False, methods=["get"], url_path="my-listings")
    def my_listings(self, request):
        listings = self._base_queryset().filter(book_detail__seller_id=request.user.pk)
        page = self.paginate_queryset(listings)
        serializer = self.get_serializer(page or listings, many=True)
        return self.get_paginated_response(serializer.data) if page is not None else Response(serializer.data)

    @action(detail=False, methods=["get"], url_path="my-transactions")
    def my_transactions(self, request):
        queryset = visible_transactions_for(request.user).order_by("-created_at", "-id")
        page = self.paginate_queryset(queryset)
        serializer = BookTransactionSerializer(page or queryset, many=True)
        return self.get_paginated_response(serializer.data) if page is not None else Response(serializer.data)

    @action(detail=True, methods=["post"], url_path="reserve")
    def reserve(self, request, pk=None):
        try:
            book_tx = reserve_book(request.user, pk)
        except BookPermissionError as exc:
            raise PermissionDenied(str(exc))
        except BookOperationError as exc:
            raise ValidationError({"detail": str(exc)})
        return Response(BookTransactionSerializer(book_tx).data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=["post"], url_path="confirm-sale")
    def confirm_sale(self, request, pk=None):
        try:
            book_tx = confirm_book_sale(request.user, pk)
        except BookPermissionError as exc:
            raise PermissionDenied(str(exc))
        except BookOperationError as exc:
            raise ValidationError({"detail": str(exc)})
        return Response(BookTransactionSerializer(book_tx).data, status=status.HTTP_200_OK)

    @action(detail=False, methods=["post"], url_path=r"transactions/(?P<transaction_id>[^/.]+)/complete")
    def complete(self, request, transaction_id=None):
        try:
            book_tx = complete_book_transaction(request.user, transaction_id)
        except BookPermissionError as exc:
            raise PermissionDenied(str(exc))
        except BookOperationError as exc:
            raise ValidationError({"detail": str(exc)})
        return Response(BookTransactionSerializer(book_tx).data, status=status.HTTP_200_OK)

    @action(detail=False, methods=["post"], url_path=r"transactions/(?P<transaction_id>[^/.]+)/cancel")
    def cancel(self, request, transaction_id=None):
        try:
            book_tx = cancel_book_reservation(request.user, transaction_id)
        except BookPermissionError as exc:
            raise PermissionDenied(str(exc))
        except BookOperationError as exc:
            raise ValidationError({"detail": str(exc)})
        return Response(BookTransactionSerializer(book_tx).data, status=status.HTTP_200_OK)

    @action(detail=False, methods=["get"], url_path=r"transactions/(?P<transaction_id>[^/.]+)")
    def transaction_detail(self, request, transaction_id=None):
        queryset = visible_transactions_for(request.user)
        try:
            book_tx = queryset.get(pk=transaction_id)
        except BookTransaction.DoesNotExist as exc:
            raise PermissionDenied("Book transaction not found or not owned by you.") from exc
        return Response(BookTransactionSerializer(book_tx).data)
