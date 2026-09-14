"""API views for hostel request management."""

from rest_framework import generics, status
from rest_framework.exceptions import ValidationError
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import HostelRequest
from .permissions import (
    IsRequestCreator,
    IsRequestWardenOrAdmin,
    IsStudent,
    IsWarden,
    IsWardenOrAdmin,
)
from .serializers import (
    HostelRequestCreateSerializer,
    HostelRequestSerializer,
    HostelRequestTransitionSerializer,
)
from .services import (
    HostelRequestOperationError,
    submit_hostel_request,
    transition_hostel_request,
    visible_requests_for,
)


def _as_validation_error(exc):
    return ValidationError({"detail": str(exc)})


class HostelRequestListView(generics.ListCreateAPIView):
    """List hostel requests visible to the user, or create a new request (students only)."""

    serializer_class = HostelRequestCreateSerializer
    permission_classes = (IsAuthenticated,)

    def get_serializer_class(self):
        if self.request.method == "POST":
            return HostelRequestCreateSerializer
        return HostelRequestSerializer

    def get_queryset(self):
        return visible_requests_for(self.request.user)

    def get_serializer_context(self):
        return {"request": self.request}

    def create(self, request, *args, **kwargs):
        """Create a new hostel request."""
        serializer = self.get_serializer_class()(data=request.data)
        serializer.is_valid(raise_exception=True)

        try:
            new_request = submit_hostel_request(
                student=request.user,
                listing=serializer.validated_data["listing"],
                quantity=serializer.validated_data["quantity"],
                required_by_date=serializer.validated_data["required_by_date"],
                special_instructions=serializer.validated_data.get("special_instructions", ""),
            )
        except HostelRequestOperationError as exc:
            raise _as_validation_error(exc) from exc

        response_serializer = HostelRequestSerializer(new_request, context={"request": request})
        return Response(response_serializer.data, status=status.HTTP_201_CREATED)


class HostelRequestDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Retrieve, update, or cancel a hostel request."""

    serializer_class = HostelRequestSerializer
    permission_classes = (IsAuthenticated, IsRequestCreator)
    lookup_field = "pk"

    def get_queryset(self):
        return visible_requests_for(self.request.user)

    def get_permissions(self):
        if self.request.method in {"GET", "PATCH", "DELETE"}:
            return [IsAuthenticated(), IsRequestCreator()]
        return [IsAuthenticated()]

    def destroy(self, request, *args, **kwargs):
        """Cancel the request."""
        request_obj = self.get_object()

        try:
            transition_hostel_request(
                request_obj,
                request.user,
                target_status=HostelRequest.Status.CANCELLED,
                note="Request cancelled by student.",
            )
        except HostelRequestOperationError as exc:
            raise _as_validation_error(exc) from exc

        updated = self.get_queryset().get(pk=request_obj.pk)
        response_serializer = HostelRequestSerializer(updated, context={"request": request})
        return Response(response_serializer.data)


class HostelRequestTransitionView(APIView):
    """Apply a status transition to a hostel request (warden/admin only)."""

    permission_classes = (IsAuthenticated, IsRequestWardenOrAdmin)

    def post(self, request, pk):
        request_obj = self.get_queryset(request).get(pk=pk)

        serializer = HostelRequestTransitionSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        try:
            updated = transition_hostel_request(
                request_obj,
                request.user,
                target_status=serializer.validated_data["target_status"],
                note=serializer.validated_data.get("note", ""),
            )
        except HostelRequestOperationError as exc:
            raise _as_validation_error(exc) from exc

        response_serializer = HostelRequestSerializer(updated, context={"request": request})
        return Response(response_serializer.data)

    def get_queryset(self, request):
        return visible_requests_for(request.user)


class WardenHostelRequestsView(generics.ListAPIView):
    """List hostel requests visible to the authenticated warden."""

    serializer_class = HostelRequestSerializer
    permission_classes = (IsAuthenticated, IsWarden)

    def get_queryset(self):
        return visible_requests_for(self.request.user)


class WardenHostelRequestDetailView(generics.RetrieveAPIView):
    """Retrieve a single hostel request detail (warden only)."""

    serializer_class = HostelRequestSerializer
    permission_classes = (IsAuthenticated, IsWarden)
    lookup_field = "pk"

    def get_queryset(self):
        return visible_requests_for(self.request.user)


class StudentHostelRequestsView(generics.ListAPIView):
    """List hostel requests submitted by the authenticated student."""

    serializer_class = HostelRequestSerializer
    permission_classes = (IsAuthenticated, IsStudent)

    def get_queryset(self):
        return visible_requests_for(self.request.user)


class AdminHostelRequestsView(generics.ListAPIView):
    """List all hostel requests (admin only)."""

    serializer_class = HostelRequestSerializer
    permission_classes = (IsAuthenticated, IsWardenOrAdmin)

    def get_queryset(self):
        return visible_requests_for(self.request.user)