import { ArrowUpRight, Check, CircleCheck, Play, ShieldCheck } from "lucide-react"
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
        <h1>
          Your subscriptions.
          <br />
          Your money.
          <br />
          <span>Slayed on command.</span>
        </h1>
        <p>
          Connect your accounts to detect recurring charges, identify forgotten subscriptions,
          <br className="desktop-break" /> and let an AI browser agent cancel them for you in seconds.
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
          <ShieldCheck size={15} /> Zero passwords stored. Live proof screenshots provided.
        </div>
      </div>
      <div className="hero-visual">
        <div className="orbit orbit-one" />
        <div className="orbit orbit-two" />
        <div className="floating-tag top-tag">
          <span className="tag-icon">
            <CircleCheck size={16} />
          </span>{" "}
          Zero dark patterns tolerated.
        </div>
        <MiniDashboard />
        <div className="cancel-float">
          <span className="cancel-float-icon">
            <Check size={20} />
          </span>
          <div>
            <strong>Consider it slayed.</strong>
            <span>Adobe CC subscription cancelled by AI</span>
          </div>
          <span className="float-saving">
            +$59.99<span>/month back</span>
          </span>
        </div>
      </div>
    </section>
  )
}
