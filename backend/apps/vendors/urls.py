"""Vendor onboarding and administration routes."""

from django.urls import path

from .views import (
    AdminVendorListView,
    ApproveVendorView,
    RejectVendorView,
    VendorApplicationView,
    VendorProfileView,
)

app_name = "vendors"

urlpatterns = [
    path("", AdminVendorListView.as_view(), name="admin-list"),
    path("apply/", VendorApplicationView.as_view(), name="apply"),
    path("me/", VendorProfileView.as_view(), name="profile"),
    path("<uuid:pk>/approve/", ApproveVendorView.as_view(), name="approve"),
    path("<uuid:pk>/reject/", RejectVendorView.as_view(), name="reject"),
]
