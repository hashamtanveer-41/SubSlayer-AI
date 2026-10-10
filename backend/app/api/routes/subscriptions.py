import uuid
import asyncio
import os
from typing import List
from fastapi import APIRouter, Depends, HTTPException
from app.domain.models import Subscription, CreateSubscriptionRequest, UpdateSubscriptionRequest, SubscriptionStatus, SubscriptionCycle
from app.api.deps import get_subscription_repo
from app.services.repository import SubscriptionRepository
from app.services.intelligence.vampire_scorer import VampireScorer
from app.demo_common import PROVIDERS
from app.services.providers.adapters import ProviderAdapterRegistry
from app.services.providers.remote import ProviderUnavailable

router = APIRouter(prefix="/api/subscriptions", tags=["Subscriptions"])

@router.get("", response_model=List[Subscription])
async def list_subscriptions(refresh: bool = False,
                             repo: SubscriptionRepository = Depends(get_subscription_repo)):
    if refresh and os.getenv("PROVIDER_MODE", "remote").lower() != "fixture":
        async def sync_provider(sub: Subscription) -> None:
            if sub.provider not in PROVIDERS or not sub.providerSubscriptionId:
                return
            adapter = ProviderAdapterRegistry.get_adapter(sub.provider)
            if adapter is None:
                return
            try:
                live = await adapter.lookup_subscription(sub.providerSubscriptionId)
            except (ProviderUnavailable, KeyError, ValueError, RuntimeError):
                return
            provider_status = live.get("status")
            if provider_status == "cancelled":
                status = SubscriptionStatus.CANCELLED
            elif provider_status in ("scheduled", "pending", "cancellation_scheduled"):
                status = SubscriptionStatus.PENDING_CANCELLATION
            elif provider_status == "active":
                task = repo.get_task(sub.latestCancellationTaskId) if sub.latestCancellationTaskId else None
                if task and task.status in ("queued", "in_progress"):
                    return
                status = SubscriptionStatus.ACTIVE
            else:
                return
            updated = sub.model_copy(update={
                "status": status,
                "providerRequestId": live.get("providerRequestId"),
                "cancellationEffectiveDate": live.get("currentPeriodEnd"),
            })
            repo.update(updated)

        await asyncio.gather(*(sync_provider(sub) for sub in repo.get_all()))
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
        if req.cycle != SubscriptionCycle.MONTHLY:
            raise HTTPException(status_code=400, detail="Demo provider plans bill monthly")
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


@router.patch("/{subscription_id}", response_model=Subscription)
async def update_subscription(subscription_id: str, req: UpdateSubscriptionRequest,
                              repo: SubscriptionRepository = Depends(get_subscription_repo)):
    sub = repo.get_by_id(subscription_id)
    if sub is None:
        raise HTTPException(status_code=404, detail="Subscription not found")
    changes = req.model_dump(exclude_unset=True, exclude_none=True)
    if "price" in changes and sub.provider in PROVIDERS:
        if round(changes["price"] * 100) != PROVIDERS[sub.provider]["price_cents"]:
            raise HTTPException(status_code=400, detail="Price must match the demo provider plan")
    if sub.provider in PROVIDERS and changes.get("cycle", SubscriptionCycle.MONTHLY) != SubscriptionCycle.MONTHLY:
        raise HTTPException(status_code=400, detail="Demo provider plans bill monthly")
    updated = sub.model_copy(update=changes)
    repo.update(updated)
    return updated
