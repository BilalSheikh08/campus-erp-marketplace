from django.urls import path

from .views import (
    ContactInquiryCreateView,
    ContactInquiryDetailView,
    ContactInquiryListView,
)

app_name = "support"

urlpatterns = [
    path("inquiries/", ContactInquiryCreateView.as_view(), name="inquiry-create"),
    path("inquiries/admin/", ContactInquiryListView.as_view(), name="inquiry-list"),
    path("inquiries/admin/<uuid:pk>/", ContactInquiryDetailView.as_view(), name="inquiry-detail"),
]
