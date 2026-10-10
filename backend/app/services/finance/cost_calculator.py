from typing import List, Dict
from app.domain.models import Subscription, SubscriptionCycle

class CostCalculator:
    """
    Financial normalization and metrics calculator.
    Adapts core cycle normalization logic from Wallos into strongly-typed OOP methods.
    """

    @staticmethod
    def get_monthly_cost(price: float, cycle: SubscriptionCycle) -> float:
        """
        Calculates equivalent monthly cost based on billing cycle.
        Matches Wallos getPricePerMonth algorithm.
        """
        match cycle:
            case SubscriptionCycle.DAILY:
                return round(price * 30.0, 2)
            case SubscriptionCycle.WEEKLY:
                return round(price * 4.35, 2)
            case SubscriptionCycle.MONTHLY:
                return round(price, 2)
            case SubscriptionCycle.YEARLY:
                return round(price / 12.0, 2)
            case _:
                return round(price, 2)

    @staticmethod
    def get_annual_cost(price: float, cycle: SubscriptionCycle) -> float:
        """Calculates total annualized drain of a subscription."""
        monthly = CostCalculator.get_monthly_cost(price, cycle)
        return round(monthly * 12.0, 2)

    @staticmethod
    def calculate_total_savings(cancelled_subscriptions: List[Subscription]) -> Dict[str, float]:
        """Calculates monthly and annualized savings from cancelled subscriptions."""
        monthly_saved = sum(CostCalculator.get_monthly_cost(s.price, s.cycle) for s in cancelled_subscriptions)
        return {
            "monthly_savings": round(monthly_saved, 2),
            "annual_savings": round(monthly_saved * 12.0, 2)
        }

    @staticmethod
    def detect_known_overlaps(subscriptions: List[Subscription]) -> List[Dict[str, str]]:
        """
        Detects redundant subscription features based on Wallos AI recommendation heuristics.
        """
        overlaps = []
        names_lower = [s.name.lower() for s in subscriptions if s.status == "Active"]

        # Music streaming overlap
        music_services = [s for s in names_lower if any(m in s for m in ["spotify", "apple music", "youtube music", "tidal", "deezer"])]
        if len(music_services) > 1:
            overlaps.append({
                "category": "Audio Streaming",
                "message": f"Multiple active music services detected ({', '.join(music_services)}). Consolidating could save up to $10.99/mo."
            })

        # Cloud storage overlap
        storage_services = [s for s in names_lower if any(c in s for c in ["icloud", "google one", "dropbox", "onedrive", "proton"])]
        if len(storage_services) > 1:
            overlaps.append({
                "category": "Cloud Storage",
                "message": f"Multiple cloud storage subscriptions detected ({', '.join(storage_services)}). Consolidate to eliminate redundant storage."
            })

        return overlaps
