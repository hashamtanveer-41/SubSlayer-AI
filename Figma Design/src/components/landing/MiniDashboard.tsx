import { ArrowUpRight, ChevronDown } from "lucide-react"
import { seedSubscriptions } from "../../data/seedData"
import { money } from "../../utils/formatters"
import { ProviderIcon } from "../common/ProviderIcon"
import { SubSlayerLogo } from "../common/SubSlayerLogo"

export function MiniDashboard() {
  return (
    <div className="mini-dashboard">
      <div className="mini-header">
        <span className="mini-logo" style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <SubSlayerLogo size={20} />
          <span style={{ fontWeight: 700, letterSpacing: "-0.3px" }}>SubSlayer Overview</span>
        </span>
        <span className="mini-date">
          June 2026 <ChevronDown size={12} />
        </span>
      </div>
      <div className="mini-metrics">
        <div>
          <span className="mini-label">DETECTED SPEND</span>
          <strong>
            $111.46<span>/mo</span>
          </strong>
          <span className="mini-change">
            <ArrowUpRight size={12} /> 6 active subscriptions detected
          </span>
        </div>
        <div className="mini-savings">
          <span className="mini-label">POTENTIAL SAVINGS</span>
          <strong>
            $59.99<span>/mo</span>
          </strong>
          <span>One-click AI cancellation ready</span>
        </div>
      </div>
      <div className="mini-table-title">
        <strong>Your subscriptions</strong>
        <span>6 active</span>
      </div>
      {seedSubscriptions.slice(0, 3).map((s) => (
        <div className="mini-row" key={s.id}>
          <ProviderIcon sub={s} small />
          <div>
            <strong>{s.name}</strong>
            <span>{s.category}</span>
          </div>
          <strong>
            {money(s.price)}
            <small>/mo</small>
          </strong>
          <span className="mini-status">Active</span>
        </div>
      ))}
      <div className="mini-agent">
        <div>
          <strong>Automated cancellation available.</strong>
          <span>Cancel unwanted subscriptions with one click.</span>
        </div>
        <ArrowUpRight size={17} />
      </div>
    </div>
  )
}
