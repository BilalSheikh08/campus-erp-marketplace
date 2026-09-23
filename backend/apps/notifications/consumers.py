"""User-scoped real-time notification consumer."""

from channels.db import database_sync_to_async
from channels.generic.websocket import AsyncJsonWebsocketConsumer

from .services import _user_group, _serialize_notification, get_unread_count


class NotificationConsumer(AsyncJsonWebsocketConsumer):
    """Deliver only the current user's notifications."""

    async def connect(self):
        user = self.scope.get("user")
        if not user or not user.is_authenticated:
            await self.close(code=4401)
            return

        self.group_name = _user_group(user.pk)
        await self.channel_layer.group_add(self.group_name, self.channel_name)
        await self.accept()
        await self.send_json(
            {
                "type": "notification.sync",
                "unread_count": await self._unread_count(user),
            }
        )

    async def disconnect(self, close_code):
        group_name = getattr(self, "group_name", None)
        if group_name:
            await self.channel_layer.group_discard(group_name, self.channel_name)

    async def notification_message(self, event):
        await self.send_json(
            {
                "type": "notification.created",
                "notification": event["notification"],
            }
        )

    @staticmethod
    async def _unread_count(user):
        return await _get_unread_count(user)


@database_sync_to_async
def _get_unread_count(user):
    return get_unread_count(user)
