import uuid
from typing import List
from fastapi import APIRouter, Depends, HTTPException
from app.domain.models import Subscription, CreateSubscriptionRequest, SubscriptionStatus
from app.api.deps import get_subscription_repo
from app.services.repository import SubscriptionRepository
from app.services.intelligence.vampire_scorer import VampireScorer
from app.demo_common import PROVIDERS

router = APIRouter(prefix="/api/subscriptions", tags=["Subscriptions"])

@router.get("", response_model=List[Subscription])
async def list_subscriptions(repo: SubscriptionRepository = Depends(get_subscription_repo)):
    return repo.get_all()

@router.post("", response_model=Subscription)
async def create_subscription(
    req: CreateSubscriptionRequest,
    repo: SubscriptionRepository = Depends(get_subscription_repo)
):
    provider = req.provider.lower().strip()
    if provider in PROVIDERS:
        fixture = PROVIDERS[provider]
        if repo.get_by_provider_subscription_id(provider, fixture["subscription_id"]):
            raise HTTPException(status_code=409, detail="This demo provider account is already in the dashboard")
        if round(req.price * 100) != fixture["price_cents"]:
            raise HTTPException(status_code=400, detail="Price must match the demo provider plan")
    vampire_score, _ = VampireScorer.evaluate(req.name, req.category, req.price, req.cycle)
    sub = Subscription(
        id=f"sub_{uuid.uuid4().hex[:6]}",
        name=req.name,
        category=req.category,
        price=req.price,
        cycle=req.cycle,
        renewal=req.renewal,
        status=SubscriptionStatus.ACTIVE,
        vampireScore=vampire_score,
        provider=provider,
        providerSubscriptionId=(PROVIDERS[provider]["subscription_id"]
                                if provider in PROVIDERS else None),
        mark=req.name[0].upper() if req.name else "S",
        tone=provider if provider in PROVIDERS else "neutral",
    )
    return repo.add(sub)
