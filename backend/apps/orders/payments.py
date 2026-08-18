"""Replaceable local payment strategies for the first checkout release."""

from dataclasses import dataclass
from uuid import uuid4

from .models import Order


class PaymentStrategyError(ValueError):
    """Raised when a checkout payment method is unsupported."""


@dataclass(frozen=True)
class PaymentResult:
    status: str
    reference: str


def process_payment(payment_method):
    """Return a simulated result without accepting or storing credentials."""
    allowed = set(Order.PaymentMethod.values)
    if payment_method not in allowed:
        raise PaymentStrategyError("Unsupported payment method.")

    reference = f"{payment_method}-{uuid4().hex}"
    if payment_method in {
        Order.PaymentMethod.MOCK,
        Order.PaymentMethod.CAMPUS_WALLET,
    }:
        return PaymentResult(Order.PaymentStatus.PAID, reference)
    return PaymentResult(Order.PaymentStatus.PENDING, reference)


def refund_payment(payment_status):
    """Represent a local refund state transition, not a gateway call."""
    if payment_status == Order.PaymentStatus.PAID:
        return Order.PaymentStatus.REFUNDED
    return payment_status
