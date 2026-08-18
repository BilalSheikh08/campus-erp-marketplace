"""Scoped throttles for authentication endpoints."""

from rest_framework.throttling import AnonRateThrottle, UserRateThrottle


class LoginRateThrottle(AnonRateThrottle):
    scope = "auth_login"


class RegistrationRateThrottle(AnonRateThrottle):
    scope = "auth_register"


class RefreshRateThrottle(AnonRateThrottle):
    scope = "auth_refresh"


class LogoutRateThrottle(UserRateThrottle):
    scope = "auth_logout"


class PasswordChangeRateThrottle(UserRateThrottle):
    scope = "auth_password_change"
