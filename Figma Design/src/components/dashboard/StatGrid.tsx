import { CreditCard, Sparkles, Wallet } from "lucide-react"
import type { Subscription } from "../../types"
import { money } from "../../utils/formatters"
import { ProviderIcon } from "../common/ProviderIcon"

export interface StatGridProps {
  spend: number
  savings: number
  active: Subscription[]
  cancelled: Subscription[]
}

export function StatGrid({ spend, savings, active, cancelled }: StatGridProps) {
  return (
    <div className="stat-grid">
      <article className="stat-card">
        <div>
          <span>Detected Monthly Spend</span>
          <Wallet size={18} />
        </div>
        <strong>
          {money(spend)}
          <small>/mo</small>
        </strong>
        <span className="stat-note">
          Annualized cost: {money(spend * 12)}/year
        </span>
        <div className="stat-mini-bars">
          {[35, 48, 38, 63, 52, 72, 63, 88, 78, 90, 72, 62].map(
            (height, i) => (
              <i key={i} style={{ height: `${height}%` }} />
            ),
          )}
        </div>
      </article>

      <article className="stat-card">
        <div>
          <span>Active Subscriptions</span>
          <CreditCard size={18} />
        </div>
        <strong>
          {active.length.toString().padStart(2, "0")}
          <small>recurring services</small>
        </strong>
        <div className="stat-provider-icons">
          {active.slice(0, 5).map((s) => (
            <ProviderIcon key={s.id} sub={s} small />
          ))}
          {active.length > 5 && <span>+{active.length - 5}</span>}
        </div>
        <span className="stat-note">
          {active.some((s) => (s.vampireScore || 0) > 70)
            ? "⚠️ High vampire-score subscriptions detected"
            : "Review supported demo providers"}
        </span>
      </article>

      <article className="stat-card savings-card">
        <div>
        <span>Demo Cancellation Savings</span>
          <Sparkles size={18} />
        </div>
        <strong>
          {money(savings)}
          <small>/mo</small>
        </strong>
        <span className="stat-note">
          {cancelled.length
            ? `${money(savings * 12)} in projected annualized savings`
            : "Request a demo provider cancellation to see projected savings"}
        </span>
        <span className="savings-decoration">↗</span>
      </article>
    </div>
  )
}
