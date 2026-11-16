"""Project URL configuration."""

from django.conf import settings
from django.conf.urls.static import static
from django.contrib import admin
from django.http import JsonResponse
from django.urls import include, path


def health_check(request):
    """Return a lightweight readiness response for local/container checks."""
    return JsonResponse({"status": "ok", "service": "campus-erp-backend"})


def root_view(request):
    """Return a welcoming API status response for root requests."""
    return JsonResponse({
        "status": "ok",
        "service": "campus-erp-backend",
        "message": "Campus ERP & Marketplace API is active.",
        "frontend_url": "http://localhost:5173/",
        "admin_url": "/admin/",
        "endpoints": {
            "health": "/health/",
            "auth": "/api/auth/",
            "listings": "/api/listings/",
            "orders": "/api/orders/",
            "cart": "/api/cart/",
            "books": "/api/books/",
            "hostel_requests": "/api/hostel-requests/",
            "vendors": "/api/vendors/",
            "inventory": "/api/inventory/",
            "notifications": "/api/notifications/",
            "analytics": "/api/analytics/",
            "support": "/api/support/",
        },
    })


urlpatterns = [
    path("", root_view, name="api-root"),
    path("admin/", admin.site.urls),
    path("health/", health_check, name="health-check"),
    path("api/health/", health_check, name="api-health-check"),
    path("api/auth/", include("apps.users.urls")),
    path("api/vendors/", include("apps.vendors.urls")),
    path("api/listings/", include("apps.listings.urls")),
    path("api/inventory/", include("apps.inventory.urls")),
    path("api/hostel-requests/", include("apps.hostel_requests.urls")),
    path("api/", include("apps.orders.urls")),
    path("api/notifications/", include("apps.notifications.urls")),
    path("api/books/", include("apps.books.urls")),
    path("api/analytics/", include("apps.analytics.urls")),
    path("api/support/", include("apps.support.urls")),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
