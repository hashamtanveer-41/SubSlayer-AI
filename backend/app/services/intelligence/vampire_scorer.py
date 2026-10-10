from typing import Dict, Any, Tuple
from app.domain.models import SubscriptionCycle
from app.services.finance.cost_calculator import CostCalculator

class VampireScorer:
    """
    Computes a 0-100 'Vampire Score' and transparent explanation.
    Empowers the UI to explain exactly why a subscription is a high-risk drain.
    """

    @staticmethod
    def evaluate(name: str, category: str, price: float, cycle: SubscriptionCycle) -> Tuple[int, str]:
        monthly_cost = CostCalculator.get_monthly_cost(price, cycle)
        score = 40
        reasons = []

        # 1. Price drain factor
        if monthly_cost >= 50:
            score += 35
            reasons.append(f"High monthly cost (${monthly_cost:.2f}/mo)")
        elif monthly_cost >= 20:
            score += 20
            reasons.append(f"Significant recurring cost (${monthly_cost:.2f}/mo)")
        elif monthly_cost >= 10:
            score += 10

        # 2. Category vulnerability
        cat_lower = category.lower()
        if any(c in cat_lower for c in ["productivity", "design", "creative", "developer", "cloud"]):
            score += 15
            reasons.append("SaaS/Productivity category prone to forgotten seats")
        elif "entertainment" in cat_lower:
            score += 10
            reasons.append("Entertainment category with recurring streaming creep")

        # 3. Known high-churn services
        name_lower = name.lower()
        if any(target in name_lower for target in ["adobe", "canva", "netflix", "gym", "spotify"]):
            score += 15
            reasons.append("High-retention commercial service with renewal dark patterns")

        final_score = max(15, min(98, score))
        explanation = "; ".join(reasons) if reasons else "Standard recurring charge"

        return final_score, explanation
