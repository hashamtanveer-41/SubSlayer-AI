# SubSlayer backend demo

The FastAPI gateway now connects Hasham's dashboard routes to Asfand's four device-hosted **demo** provider APIs. The gateway also hosts the Stripe test-mode ledger and Qwen3.8 Flash endpoint. These services do not access real Netflix, Spotify, Canva, or Adobe accounts.

## Run the gateway

Install Python 3.12+ and run `pip install -r requirements.txt` from `backend/`. Create a local `backend/.env` based on `.env.example`. Put `STRIPE_SECRET_KEY=sk_test_...`, `QWEN_API_KEY`, a long random `DEMO_SERVICE_TOKEN`, and reachable `*_API_URL` addresses in it. The `.env` file is ignored by Git; never commit or copy these keys to provider devices. `PROVIDER_MODE=remote` is required for actual device-to-device calls. For a fixture-only offline test, explicitly set `PROVIDER_MODE=fixture`.

From `backend/`, start `uvicorn app.main:app --host 0.0.0.0 --port 8000 --workers 1`. The gateway serves Hasham's `/api/subscriptions`, `/api/agent/*`, `/api/cards/*`, and `/api/statement/*` endpoints, plus `/api/demo-wallet`, `/api/stripe/test-balance`, `/api/ai/analyze`, and provider health routes. The authenticated hub for device callbacks is mounted at `/demo`; provider devices use `HUB_API_URL=http://GATEWAY_IP:8000/demo`.

## Run four provider devices

Install the same requirements on each device. Configure only `DEMO_SERVICE_TOKEN`, `PROVIDER_NAME`, `PROVIDER_DB_PATH`, and `HUB_API_URL` in that device's environment. Set `PROVIDER_NAME` to exactly one of `netflix`, `spotify`, `canva`, or `adobe`. From `backend/`, start `uvicorn app.provider_server:app --host 0.0.0.0 --port 8101 --workers 1`. All four devices may use port 8101 because their IPs differ. Set the gateway's four `*_API_URL` variables to those four IP/port pairs. Keep the gateway and devices on a trusted LAN/VPN; use HTTPS or a private tunnel across untrusted networks.

For a one-computer rehearsal, run the gateway on 8000 and four provider processes on 8101–8104. Give each process its own `PROVIDER_NAME` and `PROVIDER_DB_PATH`. Set the gateway's `NETFLIX_API_URL=http://127.0.0.1:8101`, and likewise Spotify 8102, Canva 8103, Adobe 8104. Set every provider process's `HUB_API_URL=http://127.0.0.1:8000/demo`. Environment variables override `.env` values. The gateway and four providers each use one worker because their demo SQLite state uses process-local locks.

## Verify the flow

1. `GET /api/providers/{name}/health` on the gateway must return 200 for each provider. `GET /api/subscriptions` includes one seeded account for each provider.
2. `POST /api/agent/cancel` with `{"subscriptionId":"sub_02","provider":"canva","confirmation":true,"idempotencyKey":"cancel-canva-001"}` queues a task. Read `/api/agent/stream/{taskId}` or `/api/agent/tasks/{taskId}`. The result is based on the remote provider response. A scheduled or pending result remains pending in the gateway; only an immediate cancellation becomes cancelled.
3. `POST /api/cards/simulate-charge` with an unlocked demo card and the provider's exact demo price uses the shared Stripe test ledger. Locked cards are blocked before Stripe. Successful charges reduce `/api/demo-wallet` exactly once per idempotency key. The separate `/api/stripe/test-balance` is the Stripe **merchant** test balance, which does not decrease when a customer is charged. The wallet is a local customer simulation, not a Stripe-issued account or virtual card.
4. `POST /api/ai/analyze` uses Qwen3.8 Flash via its OpenAI-compatible Chat Completions endpoint. The model explains subscription costs; cancellation state and payment amounts are decided by deterministic code.

The provider demo IDs and exact monthly prices are Netflix `netflix-demo-001` ($15.49), Spotify `spotify-demo-001` ($10.99), Canva `canva-demo-001` ($14.99), and Adobe `adobe-demo-001` ($59.99). The hub's authenticated raw provider/payment API is also available under `/demo/api/*`. Use a unique idempotency key for every distinct operation and repeat that same key after a timeout. Provider state and wallet state live in SQLite files; use persistent paths for demos that span restarts.

Run the checks with `python -m unittest backend.tests.test_demo_flow backend.tests.test_gateway_integration -v` from the repository root with `PYTHONPATH=backend`. Hasham's legacy fixture flow in `backend/tests/test_api.py` requires `PROVIDER_MODE=fixture`; the remote integration tests cover the linked services.
