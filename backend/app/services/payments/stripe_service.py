"""Payment Shield UI adapter backed by the shared Stripe test ledger."""

from decimal import Decimal, InvalidOperation
from datetime import datetime, timezone

from fastapi import HTTPException

from app import demo_hub
from app.demo_common import PROVIDERS, token_headers
from app.domain.models import VirtualCard, SimulateChargeResponse


class StripePaymentShieldService:
    def __init__(self):
        self._cards = [
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

    def get_all_cards(self) -> list[VirtualCard]:
        return self._cards

    def get_card_by_id(self, card_id: str) -> VirtualCard | None:
        return next((card for card in self._cards if card.id == card_id), None)

    def toggle_lock(self, card_id: str, locked: bool) -> VirtualCard | None:
        card = self.get_card_by_id(card_id)
        if card:
            card.demoPolicyLocked = locked
            card.status = "locked" if locked else "active"
        return card

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
