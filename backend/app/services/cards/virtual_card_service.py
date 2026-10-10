from datetime import datetime, timezone
from typing import List, Optional
from app.domain.models import VirtualCard, CardStatus, SimulateChargeResponse

class VirtualCardService:
    """
    Manages Privacy.com-style virtual cards and the $0.00 Balance Shield.
    Single Responsibility: Card generation, balance locking, and transaction evaluation.
    """

    def __init__(self):
        # Initial seed cards matching PRD and Figma aesthetic
        self._cards: List[VirtualCard] = [
            VirtualCard(
                id="card_01",
                merchant="Adobe / SaaS Subscriptions",
                cardNumberMasked="•••• •••• •••• 8492",
                exp="09/28",
                cvv="412",
                spendingLimit=20.00,
                balanceLocked=True,
                status=CardStatus.LOCKED,
            ),
            VirtualCard(
                id="card_02",
                merchant="Streaming & Media Pass",
                cardNumberMasked="•••• •••• •••• 1044",
                exp="11/27",
                cvv="883",
                spendingLimit=15.00,
                balanceLocked=False,
                status=CardStatus.ACTIVE,
            ),
            VirtualCard(
                id="card_03",
                merchant="Gym & Fitness Shield",
                cardNumberMasked="•••• •••• •••• 6390",
                exp="04/29",
                cvv="219",
                spendingLimit=0.00,
                balanceLocked=True,
                status=CardStatus.LOCKED,
            ),
        ]

    def get_all_cards(self) -> List[VirtualCard]:
        return self._cards

    def get_card_by_id(self, card_id: str) -> Optional[VirtualCard]:
        return next((c for c in self._cards if c.id == card_id), None)

    def toggle_card_lock(self, card_id: str) -> Optional[VirtualCard]:
        card = self.get_card_by_id(card_id)
        if not card:
            return None
        
        card.balanceLocked = not card.balanceLocked
        card.status = CardStatus.LOCKED if card.balanceLocked else CardStatus.ACTIVE
        return card

    def simulate_charge(self, card_id: str, amount: float, merchant: str) -> SimulateChargeResponse:
        card = self.get_card_by_id(card_id)
        now_iso = datetime.now(timezone.utc).isoformat()

        if not card:
            return SimulateChargeResponse(
                success=False,
                status="DECLINED",
                reason="Card not found or inactive",
                amountBlocked=amount,
                bankAccountImpact=0.00,
                timestamp=now_iso,
            )

        if card.balanceLocked or card.status == CardStatus.LOCKED:
            return SimulateChargeResponse(
                success=False,
                status="DECLINED",
                reason=f"Card balance locked to $0.00 by SubSlayer Shield. Merchant '{merchant}' blocked.",
                amountBlocked=amount,
                bankAccountImpact=0.00,
                timestamp=now_iso,
            )

        if amount > card.spendingLimit:
            return SimulateChargeResponse(
                success=False,
                status="DECLINED",
                reason=f"Charge ${amount:.2f} exceeds card limit of ${card.spendingLimit:.2f}.",
                amountBlocked=amount,
                bankAccountImpact=0.00,
                timestamp=now_iso,
            )

        return SimulateChargeResponse(
            success=True,
            status="APPROVED",
            reason=f"Charge authorized within card limit of ${card.spendingLimit:.2f}.",
            amountBlocked=0.00,
            bankAccountImpact=amount,
            timestamp=now_iso,
        )
