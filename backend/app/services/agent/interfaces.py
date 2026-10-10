from abc import ABC, abstractmethod
from typing import AsyncGenerator, Dict, Any
from app.domain.models import Subscription, AgentStepEvent

class BaseBrowserDriver(ABC):
    """Abstract browser driver interface (OCP). Allows Playwright, Selenium, or Mock drivers."""
    @abstractmethod
    async def initialize(self) -> None:
        pass

    @abstractmethod
    async def inject_cookies(self, cookies: Dict[str, Any]) -> None:
        pass

    @abstractmethod
    async def navigate_to_billing(self, url: str) -> None:
        pass

    @abstractmethod
    async def close(self) -> None:
        pass


class BaseDarkPatternBypasser(ABC):
    """Abstract dark pattern solver (OCP). Evaluates retention traps and selects refusal actions."""
    @abstractmethod
    async def evaluate_and_bypass(self, step_context: Dict[str, Any]) -> str:
        pass


class BaseCancellationAgent(ABC):
    """
    Open-Closed Principle: Open for new service strategies (Canva, Adobe, Netflix),
    Closed for modification in the orchestrator pipeline.
    """
    @abstractmethod
    async def run(self, subscription: Subscription, task_id: str) -> AsyncGenerator[AgentStepEvent, None]:
        pass
