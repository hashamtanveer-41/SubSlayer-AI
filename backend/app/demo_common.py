"""Shared contract for the four independent, clearly labeled demo providers."""

import os
from datetime import datetime, timezone
from pathlib import Path
from dotenv import load_dotenv
from fastapi import HTTPException

load_dotenv(Path(__file__).resolve().parents[1] / ".env")

PROVIDERS = {
    "netflix": {"subscription_id": "netflix-demo-001", "price_cents": 1549, "category": "entertainment"},
    "spotify": {"subscription_id": "spotify-demo-001", "price_cents": 1099, "category": "entertainment"},
    "canva": {"subscription_id": "canva-demo-001", "price_cents": 1499, "category": "design"},
    "adobe": {"subscription_id": "adobe-demo-001", "price_cents": 5999, "category": "creative"},
}


def now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


def require_token(authorization: str | None) -> None:
    import hmac

    expected = os.getenv("DEMO_SERVICE_TOKEN", "")
    supplied = authorization.removeprefix("Bearer ") if authorization else ""
    if not expected or not hmac.compare_digest(supplied, expected):
        raise HTTPException(status_code=401, detail="Invalid demo service token")


def token_headers() -> dict[str, str]:
    token = os.getenv("DEMO_SERVICE_TOKEN", "")
    if not token:
        raise RuntimeError("DEMO_SERVICE_TOKEN is required")
    return {"Authorization": f"Bearer {token}"}
