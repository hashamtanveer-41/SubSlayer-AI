import { CheckCircle2, Loader2, ShieldCheck, Sparkles, X } from "lucide-react"

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
        background: "rgba(10, 8, 14, 0.75)",
        backdropFilter: "blur(4px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 500,
        padding: "20px",
      }}
    >
      <div
        style={{
          background: "#18141d",
          border: `1.5px solid ${isComplete ? "#10b981" : "#704b73"}`,
          borderRadius: "16px",
          padding: "32px",
          maxWidth: "480px",
          width: "100%",
          color: "#ffffff",
          boxShadow: "0 25px 60px rgba(0,0,0,0.8)",
          animation: "fadeIn 0.2s ease-out",
        }}
      >
        <div style={{ textAlign: "center", marginBottom: "24px" }}>
          <div
            style={{
              width: "56px",
              height: "56px",
              borderRadius: "50%",
              background: isComplete ? "rgba(16, 185, 129, 0.15)" : "rgba(112, 75, 115, 0.2)",
              color: isComplete ? "#10b981" : "#d8b4dc",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 16px",
              border: `1px solid ${isComplete ? "#10b981" : "#704b73"}`,
            }}
          >
            {isComplete ? <CheckCircle2 size={30} /> : <Loader2 size={30} className="animate-spin" />}
          </div>

          <h3 style={{ fontSize: "20px", fontWeight: 800, margin: "0 0 6px 0", color: "#ffffff" }}>
            {isComplete ? "Autonomous Slay Complete!" : `SubSlayer AI Slaying ${providerName}`}
          </h3>
          <p style={{ fontSize: "13px", color: "#a592aa", margin: 0 }}>
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
            const isPending = currentStep < stepNum

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
                    ? "rgba(16, 185, 129, 0.1)"
                    : isCurrent
                    ? "rgba(112, 75, 115, 0.2)"
                    : "#141019",
                  border: `1px solid ${
                    isDone
                      ? "#10b981"
                      : isCurrent
                      ? "#704b73"
                      : "#2e2436"
                  }`,
                  fontSize: "13px",
                  transition: "all 0.2s ease",
                }}
              >
                <div style={{ flexShrink: 0 }}>
                  {isDone ? (
                    <CheckCircle2 size={16} color="#10b981" />
                  ) : isCurrent ? (
                    <Loader2 size={16} color="#d8b4dc" className="animate-spin" />
                  ) : (
                    <span style={{ fontSize: "11px", color: "#7a6e82", fontWeight: 700 }}>
                      {stepNum}
                    </span>
                  )}
                </div>

                <span
                  style={{
                    color: isDone ? "#6ee7b7" : isCurrent ? "#ffffff" : "#7a6e82",
                    fontWeight: isCurrent ? 700 : 500,
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
              background: "#10b981",
              color: "#000000",
              border: "none",
              padding: "12px",
              borderRadius: "8px",
              fontWeight: 800,
              fontSize: "14px",
              cursor: "pointer",
            }}
          >
            Done • View Cancelled State on Site
          </button>
        )}
      </div>
    </div>
  )
}
