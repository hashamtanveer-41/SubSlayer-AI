import { useEffect, useState } from "react"
import {
  ArrowRight,
  Camera,
  Check,
  CircleCheck,
  LoaderCircle,
  ShieldCheck,
  Sparkles,
} from "lucide-react"
import type { Subscription } from "../../types"
import { annualSavings, money, monthly } from "../../utils/formatters"
import { ProviderIcon } from "../common/ProviderIcon"
import { Button } from "../ui/Button"
import { Dialog } from "../ui/Dialog"
import { LiveTerminal, type TerminalLog } from "./LiveTerminal"

export interface AgentExecutionModalProps {
  selected: Subscription | null
  onClose: () => void
  onSuccess: (sub: Subscription) => void
  onGoToHistory: () => void
}

const AGENT_STEPS = [
  "Injecting authenticated session & cookies",
  "Navigating to provider account billing settings",
  "Detecting & refusing retention discount modal",
  "Executing final cancellation confirmation",
]

export function AgentExecutionModal({
  selected,
  onClose,
  onSuccess,
  onGoToHistory,
}: AgentExecutionModalProps) {
  const [stage, setStage] = useState(-1)
  const [logs, setLogs] = useState<TerminalLog[]>([])
  const [showProofImage, setShowProofImage] = useState(false)

  // Reset state when a new subscription is selected
  useEffect(() => {
    if (selected) {
      setStage(-1)
      setLogs([])
      setShowProofImage(false)
    }
  }, [selected])

  // Stepper execution simulation
  useEffect(() => {
    if (stage < 0 || stage >= 4 || !selected) return

    const now = () =>
      new Date().toLocaleTimeString("en-US", {
        hour12: false,
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      })

    // Log the current stage
    if (stage === 0) {
      setLogs([
        {
          timestamp: now(),
          message: `Loaded target service credentials for ${selected.name}`,
          type: "info",
        },
        {
          timestamp: now(),
          message: "Pre-authenticated session cookies injected into headless browser.",
          type: "action",
        },
      ])
    } else if (stage === 1) {
      setLogs((prev) => [
        ...prev,
        {
          timestamp: now(),
          message: `Navigating to ${selected.name} billing portal...`,
          type: "info",
        },
        {
          timestamp: now(),
          message: "Billing management interface located successfully.",
          type: "action",
        },
      ])
    } else if (stage === 2) {
      setLogs((prev) => [
        ...prev,
        {
          timestamp: now(),
          message: "⚠️ Retention modal detected: 'Stay now for 50% discount'.",
          type: "warn",
        },
        {
          timestamp: now(),
          message: "Vision-LLM reasoning: Declining offer, selecting 'Cancel Anyway'.",
          type: "action",
        },
      ])
    } else if (stage === 3) {
      setLogs((prev) => [
        ...prev,
        {
          timestamp: now(),
          message: "Submitting final cancellation request...",
          type: "info",
        },
        {
          timestamp: now(),
          message: "Confirmed: Subscription status is now CANCELLED.",
          type: "success",
        },
        {
          timestamp: now(),
          message: "Capturing final verification DOM screenshot proof.",
          type: "success",
        },
      ])
    }

    const timer = window.setTimeout(() => {
      if (stage === 3) {
        onSuccess(selected)
      }
      setStage((prev) => prev + 1)
    }, 1100)

    return () => window.clearTimeout(timer)
  }, [stage, selected, onSuccess])

  if (!selected) return null

  return (
    <Dialog
      open={!!selected}
      onOpenChange={(open) => {
        if (!open) onClose()
      }}
      title={
        stage === 4
          ? "Subscription Slayed!"
          : stage >= 0
            ? "Autonomous Agent In Action..."
            : "Authorize AI Cancellation"
      }
      description={
        stage === 4
          ? "The autonomous agent completed the cancellation and captured proof."
          : stage >= 0
            ? "Headless browser session is bypassing dark patterns and executing cancellation."
            : "Review potential savings and authorize SubSlayer AI to act on your behalf."
      }
    >
      <div className="cancel-dialog">
        <div className="cancel-sub">
          <ProviderIcon sub={selected} />
          <div>
            <strong>{selected.name}</strong>
            <span>
              {money(selected.price)} /{" "}
              {selected.cycle === "Monthly" ? "month" : "year"}
            </span>
          </div>
          <span className="category-tag">{selected.category}</span>
        </div>

        {stage === -1 ? (
          <>
            <div className="cancel-savings">
              <span>Your Projected Annual Savings</span>
              <strong>{money(annualSavings(selected))}</strong>
            </div>
            <p>
              SubSlayer's autonomous browser agent will log in via your pre-authenticated session,
              navigate through {selected.name}'s retention flow, reject discount popups,
              and submit the cancellation.
            </p>
            <div className="permission-note">
              <ShieldCheck size={18} />
              By continuing, you grant one-time authorization for the SubSlayer AI agent.
            </div>
            <Button
              className="full-width"
              onClick={() => setStage(0)}
              style={{ gap: "8px" }}
            >
              <Sparkles size={17} />
              Deploy AI Agent to Cancel
            </Button>
            <Button
              variant="ghost"
              className="full-width"
              onClick={onClose}
            >
              Keep this subscription
            </Button>
          </>
        ) : (
          <>
            <div className="agent-timeline">
              {AGENT_STEPS.map((step, i) => (
                <div
                  key={step}
                  className={
                    stage > i ? "complete" : stage === i ? "running" : ""
                  }
                >
                  <span>
                    {stage > i ? (
                      <Check size={16} />
                    ) : stage === i ? (
                      <LoaderCircle className="spinning" size={16} />
                    ) : (
                      i + 1
                    )}
                  </span>
                  <div>
                    <strong>{step}</strong>
                    <small>
                      {stage > i
                        ? "Completed successfully"
                        : stage === i
                          ? "Executing step..."
                          : "Pending"}
                    </small>
                  </div>
                </div>
              ))}
            </div>

            {/* Live streaming terminal logs */}
            <LiveTerminal logs={logs} />

            {stage === 4 && (
              <div style={{ marginTop: "18px" }}>
                <div className="success-note">
                  <CircleCheck size={20} />
                  <span>
                    {selected.name} subscription successfully cancelled!
                    <br />
                    <strong>
                      +{money(monthly(selected))}/month (+{money(annualSavings(selected))}/yr) back in your pocket.
                    </strong>
                  </span>
                </div>

                <div style={{ display: "flex", gap: "10px", marginBottom: "12px" }}>
                  <Button
                    variant="secondary"
                    className="full-width"
                    onClick={() => setShowProofImage(!showProofImage)}
                    style={{ gap: "6px" }}
                  >
                    <Camera size={15} />
                    {showProofImage ? "Hide DOM Proof" : "View Proof Screenshot"}
                  </Button>
                  <Button
                    className="full-width"
                    onClick={() => {
                      onClose()
                      onGoToHistory()
                    }}
                  >
                    View History <ArrowRight size={16} />
                  </Button>
                </div>

                {showProofImage && (
                  <div
                    style={{
                      border: "1px solid #d8cbdc",
                      borderRadius: "8px",
                      overflow: "hidden",
                      background: "#2a222e",
                      padding: "10px",
                      marginTop: "10px",
                      textAlign: "center",
                    }}
                  >
                    <div
                      style={{
                        fontSize: "10px",
                        color: "#cbbcd0",
                        marginBottom: "6px",
                        display: "flex",
                        justifyContent: "space-between",
                      }}
                    >
                      <span>DOM Verification Capture</span>
                      <span>Target: {selected.name}</span>
                    </div>
                    <div
                      style={{
                        background: "#fff",
                        color: "#302b32",
                        padding: "20px",
                        borderRadius: "6px",
                        textAlign: "center",
                      }}
                    >
                      <CircleCheck size={32} color="#15803d" style={{ margin: "0 auto 8px" }} />
                      <strong style={{ display: "block", fontSize: "14px" }}>
                        Subscription Cancelled Successfully
                      </strong>
                      <p style={{ fontSize: "11px", color: "#666", marginTop: "4px" }}>
                        Your {selected.name} plan has ended. You will not be billed again.
                      </p>
                      <small style={{ fontSize: "9px", color: "#999", display: "block", marginTop: "8px" }}>
                        Timestamp: {new Date().toISOString()} · Captured by SubSlayer AI
                      </small>
                    </div>
                  </div>
                )}
              </div>
            )}

            {stage < 4 && (
              <p className="simulation-note" style={{ marginTop: "12px" }}>
                Closing this window halts the active browser agent session.
              </p>
            )}
          </>
        )}
      </div>
    </Dialog>
  )
}
