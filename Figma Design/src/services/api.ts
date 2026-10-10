import type {
  AgentCompletedEvent,
  AgentStepEvent,
  CancelAgentResponse,
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
  const res = await fetch(`${API_BASE_URL}/api/cards`)
  if (!res.ok) {
    throw new Error(`Failed to fetch cards: ${res.statusText}`)
  }
  const cards = await res.json()
  return cards.map((c: any) => ({
    ...c,
    merchant: c.label || c.merchant || "Subscription",
    cardNumberMasked: `•••• •••• •••• ${c.last4 || "4242"}`,
    exp: c.exp || "12/28",
    cvv: c.cvv || "312",
    balanceLocked: c.demoPolicyLocked ?? (c.status === "locked"),
  }))
}

export async function toggleCardLockApi(
  cardId: string,
  locked: boolean,
): Promise<VirtualCard> {
  const res = await fetch(`${API_BASE_URL}/api/cards/toggle-lock`, {
    method: "POST",
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
    cardNumberMasked: `•••• •••• •••• ${c.last4 || "4242"}`,
    exp: c.exp || "12/28",
    cvv: c.cvv || "312",
    balanceLocked: c.demoPolicyLocked ?? (c.status === "locked"),
  }
}

export async function simulateChargeApi(
  cardId: string,
  amount: number,
  merchant: string,
): Promise<SimulateChargeResponse> {
  const idempotencyKey = `sim_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`
  const res = await fetch(`${API_BASE_URL}/api/cards/simulate-charge`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      cardId,
      amount,
      merchant,
      idempotencyKey,
    }),
  })
  if (!res.ok) {
    throw new Error(`Failed to simulate charge: ${res.statusText}`)
  }
  return await res.json()
}

// 3. Subscriptions
export async function getSubscriptionsApi(): Promise<Subscription[]> {
  const res = await fetch(`${API_BASE_URL}/api/subscriptions`)
  if (!res.ok) {
    throw new Error(`Failed to fetch subscriptions: ${res.statusText}`)
  }
  return await res.json()
}

// 4. Autonomous Agent Cancellation
export async function startCancellationAgentApi(
  subscriptionId: string,
  provider: string = "generic",
): Promise<CancelAgentResponse> {
  const idempotencyKey = `cancel_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`
  const res = await fetch(`${API_BASE_URL}/api/agent/cancel`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      subscriptionId,
      provider: provider.toLowerCase(),
      confirmation: true,
      idempotencyKey,
    }),
  })
  if (!res.ok) {
    throw new Error(`Cancellation trigger failed: ${res.statusText}`)
  }
  return await res.json()
}

export function subscribeToAgentStream(
  taskId: string,
  callbacks: {
    onStep: (event: AgentStepEvent) => void
    onComplete: (event: AgentCompletedEvent) => void
    onError?: (err: any) => void
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

  eventSource.onerror = (err) => {
    if (callbacks.onError) callbacks.onError(err)
    eventSource.close()
  }

  return () => {
    eventSource.close()
  }
}
