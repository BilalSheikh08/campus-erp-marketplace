"""JWT authentication middleware for Channels WebSockets."""

from urllib.parse import parse_qs

from channels.db import database_sync_to_async
from django.contrib.auth.models import AnonymousUser
from rest_framework_simplejwt.exceptions import InvalidToken, TokenError
from rest_framework_simplejwt.tokens import AccessToken

from apps.users.models import User


@database_sync_to_async
def _get_user(token):
    try:
        validated = AccessToken(token)
        user_id = validated.get("user_id")
        if not user_id:
            return AnonymousUser()
        return User.objects.get(pk=user_id, is_active=True)
    except (TokenError, InvalidToken, User.DoesNotExist, ValueError, TypeError):
        return AnonymousUser()


class JWTAuthMiddleware:
    """Authenticate the WebSocket from ?token=<access-jwt>."""

    def __init__(self, app):
        self.app = app

    async def __call__(self, scope, receive, send):
        query_string = scope.get("query_string", b"").decode("utf-8")
        query_params = parse_qs(query_string)
        token = query_params.get("token", [None])[0]
        scope["user"] = await _get_user(token) if token else AnonymousUser()
        return await self.app(scope, receive, send)


JWTAuthMiddlewareStack = JWTAuthMiddleware
