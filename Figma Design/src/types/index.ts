export type Subscription = {
  id: string
  name: string
  category: "Entertainment" | "Productivity" | "Storage" | "Other" | string
  price: number
  cycle: "Monthly" | "Yearly"
  renewal: string
  status: "Active" | "Cancelled"
  mark: string
  tone: "netflix" | "spotify" | "adobe" | "notion" | "icloud" | "figma" | "custom" | string
  vampireScore?: number
  proofScreenshotUrl?: string | null
}

export type VirtualCard = {
  id: string
  merchant: string
  cardNumberMasked: string
  exp: string
  cvv: string
  spendingLimit: number
  balanceLocked: boolean // If true, card balance is locked to $0.00 (Zero-Out Shield)
  status: "Active" | "Locked" | "Burned"
  tone?: string
}

export type SimulatedTransaction = {
  id: string
  cardId: string
  merchant: string
  amount: number
  status: "APPROVED" | "DECLINED"
  reason: string
  timestamp: string
}

export type Page = "landing" | "login" | "signup" | "app"

export type DashboardSection =
  | "Overview"
  | "Subscriptions"
  | "Cancellation history"
  | "Virtual cards shield"
