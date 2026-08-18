"""ASGI config for the Campus ERP Marketplace project."""

import os

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")

from channels.routing import ProtocolTypeRouter  # noqa: E402
from django.core.asgi import get_asgi_application  # noqa: E402


django_asgi_application = get_asgi_application()

# WebSocket URL routing is intentionally added with the notification feature.
# HTTP is fully available in the foundation phase.
application = ProtocolTypeRouter(
    {
        "http": django_asgi_application,
    }
)
