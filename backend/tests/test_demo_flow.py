"""End-to-end contract checks with local ASGI clients and mocked external Stripe."""

import os
import tempfile
import unittest
from unittest.mock import patch

import httpx
from fastapi.testclient import TestClient

from app import demo_hub, provider_server
from app.demo_common import PROVIDERS


class DemoFlowTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.env = patch.dict(os.environ, {
            "DEMO_SERVICE_TOKEN": "test-shared-token", "STRIPE_SECRET_KEY": "sk_test_fake",
            "HUB_DB_PATH": os.path.join(self.temp.name, "hub.sqlite3"),
            "PROVIDER_DB_PATH": os.path.join(self.temp.name, "provider.sqlite3"),
            "HUB_API_URL": "http://hub.local", "NETFLIX_API_URL": "http://netflix.local",
            "SPOTIFY_API_URL": "http://spotify.local", "CANVA_API_URL": "http://canva.local",
            "ADOBE_API_URL": "http://adobe.local", "DEMO_WALLET_START_CENTS": "10000",
        })
        self.env.start()
        self.hub = TestClient(demo_hub.app)
        self.provider = TestClient(provider_server.app)
        self.headers = {"Authorization": "Bearer test-shared-token"}

    def tearDown(self):
        self.env.stop()
        self.temp.cleanup()

    def test_four_provider_cancel_contracts_and_retries(self):
        for name, expected in (("netflix", "scheduled"), ("spotify", "scheduled"),
                               ("canva", "cancelled"), ("adobe", "pending")):
            with self.subTest(name=name):
                os.environ["PROVIDER_NAME"] = name
                os.environ["PROVIDER_DB_PATH"] = os.path.join(self.temp.name, f"{name}.sqlite3")
                sub_id = PROVIDERS[name]["subscription_id"]
                url = f"/v1/subscriptions/{sub_id}/cancel"
                payload = {"idempotency_key": f"cancel-{name}-0001", "confirmed": True}
                self.assertEqual(self.provider.get(f"/v1/subscriptions/{sub_id}", headers=self.headers).json()["status"], "active")
                first = self.provider.post(url, headers=self.headers, json=payload)
                self.assertEqual(first.status_code, 200)
                self.assertEqual(first.json()["status"], expected)
                self.assertEqual(self.provider.post(url, headers=self.headers, json=payload).json(), first.json())
                self.assertEqual(self.provider.get(f"/v1/subscriptions/{sub_id}", headers=self.headers).json()["status"], expected)

    def test_remote_charge_stripe_and_wallet_idempotency(self):
        os.environ["PROVIDER_NAME"] = "netflix"
        sub_id = PROVIDERS["netflix"]["subscription_id"]
        stripe_calls = []

        def fake_post(url, **kwargs):
            if url == "http://hub.local/internal/billing/charge":
                reply = self.hub.post("/internal/billing/charge", headers=kwargs["headers"], json=kwargs["json"])
                return httpx.Response(reply.status_code, json=reply.json(), request=httpx.Request("POST", url))
            if url == "https://api.stripe.com/v1/payment_intents":
                stripe_calls.append(kwargs)
                return httpx.Response(200, json={"id": "pi_test_001", "status": "succeeded"},
                                      request=httpx.Request("POST", url))
            raise AssertionError(url)

        def fake_request(method, url, **kwargs):
            self.assertEqual(url, f"http://netflix.local/v1/subscriptions/{sub_id}/charge")
            reply = self.provider.post(f"/v1/subscriptions/{sub_id}/charge", headers=kwargs["headers"], json=kwargs["json"])
            return httpx.Response(reply.status_code, json=reply.json(), request=httpx.Request(method, url))

        with patch("httpx.post", side_effect=fake_post), patch("httpx.request", side_effect=fake_request):
            url = f"/api/providers/netflix/subscriptions/{sub_id}/charge"
            payload = {"idempotency_key": "charge-netflix-0001"}
            self.assertEqual(self.hub.post(url, json=payload).status_code, 401)
            first = self.hub.post(url, headers=self.headers, json=payload)
            second = self.hub.post(url, headers=self.headers, json=payload)
        self.assertEqual(first.status_code, 200)
        self.assertEqual(second.status_code, 200)
        self.assertEqual(first.json()["billing"]["stripe_intent_id"], "pi_test_001")
        self.assertEqual(len(stripe_calls), 1)
        self.assertEqual(self.hub.get("/api/demo-wallet", headers=self.headers).json()["balance_cents"], 8401)

    def test_decline_restores_wallet_and_qwen_uses_requested_model(self):
        declined = httpx.Response(402, json={"error": {"message": "declined"}},
                                  request=httpx.Request("POST", "https://api.stripe.com/v1/payment_intents"))
        with patch("httpx.post", return_value=declined):
            reply = self.hub.post("/internal/billing/charge", headers=self.headers, json={
                "provider": "canva", "subscription_id": "canva-demo-001", "amount_cents": 1499,
                "idempotency_key": "charge-canva-decline-1"})
        self.assertEqual(reply.status_code, 402)
        self.assertEqual(self.hub.get("/api/demo-wallet", headers=self.headers).json()["balance_cents"], 10000)

        os.environ["QWEN_API_KEY"] = "test-only-key"
        answer = httpx.Response(200, json={"choices": [{"message": {"content": "{\"risk_score\":40}"}}]},
                                request=httpx.Request("POST", "https://maas.qwencloudapi.com/compatible-mode/v1/chat/completions"))
        with patch("httpx.post", return_value=answer) as post:
            reply = self.hub.post("/api/ai/analyze", headers=self.headers, json={
                "provider": "netflix", "monthly_cost_cents": 1599, "category": "entertainment"})
        self.assertEqual(reply.status_code, 200)
        self.assertEqual(reply.json()["model"], "qwen3.8-flash")
        self.assertEqual(post.call_args.args[0], "https://maas.qwencloudapi.com/compatible-mode/v1/chat/completions")
        self.assertEqual(post.call_args.kwargs["json"]["model"], "qwen3.8-flash")

    def test_unknown_stripe_outcome_retries_without_second_reservation(self):
        successful = httpx.Response(200, json={"id": "pi_retry_001", "status": "succeeded"},
                                    request=httpx.Request("POST", "https://api.stripe.com/v1/payment_intents"))
        payload = {"provider": "spotify", "subscription_id": "spotify-demo-001",
                   "amount_cents": 1199, "idempotency_key": "charge-retry-0001"}
        with patch("httpx.post", side_effect=[httpx.TimeoutException("unknown"), successful]) as post:
            first = self.hub.post("/internal/billing/charge", headers=self.headers, json=payload)
            self.assertEqual(first.status_code, 502)
            self.assertEqual(self.hub.get("/api/demo-wallet", headers=self.headers).json()["balance_cents"], 8801)
            second = self.hub.post("/internal/billing/charge", headers=self.headers, json=payload)
        self.assertEqual(second.status_code, 200)
        self.assertEqual(second.json()["wallet_balance_cents"], 8801)
        self.assertEqual(post.call_count, 2)
        self.assertEqual(post.call_args_list[0].kwargs["headers"], post.call_args_list[1].kwargs["headers"])


if __name__ == "__main__":
    unittest.main()
