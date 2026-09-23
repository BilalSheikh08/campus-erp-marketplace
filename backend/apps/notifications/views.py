"""REST API for user-owned notifications."""

from django.http import Http404
from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.exceptions import PermissionDenied
from rest_framework.pagination import PageNumberPagination
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from .models import Notification
from .serializers import NotificationSerializer
from .services import get_unread_count


class NotificationPagination(PageNumberPagination):
    page_size = 20
    page_size_query_param = "page_size"
    max_page_size = 100


class NotificationViewSet(viewsets.ModelViewSet):
    serializer_class = NotificationSerializer
    permission_classes = [IsAuthenticated]
    pagination_class = NotificationPagination
    http_method_names = ["get", "patch", "head", "options"]

    def get_queryset(self):
        queryset = Notification.objects.filter(user=self.request.user)
        unread = self.request.query_params.get("unread")
        if unread is not None:
            if unread.lower() in {"true", "1", "yes"}:
                queryset = queryset.filter(is_read=False)
            elif unread.lower() in {"false", "0", "no"}:
                queryset = queryset.filter(is_read=True)
        category = self.request.query_params.get("category")
        if category:
            queryset = queryset.filter(category=category)
        notification_type = self.request.query_params.get("notification_type")
        if notification_type:
            queryset = queryset.filter(notification_type=notification_type)

        ordering = self.request.query_params.get("ordering", "-created_at")
        if ordering not in {"created_at", "-created_at"}:
            ordering = "-created_at"
        return queryset.order_by(ordering, "-id")

    def get_object(self):
        try:
            obj = Notification.objects.get(pk=self.kwargs.get(self.lookup_field, self.kwargs.get("pk")))
        except Notification.DoesNotExist as exc:
            raise Http404 from exc
        if obj.user_id != self.request.user.pk:
            raise PermissionDenied("You do not own this notification.")
        self.check_object_permissions(self.request, obj)
        return obj

    @action(detail=False, methods=["get"], url_path="unread-count")
    def unread_count(self, request):
        return Response({"unread_count": get_unread_count(request.user)}, status=status.HTTP_200_OK)
