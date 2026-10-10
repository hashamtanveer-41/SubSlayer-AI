from datetime import date, datetime
from enum import Enum
from typing import List, Optional
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


class Subscription(BaseModel):
    id: str
    name: str
    category: str
    price: float
    cycle: SubscriptionCycle = SubscriptionCycle.MONTHLY
    renewal: str
    status: SubscriptionStatus = SubscriptionStatus.ACTIVE
    vampireScore: int = Field(default=50, ge=0, le=100)
    cancellableViaAI: bool = True
    proofScreenshotUrl: Optional[str] = None
    mark: Optional[str] = None
    tone: Optional[str] = None
    annualSavings: Optional[float] = None


class CreateSubscriptionRequest(BaseModel):
    name: str
    category: str
    price: float
    cycle: SubscriptionCycle = SubscriptionCycle.MONTHLY
    renewal: str


class CardStatus(str, Enum):
    ACTIVE = "Active"
    LOCKED = "Locked"
    BURNED = "Burned"


class VirtualCard(BaseModel):
    id: str
    merchant: str
    cardNumberMasked: str
    exp: str
    cvv: str
    spendingLimit: float
    balanceLocked: bool = False  # True means $0.00 balance shield is active
    status: CardStatus = CardStatus.ACTIVE


class ToggleCardLockRequest(BaseModel):
    cardId: str


class SimulateChargeRequest(BaseModel):
    cardId: str
    amount: float
    merchant: str


class SimulateChargeResponse(BaseModel):
    success: bool
    status: str  # "APPROVED" | "DECLINED"
    reason: str
    amountBlocked: float
    bankAccountImpact: float
    timestamp: str


class CancelAgentRequest(BaseModel):
    subscriptionId: str
    targetService: Optional[str] = "canva"


class CancelAgentResponse(BaseModel):
    taskId: str
    status: str = "queued"
    streamUrl: str


class AgentStepEvent(BaseModel):
    step: int
    total: int = 4
    message: str
    timestamp: str
    screenshotUrl: Optional[str] = None


class AgentCompletionEvent(BaseModel):
    status: str = "success"
    subscriptionId: str
    message: str
    annualSavings: float
    proofScreenshotUrl: str
    timestamp: str
