"""Hasham gateway adapter for Asfand's device-hosted demo APIs."""

import os
from typing import Any, Optional
from urllib.parse import quote

import httpx

from app.demo_common import PROVIDERS, token_headers
from app.services.providers.base import BaseProviderAdapter


class ProviderUnavailable(Exception):
    pass


class RemoteProviderAdapter(BaseProviderAdapter):
    def __init__(self, name: str):
        if name not in PROVIDERS:
            raise ValueError(f"Unsupported demo provider: {name}")
        self._name = name

    @property
    def provider_code(self) -> str:
        return self._name

    async def _request(self, method: str, path: str, payload: dict | None = None) -> dict:
        base = os.getenv(f"{self._name.upper()}_API_URL", "").rstrip("/")
        if not base.startswith(("http://", "https://")):
            raise ProviderUnavailable(f"{self._name} demo API URL is not configured")
        try:
            async with httpx.AsyncClient(timeout=15) as client:
                response = await client.request(method, f"{base}{path}", headers=token_headers(), json=payload)
            if response.status_code >= 400:
                raise ProviderUnavailable(f"{self._name} demo API returned HTTP {response.status_code}")
            return response.json()
        except (httpx.HTTPError, ValueError, RuntimeError) as exc:
            raise ProviderUnavailable(f"{self._name} demo API unavailable") from exc

    async def lookup_subscription(self, provider_sub_id: str) -> dict[str, Any]:
        data = await self._request("GET", f"/v1/subscriptions/{quote(provider_sub_id, safe='')}")
        return {"provider": self._name, "providerSubscriptionId": data["subscription_id"],
                "status": data["status"], "currentPeriodEnd": data.get("effective_at")}

    async def request_cancellation(self, provider_sub_id: str, idempotency_key: str,
                                   context: Optional[dict[str, Any]] = None) -> dict[str, Any]:
        data = await self._request("POST", f"/v1/subscriptions/{quote(provider_sub_id, safe='')}/cancel",
                                   {"idempotency_key": idempotency_key, "confirmed": True})
        status = data["status"]
        return {"status": "pending" if status == "pending" else "success",
                "provider": self._name, "providerRequestId": data["provider_request_id"],
                "providerStatus": {"scheduled": "cancellation_scheduled", "cancelled": "cancelled",
                                   "pending": "pending"}.get(status, status),
                "effectiveDate": data["effective_at"][:10] if data.get("effective_at") else None,
                "message": f"{self._name.title()} demo API returned {status}",
                "evidenceType": "provider_demo_api_response"}

    async def get_status(self, provider_request_id: str) -> dict[str, Any]:
        data = await self._request("GET", f"/v1/requests/{quote(provider_request_id, safe='')}")
        return {"provider": self._name, "providerRequestId": provider_request_id, "status": data["status"]}
