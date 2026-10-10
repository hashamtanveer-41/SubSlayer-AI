import json
import uuid
from datetime import datetime, timezone
from typing import AsyncGenerator, Dict, Optional
from app.domain.models import (
    Subscription,
    SubscriptionStatus,
    CancelAgentResponse,
    AgentCompletionEvent,
)
from app.services.agent.strategies import CancellationStrategyFactory
from app.services.finance.cost_calculator import CostCalculator

class AgentOrchestrator:
    """
    Coordinates agent cancellation tasks, streams real-time SSE events,
    and updates repository state.
    """

    def __init__(self, subscription_repo):
        self.subscription_repo = subscription_repo
        self.active_tasks: Dict[str, dict] = {}

    def queue_cancellation(self, subscription_id: str, target_service: Optional[str] = None) -> CancelAgentResponse:
        sub = self.subscription_repo.get_by_id(subscription_id)
        if not sub:
            raise ValueError(f"Subscription {subscription_id} not found.")

        task_id = f"task_cancel_{uuid.uuid4().hex[:8]}"
        self.active_tasks[task_id] = {
            "subscription_id": subscription_id,
            "target_service": target_service or sub.name,
            "status": "queued",
            "created_at": datetime.now(timezone.utc).isoformat(),
        }

        # Update status to pending
        sub.status = SubscriptionStatus.PENDING_CANCELLATION
        self.subscription_repo.update(sub)

        return CancelAgentResponse(
            taskId=task_id,
            status="queued",
            streamUrl=f"/api/agent/stream/{task_id}"
        )

    async def stream_cancellation_task(self, task_id: str) -> AsyncGenerator[str, None]:
        task_info = self.active_tasks.get(task_id)
        if not task_info:
            yield f"event: error\ndata: {json.dumps({'error': 'Task not found'})}\n\n"
            return

        sub_id = task_info["subscription_id"]
        sub = self.subscription_repo.get_by_id(sub_id)
        if not sub:
            yield f"event: error\ndata: {json.dumps({'error': 'Subscription not found'})}\n\n"
            return

        strategy = CancellationStrategyFactory.get_strategy(sub.name)
        annual_savings = CostCalculator.get_annual_cost(sub.price, sub.cycle)
        last_proof_url = None

        # Execute strategy steps
        async for step_event in strategy.run(sub, task_id):
            if step_event.screenshotUrl:
                last_proof_url = step_event.screenshotUrl

            payload = {
                "step": step_event.step,
                "total": step_event.total,
                "message": step_event.message,
                "timestamp": step_event.timestamp,
            }
            if step_event.screenshotUrl:
                payload["screenshotUrl"] = step_event.screenshotUrl

            yield f"event: agent_step\ndata: {json.dumps(payload)}\n\n"

        # Mark subscription as Cancelled
        proof_url = last_proof_url or f"/static/proofs/{task_id}.png"
        sub.status = SubscriptionStatus.CANCELLED
        sub.proofScreenshotUrl = proof_url
        sub.annualSavings = annual_savings
        self.subscription_repo.update(sub)

        completion = AgentCompletionEvent(
            status="success",
            subscriptionId=sub.id,
            message=f"{sub.name} subscription successfully cancelled by SubSlayer AI.",
            annualSavings=annual_savings,
            proofScreenshotUrl=proof_url,
            timestamp=datetime.now(timezone.utc).isoformat()
        )

        yield f"event: agent_completed\ndata: {completion.model_dump_json()}\n\n"
