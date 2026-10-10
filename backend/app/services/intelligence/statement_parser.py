import csv
import io
import uuid
from typing import List
from app.domain.models import Subscription, SubscriptionCycle, SubscriptionStatus, StatementUploadResponse
from app.services.intelligence.vampire_scorer import VampireScorer
from app.services.finance.cost_calculator import CostCalculator
from app.demo_common import PROVIDERS

class StatementParser:
    """
    Parses CSV bank statements and flags recurring subscriptions.
    Accepts standard CSV: Date, Merchant, Amount, Category
    """

    PROVIDER_MAP = {
        "netflix": ("netflix", "Netflix", "Entertainment"),
        "spotify": ("spotify", "Spotify", "Entertainment"),
        "canva": ("canva", "Canva Pro", "Productivity"),
        "adobe": ("adobe", "Adobe Creative Cloud", "Productivity"),
    }

    @classmethod
    def parse_csv_content(cls, csv_text: str) -> StatementUploadResponse:
        f = io.StringIO(csv_text.strip())
        reader = csv.DictReader(f)
        
        parsed_subs: List[Subscription] = []

        for row in reader:
            merchant = row.get("Merchant", "").strip()
            amount_str = row.get("Amount", "0").replace("$", "").strip()
            category = row.get("Category", "General").strip()
            date_str = row.get("Date", "").strip()

            try:
                price = float(amount_str)
            except ValueError:
                price = 14.99

            merchant_lower = merchant.lower()
            matched_provider = "generic"
            display_name = merchant

            for key, (prov_code, prov_name, prov_cat) in cls.PROVIDER_MAP.items():
                if key in merchant_lower:
                    matched_provider = prov_code
                    display_name = prov_name
                    if not category or category == "General":
                        category = prov_cat
                    break

            vampire_score, _ = VampireScorer.evaluate(display_name, category, price, SubscriptionCycle.MONTHLY)

            sub = Subscription(
                id=f"sub_{uuid.uuid4().hex[:6]}",
                name=display_name,
                category=category,
                price=price,
                cycle=SubscriptionCycle.MONTHLY,
                renewal=date_str or "2026-07-01",
                status=SubscriptionStatus.ACTIVE,
                vampireScore=vampire_score,
                provider=matched_provider,
                providerSubscriptionId=(PROVIDERS[matched_provider]["subscription_id"]
                                        if matched_provider in PROVIDERS else None),
                mark=display_name[0].upper() if display_name else "S",
                tone=matched_provider if matched_provider != "generic" else "neutral",
            )
            parsed_subs.append(sub)

        total_monthly = sum(CostCalculator.get_monthly_cost(s.price, s.cycle) for s in parsed_subs)
        total_annual = round(total_monthly * 12.0, 2)
        vampire_count = sum(1 for s in parsed_subs if s.vampireScore >= 70)

        return StatementUploadResponse(
            totalIngested=len(parsed_subs),
            totalMonthlySpend=round(total_monthly, 2),
            totalAnnualWaste=total_annual,
            vampireCount=vampire_count,
            subscriptions=parsed_subs
        )
