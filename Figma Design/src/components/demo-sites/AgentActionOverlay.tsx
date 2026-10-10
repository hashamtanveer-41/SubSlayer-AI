import { CheckCircle2, Loader2, Sparkles } from "lucide-react"

export interface AgentActionOverlayProps {
  currentStep: number // 1 to 4
  stepMessages: string[]
  providerName: string
  onClose?: () => void
}

export function AgentActionOverlay({
  currentStep,
  stepMessages,
  providerName,
  onClose,
}: AgentActionOverlayProps) {
  const isComplete = currentStep >= 4

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        background: "rgba(48, 43, 50, 0.5)",
        backdropFilter: "blur(3px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 500,
        padding: "20px",
      }}
    >
      <div
        style={{
          background: "#ffffff",
          border: `1px solid ${isComplete ? "#bbf7d0" : "#e8e4e6"}`,
          borderRadius: "14px",
          padding: "32px",
          maxWidth: "480px",
          width: "100%",
          color: "var(--color-ink, #302b32)",
          boxShadow: "0 24px 60px rgba(48, 43, 50, 0.16)",
          animation: "fadeIn 0.2s ease-out",
        }}
      >
        <div style={{ textAlign: "center", marginBottom: "24px" }}>
          <div
            style={{
              width: "54px",
              height: "54px",
              borderRadius: "50%",
              background: isComplete ? "#ecfdf5" : "#f7f1fa",
              color: isComplete ? "#059669" : "var(--accent, #72556e)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 16px",
              border: `1px solid ${isComplete ? "#a7f3d0" : "#e6daed"}`,
            }}
          >
            {isComplete ? <CheckCircle2 size={28} /> : <Loader2 size={28} className="animate-spin" />}
          </div>

          <h3
            style={{
              fontFamily: "var(--font-display), 'Manrope', sans-serif",
              fontSize: "20px",
              fontWeight: 750,
              margin: "0 0 6px 0",
              color: "var(--color-ink, #302b32)",
            }}
          >
            {isComplete ? "Autonomous Cancellation Complete!" : `SubSlayer AI Cancelling ${providerName}`}
          </h3>
          <p style={{ fontSize: "13.5px", color: "var(--color-muted, #817a83)", margin: 0, lineHeight: 1.5 }}>
            {isComplete
              ? "Cancellation successfully confirmed via provider API with $0.00 penalty fees."
              : "Autonomous browser agent navigating through billing gateways & fee waivers..."}
          </p>
        </div>

        {/* Live Step Progression */}
        <div style={{ display: "grid", gap: "10px", marginBottom: "24px" }}>
          {stepMessages.map((msg, index) => {
            const stepNum = index + 1
            const isDone = currentStep > stepNum || (isComplete && stepNum === 4)
            const isCurrent = currentStep === stepNum && !isComplete

            return (
              <div
                key={index}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  padding: "10px 14px",
                  borderRadius: "8px",
                  background: isDone
                    ? "#f0fdf4"
                    : isCurrent
                    ? "#f7f1fa"
                    : "#faf9f6",
                  border: `1px solid ${
                    isDone
                      ? "#bbf7d0"
                      : isCurrent
                      ? "var(--accent, #72556e)"
                      : "#e8e4e6"
                  }`,
                  fontSize: "13px",
                  transition: "all 0.2s ease",
                }}
              >
                <div style={{ flexShrink: 0 }}>
                  {isDone ? (
                    <CheckCircle2 size={16} color="#059669" />
                  ) : isCurrent ? (
                    <Loader2 size={16} color="var(--accent, #72556e)" className="animate-spin" />
                  ) : (
                    <span style={{ fontSize: "11px", color: "#817a83", fontWeight: 700 }}>
                      {stepNum}
                    </span>
                  )}
                </div>

                <span
                  style={{
                    color: isDone ? "#166534" : isCurrent ? "#302b32" : "#817a83",
                    fontWeight: isCurrent ? 650 : 500,
                  }}
                >
                  {msg}
                </span>
              </div>
            )
          })}
        </div>

        {isComplete && (
          <button
            onClick={onClose}
            style={{
              width: "100%",
              background: "var(--accent, #72556e)",
              color: "#ffffff",
              border: "none",
              padding: "12px",
              borderRadius: "8px",
              fontWeight: 700,
              fontSize: "14px",
              cursor: "pointer",
              transition: "background 0.15s",
            }}
            onMouseOver={(e) => (e.currentTarget.style.background = "var(--accent-dark, #5b4058)")}
            onMouseOut={(e) => (e.currentTarget.style.background = "var(--accent, #72556e)")}
          >
            Done • View Cancelled State on Site
          </button>
        )}
      </div>
    </div>
  )
}
