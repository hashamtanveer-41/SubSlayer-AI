import os
import uuid
from datetime import datetime, timezone
from typing import List, Optional
import stripe
from app.domain.models import VirtualCard, SimulateChargeResponse

class StripePaymentShieldService:
    """
    Manages Stripe Test-Mode Payment Shield demo.
    Enforces that only test keys ('sk_test_') are permitted.
    Stores safe display metadata only (brand, last4); never raw PAN or CVV.
    """

    def __init__(self):
        self.api_key = os.getenv("STRIPE_SECRET_KEY", "").strip()
        
        # Security validation: Never allow live Stripe keys in demo
        if self.api_key and not self.api_key.startswith("sk_test_"):
            raise ValueError("SECURITY ALERT: Only Stripe test keys (sk_test_*) are permitted in SubSlayer AI demo.")

        stripe.api_key = self.api_key

        # Seed test cards matching PRD and Figma aesthetic
        self._cards: List[VirtualCard] = [
            VirtualCard(
                id="card_01",
                label="Streaming demo",
                stripeCustomerId="cus_test_streaming_912",
                paymentMethodId="pm_card_visa",
                cardBrand="visa",
                last4="4242",
                testMode=True,
                spendingLimit=20.00,
                demoPolicyLocked=True,
                status="locked",
            ),
            VirtualCard(
                id="card_02",
                label="Adobe / SaaS demo",
                stripeCustomerId="cus_test_adobe_418",
                paymentMethodId="pm_card_mastercard",
                cardBrand="mastercard",
                last4="5555",
                testMode=True,
                spendingLimit=60.00,
                demoPolicyLocked=False,
                status="active",
            ),
            VirtualCard(
                id="card_03",
                label="Canva / Design demo",
                stripeCustomerId="cus_test_design_330",
                paymentMethodId="pm_card_amex",
                cardBrand="amex",
                last4="0005",
                testMode=True,
                spendingLimit=15.00,
                demoPolicyLocked=True,
                status="locked",
            ),
        ]

    def get_all_cards(self) -> List[VirtualCard]:
        return self._cards

    def get_card_by_id(self, card_id: str) -> Optional[VirtualCard]:
        return next((c for c in self._cards if c.id == card_id), None)

    def toggle_lock(self, card_id: str, locked: bool) -> Optional[VirtualCard]:
        card = self.get_card_by_id(card_id)
        if not card:
            return None
        card.demoPolicyLocked = locked
        card.status = "locked" if locked else "active"
        return card

    def simulate_charge(
        self,
        card_id: str,
        amount: float,
        merchant: str,
        idempotency_key: str
    ) -> SimulateChargeResponse:
        card = self.get_card_by_id(card_id)
        now_iso = datetime.now(timezone.utc).isoformat()

        if not card:
            return SimulateChargeResponse(
                success=False,
                status="DECLINED",
                reason="Card not found or inactive",
                outcomeType="declined_by_stripe",
                stripePaymentIntentId=None,
                testMode=True,
                amountBlocked=amount,
                timestamp=now_iso,
            )

        # 1. Local Demo Policy Check: Block BEFORE reaching Stripe
        if card.demoPolicyLocked:
            return SimulateChargeResponse(
                success=False,
                status="DECLINED",
                reason=f"Payment blocked by SubSlayer demo policy; no Stripe payment was created for merchant '{merchant}'",
                outcomeType="blocked_by_demo_policy",
                stripePaymentIntentId=None,
                testMode=True,
                amountBlocked=amount,
                timestamp=now_iso,
            )

        # 2. Unlocked attempt: Create Stripe test-mode PaymentIntent or simulated test authorization
        try:
            if self.api_key and self.api_key.startswith("sk_test_"):
                # Real Stripe test mode call using idempotency key
                amount_cents = int(round(amount * 100))
                intent = stripe.PaymentIntent.create(
                    amount=amount_cents,
                    currency="usd",
                    payment_method=card.paymentMethodId,
                    confirm=True,
                    automatic_payment_methods={"enabled": True, "allow_redirects": "never"},
                    idempotency_key=f"subslayer_{idempotency_key}",
                    metadata={"merchant": merchant, "demo_card_id": card.id}
                )
                return SimulateChargeResponse(
                    success=True,
                    status="APPROVED",
                    reason=f"Stripe test-mode PaymentIntent succeeded for ${amount:.2f}",
                    outcomeType="succeeded",
                    stripePaymentIntentId=intent.id,
                    testMode=True,
                    amountBlocked=0.00,
                    timestamp=now_iso,
                )
        except Exception as e:
            # Safe handling if Stripe test call returns a simulated decline or network error
            err_msg = str(e)
            return SimulateChargeResponse(
                success=False,
                status="DECLINED",
                reason=f"Stripe test-mode transaction declined: {err_msg}",
                outcomeType="declined_by_stripe",
                stripePaymentIntentId=f"pi_test_failed_{uuid.uuid4().hex[:8]}",
                testMode=True,
                amountBlocked=amount,
                timestamp=now_iso,
            )

        # Fallback test mode simulation if offline
        intent_id = f"pi_test_mock_{uuid.uuid4().hex[:12]}"
        return SimulateChargeResponse(
            success=True,
            status="APPROVED",
            reason=f"Test-mode payment authorized for ${amount:.2f}",
            outcomeType="succeeded",
            stripePaymentIntentId=intent_id,
            testMode=True,
            amountBlocked=0.00,
            timestamp=now_iso,
        )
