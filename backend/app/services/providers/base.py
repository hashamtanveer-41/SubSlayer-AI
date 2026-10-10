from abc import ABC, abstractmethod
from typing import Dict, Any, Optional

class BaseProviderAdapter(ABC):
    """
    Abstract Base Class for Provider Demo API Adapters (OCP).
    Imitates external provider billing APIs (Netflix, Spotify, Canva, Adobe).
    Guarantees deterministic local execution without network dependencies.
    """

    @property
    @abstractmethod
    def provider_code(self) -> str:
        """Normalized code for provider, e.g. 'netflix', 'canva'."""
        pass

    @abstractmethod
    async def lookup_subscription(self, provider_sub_id: str) -> Dict[str, Any]:
        """Looks up demo subscription status from the provider simulator."""
        pass

    @abstractmethod
    async def request_cancellation(
        self,
        provider_sub_id: str,
        idempotency_key: str,
        context: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """
        Submits cancellation request to provider demo API.
        Must handle idempotency safely and return typed outcome.
        """
        pass

    @abstractmethod
    async def get_status(self, provider_request_id: str) -> Dict[str, Any]:
        """Polls status of a submitted cancellation request."""
        pass
