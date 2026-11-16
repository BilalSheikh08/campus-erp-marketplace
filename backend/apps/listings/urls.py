"""URL routes for the shared listing catalog."""

from django.urls import path

from .views import (
    ImageUploadView,
    ListingDetailView,
    ListingListCreateView,
    ListingReviewListCreateView,
)

app_name = "listings"

urlpatterns = [
    path("", ListingListCreateView.as_view(), name="listing-list-create"),
    path("upload-image/", ImageUploadView.as_view(), name="image-upload"),
    path("<uuid:pk>/", ListingDetailView.as_view(), name="listing-detail"),
    path("<uuid:pk>/reviews/", ListingReviewListCreateView.as_view(), name="listing-reviews"),
]
