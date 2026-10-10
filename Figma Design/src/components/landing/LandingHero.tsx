import { ArrowUpRight, Check, CircleCheck, Play, ShieldCheck, Sparkles } from "lucide-react"
import type { Page } from "../../types"
import { Button } from "../ui/Button"
import { MiniDashboard } from "./MiniDashboard"

export interface LandingHeroProps {
  navigate: (p: Page) => void
}

export function LandingHero({ navigate }: LandingHeroProps) {
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
          The average consumer leaks $219/month on auto-renewing trials and hidden fees.
          <br className="desktop-break" /> SubSlayer detects your vampire subscriptions,
          shows recurring costs,
          <br className="desktop-break" /> and sends confirmed requests to four demo provider APIs.
        </p>
        <div className="hero-actions">
          <Button onClick={() => navigate("signup")}>
            Slay My Subscriptions <ArrowUpRight size={18} />
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
          Four connected demo providers.
        </div>
        <MiniDashboard />
        <div className="cancel-float">
          <span className="cancel-float-icon">
            <Check size={20} />
          </span>
          <div>
            <strong>Consider it slayed.</strong>
            <span>Adobe demo provider response received</span>
          </div>
          <span className="float-saving">
            +$59.99<span>/month back</span>
          </span>
        </div>
        <div className="visual-caption">
          <span className="caption-line" /> Connected subscription and payment demo.
        </div>
      </div>
    </section>
  )
}
