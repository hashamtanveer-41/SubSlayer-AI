"""Frontend-facing views of Asfand's shared demo hub."""

from fastapi import APIRouter

from app import demo_hub
from app.demo_common import token_headers

router = APIRouter(tags=["Distributed demo"])


@router.get("/api/demo-wallet")
def wallet():
    return demo_hub.demo_wallet(authorization=token_headers()["Authorization"])


@router.get("/api/stripe/test-balance")
def stripe_balance():
    return demo_hub.stripe_test_balance(authorization=token_headers()["Authorization"])


@router.post("/api/ai/analyze")
def analyze(request: demo_hub.AnalyzeRequest):
    return demo_hub.analyze(request, authorization=token_headers()["Authorization"])


@router.get("/api/providers/{name}/health")
def provider_health(name: str):
    return demo_hub.provider_health(name)
