export type Subscription = {
  id: string
  name: string
  category: "Entertainment" | "Productivity" | "Storage" | "Other" | string
  price: number
  cycle: "Monthly" | "Yearly"
  renewal: string
  status: "Active" | "Cancelled" | "Pending Cancellation"
  mark?: string
  tone?: "netflix" | "spotify" | "adobe" | "notion" | "icloud" | "figma" | "custom" | string
  vampireScore?: number
  provider?: string
  providerSubscriptionId?: string | null
  latestCancellationTaskId?: string | null
  projectedAnnualSavings?: number | null
  proofScreenshotUrl?: string | null
}

export type VirtualCard = {
  id: string
  label?: string
  merchant?: string
  stripeCustomerId?: string
  paymentMethodId?: string
  cardBrand?: string // "visa" | "mastercard" | "amex"
  last4?: string
  testMode?: boolean
  spendingLimit: number
  balanceLocked?: boolean // alias for demoPolicyLocked
  demoPolicyLocked?: boolean // backend name
  status: "active" | "locked" | "burned" | string
  tone?: string
  cardNumberMasked?: string
  exp?: string
  cvv?: string
}

export type SimulateChargeResponse = {
  success: boolean
  status: "APPROVED" | "DECLINED"
  reason: string
  outcomeType: "blocked_by_demo_policy" | "succeeded" | "declined_by_stripe" | string
  stripePaymentIntentId?: string | null
  testMode: boolean
  amountBlocked: number
  timestamp: string
}

export type AgentStepEvent = {
  step: number
  total: number
  message: string
  timestamp: string
}

export type AgentCompletedEvent = {
  status: string
  subscriptionId: string
  provider: string
  providerRequestId: string
  providerStatus: string
  effectiveDate?: string | null
  message: string
  projectedAnnualSavings: number
  evidenceType?: string
}

export type CancelAgentResponse = {
  taskId: string
  status: string
  streamUrl: string
}

export type Page = "landing" | "login" | "signup" | "app"

export type User = {
  id: string
  email: string
  name: string
  createdAt?: string
  provider?: "password" | "google" | string
  avatar?: string | null
}

export type DashboardSection =
  | "Overview"
  | "Subscriptions"
  | "Cancellation history"
  | "Virtual cards shield"
