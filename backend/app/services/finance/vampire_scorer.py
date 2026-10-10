from app.domain.models import SubscriptionCycle
from app.services.finance.cost_calculator import CostCalculator

class VampireScorer:
    """
    Computes a 0-100 'Vampire Score' representing financial risk and waste potential.
    """

    @staticmethod
    def calculate_score(name: str, category: str, price: float, cycle: SubscriptionCycle) -> int:
        monthly_cost = CostCalculator.get_monthly_cost(price, cycle)
        score = 40  # baseline score

        # 1. Price drain factor
        if monthly_cost >= 50:
            score += 35
        elif monthly_cost >= 20:
            score += 20
        elif monthly_cost >= 10:
            score += 10

        # 2. Category vulnerability
        cat_lower = category.lower()
        if any(c in cat_lower for c in ["productivity", "design", "creative", "developer", "cloud"]):
            score += 15  # high risk of forgotten business/SaaS licenses
        elif "entertainment" in cat_lower:
            score += 10

        # 3. Known high-churn/vampire services
        name_lower = name.lower()
        if any(target in name_lower for target in ["adobe", "canva", "gym", "datacamp", "coursera", "chegg"]):
            score += 15

        # Clamp between 10 and 98
        return max(15, min(98, score))
