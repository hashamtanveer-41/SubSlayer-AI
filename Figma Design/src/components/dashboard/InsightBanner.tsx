import { ArrowUpRight, Sparkles } from "lucide-react"
import type { Subscription } from "../../types"
import { monthly } from "../../utils/formatters"
import { Button } from "../ui/Button"

export interface InsightBannerProps {
  active: Subscription[]
  onOpenCancel: (sub: Subscription) => void
  onAnalyze: (sub: Subscription) => void
  analyzing: boolean
  backendReady: boolean
  insight: string
}

export function InsightBanner({ active, onOpenCancel, onAnalyze, analyzing, backendReady, insight }: InsightBannerProps) {
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
            ? `${topSub.name} ($${topSub.price}/${topSub.cycle.toLowerCase()}) is the largest supported recurring cost. Request a Qwen demo analysis or contact its provider API.`
            : "No active supported demo subscriptions are available."}
        </p>
        {insight && <p role="status" style={{ whiteSpace: "pre-wrap", marginTop: 8 }}>Qwen demo analysis: {insight}</p>}
      </div>
      <Button variant="secondary" disabled={!topSub || !backendReady || analyzing}
        onClick={() => topSub && onAnalyze(topSub)}>
        {analyzing ? "Analyzing..." : "Analyze with Qwen"}
      </Button>
      <Button
        variant="secondary"
        disabled={!topSub || !backendReady}
        onClick={() => topSub && onOpenCancel(topSub)}
      >
        Request cancellation <ArrowUpRight size={16} />
      </Button>
    </div>
  )
}
