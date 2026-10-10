import uuid
from typing import List
from fastapi import APIRouter, Depends, HTTPException
from app.domain.models import Subscription, CreateSubscriptionRequest, SubscriptionStatus
from app.api.deps import get_subscription_repo
from app.services.repository import SubscriptionRepository
from app.services.intelligence.vampire_scorer import VampireScorer

router = APIRouter(prefix="/api/subscriptions", tags=["Subscriptions"])

@router.get("", response_model=List[Subscription])
async def list_subscriptions(repo: SubscriptionRepository = Depends(get_subscription_repo)):
    return repo.get_all()

@router.post("", response_model=Subscription)
async def create_subscription(
    req: CreateSubscriptionRequest,
    repo: SubscriptionRepository = Depends(get_subscription_repo)
):
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
        provider=req.provider.lower(),
        providerSubscriptionId=f"demo_{req.provider.lower()}_sub_{uuid.uuid4().hex[:4]}",
        mark=req.name[0].upper() if req.name else "S",
        tone=req.provider.lower() if req.provider.lower() in ["netflix", "spotify", "canva", "adobe"] else "neutral",
    )
    return repo.add(sub)
