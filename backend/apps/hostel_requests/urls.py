"""URL patterns for hostel request API endpoints."""

from django.urls import path

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

urlpatterns = [
    # Student/general endpoints
    path(
        "",
        HostelRequestListView.as_view(),
        name="hostel-request-list",
    ),
    path(
        "<uuid:pk>/",
        HostelRequestDetailView.as_view(),
        name="hostel-request-detail",
    ),
    path(
        "<uuid:pk>/transition/",
        HostelRequestTransitionView.as_view(),
        name="hostel-request-transition",
    ),
    # Warden endpoints
    path(
        "warden/",
        WardenHostelRequestsView.as_view(),
        name="warden-hostel-requests",
    ),
    path(
        "warden/<uuid:pk>/",
        WardenHostelRequestDetailView.as_view(),
        name="warden-hostel-request-detail",
    ),
    # Student list endpoint
    path(
        "student/",
        StudentHostelRequestsView.as_view(),
        name="student-hostel-requests",
    ),
    # Admin endpoint
    path(
        "admin/",
        AdminHostelRequestsView.as_view(),
        name="admin-hostel-requests",
    ),
]
