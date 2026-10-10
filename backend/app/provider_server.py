"""Run one instance per provider/device: uvicorn app.provider_server:app."""

import os
import sqlite3
import threading
from contextlib import contextmanager
from datetime import datetime, timedelta, timezone
from pathlib import Path
from uuid import uuid4

import httpx
from fastapi import FastAPI, Header, HTTPException
from pydantic import BaseModel, Field

from app.demo_common import PROVIDERS, now_iso, require_token, token_headers

app = FastAPI(title="SubSlayer provider demo API", description="Simulated provider; no real consumer platform access")
_lock = threading.RLock()


def provider() -> str:
    name = os.getenv("PROVIDER_NAME", "").lower()
    if name not in PROVIDERS:
        raise RuntimeError("PROVIDER_NAME must be netflix, spotify, canva, or adobe")
    return name


@contextmanager
def connection():
    path = Path(os.getenv("PROVIDER_DB_PATH", f"provider_{provider()}.sqlite3"))
    db = sqlite3.connect(path, timeout=15)
    db.row_factory = sqlite3.Row
    db.execute("CREATE TABLE IF NOT EXISTS subscriptions (id TEXT PRIMARY KEY, status TEXT NOT NULL, effective_at TEXT, provider_request_id TEXT)")
    db.execute("CREATE TABLE IF NOT EXISTS operations (key TEXT PRIMARY KEY, kind TEXT NOT NULL, subscription_id TEXT NOT NULL, response TEXT NOT NULL)")
    db.execute("INSERT OR IGNORE INTO subscriptions(id,status) VALUES (?, 'active')", (PROVIDERS[provider()]["subscription_id"],))
    db.commit()
    try:
        yield db
    finally:
        db.close()


def subscription(db: sqlite3.Connection, subscription_id: str) -> dict:
    row = db.execute("SELECT * FROM subscriptions WHERE id=?", (subscription_id,)).fetchone()
    if row is None:
        raise HTTPException(404, "Demo subscription not found")
    name = provider()
    status = row["status"]
    if status == "scheduled" and row["effective_at"] and row["effective_at"] <= now_iso():
        status = "cancelled"
        db.execute("UPDATE subscriptions SET status='cancelled' WHERE id=?", (subscription_id,))
        db.commit()
    return {"demo": True, "provider": name, "subscription_id": subscription_id,
            "price_cents": PROVIDERS[name]["price_cents"], "currency": "usd", "status": status,
            "effective_at": row["effective_at"], "provider_request_id": row["provider_request_id"]}


class CancelRequest(BaseModel):
    idempotency_key: str = Field(min_length=8, max_length=128)
    confirmed: bool


class ChargeRequest(BaseModel):
    idempotency_key: str = Field(min_length=8, max_length=128)


@app.get("/health")
def health():
    return {"status": "ok", "demo": True, "provider": provider()}


@app.get("/v1/subscriptions/{subscription_id}")
def get_subscription(subscription_id: str, authorization: str | None = Header(default=None)):
    require_token(authorization)
    with connection() as db:
        return subscription(db, subscription_id)


@app.get("/v1/requests/{provider_request_id}")
def get_request_status(provider_request_id: str, authorization: str | None = Header(default=None)):
    require_token(authorization)
    with connection() as db:
        row = db.execute("SELECT id FROM subscriptions WHERE provider_request_id=?", (provider_request_id,)).fetchone()
        if row is None:
            raise HTTPException(404, "Demo provider request not found")
        return subscription(db, row["id"])


@app.post("/v1/subscriptions/{subscription_id}/cancel")
def cancel(subscription_id: str, request: CancelRequest, authorization: str | None = Header(default=None)):
    require_token(authorization)
    if not request.confirmed:
        raise HTTPException(400, "User confirmation is required")
    with _lock, connection() as db:
        current = subscription(db, subscription_id)
        previous = db.execute("SELECT * FROM operations WHERE key=?", (request.idempotency_key,)).fetchone()
        if previous:
            if previous["kind"] != "cancel" or previous["subscription_id"] != subscription_id:
                raise HTTPException(409, "Idempotency key reused for another operation")
            import json
            return json.loads(previous["response"])
        if current["status"] == "active":
            # Netflix/Spotify renewals are stopped at period end; Canva is immediate;
            # Adobe demonstrates an asynchronous provider acknowledgement.
            name = provider()
            status = "cancelled" if name == "canva" else "pending" if name == "adobe" else "scheduled"
            effective = None if name == "adobe" else now_iso() if name == "canva" else (datetime.now(timezone.utc) + timedelta(days=30)).isoformat()
            receipt = f"demo_{name}_{uuid4().hex[:16]}"
            db.execute("UPDATE subscriptions SET status=?,effective_at=?,provider_request_id=? WHERE id=?",
                       (status, effective, receipt, subscription_id))
        else:
            status, effective, receipt = current["status"], current["effective_at"], current["provider_request_id"]
        prior_outcome = "already_pending" if current["status"] == "pending" else "already_cancelled"
        result = {"demo": True, "provider": provider(), "subscription_id": subscription_id,
                  "outcome": prior_outcome if current["status"] != "active" else status,
                  "status": status, "effective_at": effective, "provider_request_id": receipt}
        import json
        db.execute("INSERT INTO operations VALUES (?,?,?,?)", (request.idempotency_key, "cancel", subscription_id, json.dumps(result)))
        db.commit()
        return result


@app.post("/v1/subscriptions/{subscription_id}/charge")
def charge(subscription_id: str, request: ChargeRequest, authorization: str | None = Header(default=None)):
    require_token(authorization)
    with connection() as db:
        current = subscription(db, subscription_id)
    if current["status"] in ("cancelled", "scheduled"):
        raise HTTPException(409, "Subscription cannot be charged after cancellation")
    hub = os.getenv("HUB_API_URL", "").rstrip("/")
    if not hub:
        raise HTTPException(503, "HUB_API_URL is not configured")
    try:
        response = httpx.post(f"{hub}/internal/billing/charge", headers=token_headers(), json={
            "provider": provider(), "subscription_id": subscription_id,
            "amount_cents": PROVIDERS[provider()]["price_cents"], "idempotency_key": request.idempotency_key,
        }, timeout=25)
        return {"demo": True, "provider": provider(), "subscription_id": subscription_id,
                "billing": response.json(), "status_code": response.status_code}
    except (httpx.HTTPError, ValueError) as exc:
        raise HTTPException(502, "Billing hub unavailable or returned an invalid response") from exc
