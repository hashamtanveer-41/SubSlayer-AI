import { ArrowUpRight, Sparkles } from "lucide-react"
import type { DemoOverview } from "../../hooks/useDemoOverview"
import { money, monthly } from "../../utils/formatters"
import { ProviderIcon } from "../common/ProviderIcon"
import { SubSlayerLogo } from "../common/SubSlayerLogo"

export function MiniDashboard({ overview }: { overview: DemoOverview }) {
  const active = overview.subscriptions.filter((sub) => sub.status === "Active")
  const billable = overview.subscriptions.filter((sub) => sub.status !== "Cancelled")
  const cancelled = overview.subscriptions.filter((sub) => sub.status === "Cancelled")
  const spend = billable.reduce((total, sub) => total + monthly(sub), 0)
  const saved = cancelled.reduce((total, sub) => total + monthly(sub), 0)
  const status = overview.connected ? "Live gateway data" : overview.updatedAt ? "Last known gateway data" : "Connecting to gateway"
  return (
    <div className="mini-dashboard">
      <div className="mini-header">
        <span className="mini-logo" style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <SubSlayerLogo size={20} />
          <span style={{ fontWeight: 700, letterSpacing: "-0.3px" }}>SubSlayer Overview</span>
        </span>
        <span className="mini-date">
          {new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" })}
        </span>
      </div>
      <div className="mini-metrics">
        <div>
          <span className="mini-label">DETECTED SPEND</span>
          <strong>
            {overview.updatedAt ? money(spend) : "—"}<span>/mo</span>
          </strong>
          <span className="mini-change">
            <ArrowUpRight size={12} /> {overview.updatedAt ? `${active.length} active subscriptions` : status}
          </span>
        </div>
        <div className="mini-savings">
          <span className="mini-label">CANCELLED DEMO SPEND</span>
          <strong>
            {overview.updatedAt ? money(saved) : "—"}<span>/mo</span>
          </strong>
          <span>{status}</span>
        </div>
      </div>
      <div className="mini-table-title">
        <strong>Your subscriptions</strong>
        <span>{overview.updatedAt ? `${active.length} active` : "Loading"}</span>
      </div>
      {billable.slice(0, 3).map((s) => (
        <div className="mini-row" key={s.id}>
          <ProviderIcon sub={s} small />
          <div>
            <strong>{s.name}</strong>
            <span>{s.category}</span>
          </div>
          <strong>
            {money(s.price)}
            <small>/{s.cycle === "Yearly" ? "yr" : "mo"}</small>
          </strong>
          <span className="mini-status">{s.status === "Active" ? "Active" : "Pending"}</span>
        </div>
      ))}
      <div className="mini-agent">
        <span className="agent-symbol">
          <Sparkles size={15} />
        </span>
        <div>
          <strong>{overview.onlineProviders} of 4 provider APIs reachable</strong>
          <span>Cancellation requests require confirmation.</span>
        </div>
        <ArrowUpRight size={17} />
      </div>
    </div>
  )
}
