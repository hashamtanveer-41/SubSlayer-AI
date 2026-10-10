import type { Subscription } from "../types"

export const money = (n: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(
    n,
  )

export const monthly = (s: Subscription) =>
  s.cycle === "Yearly" ? s.price / 12 : s.price

export const annualSavings = (s: Subscription) =>
  s.cycle === "Yearly" ? s.price : s.price * 12

export const formatDate = (dateStr: string, options?: Intl.DateTimeFormatOptions) => {
  return new Date(`${dateStr}T12:00:00`).toLocaleDateString(
    "en-US",
    options || { month: "short", day: "numeric", year: "numeric" },
  )
}
