# SubSlayer AI: Backend Architecture & Team Task Breakdown

**Branch:** `feature/backend-ai-agent`  
**Backend Owners:** Hasham & Asfand  
**Frontend Collaborators:** Hamza & Sarim  
**Pitch / Presentation:** Talal  

---

## 1. Ownership & Workstream Separation

To enable Hasham and Asfand to build concurrently without merge conflicts, the backend is partitioned into two clear decoupled domains adhering to **Single Responsibility (SRP)** and **Dependency Inversion (DIP)**:

```
┌────────────────────────────────────────────────────────────────────────┐
│                   HASHAM'S WORKSTREAM: API & CORE                      │
│                                                                        │
│  • FastAPI Gateway & CORS Configuration                                │
│  • Frontend Communication & Contract Compliance                        │
│  • API Routes (Subscriptions, Cards Hub, Statement CSV Ingestion)      │
│  • SSE Streaming Endpoint Layer (Server-Sent Events)                   │
│  • In-Memory / DB Repository Layer & Dependency Injection              │
│  • Financial Logic (Wallos Cost Normalization & Vampire Risk Engine)   │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ Calls via clean interfaces (OCP/DIP)
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                   ASFAND'S WORKSTREAM: AI & AGENTS                     │
│                                                                        │
│  • Autonomous AI Browser Cancellation Agent Architecture               │
│  • Dark Pattern Detection & Bypasser Engine (RetentionTrapSolver)      │
│  • Provider Cancellation Strategies (Canva, Adobe, Generic Vision)     │
│  • Headless Browser Driver Layer (Playwright / Stagehand / Mock)       │
│  • Proof Verification Engine & DOM Screenshot Capture                  │
│  • Live Agent Reasoning Pipeline & Step Event Dispatcher              │
└────────────────────────────────────────────────────────────────────────┘
```

---

### Detailed Task Ownership

### 🧑‍💻 Hasham's Modules (API & Frontend Communication)
1. **API Endpoints & Controllers (`app/api/routes/`):**
   - `subscriptions.py`: `GET /api/subscriptions`, `POST /api/subscriptions`
   - `cards.py`: `GET /api/cards`, `POST /api/cards/toggle-lock`, `POST /api/cards/simulate-charge`
   - `statement.py`: `POST /api/statement/upload` (CSV bank feed ingestion)
   - `agent.py`: `POST /api/agent/cancel`, `GET /api/agent/stream/{taskId}` (SSE streamer)
2. **Frontend Communication & Gateway (`main.py`):**
   - Configure CORS middleware for Hamza & Sarim's Vite servers (`localhost:5173`, `localhost:8443`).
   - Setup static asset serving for verification proofs (`/static/proofs`).
   - Server health checks and error handling middleware.
3. **Repository & State Management (`app/services/repository.py`):**
   - Thread-safe repository for active subscriptions, virtual cards, and cancellation tasks.
4. **Financial Intelligence Engine (`app/services/finance/`):**
   - `cost_calculator.py`: Port of Wallos `getPricePerMonth` cycle normalization & savings projections.
   - `vampire_scorer.py`: Algorithmic 0–100 risk scoring based on cost, frequency, and inactivity.

---

### 🤖 Asfand's Modules (AI Agent & Automation)
1. **Autonomous Cancellation Engine (`app/services/agent/`):**
   - `interfaces.py`: Abstract Base Classes `BaseCancellationAgent`, `BaseBrowserDriver` (OCP).
   - `dark_patterns.py`: `RetentionTrapSolver` to detect and dismiss 50% discount modals, loss-aversion screens, and deceptive buttons.
   - `screenshot_generator.py`: `ProofScreenshotGenerator` to create high-resolution DOM verification proofs.
2. **Platform Strategies & Factory (`app/services/agent/strategies.py`):**
   - `CanvaCancellationStrategy`: Multi-step navigation, discount refusal, and confirmation flow.
   - `AdobeCancellationStrategy`: Early termination fee bypass and plan cancellation.
   - `GenericCancellationStrategy`: Vision-LLM fallback agent for arbitrary services.
   - `CancellationStrategyFactory`: Selects strategy dynamically (Open-Closed Principle).
3. **Task Orchestration & Telemetry (`app/services/agent/orchestrator.py`):**
   - `AgentOrchestrator`: Runs background tasks, executes strategies, and yields real-time telemetry steps for Hasham's SSE route to stream to the frontend.

---

## 2. Shared API Contracts (Frontend <-> Backend)

| Endpoint | Method | Owner | Purpose |
| :--- | :--- | :--- | :--- |
| `/api/subscriptions` | `GET` | Hasham | Returns subscriptions list with Vampire Scores |
| `/api/subscriptions` | `POST` | Hasham | Adds custom subscription |
| `/api/statement/upload` | `POST` | Hasham | Uploads CSV bank statement & parses subscriptions |
| `/api/agent/cancel` | `POST` | Hasham + Asfand | Triggers Asfand's agent; returns `{ taskId, streamUrl }` |
| `/api/agent/stream/{taskId}` | `GET` (SSE) | Hasham + Asfand | Streams Asfand's agent steps live to frontend |
| `/api/cards` | `GET` | Hasham | Returns virtual cards list |
| `/api/cards/toggle-lock` | `POST` | Hasham | Locks card balance to $0.00 |
| `/api/cards/simulate-charge` | `POST` | Hasham | Simulates charge; evaluates $0 shield |

---

## 3. Current Implementation Status

- [x] Dedicated branch created: `feature/backend-ai-agent`
- [x] Domain entities & Pydantic models defined in `app/domain/models.py`
- [x] Wallos financial normalization ported in `app/services/finance/cost_calculator.py`
- [x] Vampire Scorer implemented in `app/services/finance/vampire_scorer.py`
- [x] Virtual Cards service ($0 Balance Shield) implemented in `app/services/cards/virtual_card_service.py`
- [x] Agent interfaces & dark pattern solver created in `app/services/agent/`
- [x] Concrete cancellation strategies & factory created in `app/services/agent/strategies.py`
- [x] Screenshot proof verification engine created in `app/services/agent/screenshot_generator.py`
- [x] Agent Orchestrator event emitter built in `app/services/agent/orchestrator.py`
