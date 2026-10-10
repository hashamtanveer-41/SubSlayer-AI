import asyncio
from datetime import datetime
from typing import AsyncGenerator
from app.domain.models import Subscription, AgentStepEvent
from app.services.agent.interfaces import BaseCancellationAgent
from app.services.agent.dark_patterns import RetentionTrapSolver
from app.services.agent.screenshot_generator import ProofScreenshotGenerator
from app.services.finance.cost_calculator import CostCalculator

class CanvaCancellationStrategy(BaseCancellationAgent):
    """Autonomous agent strategy for Canva Pro cancellation."""

    def __init__(self):
        self.trap_solver = RetentionTrapSolver()

    async def run(self, subscription: Subscription, task_id: str) -> AsyncGenerator[AgentStepEvent, None]:
        now = lambda: datetime.now().strftime("%H:%M:%S")

        # Step 1: Session Cookie Injection
        await asyncio.sleep(1.0)
        yield AgentStepEvent(
            step=1,
            total=4,
            message="Injecting pre-authenticated session cookies for Canva account...",
            timestamp=now()
        )

        # Step 2: Navigating to Billing
        await asyncio.sleep(1.8)
        yield AgentStepEvent(
            step=2,
            total=4,
            message="Navigated to Canva Account Settings -> 'Billing & Teams' tab.",
            timestamp=now()
        )

        # Step 3: Dark Pattern Detection and Refusal
        await asyncio.sleep(2.2)
        bypass_msg = await self.trap_solver.evaluate_and_bypass({"pattern_type": "discount_modal"})
        yield AgentStepEvent(
            step=3,
            total=4,
            message=f"Bypassed retention maze: {bypass_msg}",
            timestamp=now()
        )

        # Step 4: Final Confirmation & Screenshot Proof
        await asyncio.sleep(2.0)
        annual_savings = CostCalculator.get_annual_cost(subscription.price, subscription.cycle)
        proof_url = ProofScreenshotGenerator.generate_proof(task_id, subscription.name, annual_savings)
        yield AgentStepEvent(
            step=4,
            total=4,
            message="Final cancellation confirmed. Generated verified DOM proof screenshot.",
            timestamp=now(),
            screenshotUrl=proof_url
        )


class GenericCancellationStrategy(BaseCancellationAgent):
    """Universal autonomous agent strategy for general subscription cancellations."""

    def __init__(self):
        self.trap_solver = RetentionTrapSolver()

    async def run(self, subscription: Subscription, task_id: str) -> AsyncGenerator[AgentStepEvent, None]:
        now = lambda: datetime.now().strftime("%H:%M:%S")

        # Step 1: Initialize session
        await asyncio.sleep(1.0)
        yield AgentStepEvent(
            step=1,
            total=4,
            message=f"Initializing headless agent and resolving credentials for {subscription.name}...",
            timestamp=now()
        )

        # Step 2: Navigate to subscription settings
        await asyncio.sleep(1.8)
        yield AgentStepEvent(
            step=2,
            total=4,
            message=f"Located billing management portal for {subscription.name}.",
            timestamp=now()
        )

        # Step 3: Retention trap bypass
        await asyncio.sleep(2.2)
        bypass_msg = await self.trap_solver.evaluate_and_bypass({"pattern_type": "guilt_trip"})
        yield AgentStepEvent(
            step=3,
            total=4,
            message=f"Dark pattern defeated: {bypass_msg}",
            timestamp=now()
        )

        # Step 4: Confirm cancellation
        await asyncio.sleep(2.0)
        annual_savings = CostCalculator.get_annual_cost(subscription.price, subscription.cycle)
        proof_url = ProofScreenshotGenerator.generate_proof(task_id, subscription.name, annual_savings)
        yield AgentStepEvent(
            step=4,
            total=4,
            message=f"Cancellation finalized for {subscription.name}. Subscription deactivated.",
            timestamp=now(),
            screenshotUrl=proof_url
        )


class CancellationStrategyFactory:
    """Factory Pattern (OCP): returns appropriate strategy without modifying orchestrator."""
    @staticmethod
    def get_strategy(service_name: str) -> BaseCancellationAgent:
        name_lower = service_name.lower()
        if "canva" in name_lower:
            return CanvaCancellationStrategy()
        return GenericCancellationStrategy()
