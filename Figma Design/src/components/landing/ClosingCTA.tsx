import { ArrowUpRight } from "lucide-react"
import type { Page } from "../../types"
import { Button } from "../ui/Button"

export interface ClosingCTAProps {
  navigate: (p: Page) => void
}

export function ClosingCTA({ navigate }: ClosingCTAProps) {
  return (
    <section className="closing-cta">
      <span className="eyebrow">TRY THE CONNECTED DEMO</span>
      <h2>Test provider cancellations and payment controls.</h2>
      <p>Use the four simulated provider APIs, Qwen analysis, and Stripe test mode.</p>
      <Button onClick={() => navigate("app")}>
        Launch SubSlayer AI <ArrowUpRight size={18} />
      </Button>
      <span className="cta-note">
        Built for the Hackathon · 100% Free & Open Demo
      </span>
      <span className="closing-star" aria-hidden="true">
        ✳
      </span>
    </section>
  )
}
