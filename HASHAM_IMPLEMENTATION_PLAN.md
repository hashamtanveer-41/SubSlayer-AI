# SubSlayer AI: Hasham's Implementation Plan (API, Gateway & Payments)

**Owner:** Hasham  
**Collaborator (AI / Provider Adapters):** Asfand  
**Collaborators (Frontend):** Hamza & Sarim  
**Role:** Frontend/Backend Integration Lead & API Gateway Architect  
**Branch:** `feature/backend-ai-agent`  

---

## 1. Scope & Ownership Boundaries

As defined in the [Product Requirements Document](product_requirements_document.md) and [Backend Execution Plan](BACKEND_EXECUTION_PLAN.md):

* **Hasham's Scope:**
  1. **FastAPI Gateway & Server Entry (`main.py`):** CORS origins (`localhost:5173`, `localhost:8443`), request validation, structured error handlers.
  2. **Subscription & Ingestion Routes:** `GET /api/subscriptions`, `POST /api/subscriptions`, `POST /api/statement/upload`.
  3. **Cancellation Orchestration Gateway:** `POST /api/agent/cancel`, SSE stream `GET /api/agent/stream/{taskId}`, and task recovery `GET /api/agent/tasks/{taskId}`.
  4. **Stripe Test-Mode Payment Shield:** `GET /api/cards`, `POST /api/cards/toggle-lock`, `POST /api/cards/simulate-charge` with real `sk_test_` Stripe integration and local demo policy lock.
  5. **Task & State Repository:** Thread-safe state persistence for active subscriptions, cancellation tasks, and test cards.

* **Asfand's Scope (Handed off to Asfand):**
  * The internal logic of the 4 provider demo adapters (Netflix, Spotify, Canva, Adobe).
  * Recurring-subscription detection and Vampire Score weighting algorithms.

---

## 2. Architecture & Design Principles (SOLID & OOP)

* **Single Responsibility Principle (SRP):**
  * Routers strictly parse HTTP requests, validate with Pydantic, and return JSON/SSE.
  * Business logic lives in dedicated service classes (`StripePaymentShieldService`, `CancellationOrchestrator`).
  * Data storage lives in `SubscriptionRepository`.
* **Dependency Inversion Principle (DIP):**
  * All routes consume services via FastAPI's `Depends()` dependency injection (`app/api/deps.py`), allowing seamless mock injection in tests.
* **Security & Compliance:**
  * Strict validation: `STRIPE_SECRET_KEY` must begin with `sk_test_`. Live keys are completely rejected.
  * Zero PAN/CVV: endpoints only ever touch safe display metadata (`last4`, `cardBrand`, Stripe IDs).

---

## 3. Step-by-Step Implementation Roadmap

### Step 1: Core Domain Schemas & Validation (`app/domain/models.py`)
- [x] `Subscription`: provider, providerSubscriptionId, status, vampireScore, latestCancellationTaskId.
- [x] `CancelAgentRequest`: subscriptionId, provider, confirmation, idempotencyKey.
- [x] `CancelAgentResponse`: taskId, status, streamUrl.
- [x] `AgentStepEvent` & `AgentCompletedEvent`: matching PRD Section 5.2 SSE contracts.
- [x] `CancellationTask`: stores full task history for recovery via `GET /api/agent/tasks/{taskId}`.
- [x] `VirtualCard` & `SimulateChargeResponse`: safe Stripe test metadata and `blocked_by_demo_policy` outcome types.

### Step 2: Thread-Safe Repository & Task Store (`app/services/repository.py`)
- [x] In-memory thread-safe store for subscriptions, tasks, and audit logs.
- [x] Seed data matching the Figma frontend prototype (Adobe, Canva, Netflix, Spotify, Notion, iCloud+).
- [x] State updates: marking subscription as `Cancelled` and storing `projectedAnnualSavings`.

### Step 3: Cancellation Orchestration & SSE Gateway (`app/services/cancellation_orchestrator.py`)
- [x] Validate user confirmation and provider support (`netflix`, `spotify`, `canva`, `adobe`).
- [x] Asynchronous SSE generator yielding `event: agent_step` and `event: agent_completed`.
- [x] Task state persistence enabling task recovery if an SSE connection is dropped or refreshed.

### Step 4: Stripe Test-Mode Payment Shield Service (`app/services/payments/stripe_service.py`)
- [x] Initialize Stripe with `sk_test_` key validation.
- [x] Seed test card fixtures (`pm_card_visa`, `pm_card_mastercard`, `pm_card_amex`).
- [x] `toggle_lock(card_id, locked)`: updates `demoPolicyLocked` and card status (`locked` vs `active`).
- [x] `simulate_charge(...)`:
  - When locked: blocks locally -> returns `outcomeType: "blocked_by_demo_policy"`.
  - When unlocked: executes Stripe test PaymentIntent with idempotency key.

### Step 5: Statement Upload & Parsing Gateway (`app/services/intelligence/statement_parser.py`)
- [x] Supports standard CSV format (`Date, Merchant, Amount, Category`).
- [x] Matches merchant to supported demo providers or generic categories.
- [x] Calculates total monthly spend, annual drain, and Vampire scores.

### Step 6: FastAPI Routers & Gateway (`app/api/routes/` & `app/main.py`)
- [x] `routes/subscriptions.py`: List & create endpoints.
- [x] `routes/agent.py`: Cancel queue, SSE streaming, and task recovery endpoints.
- [x] `routes/cards.py`: Card list, lock toggle, and charge simulation.
- [x] `routes/statement.py`: CSV statement upload endpoint.
- [x] `main.py`: CORS configuration, health check endpoint (`/health`), router wiring.

### Step 7: Automated Verification Suite (`tests/test_api.py`)
- [x] Health check test verifying Stripe test mode is enabled.
- [x] Subscriptions list and add tests.
- [x] Statement upload and Vampire Score test.
- [x] Payment shield lock and charge decline tests.
- [x] End-to-end cancellation SSE streaming and task recovery test.

---

## 4. Verification & Frontend Handoff Checklist

Before handing off to Hamza & Sarim (Frontend):
1. **Server execution:** Start Uvicorn on `http://localhost:8000`.
2. **CORS test:** Verify that requests from `http://localhost:5173` and `http://localhost:8443` succeed.
3. **Swagger UI docs:** Available at `http://localhost:8000/docs` for Hamza and Sarim to test every endpoint interactively.
