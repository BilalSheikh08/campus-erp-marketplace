"""Authentication and user profile routes."""

from django.urls import path

from .views import (
    LoginView,
    LogoutView,
    PasswordChangeView,
    ProfileView,
    RefreshView,
    RegistrationView,
)

app_name = "users"

urlpatterns = [
    path("register/", RegistrationView.as_view(), name="register"),
    path("login/", LoginView.as_view(), name="login"),
    path("token/refresh/", RefreshView.as_view(), name="token-refresh"),
    path("logout/", LogoutView.as_view(), name="logout"),
    path("me/", ProfileView.as_view(), name="me"),
    path("password/change/", PasswordChangeView.as_view(), name="password-change"),
]
