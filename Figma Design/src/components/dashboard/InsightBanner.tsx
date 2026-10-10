import { ArrowUpRight, Sparkles } from "lucide-react"
import type { Subscription } from "../../types"
import { monthly } from "../../utils/formatters"
import { Button } from "../ui/Button"

export interface InsightBannerProps {
  active: Subscription[]
  onOpenCancel: (sub: Subscription) => void
}

export function InsightBanner({ active, onOpenCancel }: InsightBannerProps) {
  const topSub = active.length
    ? [...active].sort((a, b) => monthly(b) - monthly(a))[0]
    : null

  return (
    <div className="insight-banner">
      <span className="agent-symbol">
        <Sparkles size={22} />
      </span>
      <div>
        <strong>Vampire Subscription Alert.</strong>
        <p>
          {topSub
            ? `${topSub.name} ($${topSub.price}/${topSub.cycle.toLowerCase()}) is your largest recurring cost. SubSlayer agent is primed to cancel it autonomously.`
            : "All detected vampire subscriptions have been slayed. Add a subscription whenever you need."}
        </p>
      </div>
      <Button
        variant="secondary"
        disabled={!topSub}
        onClick={() => topSub && onOpenCancel(topSub)}
      >
        Auto-Cancel with AI <ArrowUpRight size={16} />
      </Button>
    </div>
  )
}
