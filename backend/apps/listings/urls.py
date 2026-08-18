"""URL routes for the shared listing catalog."""

from django.urls import path

from .views import ListingDetailView, ListingListCreateView

app_name = "listings"

urlpatterns = [
    path("", ListingListCreateView.as_view(), name="listing-list-create"),
    path("<uuid:pk>/", ListingDetailView.as_view(), name="listing-detail"),
]
