# Asfand demo services

This implementation runs a hub and four **simulated** subscription APIs. It never calls the real Netflix, Spotify, Canva, or Adobe consumer APIs. Each provider runs on its own device and keeps its own SQLite state; the hub connects to each provider over HTTP. No browser automation is used. The current Wallos-based application can consume these APIs later.

## Setup

Install Python 3.12+ and `pip install -r requirements.txt` on all five devices. Set environment variables from `.env.example` through your shell or a secret manager; the code does **not** load `.env` automatically. Use the same long random `DEMO_SERVICE_TOKEN` on all devices. Use only a Stripe `sk_test_` key, and set `QWEN_API_KEY` on the hub. Do not place real keys in committed files or issue examples. If a key was shared in chat, rotate it after setup.

On the hub device set `NETFLIX_API_URL`, `SPOTIFY_API_URL`, `CANVA_API_URL`, and `ADOBE_API_URL` to the devices' reachable addresses. Run `uvicorn app.demo_hub:app --host 0.0.0.0 --port 8000 --workers 1` from `backend/`.

On each provider device set `PROVIDER_NAME` to exactly one of `netflix`, `spotify`, `canva`, `adobe`, set `HUB_API_URL` to the hub's reachable address, and run `uvicorn app.provider_server:app --host 0.0.0.0 --port 8101 --workers 1` from `backend/`. Each device may use the same port; the hub URLs select the correct IP. Set `PROVIDER_DB_PATH` to a distinct persistent location on each device if needed. Set `HUB_DB_PATH` to a persistent location on the hub. Open only the chosen ports on a trusted LAN/VPN; use HTTPS or a private tunnel across untrusted networks. Do not expose these demo routes directly to the public internet.

## API flow

The hub publishes `/openapi.json` and interactive `/docs`. Mutating and account endpoints require `Authorization: Bearer <DEMO_SERVICE_TOKEN>`. The public `/health` and `/api/providers/{name}/health` routes check service reachability. Provider IDs are `netflix-demo-001`, `spotify-demo-001`, `canva-demo-001`, `adobe-demo-001`.

1. `GET /api/providers` lists fixtures; `GET /api/providers/{name}/subscriptions/{id}` reads provider state.
2. `POST /api/providers/{name}/subscriptions/{id}/cancel` with `{"idempotency_key":"cancel-unique-001","confirmed":true}` requests cancellation. Netflix/Spotify return scheduled, Canva cancelled, and Adobe pending. Retry with the same key to retrieve the same receipt. These statuses are demo outcomes only.
3. `POST /api/providers/{name}/subscriptions/{id}/charge` with `{"idempotency_key":"charge-unique-001"}` sends the request to that device, then back to the hub's authenticated billing endpoint. The hub verifies the provider and exact catalog price, reserves the amount in its demo wallet, creates and confirms a Stripe **test-mode** PaymentIntent with `pm_card_visa`, then records the Stripe ID. A repeated key returns the same successful operation. A decline releases the reservation. A network-unknown result stays pending; retry the *same* key to reconcile safely.
4. `GET /api/demo-wallet` shows the **customer demo wallet** and recent charge ledger. Successful charges reduce this balance. `GET /api/stripe/test-balance` reads the distinct Stripe **merchant** test balance. A successful payment normally increases the merchant balance; it does not debit that account. The wallet is an application simulation, not a Stripe-issued virtual account/card.
5. `POST /api/ai/analyze` accepts `{"provider":"netflix","monthly_cost_cents":1599,"category":"entertainment","user_note":"rarely used"}` and calls Qwen3.8 Flash via the OpenAI-compatible Chat Completions endpoint. The model gives an explanation; deterministic code alone decides cancellation and payment state. AI output is not proof of provider or Stripe action.

The hub only needs the Stripe and Qwen secrets. Provider devices only need the shared demo token and hub URL. Hasham can later place the hub behind the main backend gateway and map its responses to the frontend contract. Keep one worker per service because the demo wallet's process lock coordinates local SQLite reservations. Use unique idempotency keys for separate operations.

## Local smoke check

For a one-device rehearsal, start the hub on port 8000 and provider instances on ports 8101–8104 using separate `PROVIDER_NAME`, `PROVIDER_DB_PATH`, and ports. Set the four hub URLs to `http://127.0.0.1:8101` through `:8104`. Check all four `/api/providers/{name}/health` responses, then read a subscription, charge it once, repeat the same charge key, and compare `/api/demo-wallet` after each call. The balance must fall exactly once. Cancel it, then confirm its provider status. Without a reachable Stripe test API or valid key, cancellation still works and charge reports configuration or upstream failure.
