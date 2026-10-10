"""Gateway handoff checks without real network or payment side effects."""

import os
import tempfile
import unittest
from unittest.mock import patch

import httpx
from fastapi.testclient import TestClient

from app.main import app
from app import provider_server
from app.api.deps import get_orchestrator, get_subscription_repo, get_stripe_service
from app.services.cancellation_orchestrator import CancellationOrchestrator
from app.services.payments.stripe_service import StripePaymentShieldService
from app.services.repository import SubscriptionRepository


class GatewayIntegrationTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.env = patch.dict(os.environ, {
            "DEMO_SERVICE_TOKEN": "gateway-test-token", "STRIPE_SECRET_KEY": "sk_test_fake",
            "QWEN_API_KEY": "test-qwen-key", "PROVIDER_MODE": "remote", "PROVIDER_NAME": "canva",
            "CANVA_API_URL": "http://canva.local", "HUB_DB_PATH": os.path.join(self.temp.name, "hub.sqlite3"),
            "PROVIDER_DB_PATH": os.path.join(self.temp.name, "canva.sqlite3"),
            "DEMO_WALLET_START_CENTS": "10000",
        })
        self.env.start()
        repo = SubscriptionRepository()
        app.dependency_overrides[get_subscription_repo] = lambda: repo
        app.dependency_overrides[get_orchestrator] = lambda: CancellationOrchestrator(repo)
        app.dependency_overrides[get_stripe_service] = StripePaymentShieldService
        self.client = TestClient(app)

    def tearDown(self):
        app.dependency_overrides.clear()
        self.env.stop()
        self.temp.cleanup()

    def test_gateway_calls_provider_and_preserves_cancelled_status(self):
        provider_client = TestClient(provider_server.app)
        real_async_client = httpx.AsyncClient

        def provider_transport(**kwargs):
            return real_async_client(transport=httpx.ASGITransport(app=provider_server.app), **kwargs)

        async def no_delay(_):
            return None

        with patch("app.services.providers.remote.httpx.AsyncClient", side_effect=provider_transport), \
             patch("app.services.cancellation_orchestrator.asyncio.sleep", side_effect=no_delay):
            queued = self.client.post("/api/agent/cancel", json={
                "subscriptionId": "sub_02", "provider": "canva", "confirmation": True,
                "idempotencyKey": "gateway-canva-cancel-001"})
            self.assertEqual(queued.status_code, 202)
            task_id = queued.json()["taskId"]
            duplicate = self.client.post("/api/agent/cancel", json={
                "subscriptionId": "sub_02", "provider": "canva", "confirmation": True,
                "idempotencyKey": "gateway-canva-cancel-001"})
            self.assertEqual(duplicate.json()["taskId"], task_id)
            stream = self.client.get(f"/api/agent/stream/{task_id}")
            refreshed = self.client.get("/api/subscriptions?refresh=true")
        self.assertEqual(stream.status_code, 200)
        self.assertIn("event: agent_completed", stream.text)
        self.assertEqual(refreshed.status_code, 200)
        live_sub = next(row for row in refreshed.json() if row["id"] == "sub_02")
        self.assertEqual(live_sub["status"], "Cancelled")
        self.assertTrue(live_sub["providerRequestId"])
        sub = next(row for row in self.client.get("/api/subscriptions").json() if row["id"] == "sub_02")
        self.assertEqual(sub["status"], "Cancelled")
        self.assertEqual(provider_client.get("/v1/subscriptions/canva-demo-001",
                                             headers={"Authorization": "Bearer gateway-test-token"}).json()["status"], "cancelled")

    def test_gateway_card_charge_uses_same_wallet(self):
        stripe_response = httpx.Response(200, json={"id": "pi_gateway_test", "status": "succeeded"},
                                         request=httpx.Request("POST", "https://api.stripe.com/v1/payment_intents"))
        with patch("httpx.post", return_value=stripe_response) as stripe_post:
            payload = {"cardId": "card_02", "amount": 59.99, "merchant": "Adobe Creative Cloud",
                       "idempotencyKey": "gateway-adobe-charge-001"}
            first = self.client.post("/api/cards/simulate-charge", json=payload)
            second = self.client.post("/api/cards/simulate-charge", json=payload)
        self.assertEqual(first.status_code, 200)
        self.assertTrue(first.json()["success"])
        self.assertEqual(second.json()["stripePaymentIntentId"], "pi_gateway_test")
        self.assertEqual(stripe_post.call_count, 1)
        wallet = self.client.get("/api/demo-wallet")
        self.assertEqual(wallet.json()["balance_cents"], 4001)
        self.assertEqual(self.client.get("/demo/health").status_code, 200)

    def test_gateway_exposes_qwen_analysis_without_exposing_key(self):
        qwen_response = httpx.Response(200, json={
            "model": "qwen3.8-flash", "choices": [{"message": {"content": '{"risk_score": 42}'}}]},
            request=httpx.Request("POST", "https://maas.qwencloudapi.com/compatible-mode/v1/chat/completions"))
        with patch("httpx.post", return_value=qwen_response) as qwen_post:
            response = self.client.post("/api/ai/analyze", json={
                "provider": "canva", "monthly_cost_cents": 1499, "category": "design"})
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()["model"], "qwen3.8-flash")
        self.assertNotIn("test-qwen-key", response.text)
        self.assertEqual(qwen_post.call_args.kwargs["json"]["model"], "qwen3.8-flash")

    def test_unavailable_provider_does_not_claim_cancellation(self):
        async def no_delay(_):
            return None

        with patch("app.services.providers.remote.httpx.AsyncClient", side_effect=httpx.ConnectError("offline")), \
             patch("app.services.cancellation_orchestrator.asyncio.sleep", side_effect=no_delay):
            queued = self.client.post("/api/agent/cancel", json={
                "subscriptionId": "sub_02", "provider": "canva", "confirmation": True,
                "idempotencyKey": "gateway-canva-offline-001"})
            task_id = queued.json()["taskId"]
            stream = self.client.get(f"/api/agent/stream/{task_id}")
        self.assertIn("event: error", stream.text)
        self.assertNotIn("agent_completed", stream.text)
        self.assertEqual(self.client.get(f"/api/agent/tasks/{task_id}").json()["status"], "failed")
        sub = next(row for row in self.client.get("/api/subscriptions").json() if row["id"] == "sub_02")
        self.assertEqual(sub["status"], "Active")


if __name__ == "__main__":
    unittest.main()
