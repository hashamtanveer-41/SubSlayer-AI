from typing import List
from fastapi import APIRouter, Depends, HTTPException
from app.domain.models import (
    VirtualCard,
    ToggleCardLockRequest,
    SimulateChargeRequest,
    SimulateChargeResponse,
)
from app.api.deps import get_stripe_service
from app.services.payments.stripe_service import StripePaymentShieldService

router = APIRouter(prefix="/api/cards", tags=["Payment Shield"])

@router.get("", response_model=List[VirtualCard])
async def list_cards(stripe_svc: StripePaymentShieldService = Depends(get_stripe_service)):
    return stripe_svc.get_all_cards()

@router.post("/toggle-lock", response_model=VirtualCard)
async def toggle_card_lock(
    req: ToggleCardLockRequest,
    stripe_svc: StripePaymentShieldService = Depends(get_stripe_service)
):
    card = stripe_svc.toggle_lock(req.cardId, req.locked)
    if not card:
        raise HTTPException(status_code=404, detail=f"Card '{req.cardId}' not found.")
    return card

@router.post("/simulate-charge", response_model=SimulateChargeResponse)
async def simulate_charge(
    req: SimulateChargeRequest,
    stripe_svc: StripePaymentShieldService = Depends(get_stripe_service)
):
    return stripe_svc.simulate_charge(
        card_id=req.cardId,
        amount=req.amount,
        merchant=req.merchant,
        idempotency_key=req.idempotencyKey
    )
