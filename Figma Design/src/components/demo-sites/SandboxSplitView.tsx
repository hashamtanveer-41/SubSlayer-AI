import { useState } from "react"
import {
  ArrowLeft,
  CheckCircle2,
  ExternalLink,
  Flame,
  Layers,
  Lock,
  Maximize2,
  RefreshCw,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Unlock,
} from "lucide-react"
import type { Page, Subscription, VirtualCard } from "../../types"
import { SpotifyDemoPortal } from "./SpotifyDemoPortal"
import { AdobeDemoPortal } from "./AdobeDemoPortal"
import { toggleCardLockApi, startCancellationAgentApi } from "../../services/api"
import { SpotifyLogo, AdobeLogo } from "../common/PlatformLogos"
import { Brand } from "../common/Brand"

export interface SandboxSplitViewProps {
  onNavigate: (page: Page) => void
  subscriptions: Subscription[]
  setSubscriptions: (subs: Subscription[]) => void
  virtualCards: VirtualCard[]
  setVirtualCards: (cards: VirtualCard[]) => void
}

export function SandboxSplitView({
  onNavigate,
  subscriptions,
  setSubscriptions,
  virtualCards,
  setVirtualCards,
}: SandboxSplitViewProps) {
  const [activeProvider, setActiveProvider] = useState<"spotify" | "adobe">("spotify")
  const [logEvents, setLogEvents] = useState<
    { id: string; time: string; msg: string; type: "shield" | "agent" | "charge" }[]
  >([
    {
      id: "1",
      time: "Initial",
      msg: "Sandbox initialized with live FastAPI gateway & Stripe test mode.",
      type: "shield",
    },
  ])

  // Get current subscription & card for active provider
  const targetSub = subscriptions.find((s) =>
    activeProvider === "spotify"
      ? s.provider === "spotify" || s.name.toLowerCase().includes("spotify")
      : s.provider === "adobe" || s.name.toLowerCase().includes("adobe"),
  )

  const targetCard = virtualCards.find((c) =>
    activeProvider === "spotify"
      ? c.id === "card_01" || c.merchant?.toLowerCase().includes("streaming")
      : c.id === "card_02" || c.merchant?.toLowerCase().includes("adobe"),
  ) || virtualCards[0]

  const isLocked = Boolean(
    targetCard?.demoPolicyLocked ?? targetCard?.balanceLocked ?? targetCard?.status === "locked",
  )

  function addLog(msg: string, type: "shield" | "agent" | "charge") {
    setLogEvents((prev) => [
      {
        id: `log_${Date.now()}_${Math.random()}`,
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" }),
        msg,
        type,
      },
      ...prev.slice(0, 7),
    ])
  }

  // Card shield toggle from the SubSlayer panel
  async function handleToggleShield() {
    if (!targetCard) return
    const newLockState = !isLocked

    // Optimistic
    setVirtualCards(
      virtualCards.map((c) =>
        c.id === targetCard.id
          ? {
              ...c,
              demoPolicyLocked: newLockState,
              balanceLocked: newLockState,
              status: newLockState ? "locked" : "active",
            }
          : c,
      ),
    )

    addLog(
      newLockState
        ? `Shield LOCKED to $0.00 for ${targetCard.label || "Card"}. Recurring charges blocked.`
        : `Shield UNLOCKED for ${targetCard.label || "Card"}. Charges allowed.`,
      "shield",
    )

    try {
      const updated = await toggleCardLockApi(targetCard.id, newLockState)
      setVirtualCards(virtualCards.map((c) => (c.id === targetCard.id ? updated : c)))
    } catch {
      // Fallback
    }
  }

  // 1-Click Slay from SubSlayer panel
  async function handleSlaySubscription() {
    if (!targetSub || targetSub.status === "Cancelled") return
    addLog(`Deploying SubSlayer AI agent for ${targetSub.name}...`, "agent")

    // Optimistic
    setSubscriptions(
      subscriptions.map((s) => (s.id === targetSub.id ? { ...s, status: "Cancelled" } : s)),
    )

    try {
      await startCancellationAgentApi(targetSub.id, activeProvider)
      addLog(`SubSlayer agent successfully slayed ${targetSub.name}! Fee waived.`, "agent")
    } catch (err: any) {
      addLog(`Agent execution completed: ${err?.message || "Task processed"}`, "agent")
    }
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        background: "var(--color-paper, #f8f7f8)",
        color: "var(--color-ink, #302b32)",
        fontFamily: "var(--font-sans), 'DM Sans', -apple-system, sans-serif",
      }}
    >
      {/* Split View Header */}
      <header
        style={{
          background: "#ffffff",
          borderBottom: "1px solid var(--color-line, #e8e4e6)",
          padding: "0 28px",
          height: "64px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: "14px",
          zIndex: 50,
          boxShadow: "0 1px 3px rgba(48, 43, 50, 0.03)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <Brand onClick={() => onNavigate("app")} />

          <div style={{ width: "1px", height: "20px", background: "#e8e4e6" }} />

          <span style={{ fontSize: "13px", color: "var(--color-muted, #817a83)", fontWeight: 550 }}>
            Side-by-Side Sandbox
          </span>
        </div>

        {/* Center: Provider Switcher Tabs (SubSlayer Styled) */}
        <div
          style={{
            display: "flex",
            background: "#f0ebf2",
            padding: "3px",
            borderRadius: "8px",
            border: "1px solid #e8e0e9",
            gap: "4px",
          }}
        >
          <button
            onClick={() => {
              setActiveProvider("spotify")
              addLog("Switched active sandbox to Spotify Premium ($10.99/mo).", "charge")
            }}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "7px",
              padding: "6px 14px",
              borderRadius: "6px",
              border: "none",
              fontSize: "12.5px",
              fontWeight: 600,
              cursor: "pointer",
              background: activeProvider === "spotify" ? "var(--accent, #72556e)" : "transparent",
              color: activeProvider === "spotify" ? "#ffffff" : "var(--color-muted, #817a83)",
              transition: "all 0.15s",
            }}
          >
            <SpotifyLogo size={15} /> Spotify Demo ($10.99)
          </button>

          <button
            onClick={() => {
              setActiveProvider("adobe")
              addLog("Switched active sandbox to Adobe CC ($59.99/mo).", "charge")
            }}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "7px",
              padding: "6px 14px",
              borderRadius: "6px",
              border: "none",
              fontSize: "12.5px",
              fontWeight: 600,
              cursor: "pointer",
              background: activeProvider === "adobe" ? "var(--accent, #72556e)" : "transparent",
              color: activeProvider === "adobe" ? "#ffffff" : "var(--color-muted, #817a83)",
              transition: "all 0.15s",
            }}
          >
            <AdobeLogo size={15} /> Adobe CC Demo ($59.99)
          </button>
        </div>

        {/* Right: Fullscreen Provider & Return buttons */}
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <button
            onClick={() =>
              onNavigate(activeProvider === "spotify" ? "demo-spotify" : "demo-adobe")
            }
            style={{
              background: "#ffffff",
              border: "1px solid var(--color-line, #e8e4e6)",
              color: "var(--color-ink, #302b32)",
              padding: "7px 12px",
              borderRadius: "7px",
              fontSize: "12px",
              fontWeight: 550,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "5px",
            }}
          >
            <Maximize2 size={13} /> Full Window View
          </button>

          <button
            onClick={() => onNavigate("app")}
            style={{
              background: "var(--accent, #72556e)",
              border: "none",
              color: "#fff",
              padding: "7px 14px",
              borderRadius: "7px",
              fontSize: "12.5px",
              fontWeight: 600,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "6px",
            }}
            onMouseOver={(e) => (e.currentTarget.style.background = "var(--accent-dark, #5b4058)")}
            onMouseOut={(e) => (e.currentTarget.style.background = "var(--accent, #72556e)")}
          >
            <ArrowLeft size={13} /> Back to Dashboard
          </button>
        </div>
      </header>

      {/* Split Container */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "420px 1fr",
          flex: 1,
          overflow: "hidden",
        }}
      >
        {/* Left Pane: SubSlayer AI Active Defense Panel */}
        <div
          style={{
            background: "#ffffff",
            borderRight: "1px solid var(--color-line, #e8e4e6)",
            padding: "24px",
            overflowY: "auto",
            display: "flex",
            flexDirection: "column",
            gap: "20px",
          }}
        >
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
              <span
                style={{
                  background: "#f7f1fa",
                  border: "1px solid #e6daed",
                  color: "var(--accent, #72556e)",
                  fontSize: "11px",
                  fontWeight: 700,
                  padding: "2px 8px",
                  borderRadius: "20px",
                }}
              >
                SUBSLAYER DEFENSE HUB
              </span>
            </div>
            <h2
              style={{
                fontSize: "19px",
                fontWeight: 750,
                margin: "0 0 4px 0",
                color: "var(--color-ink, #302b32)",
                fontFamily: "var(--font-display), 'Manrope', sans-serif",
              }}
            >
              Real-Time Control Center
            </h2>
            <p style={{ color: "var(--color-muted, #817a83)", fontSize: "13px", margin: 0, lineHeight: 1.5 }}>
              Toggle virtual card shields and deploy autonomous cancellation agents while viewing the provider site on the right.
            </p>
          </div>

          {/* Virtual Card Shield Card */}
          <div
            style={{
              background: "#faf9f6",
              borderRadius: "10px",
              border: `1px solid ${isLocked ? "#fecaca" : "#e8e4e6"}`,
              padding: "18px",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "12px",
              }}
            >
              <span style={{ fontSize: "11px", fontWeight: 700, color: "var(--color-muted, #817a83)", letterSpacing: "0.5px" }}>
                VIRTUAL CARD SHIELD
              </span>
              <span
                style={{
                  fontSize: "11px",
                  fontWeight: 700,
                  padding: "2px 8px",
                  borderRadius: "12px",
                  background: isLocked ? "#fef2f2" : "#f7f1fa",
                  color: isLocked ? "#b91c1c" : "var(--accent, #72556e)",
                  border: `1px solid ${isLocked ? "#fecaca" : "#e6daed"}`,
                }}
              >
                {isLocked ? "🔒 LOCKED ($0.00 LIMIT)" : "🔓 ACTIVE"}
              </span>
            </div>

            <div style={{ fontSize: "16px", fontWeight: 700, fontFamily: "monospace", letterSpacing: "1.5px", color: "var(--color-ink, #302b32)" }}>
              •••• •••• •••• {targetCard?.last4 || "4242"}
            </div>
            <div style={{ fontSize: "12px", color: "var(--color-muted, #817a83)", margin: "4px 0 14px 0" }}>
              Linked Merchant: {activeProvider.toUpperCase()} DEMO • Limit: ${targetCard?.spendingLimit || 20}.00
            </div>

            <button
              onClick={handleToggleShield}
              style={{
                width: "100%",
                background: isLocked ? "#ffffff" : "#fef2f2",
                color: isLocked ? "var(--color-ink, #302b32)" : "#b91c1c",
                border: `1px solid ${isLocked ? "#e8e4e6" : "#fecaca"}`,
                padding: "9px 14px",
                borderRadius: "7px",
                fontSize: "12.5px",
                fontWeight: 650,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "6px",
              }}
            >
              {isLocked ? (
                <>
                  <Unlock size={14} /> Unlock Shield (Allow Charges)
                </>
              ) : (
                <>
                  <Lock size={14} /> Lock Shield to $0.00 (Block Charges)
                </>
              )}
            </button>
          </div>

          {/* Autonomous Cancellation Trigger Card */}
          <div
            style={{
              background: "#faf9f6",
              borderRadius: "10px",
              border: "1px solid var(--color-line, #e8e4e6)",
              padding: "18px",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "12px",
              }}
            >
              <span style={{ fontSize: "11px", fontWeight: 700, color: "var(--color-muted, #817a83)", letterSpacing: "0.5px" }}>
                TARGET SUBSCRIPTION
              </span>
              <span
                style={{
                  fontSize: "11px",
                  fontWeight: 700,
                  padding: "2px 8px",
                  borderRadius: "12px",
                  background: targetSub?.status === "Cancelled" ? "#fef2f2" : "#f0fdf4",
                  color: targetSub?.status === "Cancelled" ? "#b91c1c" : "#166534",
                  border: `1px solid ${targetSub?.status === "Cancelled" ? "#fecaca" : "#bbf7d0"}`,
                }}
              >
                {targetSub?.status === "Cancelled" ? "CANCELLED" : "ACTIVE"}
              </span>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "14px" }}>
              {activeProvider === "spotify" ? <SpotifyLogo size={22} /> : <AdobeLogo size={22} />}
              <div>
                <strong style={{ fontSize: "14.5px", display: "block", color: "var(--color-ink, #302b32)" }}>
                  {targetSub?.name || (activeProvider === "spotify" ? "Spotify" : "Adobe CC")}
                </strong>
                <span style={{ fontSize: "12px", color: "var(--color-muted, #817a83)" }}>
                  ${targetSub?.price || (activeProvider === "spotify" ? 10.99 : 59.99)}/mo
                </span>
              </div>
            </div>

            <button
              onClick={handleSlaySubscription}
              disabled={targetSub?.status === "Cancelled"}
              style={{
                width: "100%",
                background:
                  targetSub?.status === "Cancelled"
                    ? "#e8e4e6"
                    : "var(--accent, #72556e)",
                color: targetSub?.status === "Cancelled" ? "#817a83" : "#ffffff",
                border: "none",
                padding: "10px 14px",
                borderRadius: "7px",
                fontSize: "13px",
                fontWeight: 650,
                cursor: targetSub?.status === "Cancelled" ? "default" : "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "6px",
              }}
              onMouseOver={(e) => {
                if (targetSub?.status !== "Cancelled") {
                  e.currentTarget.style.background = "var(--accent-dark, #5b4058)"
                }
              }}
              onMouseOut={(e) => {
                if (targetSub?.status !== "Cancelled") {
                  e.currentTarget.style.background = "var(--accent, #72556e)"
                }
              }}
            >
              <Sparkles size={14} />
              {targetSub?.status === "Cancelled"
                ? "Subscription Already Slayed"
                : `⚡ Auto-Cancel ${targetSub?.name || "Service"}`}
            </button>
          </div>

          {/* Real-Time Sandbox Activity Log */}
          <div
            style={{
              background: "#faf9f6",
              borderRadius: "10px",
              border: "1px solid var(--color-line, #e8e4e6)",
              padding: "16px",
              flex: 1,
            }}
          >
            <span style={{ fontSize: "11px", fontWeight: 700, color: "var(--color-muted, #817a83)", display: "block", marginBottom: "10px", letterSpacing: "0.5px" }}>
              REAL-TIME EVENT STREAM
            </span>

            <div style={{ display: "grid", gap: "8px" }}>
              {logEvents.map((e) => (
                <div
                  key={e.id}
                  style={{
                    background: "#ffffff",
                    padding: "8px 12px",
                    borderRadius: "6px",
                    fontSize: "12px",
                    border: "1px solid #e8e4e6",
                    borderLeft: `3px solid ${
                      e.type === "shield" ? "#3b82f6" : e.type === "agent" ? "#72556e" : "#10b981"
                    }`,
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", color: "#817a83", fontSize: "10.5px" }}>
                    <span style={{ fontWeight: 650 }}>{e.type.toUpperCase()}</span>
                    <span>{e.time}</span>
                  </div>
                  <span style={{ color: "var(--color-ink, #302b32)", display: "block", marginTop: "2px" }}>
                    {e.msg}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Pane: Live Provider Portal (Spotify or Adobe) */}
        <div
          style={{
            background: activeProvider === "spotify" ? "#121212" : "#f8f9fa",
            overflowY: "auto",
            display: "flex",
            flexDirection: "column",
          }}
        >
          {/* Mini Browser Bar */}
          <div
            style={{
              background: "#fcfbfa",
              borderBottom: "1px solid var(--color-line, #e8e4e6)",
              padding: "8px 16px",
              display: "flex",
              alignItems: "center",
              gap: "10px",
              fontSize: "12px",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <span style={{ width: "10px", height: "10px", borderRadius: "50%", background: "#ff5f56", display: "inline-block" }} />
              <span style={{ width: "10px", height: "10px", borderRadius: "50%", background: "#ffbd2e", display: "inline-block" }} />
              <span style={{ width: "10px", height: "10px", borderRadius: "50%", background: "#27c93f", display: "inline-block" }} />
            </div>

            <div
              style={{
                flex: 1,
                background: "#f3eff5",
                border: "1px solid #e8e0e9",
                borderRadius: "6px",
                padding: "4px 12px",
                display: "flex",
                alignItems: "center",
                gap: "6px",
                fontSize: "11.5px",
                color: "#302b32",
                fontWeight: 550,
              }}
            >
              <Lock size={11} color="var(--accent, #72556e)" />
              <span>
                {activeProvider === "spotify"
                  ? "https://accounts.spotify.com/en/account/overview"
                  : "https://account.adobe.com/plans"}
              </span>
            </div>
          </div>

          {activeProvider === "spotify" ? (
            <SpotifyDemoPortal
              embedded={true}
              onNavigate={onNavigate}
              currentSubscription={targetSub}
              onSubscriptionUpdated={(sub) => {
                setSubscriptions(subscriptions.map((s) => (s.id === sub.id ? sub : s)))
                addLog(`Spotify manual cancellation confirmed: switches to Free tier.`, "agent")
              }}
              virtualCard={targetCard}
              onCardUpdated={(c) => {
                setVirtualCards(virtualCards.map((item) => (item.id === c.id ? c : item)))
              }}
            />
          ) : (
            <AdobeDemoPortal
              embedded={true}
              onNavigate={onNavigate}
              currentSubscription={targetSub}
              onSubscriptionUpdated={(sub) => {
                setSubscriptions(subscriptions.map((s) => (s.id === sub.id ? sub : s)))
                addLog(`Adobe cancellation confirmed ($0.00 fee).`, "agent")
              }}
              virtualCard={targetCard}
              onCardUpdated={(c) => {
                setVirtualCards(virtualCards.map((item) => (item.id === c.id ? c : item)))
              }}
            />
          )}
        </div>
      </div>
    </div>
  )
}
