import { ArrowUpRight, Check, CircleCheck, Play, ShieldCheck, Sparkles } from "lucide-react"
import type { Page } from "../../types"
import type { DemoOverview } from "../../hooks/useDemoOverview"
import { money, monthly } from "../../utils/formatters"
import { Button } from "../ui/Button"
import { MiniDashboard } from "./MiniDashboard"

export interface LandingHeroProps {
  navigate: (p: Page) => void
  overview: DemoOverview
}

export function LandingHero({ navigate, overview }: LandingHeroProps) {
  const cancelled = overview.subscriptions.filter((sub) => sub.status === "Cancelled")
  const savings = cancelled.reduce((total, sub) => total + monthly(sub), 0)
  return (
    <section className="hero">
      <div className="hero-copy">
        <div className="eyebrow">
          <span className="tiny-star">
            <Sparkles size={13} />
          </span>{" "}
          AUTONOMOUS AI SUBSCRIPTION ASSASSIN
        </div>
        <h1>
          Your subscriptions.
          <br />
          Your money.
          <br />
          <span>Slayed on command.</span>
          <span className="hero-asterisk" aria-hidden="true" style={{ color: "var(--accent)", fontSize: "40px" }}>
            *
          </span>
        </h1>
        <p>
          Inspect recurring costs from the live demo gateway, request Qwen analysis,
          and send confirmed cancellation requests to four separate provider simulators.
        </p>
        <div className="hero-actions">
          <Button onClick={() => navigate("app")}>
            Open Live Dashboard <ArrowUpRight size={18} />
          </Button>
          <Button variant="ghost" onClick={() => navigate("app")}>
            <span className="play-circle">
              <Play size={12} fill="currentColor" />
            </span>{" "}
            Explore Live Demo
          </Button>
        </div>
        <div className="hero-assurance">
          <ShieldCheck size={15} /> Demo APIs only. Provider receipts show simulated outcomes.
        </div>
      </div>
      <div className="hero-visual">
        <div className="orbit orbit-one" />
        <div className="orbit orbit-two" />
        <div className="floating-tag top-tag">
          <span className="tag-icon">
            <CircleCheck size={16} />
          </span>{" "}
          {overview.onlineProviders} of 4 demo providers connected.
        </div>
        <MiniDashboard overview={overview} />
        <div className="cancel-float">
          <span className="cancel-float-icon">
            <Check size={20} />
          </span>
          <div>
            <strong>{cancelled.length ? `${cancelled.length} demo cancellation${cancelled.length === 1 ? "" : "s"} recorded` : "Provider requests are ready"}</strong>
            <span>{overview.connected ? "Status comes from the gateway" : "Waiting for the gateway"}</span>
          </div>
          <span className="float-saving">
            {overview.updatedAt ? money(savings) : "—"}<span>/month projected</span>
          </span>
        </div>
        <div className="visual-caption">
          <span className="caption-line" /> Connected subscription and payment demo.
        </div>
      </div>
    </section>
  )
}
