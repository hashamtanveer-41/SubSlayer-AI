import { ShieldCheck } from "lucide-react"
import type { Page } from "../../types"
import { Brand } from "../common/Brand"
import { MiniDashboard } from "../landing/MiniDashboard"

export interface AuthStoryProps {
  navigate: (p: Page) => void
}

export function AuthStory({ navigate }: AuthStoryProps) {
  return (
    <div className="auth-story">
      <Brand onClick={() => navigate("landing")} />
      <div>
        <span className="eyebrow">YOUR WEAPON AGAINST VAMPIRE SUBSCRIPTIONS</span>
        <h1>
          Less auto-pay.
          <br />
          <span>More financial peace.</span>
        </h1>
        <p>
          Gain 100% visibility over recurring charges.
          <br />
          And let AI do the tedious cancellation work.
        </p>
        <MiniDashboard />
      </div>
      <span className="auth-bottom">
        <ShieldCheck size={16} /> Autonomous execution with zero stored passwords.
      </span>
    </div>
  )
}
