import { ArrowUpRight, ShieldCheck, Zap } from "lucide-react"
import type { Page } from "../../types"
import { SubSlayerLogo } from "../common/SubSlayerLogo"
import { Button } from "../ui/Button"

export interface FeatureStatementProps {
  navigate: (p: Page) => void
}

export function FeatureStatement({ navigate }: FeatureStatementProps) {
  return (
    <section className="statement-section" id="features">
      <div className="statement-art" style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", position: "relative" }}>
        <SubSlayerLogo size={180} glow />
        <span className="art-note">
          Keep your money
          <br />
          <em>where it belongs.</em>
        </span>
        <span className="art-star">✳</span>
      </div>
      <div className="statement-copy">
        <span className="eyebrow">
          ACTIVE EXECUTION. NOT PASSIVE TRACKING.
        </span>
        <h2>
          Rocket Money tells you.
          <br />
          SubSlayer
          <br />
          <span>actually slays it.</span>
        </h2>
        <p>
          Passive trackers leave the painful cancellation chore in your lap. SubSlayer
          employs autonomous Vision-LLM browser agents to log in, evade retention popups,
          and finish the cancellation so you never have to deal with deceptive UI again.
        </p>
        <div className="benefit">
          <ShieldCheck size={19} />
          <div>
            <strong>Explicit Authorization Guardrails.</strong>
            <span>The AI only executes when you trigger it. Zero unauthorized cancellations.</span>
          </div>
        </div>
        <div className="benefit">
          <Zap size={19} />
          <div>
            <strong>The Privacy.com Virtual Card Shield.</strong>
            <span>
              For gyms and stubborn providers that make online cancellation impossible,
              our $0 Balance virtual cards block unauthorized recurring charges before
              they ever touch your bank account.
            </span>
          </div>
        </div>
        <Button variant="secondary" onClick={() => navigate("app")}>
          Explore the Dashboard <ArrowUpRight size={17} />
        </Button>
      </div>
    </section>
  )
}
