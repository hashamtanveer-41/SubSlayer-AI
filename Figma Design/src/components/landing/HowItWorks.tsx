import { ArrowUpRight, Check, CircleHelp, Plus, SlidersHorizontal, Sparkles, Wallet } from "lucide-react"
import type { DemoOverview } from "../../hooks/useDemoOverview"
import { monthly, money } from "../../utils/formatters"
import { ProviderIcon } from "../common/ProviderIcon"

export function HowItWorks({ overview }: { overview: DemoOverview }) {
  const active = overview.subscriptions.filter((sub) => sub.status === "Active")
  const supported = active.filter((sub) => ["netflix", "spotify", "canva", "adobe"].includes(sub.provider || ""))
  const potential = supported.reduce((total, sub) => total + monthly(sub) * 12, 0)
  const requested = overview.subscriptions.filter((sub) => sub.status !== "Active")
  return (
    <section className="how-section" id="how-it-works">
      <div className="section-heading">
        <div>
          <span className="eyebrow">ACTIVE AGENTIC INTERVENTION</span>
          <h2>
            From vampire drain
            <br />
            <span>to liberated cash in 3 steps.</span>
          </h2>
        </div>
        <p>
          Explore a connected demo without real provider accounts.
          <br />
          Four simulated provider APIs return clear outcomes.
        </p>
      </div>
      <div className="steps">
        <article className="step">
          <div className="step-top">
            <span>01 / DETECT</span>
            <Wallet size={22} />
          </div>
          <h3>Ingest & Uncover.</h3>
          <p>
            Review subscriptions loaded from the running demo gateway and inspect
            their recurring costs.
          </p>
          <div className="step-visual connect-visual">
            {active.slice(0, 4).map((s) => (
              <ProviderIcon key={s.id} sub={s} />
            ))}
            <span className="connect-plus">
              <Plus size={18} />
            </span>
          </div>
        </article>
        <article className="step">
          <div className="step-top">
            <span>02 / ANALYZE</span>
            <SlidersHorizontal size={22} />
          </div>
          <h3>Vampire Risk Scoring.</h3>
          <p>
            See annualized cost from the active provider plans and ask Qwen for
            a demo risk explanation.
          </p>
          <div className="step-visual discover-visual">
            <span>Supported active plans / year</span>
            <strong>
              {overview.updatedAt ? money(potential) : "—"} <ArrowUpRight size={22} />
            </strong>
          </div>
        </article>
        <article className="step">
          <div className="step-top">
            <span>03 / SLAY & SHIELD</span>
            <Sparkles size={22} />
          </div>
          <h3>Provider API Cancellation.</h3>
          <p>
            Confirm a request to the selected demo provider API and follow its
            response in the live status stream.
          </p>
          <div className="step-visual unloop-visual">
            <span className="agent-symbol">
              <Sparkles size={18} />
            </span>
            <div>
              <strong>{requested.length ? `${requested.length} provider request${requested.length === 1 ? "" : "s"} recorded` : "Awaiting first provider request"}</strong>
              <span>{requested.length ? "Status returned by the gateway." : "Open the dashboard to try it."}</span>
            </div>
            <Check size={18} />
          </div>
        </article>
      </div>
      <div className="demo-disclosure">
        <CircleHelp size={14} /> Hackathon demo uses simulated provider APIs,
        Qwen3.8 Flash analysis, and Stripe test-mode payments.
      </div>
    </section>
  )
}
