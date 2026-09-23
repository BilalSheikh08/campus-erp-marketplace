"""Cart, checkout, and order lifecycle API views."""

from django.shortcuts import get_object_or_404
from rest_framework import generics, status
from rest_framework.exceptions import ValidationError
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.core.permissions import IsOrderParticipant, IsStudent

from .models import Cart, CartItem
from .serializers import (
    CartItemCreateSerializer,
    CartItemSerializer,
    CartItemUpdateSerializer,
    CartSerializer,
    CheckoutSerializer,
    OrderSerializer,
    OrderTransitionSerializer,
)
from .services import (
    OrderOperationError,
    add_to_cart,
    checkout_cart,
    clear_cart,
    get_or_create_cart,
    remove_cart_item,
    set_cart_item_quantity,
    transition_order,
    visible_orders_for,
)


def _as_validation_error(exc):
    return ValidationError({"detail": str(exc)})


def cart_queryset_for(user):
    return Cart.objects.prefetch_related("items__listing").filter(user_id=user.pk)


class CartView(APIView):
    """Retrieve or clear the authenticated student’s active Cart."""

    permission_classes = (IsAuthenticated, IsStudent)

    def get(self, request):
        cart = get_or_create_cart(request.user)
        cart = get_object_or_404(cart_queryset_for(request.user), pk=cart.pk)
        return Response(CartSerializer(cart).data)

    def delete(self, request):
        cart = clear_cart(request.user)
        cart = get_object_or_404(cart_queryset_for(request.user), pk=cart.pk)
        return Response(CartSerializer(cart).data, status=status.HTTP_200_OK)


class CartItemListCreateView(APIView):
    """Add a Listing to the current user’s Cart, incrementing duplicates."""

    permission_classes = (IsAuthenticated, IsStudent)

    def post(self, request):
        serializer = CartItemCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        try:
            item = add_to_cart(
                request.user,
                serializer.validated_data["listing"],
                serializer.validated_data["quantity"],
            )
        except OrderOperationError as exc:
            raise _as_validation_error(exc) from exc
        return Response(
            CartItemSerializer(item, context={"request": request}).data,
            status=status.HTTP_201_CREATED,
        )


class CartItemDetailView(APIView):
    """Set or remove one CartItem owned by the authenticated student."""

    permission_classes = (IsAuthenticated, IsStudent)

    def patch(self, request, pk):
        serializer = CartItemUpdateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        try:
            item = set_cart_item_quantity(
                request.user,
                pk,
                serializer.validated_data["quantity"],
            )
        except CartItem.DoesNotExist as exc:
            raise ValidationError({"detail": "Cart item not found."}) from exc
        except OrderOperationError as exc:
            raise _as_validation_error(exc) from exc
        return Response(CartItemSerializer(item).data)

    def delete(self, request, pk):
        try:
            remove_cart_item(request.user, pk)
        except OrderOperationError as exc:
            raise ValidationError({"detail": str(exc)}) from exc
        return Response(status=status.HTTP_204_NO_CONTENT)


class OrderListView(generics.ListAPIView):
    """List only orders visible to the authenticated Student, Vendor, or Admin."""

    serializer_class = OrderSerializer
    permission_classes = (IsAuthenticated, IsOrderParticipant)

    def get_queryset(self):
        return visible_orders_for(self.request.user)


class OrderDetailView(generics.RetrieveAPIView):
    """Retrieve an order after applying role-specific visibility filtering."""

    serializer_class = OrderSerializer
    permission_classes = (IsAuthenticated, IsOrderParticipant)
    lookup_field = "pk"

    def get_queryset(self):
        return visible_orders_for(self.request.user)


class CheckoutView(APIView):
    """Create server-priced order(s) from the current Cart."""

    permission_classes = (IsAuthenticated, IsStudent)

    def post(self, request):
        serializer = CheckoutSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        try:
            orders = checkout_cart(
                request.user,
                payment_method=serializer.validated_data["payment_method"],
                pickup_slot=serializer.validated_data.get("pickup_slot", ""),
            )
        except OrderOperationError as exc:
            raise _as_validation_error(exc) from exc
        return Response(
            {"orders": OrderSerializer(orders, many=True).data},
            status=status.HTTP_201_CREATED,
        )


class OrderTransitionView(APIView):
    """Apply one centralized, authorized order state transition."""

    permission_classes = (IsAuthenticated, IsOrderParticipant)

    def post(self, request, pk):
        order = get_object_or_404(visible_orders_for(request.user), pk=pk)
        serializer = OrderTransitionSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        try:
            updated = transition_order(
                order,
                request.user,
                target_status=serializer.validated_data["target_status"],
                note=serializer.validated_data.get("note", ""),
            )
        except OrderOperationError as exc:
            raise _as_validation_error(exc) from exc
        updated = get_object_or_404(visible_orders_for(request.user), pk=updated.pk)
        return Response(OrderSerializer(updated).data)
