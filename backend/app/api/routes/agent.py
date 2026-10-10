from fastapi import APIRouter, Depends, HTTPException, status
from starlette.responses import StreamingResponse
from app.domain.models import CancelAgentRequest, CancelAgentResponse, CancellationTask
from app.api.deps import get_orchestrator
from app.services.cancellation_orchestrator import CancellationOrchestrator

router = APIRouter(prefix="/api/agent", tags=["Cancellation Agent"])

@router.post("/cancel", response_model=CancelAgentResponse, status_code=status.HTTP_202_ACCEPTED)
async def cancel_subscription(
    req: CancelAgentRequest,
    orchestrator: CancellationOrchestrator = Depends(get_orchestrator)
):
    try:
        return orchestrator.queue_cancellation(
            subscription_id=req.subscriptionId,
            provider=req.provider,
            confirmation=req.confirmation,
            idempotency_key=req.idempotencyKey
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/stream/{task_id}")
async def stream_agent_progress(
    task_id: str,
    orchestrator: CancellationOrchestrator = Depends(get_orchestrator)
):
    task = orchestrator.get_task(task_id)
    if not task:
        raise HTTPException(status_code=404, detail=f"Cancellation task '{task_id}' not found.")

    return StreamingResponse(
        orchestrator.stream_cancellation_task(task_id),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",
        }
    )

@router.get("/tasks/{task_id}", response_model=CancellationTask)
async def get_cancellation_task(
    task_id: str,
    orchestrator: CancellationOrchestrator = Depends(get_orchestrator)
):
    task = orchestrator.get_task(task_id)
    if not task:
        raise HTTPException(status_code=404, detail=f"Cancellation task '{task_id}' not found.")
    return task
