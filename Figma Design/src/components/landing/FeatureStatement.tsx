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
          This demo sends cancellation requests to four simulated provider APIs and
          displays their returned status and receipt. No real platform account changes.
        </p>
        <div className="benefit">
          <ShieldCheck size={19} />
          <div>
            <strong>Explicit Authorization.</strong>
            <span>Each demo cancellation requires your confirmation.</span>
          </div>
        </div>
        <div className="benefit" id="virtual-cards">
          <Zap size={19} />
          <div>
            <strong>Stripe Test Payment Shield.</strong>
            <span>
              Lock a demo payment policy to block a test charge, or unlock it to see
              the separate customer demo wallet decrease after a Stripe test payment.
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
