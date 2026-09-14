"""URL patterns for hostel request API endpoints."""

from django.urls import path
from rest_framework.routers import DefaultRouter

from .views import (
    AdminHostelRequestsView,
    HostelRequestDetailView,
    HostelRequestListView,
    HostelRequestTransitionView,
    StudentHostelRequestsView,
    WardenHostelRequestDetailView,
    WardenHostelRequestsView,
)

app_name = "hostel_requests"

router = DefaultRouter()
router.register("hostel-requests", HostelRequestListView, basename="hostel-request")

urlpatterns = [
    path(
        "hostel-requests/<uuid:pk>/",
        HostelRequestDetailView.as_view(),
        name="hostel-request-detail",
    ),
    path(
        "hostel-requests/<uuid:pk>/transition/",
        HostelRequestTransitionView.as_view(),
        name="hostel-request-transition",
    ),
    path(
        "warden/hostel-requests/",
        WardenHostelRequestsView.as_view(),
        name="warden-hostel-requests",
    ),
    path(
        "warden/hostel-requests/<uuid:pk>/",
        WardenHostelRequestDetailView.as_view(),
        name="warden-hostel-request-detail",
    ),
    path(
        "student/hostel-requests/",
        StudentHostelRequestsView.as_view(),
        name="student-hostel-requests",
    ),
    path(
        "admin/hostel-requests/",
        AdminHostelRequestsView.as_view(),
        name="admin-hostel-requests",
    ),
] + router.urls