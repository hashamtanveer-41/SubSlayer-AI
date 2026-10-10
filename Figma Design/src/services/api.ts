import type {
  AgentCompletedEvent,
  AgentStepEvent,
  CancelAgentResponse,
  SimulateChargeResponse,
  Subscription,
  User,
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

export function getAuthHeaders(extraHeaders: Record<string, string> = {}): Record<string, string> {
  const headers: Record<string, string> = { ...extraHeaders }
  const sessionId = typeof window !== "undefined" ? localStorage.getItem("subslayer_session") : null
  if (sessionId) {
    headers["Authorization"] = `Bearer ${sessionId}`
    headers["X-Session-ID"] = sessionId
  }
  return headers
}

// 0. Authentication (Session Cookie + Header Fallback)
export async function getMeApi(): Promise<User | null> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/auth/me`, {
      credentials: "include",
      headers: getAuthHeaders(),
      signal: AbortSignal.timeout(5000),
    })
    if (!res.ok) return null
    const data = await res.json()
    return data.authenticated && data.user ? data.user : null
  } catch {
    return null
  }
}

export async function loginApi(email: string, password: string): Promise<User> {
  const res = await fetch(`${API_BASE_URL}/api/auth/login`, {
    method: "POST",
    credentials: "include",
    headers: getAuthHeaders({ "Content-Type": "application/json" }),
    body: JSON.stringify({ email, password }),
  })
  if (!res.ok) {
    throw await responseError(res)
  }
  const data = await res.json()
  if (!data.user) {
    throw new Error(data.message || "Failed to log in")
  }
  if (data.sessionId) {
    localStorage.setItem("subslayer_session", data.sessionId)
  }
  return data.user
}

export async function signupApi(
  email: string,
  password: string,
  name: string,
): Promise<User> {
  const res = await fetch(`${API_BASE_URL}/api/auth/signup`, {
    method: "POST",
    credentials: "include",
    headers: getAuthHeaders({ "Content-Type": "application/json" }),
    body: JSON.stringify({ email, password, name }),
  })
  if (!res.ok) {
    throw await responseError(res)
  }
  const data = await res.json()
  if (!data.user) {
    throw new Error(data.message || "Failed to create account")
  }
  if (data.sessionId) {
    localStorage.setItem("subslayer_session", data.sessionId)
  }
  return data.user
}

export async function updateProfileApi(name: string): Promise<User> {
  const res = await fetch(`${API_BASE_URL}/api/auth/profile`, {
    method: "PATCH",
    credentials: "include",
    headers: getAuthHeaders({ "Content-Type": "application/json" }),
    body: JSON.stringify({ name }),
  })
  if (!res.ok) {
    throw await responseError(res)
  }
  const data = await res.json()
  if (!data.user) {
    throw new Error("Could not update profile")
  }
  return data.user
}

export async function changePasswordApi(
  newPassword: string,
  currentPassword?: string,
): Promise<{ success: boolean; message: string }> {
  const res = await fetch(`${API_BASE_URL}/api/auth/change-password`, {
    method: "POST",
    credentials: "include",
    headers: getAuthHeaders({ "Content-Type": "application/json" }),
    body: JSON.stringify({ newPassword, currentPassword }),
  })
  if (!res.ok) {
    throw await responseError(res)
  }
  return await res.json()
}

export async function logoutApi(): Promise<void> {
  try {
    await fetch(`${API_BASE_URL}/api/auth/logout`, {
      method: "POST",
      credentials: "include",
      headers: getAuthHeaders(),
    })
  } catch (err) {
    console.error("Logout request failed:", err)
  } finally {
    localStorage.removeItem("subslayer_session")
  }
}

export async function getGoogleAuthConfigApi(): Promise<{
  configured: boolean
  clientId?: string | null
  authUrl?: string | null
}> {
  try {
    const origin = typeof window !== "undefined" ? window.location.origin : ""
    const url = origin
      ? `${API_BASE_URL}/api/auth/google/config?origin=${encodeURIComponent(origin)}`
      : `${API_BASE_URL}/api/auth/google/config`
    const res = await fetch(url, {
      credentials: "include",
      headers: getAuthHeaders(),
      signal: AbortSignal.timeout(4000),
    })
    if (!res.ok) return { configured: false }
    return await res.json()
  } catch {
    return { configured: false }
  }
}

export async function googleLoginWithCredentialApi(credential: string): Promise<User> {
  const res = await fetch(`${API_BASE_URL}/api/auth/google`, {
    method: "POST",
    credentials: "include",
    headers: getAuthHeaders({ "Content-Type": "application/json" }),
    body: JSON.stringify({ credential }),
  })
  if (!res.ok) {
    throw await responseError(res)
  }
  const data = await res.json()
  if (!data.user) {
    throw new Error(data.message || "Google sign-in failed")
  }
  if (data.sessionId) {
    localStorage.setItem("subslayer_session", data.sessionId)
  }
  return data.user
}

// 1. Health check
export async function getApiHealth(): Promise<ApiHealth | null> {
  try {
    const res = await fetch(`${API_BASE_URL}/health`, {
      credentials: "include",
      headers: getAuthHeaders(),
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
  const res = await fetch(`${API_BASE_URL}/api/cards`, {
    credentials: "include",
    headers: getAuthHeaders(),
  })
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
    credentials: "include",
    headers: getAuthHeaders({ "Content-Type": "application/json" }),
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
    credentials: "include",
    headers: getAuthHeaders({ "Content-Type": "application/json" }),
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
  const res = await fetch(`${API_BASE_URL}/api/subscriptions`, {
    credentials: "include",
    headers: getAuthHeaders(),
  })
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
    credentials: "include",
    headers: getAuthHeaders({ "Content-Type": "application/json" }),
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
