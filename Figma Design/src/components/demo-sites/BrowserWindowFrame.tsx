import { ReactNode } from "react"
import {
  ArrowLeft,
  ArrowRight,
  Flame,
  Globe,
  Lock,
  Maximize2,
  RefreshCw,
  RotateCw,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Unlock,
} from "lucide-react"

export interface BrowserWindowFrameProps {
  url: string
  title: string
  provider: "spotify" | "adobe"
  isLocked: boolean
  onToggleLock: () => void
  onSimulateCharge: () => void
  onRunAgent: () => void
  isCharging?: boolean
  isAgentRunning?: boolean
  isCancelled?: boolean
  onBackToHub: () => void
  onSwitchProvider?: () => void
  children: ReactNode
}

export function BrowserWindowFrame({
  url,
  title,
  provider,
  isLocked,
  onToggleLock,
  onSimulateCharge,
  onRunAgent,
  isCharging,
  isAgentRunning,
  isCancelled,
  onBackToHub,
  onSwitchProvider,
  children,
}: BrowserWindowFrameProps) {
  const providerPrice = provider === "spotify" ? "$10.99" : "$59.99"
  const otherProviderName = provider === "spotify" ? "Adobe CC ($59.99)" : "Spotify ($10.99)"

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        minHeight: "100vh",
        background: "#0c0a0e",
        color: "#ffffff",
        fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
      }}
    >
      {/* 1. SubSlayer Live Agent Control Dock */}
      <div
        style={{
          background: "linear-gradient(90deg, #18111e 0%, #24162a 50%, #150f1b 100%)",
          borderBottom: "1px solid #3d2345",
          padding: "10px 20px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: "12px",
          fontSize: "13px",
          position: "sticky",
          top: 0,
          zIndex: 1000,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <button
            onClick={onBackToHub}
            style={{
              background: "#704b73",
              border: "none",
              color: "#fff",
              padding: "6px 14px",
              borderRadius: "6px",
              fontSize: "12px",
              fontWeight: 700,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "6px",
            }}
          >
            <ArrowLeft size={14} /> Back to Dashboard
          </button>

          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span
              style={{
                display: "inline-block",
                width: "8px",
                height: "8px",
                borderRadius: "50%",
                background: "#10b981",
                boxShadow: "0 0 8px #10b981",
              }}
            />
            <strong style={{ fontSize: "13px", color: "#f3e8f5" }}>
              SubSlayer Live Sandbox
            </strong>
            <span style={{ color: "#a592aa", fontSize: "12px" }}>
              • Target: {provider.toUpperCase()} (Visa •••• 4242)
            </span>
          </div>
        </div>

        {/* Live Interaction Controls */}
        <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
          {/* Card Shield Button */}
          <button
            onClick={onToggleLock}
            style={{
              background: isLocked ? "#450a0a" : "#064e3b",
              border: `1px solid ${isLocked ? "#ef4444" : "#10b981"}`,
              color: isLocked ? "#fca5a5" : "#6ee7b7",
              padding: "6px 13px",
              borderRadius: "6px",
              fontSize: "12px",
              fontWeight: 700,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "6px",
            }}
            title="Toggle SubSlayer Virtual Card Shield lock"
          >
            {isLocked ? <Lock size={13} /> : <Unlock size={13} />}
            {isLocked ? "Shield: LOCKED ($0.00)" : "Shield: ACTIVE"}
          </button>

          {/* Test Renewal Charge Button */}
          <button
            onClick={onSimulateCharge}
            disabled={isCharging}
            style={{
              background: "#251829",
              border: "1px solid #5a3861",
              color: "#f3e8f5",
              padding: "6px 13px",
              borderRadius: "6px",
              fontSize: "12px",
              fontWeight: 700,
              cursor: isCharging ? "wait" : "pointer",
              display: "flex",
              alignItems: "center",
              gap: "6px",
            }}
            title="Simulate monthly recurring charge from this merchant"
          >
            {isCharging ? <RefreshCw size={13} className="animate-spin" /> : <Flame size={13} color="#f59e0b" />}
            {isCharging ? "Charging..." : `Test ${providerPrice} Charge`}
          </button>

          {/* Run Agent Cancellation Button */}
          <button
            onClick={onRunAgent}
            disabled={isAgentRunning || isCancelled}
            style={{
              background: isCancelled
                ? "#252028"
                : "linear-gradient(135deg, #10b981 0%, #059669 100%)",
              border: "none",
              color: isCancelled ? "#888" : "#ffffff",
              padding: "6px 16px",
              borderRadius: "6px",
              fontSize: "12px",
              fontWeight: 800,
              cursor: isAgentRunning || isCancelled ? "default" : "pointer",
              display: "flex",
              alignItems: "center",
              gap: "6px",
              boxShadow: isCancelled ? "none" : "0 2px 10px rgba(16, 185, 129, 0.3)",
            }}
            title="Deploy SubSlayer browser agent to cancel this subscription"
          >
            <Sparkles size={13} />
            {isAgentRunning
              ? "Agent Running..."
              : isCancelled
              ? "Slayed by AI"
              : "▶ Run AI Cancellation Agent"}
          </button>

          {/* Switch to other provider demo */}
          {onSwitchProvider && (
            <button
              onClick={onSwitchProvider}
              style={{
                background: "rgba(255,255,255,0.08)",
                border: "1px solid rgba(255,255,255,0.15)",
                color: "#e2d7e5",
                padding: "6px 12px",
                borderRadius: "6px",
                fontSize: "12px",
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              Switch to {otherProviderName} →
            </button>
          )}
        </div>
      </div>

      {/* 2. Realistic Desktop Browser Frame */}
      <div
        style={{
          margin: "16px auto 32px",
          maxWidth: "1280px",
          width: "calc(100% - 32px)",
          borderRadius: "12px",
          overflow: "hidden",
          border: "1px solid #33283b",
          boxShadow: "0 25px 70px rgba(0, 0, 0, 0.6)",
          background: provider === "spotify" ? "#121212" : "#f5f5f5",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Browser Top Window Bar */}
        <div
          style={{
            background: "#1e1824",
            borderBottom: "1px solid #2e2436",
            padding: "10px 16px",
            display: "flex",
            alignItems: "center",
            gap: "14px",
          }}
        >
          {/* Mac-style Window Controls */}
          <div style={{ display: "flex", alignItems: "center", gap: "7px" }}>
            <span style={{ width: "12px", height: "12px", borderRadius: "50%", background: "#ff5f56", display: "inline-block" }} />
            <span style={{ width: "12px", height: "12px", borderRadius: "50%", background: "#ffbd2e", display: "inline-block" }} />
            <span style={{ width: "12px", height: "12px", borderRadius: "50%", background: "#27c93f", display: "inline-block" }} />
          </div>

          {/* Navigation Controls */}
          <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "#8a7e91" }}>
            <ArrowLeft size={14} style={{ cursor: "pointer" }} />
            <ArrowRight size={14} style={{ cursor: "pointer", opacity: 0.5 }} />
            <RotateCw size={13} style={{ cursor: "pointer", marginLeft: "2px" }} />
          </div>

          {/* Realistic Address Bar */}
          <div
            style={{
              flex: 1,
              maxWidth: "700px",
              background: "#120e17",
              border: "1px solid #33283b",
              borderRadius: "20px",
              padding: "5px 14px",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              fontSize: "12.5px",
              color: "#d1c7d6",
              margin: "0 auto",
            }}
          >
            <Lock size={12} color="#10b981" />
            <span style={{ color: "#ffffff", fontWeight: 600 }}>{url}</span>
            <span style={{ marginLeft: "auto", fontSize: "11px", color: "#7a6e82" }}>
              SSL Secured
            </span>
          </div>

          <div style={{ width: "60px" }} />
        </div>

        {/* Browser Web Content Container */}
        <div style={{ flex: 1, position: "relative" }}>
          {children}
        </div>
      </div>
    </div>
  )
}
