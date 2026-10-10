from starlette.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_health():
    res = client.get("/health")
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "healthy"
    assert data["stripeMode"] == "test"

def test_subscriptions():
    res = client.get("/api/subscriptions")
    assert res.status_code == 200
    subs = res.json()
    assert len(subs) >= 4
    canva_sub = next(s for s in subs if s["provider"] == "canva")
    assert canva_sub["name"] == "Canva Pro"
    assert canva_sub["status"] == "Active"

def test_create_subscription():
    payload = {
        "provider": "generic",
        "name": "Custom Subscription",
        "category": "Entertainment",
        "price": 22.99,
        "cycle": "Monthly",
        "renewal": "2026-08-01"
    }
    res = client.post("/api/subscriptions", json=payload)
    assert res.status_code == 200
    data = res.json()
    assert data["name"] == "Custom Subscription"
    duplicate = client.post("/api/subscriptions", json={**payload, "provider": "netflix", "name": "Netflix Premium", "price": 15.49})
    assert duplicate.status_code == 409

    # The frontend edit dialog persists changes through PATCH, while provider
    # identity remains bound to the original demo account.
    changed = client.patch(f"/api/subscriptions/{data['id']}", json={"name": "Updated Subscription", "price": 19.99})
    assert changed.status_code == 200
    assert changed.json()["name"] == "Updated Subscription"
    assert changed.json()["price"] == 19.99
    assert changed.json()["provider"] == "generic"
    assert client.patch("/api/subscriptions/missing", json={"name": "No account"}).status_code == 404
    assert client.patch("/api/subscriptions/sub_01", json={"price": 1.00}).status_code == 400
    assert client.patch("/api/subscriptions/sub_01", json={"cycle": "Yearly"}).status_code == 400

def test_statement_upload():
    res = client.post("/api/statement/upload", json={"useDemo": True})
    assert res.status_code == 200
    data = res.json()
    assert data["totalIngested"] > 0
    assert data["totalMonthlySpend"] > 0
    assert data["totalAnnualWaste"] > 0

def test_cards_and_shield():
    # 1. List cards
    res = client.get("/api/cards")
    assert res.status_code == 200
    cards = res.json()
    assert len(cards) >= 3

    card_01 = cards[0]
    card_id = card_01["id"]

    # 2. Lock card
    lock_res = client.post("/api/cards/toggle-lock", json={"cardId": card_id, "locked": True})
    assert lock_res.status_code == 200
    assert lock_res.json()["demoPolicyLocked"] is True

    # 3. Simulate charge when locked -> Must be blocked by demo policy
    charge_res = client.post("/api/cards/simulate-charge", json={
        "cardId": card_id,
        "amount": 59.99,
        "merchant": "Adobe Systems",
        "idempotencyKey": "test-key-lock-1"
    })
    assert charge_res.status_code == 200
    charge_data = charge_res.json()
    assert charge_data["success"] is False
    assert charge_data["status"] == "DECLINED"
    assert charge_data["outcomeType"] == "blocked_by_demo_policy"
    assert charge_data["amountBlocked"] == 59.99

def test_agent_cancellation_lifecycle():
    # 1. Queue cancellation
    req = {
        "subscriptionId": "sub_02",
        "provider": "canva",
        "confirmation": True,
        "idempotencyKey": "test-idem-canva-1"
    }
    res = client.post("/api/agent/cancel", json=req)
    assert res.status_code == 202
    data = res.json()
    task_id = data["taskId"]
    assert "streamUrl" in data

    # 2. Recover task state via GET /api/agent/tasks/{taskId}
    task_res = client.get(f"/api/agent/tasks/{task_id}")
    assert task_res.status_code == 200
    task_data = task_res.json()
    assert task_data["taskId"] == task_id
    assert task_data["provider"] == "canva"

    # 3. Stream SSE events
    with client.stream("GET", f"/api/agent/stream/{task_id}") as stream:
        lines = [line if isinstance(line, str) else line.decode("utf-8") for line in stream.iter_lines() if line]
        assert any("agent_step" in line for line in lines)
        assert any("agent_completed" in line for line in lines)

    # 4. A scheduled provider response is pending until its effective date.
    sub_res = client.get("/api/subscriptions")
    subs = sub_res.json()
    sub_02 = next(s for s in subs if s["id"] == "sub_02")
    assert sub_02["status"] == "Pending Cancellation"
    assert sub_02["projectedAnnualSavings"] > 0

if __name__ == "__main__":
    print("Running integration tests...")
    test_health()
    print("✓ test_health passed")
    test_subscriptions()
    print("✓ test_subscriptions passed")
    test_create_subscription()
    print("✓ test_create_subscription passed")
    test_statement_upload()
    print("✓ test_statement_upload passed")
    test_cards_and_shield()
    print("✓ test_cards_and_shield passed")
    test_agent_cancellation_lifecycle()
    print("✓ test_agent_cancellation_lifecycle passed")
    print("\nALL 6 INTEGRATION TESTS PASSED 100%!")
