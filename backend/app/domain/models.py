from datetime import datetime, timezone
from enum import Enum
from typing import List, Optional, Literal
from pydantic import BaseModel, Field


class SubscriptionCycle(str, Enum):
    DAILY = "Daily"
    WEEKLY = "Weekly"
    MONTHLY = "Monthly"
    YEARLY = "Yearly"


class SubscriptionStatus(str, Enum):
    ACTIVE = "Active"
    CANCELLED = "Cancelled"
    PENDING_CANCELLATION = "Pending Cancellation"


class SupportedProvider(str, Enum):
    NETFLIX = "netflix"
    SPOTIFY = "spotify"
    CANVA = "canva"
    ADOBE = "adobe"


class Subscription(BaseModel):
    id: str
    name: str
    category: str
    price: float
    cycle: SubscriptionCycle = SubscriptionCycle.MONTHLY
    renewal: str
    status: SubscriptionStatus = SubscriptionStatus.ACTIVE
    vampireScore: int = Field(default=50, ge=0, le=100)
    provider: str = "generic"
    providerSubscriptionId: Optional[str] = None
    latestCancellationTaskId: Optional[str] = None
    mark: Optional[str] = None
    tone: Optional[str] = None
    projectedAnnualSavings: Optional[float] = None


class CreateSubscriptionRequest(BaseModel):
    provider: str
    name: str
    category: str
    price: float
    cycle: SubscriptionCycle = SubscriptionCycle.MONTHLY
    renewal: str


class CancelAgentRequest(BaseModel):
    subscriptionId: str
    provider: str
    confirmation: bool = True
    idempotencyKey: str


class CancelAgentResponse(BaseModel):
    taskId: str
    status: str = "queued"
    streamUrl: str


class AgentStepEvent(BaseModel):
    step: int
    total: int = 4
    message: str
    timestamp: str


class AgentCompletedEvent(BaseModel):
    status: str  # "success" | "pending" | "already_cancelled" | "rejected" | "failed"
    subscriptionId: str
    provider: str
    providerRequestId: str
    providerStatus: str
    effectiveDate: Optional[str] = None
    message: str
    projectedAnnualSavings: float
    evidenceType: str = "provider_demo_api_response"


class CancellationTask(BaseModel):
    taskId: str
    subscriptionId: str
    provider: str
    status: str = "queued"
    steps: List[AgentStepEvent] = []
    result: Optional[AgentCompletedEvent] = None
    createdAt: str
    updatedAt: str


class VirtualCard(BaseModel):
    id: str
    label: str
    stripeCustomerId: str
    paymentMethodId: str
    cardBrand: str
    last4: str
    testMode: bool = True
    spendingLimit: float
    demoPolicyLocked: bool = False
    status: str = "active"  # "active" | "locked"


class ToggleCardLockRequest(BaseModel):
    cardId: str
    locked: bool


class SimulateChargeRequest(BaseModel):
    cardId: str
    amount: float
    merchant: str
    idempotencyKey: str


class SimulateChargeResponse(BaseModel):
    success: bool
    status: str  # "APPROVED" | "DECLINED"
    reason: str
    outcomeType: Literal["blocked_by_demo_policy", "succeeded", "declined_by_stripe"]
    stripePaymentIntentId: Optional[str] = None
    testMode: bool = True
    amountBlocked: float
    timestamp: str


class StatementUploadResponse(BaseModel):
    totalIngested: int
    totalMonthlySpend: float
    totalAnnualWaste: float
    vampireCount: int
    subscriptions: List[Subscription]
