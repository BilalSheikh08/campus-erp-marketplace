"""Authenticated Inventory management and stock adjustment APIs."""

from django.shortcuts import get_object_or_404
from rest_framework import generics, status
from rest_framework.exceptions import ValidationError
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.core.permissions import IsInventoryManager, IsOwnerOrAdmin

from .models import Inventory
from .serializers import InventorySerializer, StockAdjustmentSerializer
from .services import InventoryOperationError, adjust_stock


def inventory_queryset():
    return (
        Inventory.objects.select_related(
            "listing",
            "listing__vendor",
            "listing__vendor__user",
        )
        .all()
        .order_by("-updated_at", "-id")
    )


class InventoryListCreateView(generics.ListCreateAPIView):
    """List managed stock or create the sole Inventory row for a Listing."""

    serializer_class = InventorySerializer
    permission_classes = (IsAuthenticated, IsInventoryManager)

    def get_queryset(self):
        queryset = inventory_queryset()
        user = self.request.user
        if user.is_superuser or user.role == "admin":
            return queryset
        return queryset.filter(listing__vendor__user_id=user.pk)


class InventoryDetailView(generics.RetrieveUpdateAPIView):
    """Retrieve or safely update quantity and threshold for owned stock."""

    serializer_class = InventorySerializer
    permission_classes = (IsAuthenticated, IsInventoryManager, IsOwnerOrAdmin)
    lookup_field = "pk"

    def get_queryset(self):
        return inventory_queryset()


class StockAdjustmentView(APIView):
    """Apply a locked, non-zero quantity delta to an owned Inventory row."""

    permission_classes = (IsAuthenticated, IsInventoryManager, IsOwnerOrAdmin)

    def get_inventory(self, pk):
        inventory = get_object_or_404(inventory_queryset(), pk=pk)
        self.check_object_permissions(self.request, inventory)
        return inventory

    def post(self, request, pk):
        inventory = self.get_inventory(pk)
        adjustment_serializer = StockAdjustmentSerializer(data=request.data)
        adjustment_serializer.is_valid(raise_exception=True)
        try:
            updated_inventory = adjust_stock(
                inventory,
                adjustment_serializer.validated_data["quantity_change"],
            )
        except InventoryOperationError as exc:
            raise ValidationError({"quantity_change": str(exc)}) from exc

        response_serializer = InventorySerializer(
            updated_inventory,
            context={"request": request},
        )
        return Response(response_serializer.data, status=status.HTTP_200_OK)
