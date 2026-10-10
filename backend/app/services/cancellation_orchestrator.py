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
from app.services.providers.remote import ProviderUnavailable
from app.services.finance.cost_calculator import CostCalculator

class CancellationOrchestrator:
    """
    Coordinates provider API demo cancellation execution, streams SSE events,
    and supports task recovery if SSE disconnects.
    """

    def __init__(self, repository):
        self.repo = repository
        self._running_tasks: dict[str, asyncio.Task] = {}

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
        if sub.provider != normalized_provider:
            raise ValueError("Subscription does not belong to the requested provider")
        if not sub.providerSubscriptionId:
            raise ValueError("Subscription has no provider demo ID")
        if len(idempotency_key) < 8:
            raise ValueError("Idempotency key must contain at least 8 characters")
        existing = self.repo.get_task_by_idempotency_key(idempotency_key)
        if existing:
            if existing.subscriptionId != subscription_id or existing.provider != normalized_provider:
                raise ValueError("Idempotency key was used for another cancellation")
            return CancelAgentResponse(taskId=existing.taskId, status=existing.status,
                                       streamUrl=f"/api/agent/stream/{existing.taskId}")

        task_id = f"task_cancel_{uuid.uuid4().hex[:8]}"
        now_iso = datetime.now(timezone.utc).isoformat()

        task = CancellationTask(
            taskId=task_id,
            subscriptionId=subscription_id,
            provider=normalized_provider,
            idempotencyKey=idempotency_key,
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
        if task.result is not None:
            yield f"event: agent_completed\ndata: {task.result.model_dump_json()}\n\n"
            return
        if task.status == "failed":
            yield f"event: error\ndata: {json.dumps({'error': task.errorMessage or 'Provider request failed'})}\n\n"
            return

        worker = self._running_tasks.get(task_id)
        if worker is None:
            worker = asyncio.create_task(self._drive_task(task_id))
            self._running_tasks[task_id] = worker

        sent_steps = 0
        while True:
            current = self.repo.get_task(task_id)
            if current is None:
                yield f"event: error\ndata: {json.dumps({'error': 'Task not found'})}\n\n"
                return
            while sent_steps < len(current.steps):
                step = current.steps[sent_steps]
                sent_steps += 1
                yield f"event: agent_step\ndata: {step.model_dump_json()}\n\n"
            if current.result is not None:
                yield f"event: agent_completed\ndata: {current.result.model_dump_json()}\n\n"
                return
            if current.status == "failed":
                yield f"event: error\ndata: {json.dumps({'error': current.errorMessage or 'Provider request failed', 'taskId': task_id})}\n\n"
                return
            await asyncio.wait({worker}, timeout=0.1)

    async def _drive_task(self, task_id: str) -> None:
        try:
            async for _ in self._execute_cancellation_task(task_id):
                pass
        except Exception:
            task = self.repo.get_task(task_id)
            if task and task.result is None:
                task.status = "failed"
                task.errorMessage = "Agent execution failed before provider confirmation"
                task.updatedAt = datetime.now(timezone.utc).isoformat()
                self.repo.save_task(task)
        finally:
            task = self.repo.get_task(task_id)
            if task and task.result is None and task.status != "failed":
                task.status = "failed"
                task.errorMessage = "Provider request stopped without a result"
                task.updatedAt = datetime.now(timezone.utc).isoformat()
                self.repo.save_task(task)

    async def _execute_cancellation_task(self, task_id: str) -> AsyncGenerator[str, None]:
        task = self.repo.get_task(task_id)
        if not task:
            yield f"event: error\ndata: {json.dumps({'error': 'Task not found'})}\n\n"
            return
        if task.result is not None:
            yield f"event: agent_completed\ndata: {task.result.model_dump_json()}\n\n"
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
        try:
            provider_resp = await adapter.request_cancellation(
                provider_sub_id=sub.providerSubscriptionId,
                idempotency_key=task.idempotencyKey,
                context={"subscription": sub.model_dump()}
            )
        except ProviderUnavailable as exc:
            task.status = "failed"
            task.errorMessage = str(exc)
            task.updatedAt = datetime.now(timezone.utc).isoformat()
            self.repo.save_task(task)
            sub.status = SubscriptionStatus.ACTIVE
            self.repo.update(sub)
            yield f"event: error\ndata: {json.dumps({'error': str(exc), 'taskId': task_id})}\n\n"
            return

        # Step 3: Received provider response
        await asyncio.sleep(1.0)
        provider_status = provider_resp.get("providerStatus", "cancellation_scheduled")
        effective_date = provider_resp.get("effectiveDate")
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
            status="pending" if provider_status in ("pending", "cancellation_scheduled") else "success",
            subscriptionId=sub.id,
            provider=task.provider,
            providerRequestId=provider_resp.get("providerRequestId", f"demo_req_{uuid.uuid4().hex[:6]}"),
            providerStatus=provider_status,
            effectiveDate=effective_date,
            message=provider_resp.get("message", f"Cancellation scheduled by {task.provider.title()} demo API"),
            projectedAnnualSavings=annual_savings,
            evidenceType="provider_demo_api_response"
        )

        task.status = completed_event.status
        task.result = completed_event
        task.updatedAt = datetime.now(timezone.utc).isoformat()
        self.repo.save_task(task)

        # Update subscription state
        sub.status = (SubscriptionStatus.CANCELLED if provider_status == "cancelled"
                      else SubscriptionStatus.PENDING_CANCELLATION)
        sub.projectedAnnualSavings = annual_savings
        sub.providerRequestId = completed_event.providerRequestId
        sub.cancellationEffectiveDate = completed_event.effectiveDate
        self.repo.update(sub)

        yield f"event: agent_completed\ndata: {completed_event.model_dump_json()}\n\n"
