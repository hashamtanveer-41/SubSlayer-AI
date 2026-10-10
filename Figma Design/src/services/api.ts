import type {
  AgentCompletedEvent,
  AgentStepEvent,
  CancelAgentResponse,
  CancellationTask,
  DemoWallet,
  SimulateChargeResponse,
  Subscription,
  VirtualCard,
} from "../types"

export const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://127.0.0.1:8000"

export type ApiHealth = {
  status: string
  service: string
  version: string
  stripeMode: string
}

async function responseError(res: Response): Promise<Error> {
  const body = await res.json().catch(() => null)
  return new Error(typeof body?.detail === "string" ? body.detail : `Backend request failed (HTTP ${res.status})`)
}

// 1. Health check
export async function getApiHealth(): Promise<ApiHealth | null> {
  try {
    const res = await fetch(`${API_BASE_URL}/health`, {
      signal: AbortSignal.timeout(3000),
    })
    if (!res.ok) return null
    return await res.json()
  } catch {
    return null
  }
}

// 2. Virtual Cards (Stripe Test Hub)
export async function getVirtualCards(): Promise<VirtualCard[]> {
  const res = await fetch(`${API_BASE_URL}/api/cards`, { signal: AbortSignal.timeout(5000) })
  if (!res.ok) {
    throw new Error(`Failed to fetch cards: ${res.statusText}`)
  }
  const cards = await res.json()
  return cards.map((c: any) => ({
    ...c,
    merchant: c.label || c.merchant || "Subscription",
    cardNumberMasked: `DEMO •••• ${c.last4 || "4242"}`,
    balanceLocked: c.demoPolicyLocked ?? (c.status === "locked"),
  }))
}

export async function toggleCardLockApi(
  cardId: string,
  locked: boolean,
): Promise<VirtualCard> {
  const res = await fetch(`${API_BASE_URL}/api/cards/toggle-lock`, {
    method: "POST",
    signal: AbortSignal.timeout(10000),
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ cardId, locked }),
  })
  if (!res.ok) {
    throw new Error(`Failed to toggle card lock: ${res.statusText}`)
  }
  const c = await res.json()
  return {
    ...c,
    merchant: c.label || c.merchant || "Subscription",
    cardNumberMasked: `DEMO •••• ${c.last4 || "4242"}`,
    balanceLocked: c.demoPolicyLocked ?? (c.status === "locked"),
  }
}

export async function simulateChargeApi(
  cardId: string,
  amount: number,
  merchant: string,
  idempotencyKey: string,
): Promise<SimulateChargeResponse> {
  const res = await fetch(`${API_BASE_URL}/api/cards/simulate-charge`, {
    method: "POST",
    signal: AbortSignal.timeout(30000),
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      cardId,
      amount,
      merchant,
      idempotencyKey,
    }),
  })
  if (!res.ok) {
    throw await responseError(res)
  }
  return await res.json()
}

// 3. Subscriptions
export async function getSubscriptionsApi(): Promise<Subscription[]> {
  const res = await fetch(`${API_BASE_URL}/api/subscriptions?refresh=true`, { signal: AbortSignal.timeout(10000) })
  if (!res.ok) {
    throw new Error(`Failed to fetch subscriptions: ${res.statusText}`)
  }
  return await res.json()
}

export async function getProviderHealthApi(name: string): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/providers/${name}/health`, {
      signal: AbortSignal.timeout(3000),
    })
    return res.ok
  } catch {
    return false
  }
}

export async function saveSubscriptionApi(sub: Subscription, editing: boolean): Promise<Subscription> {
  const payload = { name: sub.name, category: sub.category, price: sub.price,
    cycle: sub.cycle, renewal: sub.renewal, provider: sub.provider || "generic" }
  const res = await fetch(`${API_BASE_URL}/api/subscriptions${editing ? `/${sub.id}` : ""}`, {
    method: editing ? "PATCH" : "POST",
    signal: AbortSignal.timeout(10000),
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  })
  if (!res.ok) throw await responseError(res)
  return await res.json()
}

export async function getDemoWalletApi(): Promise<DemoWallet> {
  const res = await fetch(`${API_BASE_URL}/api/demo-wallet`, { signal: AbortSignal.timeout(5000) })
  if (!res.ok) throw await responseError(res)
  return await res.json()
}

export async function analyzeSubscriptionApi(sub: Subscription): Promise<string> {
  const res = await fetch(`${API_BASE_URL}/api/ai/analyze`, {
    method: "POST",
    signal: AbortSignal.timeout(40000),
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      provider: sub.provider,
      monthly_cost_cents: Math.round((sub.cycle === "Yearly" ? sub.price / 12 : sub.price) * 100),
      category: sub.category,
      user_note: "",
    }),
  })
  if (!res.ok) throw await responseError(res)
  const result = await res.json()
  const raw = result.analysis
  if (typeof raw !== "string") throw new Error("Qwen returned an invalid analysis")
  try {
    const parsed = JSON.parse(raw)
    if (typeof parsed.reason === "string") {
      return `${parsed.reason} (estimated risk ${parsed.risk_score ?? "?"}/100)`
    }
  } catch {
    // A textual model response can still be shown as advisory text.
  }
  return raw
}

export async function getCancellationTaskApi(taskId: string): Promise<CancellationTask> {
  const res = await fetch(`${API_BASE_URL}/api/agent/tasks/${taskId}`, { signal: AbortSignal.timeout(5000) })
  if (!res.ok) throw await responseError(res)
  return await res.json()
}

// 4. Autonomous Agent Cancellation
export async function startCancellationAgentApi(
  subscriptionId: string,
  provider: string,
  idempotencyKey: string,
): Promise<CancelAgentResponse> {
  const res = await fetch(`${API_BASE_URL}/api/agent/cancel`, {
    method: "POST",
    signal: AbortSignal.timeout(10000),
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      subscriptionId,
      provider: provider.toLowerCase(),
      confirmation: true,
      idempotencyKey,
    }),
  })
  if (!res.ok) {
    throw await responseError(res)
  }
  return await res.json()
}

export function subscribeToAgentStream(
  taskId: string,
  callbacks: {
    onStep: (event: AgentStepEvent) => void
    onComplete: (event: AgentCompletedEvent) => void
    onError?: (message: string) => void
  },
): () => void {
  const sseUrl = `${API_BASE_URL}/api/agent/stream/${taskId}`
  const eventSource = new EventSource(sseUrl)

  eventSource.addEventListener("agent_step", (e) => {
    try {
      const data = JSON.parse(e.data) as AgentStepEvent
      callbacks.onStep(data)
    } catch (err) {
      console.error("Failed to parse agent_step:", err)
    }
  })

  eventSource.addEventListener("agent_completed", (e) => {
    try {
      const data = JSON.parse(e.data) as AgentCompletedEvent
      callbacks.onComplete(data)
      eventSource.close()
    } catch (err) {
      console.error("Failed to parse agent_completed:", err)
      eventSource.close()
    }
  })

  eventSource.onerror = (event) => {
    let message = "Provider stream disconnected; checking task status."
    if (event instanceof MessageEvent && event.data) {
      try {
        message = JSON.parse(event.data).error || message
      } catch {
        message = String(event.data)
      }
    }
    callbacks.onError?.(message)
    eventSource.close()
  }

  return () => {
    eventSource.close()
  }
}
