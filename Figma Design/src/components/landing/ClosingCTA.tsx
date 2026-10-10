import { ArrowUpRight } from "lucide-react"
import type { Page } from "../../types"
import { Button } from "../ui/Button"

export interface ClosingCTAProps {
  navigate: (p: Page) => void
}

export function ClosingCTA({ navigate }: ClosingCTAProps) {
  return (
    <section className="closing-cta">
      <span className="eyebrow">RECLAIM YOUR CASH TODAY</span>
      <h2>Stop letting auto-pay drain your account.</h2>
      <p>Let your autonomous AI assistant handle the cancellation friction for you.</p>
      <Button onClick={() => navigate("signup")}>
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
