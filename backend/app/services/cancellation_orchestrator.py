import asyncio
import json
import uuid
from datetime import datetime, timezone
from typing import AsyncGenerator, Optional
from app.domain.models import (
    Subscription,
    SubscriptionStatus,
    CancelAgentResponse,
    AgentStepEvent,
    AgentCompletedEvent,
    CancellationTask,
)
from app.services.providers.adapters import ProviderAdapterRegistry
from app.services.finance.cost_calculator import CostCalculator

class CancellationOrchestrator:
    """
    Coordinates provider API demo cancellation execution, streams SSE events,
    and supports task recovery if SSE disconnects.
    """

    def __init__(self, repository):
        self.repo = repository

    def queue_cancellation(
        self,
        subscription_id: str,
        provider: str,
        confirmation: bool,
        idempotency_key: str
    ) -> CancelAgentResponse:
        if not confirmation:
            raise ValueError("User confirmation required to submit cancellation.")

        sub = self.repo.get_by_id(subscription_id)
        if not sub:
            raise ValueError(f"Subscription '{subscription_id}' not found.")

        normalized_provider = provider.lower().strip()
        if not ProviderAdapterRegistry.is_supported(normalized_provider):
            raise ValueError(f"Provider '{provider}' is not supported. Supported demo providers: netflix, spotify, canva, adobe.")

        task_id = f"task_cancel_{uuid.uuid4().hex[:8]}"
        now_iso = datetime.now(timezone.utc).isoformat()

        task = CancellationTask(
            taskId=task_id,
            subscriptionId=subscription_id,
            provider=normalized_provider,
            status="queued",
            steps=[],
            result=None,
            createdAt=now_iso,
            updatedAt=now_iso,
        )
        self.repo.save_task(task)

        # Mark subscription pending
        sub.status = SubscriptionStatus.PENDING_CANCELLATION
        sub.latestCancellationTaskId = task_id
        self.repo.update(sub)

        return CancelAgentResponse(
            taskId=task_id,
            status="queued",
            streamUrl=f"/api/agent/stream/{task_id}"
        )

    def get_task(self, task_id: str) -> Optional[CancellationTask]:
        return self.repo.get_task(task_id)

    async def stream_cancellation_task(self, task_id: str) -> AsyncGenerator[str, None]:
        task = self.repo.get_task(task_id)
        if not task:
            yield f"event: error\ndata: {json.dumps({'error': 'Task not found'})}\n\n"
            return

        sub = self.repo.get_by_id(task.subscriptionId)
        if not sub:
            yield f"event: error\ndata: {json.dumps({'error': 'Subscription not found'})}\n\n"
            return

        adapter = ProviderAdapterRegistry.get_adapter(task.provider)
        if not adapter:
            yield f"event: error\ndata: {json.dumps({'error': 'unsupported_provider'})}\n\n"
            return

        now_time = lambda: datetime.now(timezone.utc).strftime("%H:%M:%S")
        task.status = "in_progress"

        # Step 1: Validate subscription and provider demo integration
        await asyncio.sleep(0.8)
        step1 = AgentStepEvent(
            step=1,
            total=4,
            message=f"Validated subscription '{sub.name}' and provider demo adapter for {task.provider.title()}",
            timestamp=now_time()
        )
        task.steps.append(step1)
        self.repo.save_task(task)
        yield f"event: agent_step\ndata: {step1.model_dump_json()}\n\n"

        # Step 2: Send cancellation request to provider demo API
        await asyncio.sleep(1.0)
        step2 = AgentStepEvent(
            step=2,
            total=4,
            message=f"Sent cancellation request to {task.provider.title()} demo API with idempotency protection",
            timestamp=now_time()
        )
        task.steps.append(step2)
        self.repo.save_task(task)
        yield f"event: agent_step\ndata: {step2.model_dump_json()}\n\n"

        # Call provider adapter
        idempotency_key = f"cancel-{sub.id}-{task_id}"
        provider_resp = await adapter.request_cancellation(
            provider_sub_id=sub.providerSubscriptionId or f"demo_{task.provider}_{sub.id}",
            idempotency_key=idempotency_key,
            context={"subscription": sub.model_dump()}
        )

        # Step 3: Received provider response
        await asyncio.sleep(1.0)
        provider_status = provider_resp.get("providerStatus", "cancellation_scheduled")
        effective_date = provider_resp.get("effectiveDate", sub.renewal)
        step3 = AgentStepEvent(
            step=3,
            total=4,
            message=f"Received provider response: {provider_status.replace('_', ' ')} (Effective: {effective_date})",
            timestamp=now_time()
        )
        task.steps.append(step3)
        self.repo.save_task(task)
        yield f"event: agent_step\ndata: {step3.model_dump_json()}\n\n"

        # Step 4 / Completion
        await asyncio.sleep(0.8)
        annual_savings = CostCalculator.get_annual_cost(sub.price, sub.cycle)
        completed_event = AgentCompletedEvent(
            status="success",
            subscriptionId=sub.id,
            provider=task.provider,
            providerRequestId=provider_resp.get("providerRequestId", f"demo_req_{uuid.uuid4().hex[:6]}"),
            providerStatus=provider_status,
            effectiveDate=effective_date,
            message=provider_resp.get("message", f"Cancellation scheduled by {task.provider.title()} demo API"),
            projectedAnnualSavings=annual_savings,
            evidenceType="provider_demo_api_response"
        )

        task.status = "success"
        task.result = completed_event
        task.updatedAt = datetime.now(timezone.utc).isoformat()
        self.repo.save_task(task)

        # Update subscription state
        sub.status = SubscriptionStatus.CANCELLED
        sub.projectedAnnualSavings = annual_savings
        self.repo.update(sub)

        yield f"event: agent_completed\ndata: {completed_event.model_dump_json()}\n\n"
