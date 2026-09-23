"""Project URL configuration."""

from django.contrib import admin
from django.http import JsonResponse
from django.urls import include, path


def health_check(request):
    """Return a lightweight readiness response for local/container checks."""
    return JsonResponse({"status": "ok", "service": "campus-erp-backend"})


urlpatterns = [
    path("admin/", admin.site.urls),
    path("health/", health_check, name="health-check"),
    path("api/health/", health_check, name="api-health-check"),
    path("api/auth/", include("apps.users.urls")),
    path("api/vendors/", include("apps.vendors.urls")),
    path("api/listings/", include("apps.listings.urls")),
    path("api/inventory/", include("apps.inventory.urls")),
    path("api/hostel-requests/", include("apps.hostel_requests.urls")),
    path("api/orders/", include("apps.orders.urls")),
    path("api/notifications/", include("apps.notifications.urls")),
    path("api/books/", include("apps.books.urls")),
    path("api/analytics/", include("apps.analytics.urls")),
]
