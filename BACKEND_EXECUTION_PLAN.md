# SubSlayer AI: Backend Execution Plan

This plan follows [the product requirements](product_requirements_document.md). The demo uses provider-shaped APIs for Netflix, Spotify, Canva, and Adobe, plus Stripe test mode. It does not use Playwright, Chromium, browser navigation, or real consumer accounts.

## Team ownership

| Owner | Responsibility | Deliverable and handoff |
| :--- | :--- | :--- |
| **Hamza — frontend** | Own the dashboard, statement upload, cancellation confirmation/status view, and Payment Shield demo UI. | Consume the agreed backend contracts; show provider response IDs, effective dates, projected savings, and explicit demo/test-mode labels. Report contract mismatches to Hasham. |
| **Hasham — frontend/backend integration** | Own the FastAPI gateway and the connection between Hamza's UI and Asfand's services. | Implement subscription/CSV/card routes, request validation, CORS, task storage, SSE and task retrieval, consistent errors, and the Stripe test-mode payment endpoints. Coordinate response shapes with Hamza and service interfaces with Asfand. |
| **Asfand — AI and provider APIs** | Own recurring-subscription analysis, the four provider demo APIs, and the standalone Stripe test-mode demo ledger requested for the current implementation stage. | Run provider services on four devices and the hub separately; provide lookup, cancellation, charge, status, Qwen3.8 Flash analysis, and Stripe test-mode endpoints for Hasham to integrate. |
| **Sarim — frontend support** | Support Hamza with visual polish and responsive states. | Keep UI changes aligned with the same backend contracts. |
| **Talal — demo/pitch** | Own the presentation and backup recording. | Describe the four provider integrations and Stripe payment flow as demos, using actual returned results. |

## Wallos reference

The team may use the **Wallos repository as a product reference** for subscription lists, recurring cost normalization, and dashboard ideas. This plan does not require cloning, porting, or modifying Wallos now. Before reusing any Wallos code, the implementation owners should check its license and document what was adapted. SubSlayer's cancellation flow remains the four demo provider APIs defined here.

## Execution order and handoffs

1. **Freeze contracts together — Hamza, Hasham, Asfand.** Agree on the fields and outcomes in the PRD before separate work starts. A subscription has a provider and provider subscription ID. A cancellation request includes user confirmation and an idempotency key. Hasham owns the published API contract; Asfand owns the provider adapter contract; Hamza checks that UI states are covered.
2. **Build provider behavior — Asfand.** Create independent Netflix, Spotify, Canva, and Adobe demo adapters with subscription lookup, cancellation request, and status lookup. Use local deterministic fixtures by default; optional remote simulator URLs must not be production consumer endpoints. Return a provider request ID, outcome, effective date when applicable, and sanitized response summary. Make duplicate requests safe.
3. **Build ingestion and intelligence — Asfand with Hasham.** Asfand defines recurring-charge detection, monthly/annual normalization, and Vampire Score inputs/outputs. Hasham exposes CSV upload and subscription responses to the frontend. Keep scoring explanations available so Hamza can show why a subscription was flagged.
4. **Connect services to the UI — Hasham.** Implement `/api/subscriptions`, `/api/statement/upload`, `/api/agent/cancel`, `/api/agent/stream/{taskId}`, and `/api/agent/tasks/{taskId}`. Validate provider mapping and confirmation, store cancellation task state, stream Asfand's status events, and allow task recovery after an SSE disconnect. Update subscription status and savings only when the provider demo response supports them.
5. **Build the payment demo — Asfand, then Hasham and Hamza.** Asfand's standalone hub creates Stripe test-mode PaymentIntents and records a separate customer demo wallet that decreases after successful charges. The Stripe merchant test balance is a distinct read-only value. Hasham later maps these endpoints into the main backend and owns any card-lock policy and frontend-facing contract. Hamza builds the test-mode UI. Never accept card numbers/CVV or use live keys.
6. **Integrate and rehearse — all owners.** Hamza checks loading, success, pending, rejection, timeout, and reconnect states. Hasham checks route/service mapping and secret handling. Asfand verifies all four provider fixtures and idempotent outcomes. Talal records a local demo path that works without venue internet. The black-box test role in the PRD receives only the public contract and service URL.

## Ownership boundaries

- **Hamza ↔ Hasham:** Hamza changes frontend behavior; Hasham changes public backend routes and response contracts. Agree on contract changes before either side depends on them.
- **Hasham ↔ Asfand:** Asfand supplies the standalone provider, Qwen, and Stripe test-mode hub APIs. Hasham owns their later integration into the primary backend and the frontend-facing contract.
- **Stripe:** Asfand owns the current test-mode hub and demo wallet; Hasham owns later gateway/card-lock integration. Stripe test mode does not issue a real zero-balance virtual card, and a merchant balance does not decrease when a customer is charged.
- **Demo claims:** A provider receipt proves only that the corresponding demo API returned that result. It is not evidence that a real Netflix, Spotify, Canva, or Adobe account changed.

## Progress tracking

Track completion against the handoffs above. The previous checklist in this file described browser automation, screenshots, and a real card shield; those items are outside the current demo scope and are not carried forward as completed work.
