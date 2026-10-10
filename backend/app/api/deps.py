from app.services.repository import SubscriptionRepository
from app.services.cancellation_orchestrator import CancellationOrchestrator
from app.services.payments.stripe_service import StripePaymentShieldService

_subscription_repo = SubscriptionRepository()
_orchestrator = CancellationOrchestrator(_subscription_repo)
_stripe_service = StripePaymentShieldService()

def get_subscription_repo() -> SubscriptionRepository:
    return _subscription_repo

def get_orchestrator() -> CancellationOrchestrator:
    return _orchestrator

def get_stripe_service() -> StripePaymentShieldService:
    return _stripe_service
