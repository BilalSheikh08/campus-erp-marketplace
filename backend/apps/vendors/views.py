"""Vendor application, profile, and administration API views."""

from django.core.exceptions import ValidationError
from django.db import IntegrityError, transaction
from django.http import Http404
from rest_framework import generics, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.core.permissions import IsAdmin, IsStudent

from .models import Vendor
from .serializers import VendorRejectionSerializer, VendorSerializer


class VendorApplicationView(generics.CreateAPIView):
    """Submit a new vendor application as a Student."""

    serializer_class = VendorSerializer
    permission_classes = [IsAuthenticated, IsStudent]

    def create(self, request, *args, **kwargs):
        try:
            return super().create(request, *args, **kwargs)
        except IntegrityError:
            return Response(
                {"user": "This user already has a vendor application."},
                status=status.HTTP_400_BAD_REQUEST,
            )


class VendorProfileView(generics.RetrieveUpdateAPIView):
    """Retrieve or update the authenticated user's vendor profile."""

    serializer_class = VendorSerializer
    permission_classes = [IsAuthenticated]
    http_method_names = ["get", "patch", "head", "options"]

    def get_object(self):
        try:
            return Vendor.objects.select_related("user", "approved_by").get(
                user=self.request.user
            )
        except Vendor.DoesNotExist as exc:
            raise Http404("You do not have a vendor application.") from exc


class AdminVendorListView(generics.ListAPIView):
    """List vendor applications for administrators."""

    serializer_class = VendorSerializer
    permission_classes = [IsAuthenticated, IsAdmin]

    def get_queryset(self):
        queryset = Vendor.objects.select_related("user", "approved_by").all()
        approval_status = self.request.query_params.get("approval_status")
        vendor_type = self.request.query_params.get("vendor_type")

        if approval_status in Vendor.ApprovalStatus.values:
            queryset = queryset.filter(approval_status=approval_status)
        if vendor_type in Vendor.VendorType.values:
            queryset = queryset.filter(vendor_type=vendor_type)
        return queryset


class ApproveVendorView(APIView):
    """Approve one pending vendor application as an administrator."""

    permission_classes = [IsAuthenticated, IsAdmin]

    def post(self, request, pk):
        try:
            with transaction.atomic():
                vendor = (
                    Vendor.objects.select_for_update()
                    .select_related("user", "approved_by")
                    .get(pk=pk)
                )
                vendor.approve(request.user)
        except Vendor.DoesNotExist as exc:
            raise Http404("Vendor application not found.") from exc
        except ValidationError as exc:
            return Response(
                {"detail": exc.messages[0]},
                status=status.HTTP_400_BAD_REQUEST,
            )

        return Response(VendorSerializer(vendor).data)


class RejectVendorView(APIView):
    """Reject one pending vendor application as an administrator."""

    permission_classes = [IsAuthenticated, IsAdmin]

    def post(self, request, pk):
        serializer = VendorRejectionSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        try:
            with transaction.atomic():
                vendor = (
                    Vendor.objects.select_for_update()
                    .select_related("user", "approved_by")
                    .get(pk=pk)
                )
                vendor.reject(request.user, serializer.validated_data.get("reason", ""))
        except Vendor.DoesNotExist as exc:
            raise Http404("Vendor application not found.") from exc
        except ValidationError as exc:
            return Response(
                {"detail": exc.messages[0]},
                status=status.HTTP_400_BAD_REQUEST,
            )

        return Response(VendorSerializer(vendor).data)
