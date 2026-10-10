import unittest
from starlette.testclient import TestClient
from app.main import app

class BackendApiTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.client = TestClient(app)

    def setUp(self):
        from app.api.deps import get_subscription_repo, get_stripe_service
        get_subscription_repo().reset()
        get_stripe_service().reset()

    def test_health(self):
        res = self.client.get("/health")
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertEqual(data["status"], "healthy")
        self.assertEqual(data["stripeMode"], "test")

    def test_subscriptions(self):
        res = self.client.get("/api/subscriptions")
        self.assertEqual(res.status_code, 200)
        subs = res.json()
        self.assertGreaterEqual(len(subs), 4)
        canva_sub = next(s for s in subs if s["provider"] == "canva")
        self.assertEqual(canva_sub["name"], "Canva Pro")

    def test_create_subscription(self):
        payload = {
            "provider": "generic",
            "name": "Duolingo Plus",
            "category": "Entertainment",
            "price": 22.99,
            "cycle": "Monthly",
            "renewal": "2026-08-01"
        }
        res = self.client.post("/api/subscriptions", json=payload)
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertEqual(data["name"], "Duolingo Plus")
        self.assertGreaterEqual(data["vampireScore"], 50)

        # Frontend edits persist while provider identity and plan stay bound.
        changed = self.client.patch(f"/api/subscriptions/{data['id']}",
                                    json={"name": "Updated Subscription", "price": 19.99})
        self.assertEqual(changed.status_code, 200)
        self.assertEqual(changed.json()["name"], "Updated Subscription")
        self.assertEqual(changed.json()["price"], 19.99)
        self.assertEqual(changed.json()["provider"], "generic")
        self.assertEqual(self.client.patch("/api/subscriptions/missing",
                                           json={"name": "No account"}).status_code, 404)
        self.assertEqual(self.client.patch("/api/subscriptions/sub_01",
                                           json={"price": 1.00}).status_code, 400)
        self.assertEqual(self.client.patch("/api/subscriptions/sub_01",
                                           json={"cycle": "Yearly"}).status_code, 400)

    def test_statement_upload(self):
        res = self.client.post("/api/statement/upload", json={"useDemo": True})
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertGreater(data["totalIngested"], 0)
        self.assertGreater(data["totalMonthlySpend"], 0)
        self.assertGreater(data["totalAnnualWaste"], 0)

    def test_cards_and_shield(self):
        # 1. List cards
        res = self.client.get("/api/cards")
        self.assertEqual(res.status_code, 200)
        cards = res.json()
        self.assertGreaterEqual(len(cards), 3)

        card_01 = cards[0]
        card_id = card_01["id"]

        # 2. Lock card
        lock_res = self.client.post("/api/cards/toggle-lock", json={"cardId": card_id, "locked": True})
        self.assertEqual(lock_res.status_code, 200)
        self.assertTrue(lock_res.json()["demoPolicyLocked"])

        # 3. Simulate charge when locked -> Must be blocked by demo policy
        charge_res = self.client.post("/api/cards/simulate-charge", json={
            "cardId": card_id,
            "amount": 59.99,
            "merchant": "Adobe Systems",
            "idempotencyKey": "test-key-lock-1"
        })
        self.assertEqual(charge_res.status_code, 200)
        charge_data = charge_res.json()
        self.assertFalse(charge_data["success"])
        self.assertEqual(charge_data["status"], "DECLINED")
        self.assertEqual(charge_data["outcomeType"], "blocked_by_demo_policy")
        self.assertEqual(charge_data["amountBlocked"], 59.99)

    def test_agent_cancellation_lifecycle(self):
        # 1. Queue cancellation
        req = {
            "subscriptionId": "sub_02",
            "provider": "canva",
            "confirmation": True,
            "idempotencyKey": "test-idem-canva-api-1"
        }
        res = self.client.post("/api/agent/cancel", json=req)
        self.assertEqual(res.status_code, 202)
        data = res.json()
        task_id = data["taskId"]
        self.assertIn("streamUrl", data)

        # 2. Recover task state via GET /api/agent/tasks/{taskId}
        task_res = self.client.get(f"/api/agent/tasks/{task_id}")
        self.assertEqual(task_res.status_code, 200)
        task_data = task_res.json()
        self.assertEqual(task_data["taskId"], task_id)
        self.assertEqual(task_data["provider"], "canva")

        # 3. Stream SSE events
        stream = self.client.get(f"/api/agent/stream/{task_id}")
        self.assertEqual(stream.status_code, 200)
        self.assertIn("event: agent_step", stream.text)
        self.assertIn("event: agent_completed", stream.text)

        # 4. Verify subscription status updated
        sub_res = self.client.get("/api/subscriptions")
        subs = sub_res.json()
        sub_02 = next(s for s in subs if s["id"] == "sub_02")
        self.assertIn(sub_02["status"], ["Cancelled", "Pending Cancellation"])
        self.assertGreater(sub_02["projectedAnnualSavings"], 0)


if __name__ == "__main__":
    unittest.main()
