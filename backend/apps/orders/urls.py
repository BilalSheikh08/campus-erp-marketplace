"""Cart and order API routes."""

from django.urls import path

from .views import (
    CartItemDetailView,
    CartItemListCreateView,
    CartView,
    CheckoutView,
    OrderDetailView,
    OrderListView,
    OrderTransitionView,
)

app_name = "orders"

urlpatterns = [
    path("cart/", CartView.as_view(), name="cart"),
    path("cart/items/", CartItemListCreateView.as_view(), name="cart-items"),
    path("cart/items/<uuid:pk>/", CartItemDetailView.as_view(), name="cart-item-detail"),
    path("orders/", OrderListView.as_view(), name="order-list"),
    path("orders/checkout/", CheckoutView.as_view(), name="checkout"),
    path("orders/<uuid:pk>/", OrderDetailView.as_view(), name="order-detail"),
    path(
        "orders/<uuid:pk>/transition/",
        OrderTransitionView.as_view(),
        name="order-transition",
    ),
]
