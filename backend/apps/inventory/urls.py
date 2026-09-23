"""URL routes for authenticated inventory management."""

from django.urls import path

from .views import InventoryDetailView, InventoryListCreateView, StockAdjustmentView


urlpatterns = [
    path("", InventoryListCreateView.as_view(), name="inventory-list-create"),
    path("<uuid:pk>/", InventoryDetailView.as_view(), name="inventory-detail"),
    path(
        "<uuid:pk>/adjust/",
        StockAdjustmentView.as_view(),
        name="inventory-adjust",
    ),
]
