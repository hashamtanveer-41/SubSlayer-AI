import { ReactNode } from "react"
import {
  ArrowLeft,
  ArrowRight,
  Lock,
  RotateCw,
  Sparkles,
  Unlock,
} from "lucide-react"
import { Brand } from "../common/Brand"

export interface BrowserWindowFrameProps {
  url: string
  title: string
  provider: "spotify" | "adobe"
  isLocked: boolean
  onToggleLock: () => void
  onSimulateCharge?: () => void
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
  onRunAgent,
  isAgentRunning,
  isCancelled,
  onBackToHub,
  onSwitchProvider,
  children,
}: BrowserWindowFrameProps) {
  const otherProviderName = provider === "spotify" ? "Adobe CC" : "Spotify"

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        minHeight: "100vh",
        background: "var(--color-paper, #f8f7f8)",
        color: "var(--color-ink, #302b32)",
        fontFamily: "var(--font-sans), 'DM Sans', -apple-system, BlinkMacSystemFont, sans-serif",
      }}
    >
      {/* 1. SubSlayer Clean Top Navigation Bar */}
      <header
        style={{
          background: "#ffffff",
          borderBottom: "1px solid var(--color-line, #e8e4e6)",
          padding: "0 28px",
          height: "64px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          position: "sticky",
          top: 0,
          zIndex: 100,
          boxShadow: "0 1px 3px rgba(48, 43, 50, 0.03)",
        }}
      >
        {/* Left: SubSlayer Brand & Back Link */}
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <Brand onClick={onBackToHub} />

          <div style={{ width: "1px", height: "20px", background: "#e8e4e6" }} />

          <button
            onClick={onBackToHub}
            style={{
              background: "transparent",
              border: "none",
              color: "var(--color-muted, #817a83)",
              fontSize: "13px",
              fontWeight: 550,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "6px",
              padding: "6px 8px",
              borderRadius: "6px",
              transition: "color 0.15s, background 0.15s",
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.color = "var(--color-ink, #302b32)"
              e.currentTarget.style.background = "#f7f1fa"
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.color = "var(--color-muted, #817a83)"
              e.currentTarget.style.background = "transparent"
            }}
          >
            <ArrowLeft size={14} /> Back to Dashboard
          </button>
        </div>

        {/* Center: Minimal Environment Tag */}
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "7px",
            background: "#f7f1fa",
            border: "1px solid #e6daed",
            padding: "5px 14px",
            borderRadius: "20px",
            fontSize: "12px",
            fontWeight: 600,
            color: "var(--accent, #72556e)",
          }}
        >
          <span
            style={{
              width: "7px",
              height: "7px",
              borderRadius: "50%",
              background: "#72556e",
              display: "inline-block",
            }}
          />
          <span>Simulated Environment: {provider === "spotify" ? "Spotify Premium" : "Adobe Creative Cloud"}</span>
        </div>

        {/* Right: SubSlayer Controls (Clean & Uncluttered) */}
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          {/* Card Shield Button */}
          <button
            onClick={onToggleLock}
            style={{
              background: isLocked ? "#fef2f2" : "#f7f1fa",
              border: `1px solid ${isLocked ? "#fecaca" : "#e6daed"}`,
              color: isLocked ? "#b91c1c" : "var(--accent, #72556e)",
              padding: "7px 13px",
              borderRadius: "7px",
              fontSize: "12.5px",
              fontWeight: 600,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "6px",
              transition: "background 0.15s",
            }}
            title="Toggle SubSlayer Virtual Card Shield lock"
          >
            {isLocked ? <Lock size={13} /> : <Unlock size={13} />}
            <span>{isLocked ? "Shield: LOCKED ($0.00)" : "Shield: ACTIVE"}</span>
          </button>

          {/* Autonomous Cancellation Agent Button */}
          <button
            onClick={onRunAgent}
            disabled={isAgentRunning || isCancelled}
            style={{
              background: isCancelled ? "#f0ebf2" : "var(--accent, #72556e)",
              color: isCancelled ? "#817a83" : "#ffffff",
              border: isCancelled ? "1px solid #e8e4e6" : "none",
              padding: "8px 16px",
              borderRadius: "7px",
              fontSize: "13px",
              fontWeight: 600,
              cursor: isAgentRunning || isCancelled ? "default" : "pointer",
              display: "flex",
              alignItems: "center",
              gap: "6px",
              transition: "background 0.15s",
            }}
            onMouseOver={(e) => {
              if (!isCancelled && !isAgentRunning) {
                e.currentTarget.style.background = "var(--accent-dark, #5b4058)"
              }
            }}
            onMouseOut={(e) => {
              if (!isCancelled && !isAgentRunning) {
                e.currentTarget.style.background = "var(--accent, #72556e)"
              }
            }}
            title="Deploy SubSlayer AI browser agent to cancel this subscription"
          >
            <Sparkles size={14} />
            <span>
              {isCancelled
                ? "Subscription Slayed ✓"
                : isAgentRunning
                ? "Agent Running..."
                : "⚡ Auto-Cancel with AI"}
            </span>
          </button>

          {/* Switch to other provider demo */}
          {onSwitchProvider && (
            <button
              onClick={onSwitchProvider}
              style={{
                background: "#ffffff",
                border: "1px solid var(--color-line, #e8e4e6)",
                color: "var(--color-ink, #302b32)",
                padding: "7px 12px",
                borderRadius: "7px",
                fontSize: "12px",
                fontWeight: 550,
                cursor: "pointer",
                transition: "background 0.15s",
              }}
              onMouseOver={(e) => (e.currentTarget.style.background = "#f8f7f8")}
              onMouseOut={(e) => (e.currentTarget.style.background = "#ffffff")}
            >
              Switch to {otherProviderName} →
            </button>
          )}
        </div>
      </header>

      {/* 2. Realistic Desktop Browser Frame */}
      <div
        style={{
          margin: "24px auto 48px",
          maxWidth: "1160px",
          width: "calc(100% - 48px)",
          borderRadius: "12px",
          overflow: "hidden",
          border: "1px solid var(--color-line, #e8e4e6)",
          boxShadow: "0 10px 32px rgba(48, 43, 50, 0.08)",
          background: provider === "spotify" ? "#121212" : "#ffffff",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Browser Top Window Chrome */}
        <div
          style={{
            background: "#fcfbfa",
            borderBottom: "1px solid var(--color-line, #e8e4e6)",
            padding: "9px 16px",
            display: "flex",
            alignItems: "center",
            gap: "14px",
          }}
        >
          {/* Mac-style Window Controls */}
          <div style={{ display: "flex", alignItems: "center", gap: "7px" }}>
            <span style={{ width: "11px", height: "11px", borderRadius: "50%", background: "#ff5f56", display: "inline-block" }} />
            <span style={{ width: "11px", height: "11px", borderRadius: "50%", background: "#ffbd2e", display: "inline-block" }} />
            <span style={{ width: "11px", height: "11px", borderRadius: "50%", background: "#27c93f", display: "inline-block" }} />
          </div>

          {/* Navigation Controls */}
          <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "#817a83" }}>
            <ArrowLeft size={13} style={{ cursor: "pointer" }} />
            <ArrowRight size={13} style={{ cursor: "pointer", opacity: 0.4 }} />
            <RotateCw size={12} style={{ cursor: "pointer", marginLeft: "2px" }} />
          </div>

          {/* Realistic Address Bar */}
          <div
            style={{
              flex: 1,
              maxWidth: "680px",
              background: "#f3eff5",
              border: "1px solid #e8e0e9",
              borderRadius: "7px",
              padding: "5px 14px",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              fontSize: "12.5px",
              color: "#302b32",
              margin: "0 auto",
            }}
          >
            <Lock size={12} color="var(--accent, #72556e)" />
            <span style={{ color: "#302b32", fontWeight: 550 }}>{url}</span>
            <span style={{ marginLeft: "auto", fontSize: "11px", color: "#817a83" }}>
              SSL Secured
            </span>
          </div>

          <div style={{ width: "50px" }} />
        </div>

        {/* Browser Web Content Container */}
        <div style={{ flex: 1, position: "relative" }}>
          {children}
        </div>
      </div>
    </div>
  )
}
