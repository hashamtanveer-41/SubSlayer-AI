import { ArrowUpRight, Sparkles, TrendingDown, ShieldAlert } from "lucide-react"
import type { Subscription } from "../../types"
import type { AiAnalysisResult } from "../../services/api"
import { monthly } from "../../utils/formatters"
import { Button } from "../ui/Button"

export interface InsightBannerProps {
  active: Subscription[]
  onOpenCancel: (sub: Subscription) => void
  onAnalyze?: (sub: Subscription) => void
  analyzing?: boolean
  insight?: AiAnalysisResult | null
}

export function InsightBanner({
  active,
  onOpenCancel,
  onAnalyze,
  analyzing = false,
  insight,
}: InsightBannerProps) {
  const topSub = active.length
    ? [...active].sort((a, b) => monthly(b) - monthly(a))[0]
    : null

  return (
    <div className="insight-banner">
      <span className="agent-symbol">
        <Sparkles size={22} />
      </span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
          <strong>Vampire Subscription Alert.</strong>
          {topSub?.vampireScore && (
            <span
              style={{
                fontSize: "11px",
                fontWeight: 750,
                padding: "2px 7px",
                borderRadius: "12px",
                background:
                  topSub.vampireScore > 75
                    ? "#fee2e2"
                    : topSub.vampireScore > 40
                      ? "#fef3c7"
                      : "#dcfce7",
                color:
                  topSub.vampireScore > 75
                    ? "#991b1b"
                    : topSub.vampireScore > 40
                      ? "#92400e"
                      : "#166534",
              }}
            >
              Vampire Risk {topSub.vampireScore}/100
            </span>
          )}
        </div>
        <p style={{ margin: "4px 0 0" }}>
          {topSub
            ? `${topSub.name} ($${topSub.price}/${topSub.cycle.toLowerCase()}) is your largest recurring cost. Request an AI analysis to calculate vampire waste or deploy the autonomous cancellation agent.`
            : "All detected vampire subscriptions have been slayed. Add a subscription whenever you need."}
        </p>

        {/* Live AI Analysis Insight Card */}
        {insight && (
          <div
            style={{
              marginTop: "12px",
              padding: "10px 14px",
              borderRadius: "10px",
              background: "rgba(255, 255, 255, 0.9)",
              border: "1px solid #ebddee",
              boxShadow: "0 2px 8px rgba(92, 52, 103, 0.08)",
              display: "flex",
              flexDirection: "column",
              gap: "6px",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "10px" }}>
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "5px",
                  fontSize: "12px",
                  fontWeight: 750,
                  color: "var(--accent, #704b73)",
                }}
              >
                <Sparkles size={13} />
                Qwen AI Risk Intelligence ({insight.riskScore}/100 Risk)
              </span>
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "4px",
                  fontSize: "11.5px",
                  fontWeight: 700,
                  color: "#16a34a",
                }}
              >
                <TrendingDown size={13} />
                +${insight.annualSavingsDollars.toFixed(2)}/yr savings
              </span>
            </div>
            <p
              style={{
                margin: 0,
                fontSize: "12.5px",
                lineHeight: "1.45",
                color: "var(--color-ink, #19141c)",
                fontWeight: 550,
              }}
            >
              {insight.reason}
            </p>
          </div>
        )}
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
        {onAnalyze && topSub && (
          <Button
            variant="secondary"
            loading={analyzing}
            loadingText="Analyzing with AI..."
            disabled={analyzing}
            onClick={() => onAnalyze(topSub)}
            style={{ fontWeight: 700, fontSize: "13px", gap: "6px" }}
          >
            <Sparkles size={14} /> Analyze with AI
          </Button>
        )}
        <Button
          variant="secondary"
          disabled={!topSub}
          onClick={() => topSub && onOpenCancel(topSub)}
          style={{ fontWeight: 700, fontSize: "13px" }}
        >
          Auto-Cancel with AI <ArrowUpRight size={16} />
        </Button>
      </div>
    </div>
  )
}
