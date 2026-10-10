import { useEffect, useRef, useState } from "react"
import { ArrowRight, CircleCheck, LoaderCircle, ShieldCheck, Sparkles } from "lucide-react"
import {
  getCancellationTaskApi,
  startCancellationAgentApi,
  subscribeToAgentStream,
} from "../../services/api"
import type { AgentCompletedEvent, Subscription } from "../../types"
import { annualSavings, money } from "../../utils/formatters"
import { ProviderIcon } from "../common/ProviderIcon"
import { Button } from "../ui/Button"
import { Dialog } from "../ui/Dialog"
import { LiveTerminal, type TerminalLog } from "./LiveTerminal"

export interface AgentExecutionModalProps {
  selected: Subscription | null
  onClose: () => void
  onResult: (sub: Subscription, event: AgentCompletedEvent) => void
  onFailure?: () => void
  onGoToHistory: () => void
}

const steps = [
  "Validate the demo subscription",
  "Send the cancellation request to the provider API",
  "Read the provider response",
  "Record the provider receipt and status",
]

export function AgentExecutionModal({
  selected,
  onClose,
  onResult,
  onFailure,
  onGoToHistory,
}: AgentExecutionModalProps) {
  const [phase, setPhase] = useState<"idle" | "running" | "completed" | "error">("idle")
  const [step, setStep] = useState(0)
  const [logs, setLogs] = useState<TerminalLog[]>([])
  const [error, setError] = useState("")
  const [receipt, setReceipt] = useState<AgentCompletedEvent | null>(null)
  const stopStream = useRef<(() => void) | null>(null)
  const attemptKey = useRef("")

  useEffect(() => {
    stopStream.current?.()
    stopStream.current = null
    setPhase("idle")
    setStep(0)
    setLogs([])
    setReceipt(null)
    setError("")
    attemptKey.current = ""
    return () => stopStream.current?.()
  }, [selected?.id])

  function finish(sub: Subscription, event: AgentCompletedEvent) {
    setReceipt(event)
    setPhase("completed")
    setStep(4)
    setLogs((current) => [...current, {
      timestamp: new Date().toLocaleTimeString(),
      message: `${event.providerStatus}: ${event.providerRequestId}`,
      type: event.status === "success" ? "success" : "warn",
    }])
    onResult(sub, event)
  }

  async function launch() {
    if (!selected || phase === "running") return
    setPhase("running")
    setError("")
    if (!attemptKey.current) attemptKey.current = `cancel_${crypto.randomUUID()}`
    try {
      const queued = await startCancellationAgentApi(selected.id, selected.provider || "generic", attemptKey.current)
      setLogs([{ timestamp: new Date().toLocaleTimeString(),
        message: `Task ${queued.taskId} queued for ${selected.provider} demo API.`, type: "action" }])
      stopStream.current = subscribeToAgentStream(queued.taskId, {
        onStep: (event) => {
          setStep(event.step)
          setLogs((current) => [...current, {
            timestamp: event.timestamp,
            message: event.message,
            type: "info",
          }])
        },
        onComplete: (event) => finish(selected, event),
        onError: async (message) => {
          try {
            const task = await getCancellationTaskApi(queued.taskId)
            if (task.result) {
              finish(selected, task.result)
              return
            }
          } catch {
            // Keep the stream error visible if task recovery also fails.
          }
          setError(message)
          setPhase("error")
          onFailure?.()
        },
      })
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Backend unavailable")
      setPhase("error")
      onFailure?.()
    }
  }

  if (!selected) return null
  const pending = receipt?.status === "pending"

  return (
    <Dialog
      open={!!selected}
      onOpenChange={(open) => { if (!open && phase !== "running") onClose() }}
      title={phase === "completed" ? (pending ? "Cancellation pending" : "Cancellation confirmed")
        : phase === "running" ? "Contacting provider demo API" : "Request demo cancellation"}
      description={phase === "completed"
        ? "The result below is the response from the demo provider API."
        : "Review the subscription and authorize one cancellation request."}
    >
      <div className="cancel-dialog">
        <div className="cancel-sub">
          <ProviderIcon sub={selected} />
          <div><strong>{selected.name}</strong><span>{money(selected.price)} / {selected.cycle.toLowerCase()}</span></div>
          <span className="category-tag">{selected.category}</span>
        </div>

        {phase === "idle" && (
          <>
            <div className="cancel-savings">
              <span>Projected annual savings after cancellation</span>
              <strong>{money(annualSavings(selected))}</strong>
            </div>
            <p>This demo sends a request to the {selected.provider} simulator. It does not change a real platform account.</p>
            <div className="permission-note"><ShieldCheck size={18} /> Authorize this demo API request.</div>
            <Button className="full-width" onClick={launch}><Sparkles size={17} /> Request cancellation</Button>
            <Button variant="ghost" className="full-width" onClick={onClose}>Keep this subscription</Button>
          </>
        )}

        {phase !== "idle" && (
          <>
            <div className="agent-timeline">
              {steps.map((label, index) => (
                <div key={label} className={step > index ? "complete" : step === index + 1 && phase === "running" ? "running" : ""}>
                  <span>{step > index ? <CircleCheck size={16} /> : step === index + 1 && phase === "running"
                    ? <LoaderCircle className="spinning" size={16} /> : index + 1}</span>
                  <div><strong>{label}</strong><small>{step > index ? "Completed" : "Pending"}</small></div>
                </div>
              ))}
            </div>
            <LiveTerminal logs={logs} />
            {phase === "error" && (
              <div className="permission-note" role="alert">
                {error}. No cancellation has been confirmed. <Button onClick={launch}>Retry request</Button>
              </div>
            )}
            {phase === "completed" && receipt && (
              <div style={{ marginTop: 18 }}>
                <div className="success-note"><CircleCheck size={20} /><span>
                  {pending ? "The provider acknowledged the request; cancellation is pending."
                    : "The demo provider confirmed cancellation."}
                  {receipt.effectiveDate && <><br />Effective date: {receipt.effectiveDate}</>}
                </span></div>
                <p>Provider receipt: <code>{receipt.providerRequestId}</code></p>
                <p>Projected annual savings: {money(receipt.projectedAnnualSavings)}</p>
                <p className="simulation-note">This receipt is from the demo API. No screenshot or real-account change is claimed.</p>
                <Button className="full-width" onClick={onGoToHistory}>View status <ArrowRight size={16} /></Button>
              </div>
            )}
          </>
        )}
      </div>
    </Dialog>
  )
}
