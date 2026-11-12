from rest_framework import generics
from rest_framework.exceptions import PermissionDenied
from rest_framework.permissions import AllowAny, IsAdminUser, IsAuthenticated
from rest_framework.throttling import AnonRateThrottle, UserRateThrottle

from .models import ContactInquiry
from .serializers import ContactInquiryAdminSerializer, ContactInquirySerializer


class ContactInquiryCreateView(generics.CreateAPIView):
    serializer_class = ContactInquirySerializer
    permission_classes = (AllowAny,)
    throttle_classes = (AnonRateThrottle, UserRateThrottle)

    def perform_create(self, serializer):
        user = self.request.user
        serializer.save(user=user if user.is_authenticated else None)


class ContactInquiryListView(generics.ListAPIView):
    serializer_class = ContactInquirySerializer
    permission_classes = (IsAuthenticated, IsAdminUser)

    def get_queryset(self):
        return ContactInquiry.objects.all()


class ContactInquiryDetailView(generics.RetrieveUpdateAPIView):
    serializer_class = ContactInquiryAdminSerializer
    permission_classes = (IsAuthenticated, IsAdminUser)
    queryset = ContactInquiry.objects.all()
    http_method_names = ("get", "patch", "head", "options")

    def perform_update(self, serializer):
        if set(self.request.data) - {"status"}:
            raise PermissionDenied("Only an inquiry's status can be changed.")
        serializer.save()
