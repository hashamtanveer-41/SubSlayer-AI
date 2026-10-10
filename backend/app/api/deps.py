from typing import Optional
from fastapi import Depends, Request, HTTPException, status
from app.services.repository import SubscriptionRepository
from app.services.cancellation_orchestrator import CancellationOrchestrator
from app.services.payments.stripe_service import StripePaymentShieldService
from app.services.auth_service import AuthService
from app.domain.auth_models import UserProfile

_subscription_repo = SubscriptionRepository()
_orchestrator = CancellationOrchestrator(_subscription_repo)
_stripe_service = StripePaymentShieldService()
_auth_service = AuthService()

def get_subscription_repo() -> SubscriptionRepository:
    return _subscription_repo

def get_orchestrator() -> CancellationOrchestrator:
    return _orchestrator

def get_stripe_service() -> StripePaymentShieldService:
    return _stripe_service

def get_auth_service() -> AuthService:
    return _auth_service

def get_current_user_optional(
    request: Request,
    auth_service: AuthService = Depends(get_auth_service)
) -> Optional[UserProfile]:
    session_id = request.cookies.get("subslayer_session")
    if not session_id:
        auth_header = request.headers.get("Authorization", "")
        if auth_header.startswith("Bearer "):
            session_id = auth_header[7:].strip()
    if not session_id:
        session_id = request.headers.get("X-Session-ID", "").strip()

    if not session_id:
        return None
    return auth_service.get_user_by_session(session_id)

def get_current_user(
    current_user: Optional[UserProfile] = Depends(get_current_user_optional)
) -> UserProfile:
    if not current_user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required"
        )
    return current_user
