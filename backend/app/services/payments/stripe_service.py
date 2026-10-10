"""Payment Shield UI adapter backed by the shared Stripe test ledger and SQLite."""

import os
import sqlite3
import threading
from contextlib import contextmanager
from decimal import Decimal, InvalidOperation
from datetime import datetime, timezone
from pathlib import Path
from typing import Optional, List

from fastapi import HTTPException

from app import demo_hub
from app.demo_common import PROVIDERS, token_headers
from app.domain.models import VirtualCard, SimulateChargeResponse
from app.services.repository import _resolve_db_path


def _row_to_card(row: sqlite3.Row) -> VirtualCard:
    return VirtualCard(
        id=row["id"],
        label=row["label"],
        stripeCustomerId=row["stripe_customer_id"],
        paymentMethodId=row["payment_method_id"],
        cardBrand=row["card_brand"],
        last4=row["last4"],
        testMode=bool(row["test_mode"]),
        spendingLimit=float(row["spending_limit"]),
        demoPolicyLocked=bool(row["demo_policy_locked"]),
        status=row["status"],
    )


class StripePaymentShieldService:
    """
    SQLite-backed thread-safe service for Virtual Cards.
    Persists card locks and statuses across backend restarts.
    """

    def __init__(self, db_path: Optional[str] = None):
        self._lock = threading.Lock()
        self.db_path = _resolve_db_path(db_path)
        self._is_memory = (self.db_path == ":memory:")
        if self._is_memory:
            self._mem_conn = sqlite3.connect(":memory:", check_same_thread=False)
            self._mem_conn.row_factory = sqlite3.Row
        self._init_db()
        self._seed_default_cards_if_empty()

    @contextmanager
    def _connection(self):
        with self._lock:
            if self._is_memory:
                yield self._mem_conn
                self._mem_conn.commit()
            else:
                conn = sqlite3.connect(self.db_path, timeout=15)
                conn.row_factory = sqlite3.Row
                try:
                    yield conn
                    conn.commit()
                finally:
                    conn.close()

    def _init_db(self):
        with self._connection() as conn:
            conn.execute("PRAGMA journal_mode=WAL;")
            conn.execute("""
                CREATE TABLE IF NOT EXISTS virtual_cards (
                    id TEXT PRIMARY KEY,
                    label TEXT NOT NULL,
                    stripe_customer_id TEXT NOT NULL,
                    payment_method_id TEXT NOT NULL,
                    card_brand TEXT NOT NULL,
                    last4 TEXT NOT NULL,
                    test_mode INTEGER NOT NULL DEFAULT 1,
                    spending_limit REAL NOT NULL,
                    demo_policy_locked INTEGER NOT NULL DEFAULT 0,
                    status TEXT NOT NULL DEFAULT 'active'
                );
            """)

    def _seed_default_cards_if_empty(self):
        with self._connection() as conn:
            count = conn.execute("SELECT COUNT(*) FROM virtual_cards").fetchone()[0]
            if count > 0:
                return
            initial_cards = [
                VirtualCard(id="card_01", label="Streaming demo", stripeCustomerId="demo_streaming",
                            paymentMethodId="pm_card_visa", cardBrand="visa", last4="4242",
                            testMode=True, spendingLimit=20.00, demoPolicyLocked=True, status="locked"),
                VirtualCard(id="card_02", label="Adobe / SaaS demo", stripeCustomerId="demo_adobe",
                            paymentMethodId="pm_card_visa", cardBrand="visa", last4="4242",
                            testMode=True, spendingLimit=60.00, demoPolicyLocked=False, status="active"),
                VirtualCard(id="card_03", label="Canva / Design demo", stripeCustomerId="demo_canva",
                            paymentMethodId="pm_card_visa", cardBrand="visa", last4="4242",
                            testMode=True, spendingLimit=15.00, demoPolicyLocked=True, status="locked"),
            ]
            for c in initial_cards:
                conn.execute("""
                    INSERT OR REPLACE INTO virtual_cards (
                        id, label, stripe_customer_id, payment_method_id, card_brand,
                        last4, test_mode, spending_limit, demo_policy_locked, status
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """, (
                    c.id, c.label, c.stripeCustomerId, c.paymentMethodId, c.cardBrand,
                    c.last4, 1 if c.testMode else 0, c.spendingLimit,
                    1 if c.demoPolicyLocked else 0, c.status,
                ))

    def reset(self):
        with self._connection() as conn:
            conn.execute("DELETE FROM virtual_cards")
        self._seed_default_cards_if_empty()

    def get_all_cards(self) -> List[VirtualCard]:
        with self._connection() as conn:
            rows = conn.execute("SELECT * FROM virtual_cards").fetchall()
            return [_row_to_card(r) for r in rows]

    def get_card_by_id(self, card_id: str) -> Optional[VirtualCard]:
        with self._connection() as conn:
            row = conn.execute("SELECT * FROM virtual_cards WHERE id = ?", (card_id,)).fetchone()
            return _row_to_card(row) if row else None

    def toggle_lock(self, card_id: str, locked: bool) -> Optional[VirtualCard]:
        new_status = "locked" if locked else "active"
        locked_int = 1 if locked else 0
        with self._connection() as conn:
            cur = conn.execute("""
                UPDATE virtual_cards
                SET demo_policy_locked = ?, status = ?
                WHERE id = ?
            """, (locked_int, new_status, card_id))
            if cur.rowcount == 0:
                return None
        return self.get_card_by_id(card_id)

    def simulate_charge(self, card_id: str, amount: float, merchant: str,
                        idempotency_key: str) -> SimulateChargeResponse:
        card = self.get_card_by_id(card_id)
        now = datetime.now(timezone.utc).isoformat()

        def declined(reason: str, outcome: str) -> SimulateChargeResponse:
            return SimulateChargeResponse(success=False, status="DECLINED", reason=reason,
                                          outcomeType=outcome, stripePaymentIntentId=None,
                                          testMode=True, amountBlocked=amount, timestamp=now)

        if card is None:
            return declined("Demo card not found", "blocked_by_demo_policy")
        if card.demoPolicyLocked:
            return declined("Blocked by demo card lock; no Stripe payment was created", "blocked_by_demo_policy")
        name = next((name for name in PROVIDERS if name in merchant.lower()), None)
        if name is None:
            return declined("Merchant is not one of the four demo providers", "blocked_by_demo_policy")
        try:
            cents = int((Decimal(str(amount)) * 100).quantize(Decimal("1")))
        except (InvalidOperation, ValueError):
            return declined("Invalid charge amount", "blocked_by_demo_policy")
        if cents != PROVIDERS[name]["price_cents"]:
            return declined("Charge amount differs from the provider demo price", "blocked_by_demo_policy")
        if amount > card.spendingLimit:
            return declined("Charge exceeds demo card spending limit", "blocked_by_demo_policy")

        try:
            result = demo_hub.bill(
                demo_hub.BillingRequest(provider=name, subscription_id=PROVIDERS[name]["subscription_id"],
                                        amount_cents=cents, idempotency_key=idempotency_key),
                authorization=token_headers()["Authorization"],
            )
        except HTTPException as exc:
            if exc.status_code == 402:
                outcome = ("blocked_by_demo_policy" if "Insufficient demo wallet" in str(exc.detail)
                           else "declined_by_stripe")
                return declined(str(exc.detail), outcome)
            raise
        return SimulateChargeResponse(success=True, status="APPROVED",
                                      reason="Stripe test charge succeeded; demo wallet debited",
                                      outcomeType="succeeded", stripePaymentIntentId=result["stripe_intent_id"],
                                      testMode=True, amountBlocked=0.0, timestamp=now)
