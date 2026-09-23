"""Channels WebSocket isolation tests for notification delivery."""

import asyncio

import pytest
from channels.db import database_sync_to_async
from channels.testing import WebsocketCommunicator
from rest_framework_simplejwt.tokens import RefreshToken

from apps.notifications.models import Notification
from apps.notifications.services import _deliver_notification
from apps.users.models import User
from config.asgi import application


@database_sync_to_async
def create_user(email, name):
    return User.objects.create_user(
        email=email,
        password="StrongPass!123",
        name=name,
        role=User.Role.STUDENT,
    )


@database_sync_to_async
def issue_access_token(user):
    return str(RefreshToken.for_user(user).access_token)


@database_sync_to_async
def create_notification(user):
    return Notification.objects.create(
        user=user,
        message="Private event",
        notification_type=Notification.NotificationType.SYSTEM,
    )


@database_sync_to_async
def deliver(notification):
    _deliver_notification(notification)


@pytest.mark.asyncio
@pytest.mark.django_db(transaction=True)
async def test_websocket_auth_syncs_only_authenticated_user():
    user = await create_user("ws-user@example.com", "WebSocket User")
    token = await issue_access_token(user)
    communicator = WebsocketCommunicator(application, f"/ws/notifications/?token={token}")
    connected, _ = await communicator.connect()
    assert connected is True
    message = await communicator.receive_json_from()
    assert message["type"] == "notification.sync"
    assert message["unread_count"] == 0
    await communicator.disconnect()


@pytest.mark.asyncio
@pytest.mark.django_db(transaction=True)
async def test_websocket_rejects_missing_authentication():
    communicator = WebsocketCommunicator(application, "/ws/notifications/")
    connected, _ = await communicator.connect()
    assert connected is False


@pytest.mark.asyncio
@pytest.mark.django_db(transaction=True)
async def test_websocket_delivery_is_user_scoped():
    user_a = await create_user("ws-a@example.com", "A")
    user_b = await create_user("ws-b@example.com", "B")
    token_a = await issue_access_token(user_a)
    token_b = await issue_access_token(user_b)
    communicator_a = WebsocketCommunicator(application, f"/ws/notifications/?token={token_a}")
    communicator_b = WebsocketCommunicator(application, f"/ws/notifications/?token={token_b}")
    assert (await communicator_a.connect())[0] is True
    assert (await communicator_b.connect())[0] is True
    await communicator_a.receive_json_from()
    await communicator_b.receive_json_from()

    notification = await create_notification(user_a)
    await deliver(notification)

    event = await communicator_a.receive_json_from()
    assert event["type"] == "notification.created"
    assert event["notification"]["user"] == str(user_a.id)
    with pytest.raises(asyncio.TimeoutError):
        await communicator_b.receive_json_from(timeout=0.1)

    await communicator_a.disconnect()
    await communicator_b.disconnect()
