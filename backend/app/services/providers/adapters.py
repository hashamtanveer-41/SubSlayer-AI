import uuid
import os
from datetime import datetime, timezone, timedelta
from typing import Dict, Any, Optional
from app.services.providers.base import BaseProviderAdapter
from app.demo_common import PROVIDERS
from app.services.providers.remote import RemoteProviderAdapter

class _InMemoryIdempotencyStore:
    def __init__(self):
        self._store: Dict[str, Dict[str, Any]] = {}

    def get(self, key: str) -> Optional[Dict[str, Any]]:
        return self._store.get(key)

    def set(self, key: str, value: Dict[str, Any]) -> None:
        self._store[key] = value

_idempotency_cache = _InMemoryIdempotencyStore()


class CanvaAdapter(BaseProviderAdapter):
    """Canva Demo API Adapter."""
    provider_code = "canva"

    async def lookup_subscription(self, provider_sub_id: str) -> Dict[str, Any]:
        return {
            "provider": self.provider_code,
            "providerSubscriptionId": provider_sub_id,
            "plan": "Canva Pro (Team / Individual)",
            "status": "active",
            "currentPeriodEnd": "2026-06-28",
        }

    async def request_cancellation(
        self,
        provider_sub_id: str,
        idempotency_key: str,
        context: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        cached = _idempotency_cache.get(idempotency_key)
        if cached:
            return cached

        req_id = f"demo_canva_req_{uuid.uuid4().hex[:6]}"
        effective_date = (datetime.now(timezone.utc) + timedelta(days=28)).strftime("%Y-%m-%d")
        
        result = {
            "status": "success",
            "provider": self.provider_code,
            "providerRequestId": req_id,
            "providerStatus": "cancellation_scheduled",
            "effectiveDate": effective_date,
            "message": "Cancellation scheduled by Canva demo API. Access remains active until period end.",
            "evidenceType": "provider_demo_api_response",
            "auditLog": {
                "endpoint": "https://api.canva.demo/v1/billing/subscriptions/cancel",
                "idempotencyKey": idempotency_key,
                "sanitizedPayload": {"subscriptionId": provider_sub_id, "reason": "user_cancelled"},
                "responseCode": 200,
                "timestamp": datetime.now(timezone.utc).isoformat()
            }
        }
        _idempotency_cache.set(idempotency_key, result)
        return result

    async def get_status(self, provider_request_id: str) -> Dict[str, Any]:
        return {
            "provider": self.provider_code,
            "providerRequestId": provider_request_id,
            "status": "cancellation_scheduled"
        }


class NetflixAdapter(BaseProviderAdapter):
    """Netflix Demo API Adapter."""
    provider_code = "netflix"

    async def lookup_subscription(self, provider_sub_id: str) -> Dict[str, Any]:
        return {
            "provider": self.provider_code,
            "providerSubscriptionId": provider_sub_id,
            "plan": "Standard (Ad-Free)",
            "status": "active",
            "currentPeriodEnd": "2026-06-24",
        }

    async def request_cancellation(
        self,
        provider_sub_id: str,
        idempotency_key: str,
        context: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        cached = _idempotency_cache.get(idempotency_key)
        if cached:
            return cached

        req_id = f"demo_netflix_req_{uuid.uuid4().hex[:6]}"
        effective_date = (datetime.now(timezone.utc) + timedelta(days=14)).strftime("%Y-%m-%d")
        
        result = {
            "status": "success",
            "provider": self.provider_code,
            "providerRequestId": req_id,
            "providerStatus": "cancellation_scheduled",
            "effectiveDate": effective_date,
            "message": "Netflix membership will not renew. Streaming access continues through current billing period.",
            "evidenceType": "provider_demo_api_response",
            "auditLog": {
                "endpoint": "https://api.netflix.demo/v2/memberships/cancel",
                "idempotencyKey": idempotency_key,
                "sanitizedPayload": {"subscriptionId": provider_sub_id},
                "responseCode": 200,
                "timestamp": datetime.now(timezone.utc).isoformat()
            }
        }
        _idempotency_cache.set(idempotency_key, result)
        return result

    async def get_status(self, provider_request_id: str) -> Dict[str, Any]:
        return {
            "provider": self.provider_code,
            "providerRequestId": provider_request_id,
            "status": "cancellation_scheduled"
        }


class SpotifyAdapter(BaseProviderAdapter):
    """Spotify Demo API Adapter."""
    provider_code = "spotify"

    async def lookup_subscription(self, provider_sub_id: str) -> Dict[str, Any]:
        return {
            "provider": self.provider_code,
            "providerSubscriptionId": provider_sub_id,
            "plan": "Spotify Premium Individual",
            "status": "active",
            "currentPeriodEnd": "2026-06-26",
        }

    async def request_cancellation(
        self,
        provider_sub_id: str,
        idempotency_key: str,
        context: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        cached = _idempotency_cache.get(idempotency_key)
        if cached:
            return cached

        req_id = f"demo_spotify_req_{uuid.uuid4().hex[:6]}"
        effective_date = (datetime.now(timezone.utc) + timedelta(days=16)).strftime("%Y-%m-%d")
        
        result = {
            "status": "success",
            "provider": self.provider_code,
            "providerRequestId": req_id,
            "providerStatus": "cancellation_scheduled",
            "effectiveDate": effective_date,
            "message": "Spotify Premium cancelled. Account will switch to Free tier at end of billing cycle.",
            "evidenceType": "provider_demo_api_response",
            "auditLog": {
                "endpoint": "https://api.spotify.demo/v1/me/subscription/cancel",
                "idempotencyKey": idempotency_key,
                "sanitizedPayload": {"subscriptionId": provider_sub_id},
                "responseCode": 200,
                "timestamp": datetime.now(timezone.utc).isoformat()
            }
        }
        _idempotency_cache.set(idempotency_key, result)
        return result

    async def get_status(self, provider_request_id: str) -> Dict[str, Any]:
        return {
            "provider": self.provider_code,
            "providerRequestId": provider_request_id,
            "status": "cancellation_scheduled"
        }


class AdobeAdapter(BaseProviderAdapter):
    """Adobe Demo API Adapter."""
    provider_code = "adobe"

    async def lookup_subscription(self, provider_sub_id: str) -> Dict[str, Any]:
        return {
            "provider": self.provider_code,
            "providerSubscriptionId": provider_sub_id,
            "plan": "Creative Cloud All Apps",
            "status": "active",
            "currentPeriodEnd": "2026-06-28",
        }

    async def request_cancellation(
        self,
        provider_sub_id: str,
        idempotency_key: str,
        context: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        cached = _idempotency_cache.get(idempotency_key)
        if cached:
            return cached

        req_id = f"demo_adobe_req_{uuid.uuid4().hex[:6]}"
        effective_date = (datetime.now(timezone.utc) + timedelta(days=18)).strftime("%Y-%m-%d")
        
        result = {
            "status": "success",
            "provider": self.provider_code,
            "providerRequestId": req_id,
            "providerStatus": "cancellation_scheduled",
            "effectiveDate": effective_date,
            "message": "Adobe Creative Cloud plan cancelled via demo API. Early termination fee waived by policy.",
            "evidenceType": "provider_demo_api_response",
            "auditLog": {
                "endpoint": "https://api.adobe.demo/v2/plans/cancel",
                "idempotencyKey": idempotency_key,
                "sanitizedPayload": {"subscriptionId": provider_sub_id, "waiveFees": True},
                "responseCode": 200,
                "timestamp": datetime.now(timezone.utc).isoformat()
            }
        }
        _idempotency_cache.set(idempotency_key, result)
        return result

    async def get_status(self, provider_request_id: str) -> Dict[str, Any]:
        return {
            "provider": self.provider_code,
            "providerRequestId": provider_request_id,
            "status": "cancellation_scheduled"
        }


class ProviderAdapterRegistry:
    """
    Factory & Registry for Provider Adapters (OCP).
    Enforces that only supported demo providers (netflix, spotify, canva, adobe) are executed.
    """
    _adapters: Dict[str, BaseProviderAdapter] = {
        "canva": CanvaAdapter(),
        "netflix": NetflixAdapter(),
        "spotify": SpotifyAdapter(),
        "adobe": AdobeAdapter(),
    }

    @classmethod
    def get_adapter(cls, provider: str) -> Optional[BaseProviderAdapter]:
        name = provider.lower().strip()
        if name not in PROVIDERS:
            return None
        if os.getenv("PROVIDER_MODE", "remote").lower() == "fixture":
            return cls._adapters[name]
        return RemoteProviderAdapter(name)

    @classmethod
    def is_supported(cls, provider: str) -> bool:
        return provider.lower().strip() in PROVIDERS
