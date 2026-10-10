import { ArrowUpRight, CheckCircle2, Lock, ShieldCheck, Zap } from "lucide-react"
import type { Page } from "../../types"
import { Button } from "../ui/Button"
import { DimensionalShield3D } from "./DimensionalShield3D"
import { DimensionalSlashedCard3D } from "./DimensionalSlashedCard3D"

export interface FeatureStatementProps {
  navigate: (p: Page) => void
}

export function FeatureStatement({ navigate }: FeatureStatementProps) {
  return (
    <section className="features-showcase" id="features">
      {/* 1. Autonomous AI Cancellation Section */}
      <div className="statement-section">
        <div className="statement-art">
          <DimensionalSlashedCard3D />
          <span className="art-note">
            Keep your money
            <br />
            <em>where it belongs.</em>
          </span>
          <span className="art-star">✳</span>
        </div>
        <div className="statement-copy">
          <span className="eyebrow">
            AUTONOMOUS AGENT EXECUTION
          </span>
          <h2>
            Traditional apps just track.
            <br />
            SubSlayer
            <br />
            <span>takes action.</span>
          </h2>
          <p>
            Passive trackers leave the painful cancellation chore in your lap. SubSlayer
            employs autonomous Vision-LLM browser agents to log in, evade retention popups,
            and complete the cancellation so you never have to deal with deceptive UI again.
          </p>
          <div className="benefit">
            <CheckCircle2 size={19} />
            <div>
              <strong>Zero Retention Maze Tolerance.</strong>
              <span>The agent navigates hidden cancel buttons and declines multi-step retention discount bribes.</span>
            </div>
          </div>
          <div className="benefit">
            <ShieldCheck size={19} />
            <div>
              <strong>Photographic DOM Verification.</strong>
              <span>Captures watermarked screenshot proof and confirmation codes for your financial records.</span>
            </div>
          </div>
          <Button variant="secondary" onClick={() => navigate("app")}>
            Slay My Subscriptions <ArrowUpRight size={17} />
          </Button>
        </div>
      </div>

      {/* 2. Virtual Card Payment Shield Section (Alternating layout) */}
      <div className="statement-section statement-reversed" style={{ marginTop: "30px" }}>
        <div className="statement-copy">
          <span className="eyebrow">
            FINANCIAL DEFENSE AT THE SOURCE
          </span>
          <h2>
            Merchants refuse to cancel?
            <br />
            SubSlayer freezes
            <br />
            <span>the payment cold.</span>
          </h2>
          <p>
            When fitness clubs, telecom carriers, or stubborn services force you through
            phone queues or certified mail, SubSlayer gives you on-demand virtual cards.
            Toggle your spending limit to $0.00 at any time to block renewal attempts.
          </p>
          <div className="benefit">
            <Lock size={19} />
            <div>
              <strong>$0.00 Spending Limit Lockdown.</strong>
              <span>Transactions are declined at the network level before ever touching your real bank balance.</span>
            </div>
          </div>
          <div className="benefit">
            <Zap size={19} />
            <div>
              <strong>Single-Merchant Card Isolation.</strong>
              <span>Each recurring service gets its own unique card number. Your primary bank account stays 100% hidden.</span>
            </div>
          </div>
          <Button variant="secondary" onClick={() => navigate("app")}>
            Explore Virtual Shield <ArrowUpRight size={17} />
          </Button>
        </div>
        <div className="statement-art">
          <DimensionalShield3D />
          <span className="art-note">
            Defend your cash
            <br />
            <em>before it's billed.</em>
          </span>
          <span className="art-star">✳</span>
        </div>
      </div>
    </section>
  )
}
