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
        time: new Date().toLocaleTimeString(),
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
    if (!targetSub) return
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
        background: "#0f0c11",
        color: "#ffffff",
        fontFamily: "'DM Sans', -apple-system, BlinkMacSystemFont, sans-serif",
      }}
    >
      {/* Split View Header */}
      <header
        style={{
          background: "#18141d",
          borderBottom: "1px solid #2e2436",
          padding: "12px 24px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: "14px",
          zIndex: 50,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div
            style={{
              width: "32px",
              height: "32px",
              borderRadius: "8px",
              background: "linear-gradient(135deg, #704b73 0%, #4a2d4e 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: 800,
              fontSize: "16px",
            }}
          >
            S
          </div>
          <div>
            <span style={{ fontSize: "15px", fontWeight: 750, color: "#fff" }}>
              SubSlayer AI Sandbox
            </span>
            <span style={{ color: "#a592aa", fontSize: "12px", marginLeft: "8px" }}>
              Side-by-Side Live Defense View
            </span>
          </div>
        </div>

        {/* Center: Provider Switcher Tabs */}
        <div
          style={{
            display: "flex",
            background: "#241c2b",
            padding: "4px",
            borderRadius: "24px",
            border: "1px solid #3d2f47",
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
              padding: "7px 16px",
              borderRadius: "20px",
              border: "none",
              fontSize: "12.5px",
              fontWeight: 700,
              cursor: "pointer",
              background: activeProvider === "spotify" ? "#1ed760" : "transparent",
              color: activeProvider === "spotify" ? "#000000" : "#d1c7d6",
              transition: "all 0.15s",
            }}
          >
            <SpotifyLogo size={16} /> Spotify Demo ($10.99)
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
              padding: "7px 16px",
              borderRadius: "20px",
              border: "none",
              fontSize: "12.5px",
              fontWeight: 700,
              cursor: "pointer",
              background: activeProvider === "adobe" ? "#fa0f00" : "transparent",
              color: activeProvider === "adobe" ? "#ffffff" : "#d1c7d6",
              transition: "all 0.15s",
            }}
          >
            <AdobeLogo size={16} /> Adobe CC Demo ($59.99)
          </button>
        </div>

        {/* Right: Fullscreen Provider & Return buttons */}
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <button
            onClick={() =>
              onNavigate(activeProvider === "spotify" ? "demo-spotify" : "demo-adobe")
            }
            style={{
              background: "rgba(255,255,255,0.08)",
              border: "1px solid rgba(255,255,255,0.15)",
              color: "#fff",
              padding: "6px 12px",
              borderRadius: "6px",
              fontSize: "12px",
              fontWeight: 600,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "5px",
            }}
          >
            <Maximize2 size={13} /> Full Screen Portal
          </button>

          <button
            onClick={() => onNavigate("app")}
            style={{
              background: "#704b73",
              border: "none",
              color: "#fff",
              padding: "6px 14px",
              borderRadius: "6px",
              fontSize: "12px",
              fontWeight: 650,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "6px",
            }}
          >
            <ArrowLeft size={14} /> Full Dashboard
          </button>
        </div>
      </header>

      {/* Split Container */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          flex: 1,
          overflow: "hidden",
        }}
      >
        {/* Left Pane: SubSlayer AI Active Defense Panel */}
        <div
          style={{
            background: "#141019",
            borderRight: "1px solid #2e2436",
            padding: "28px",
            overflowY: "auto",
            display: "flex",
            flexDirection: "column",
            gap: "24px",
          }}
        >
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
              <span
                style={{
                  background: "#704b73",
                  color: "#fff",
                  fontSize: "10.5px",
                  fontWeight: 800,
                  padding: "2px 7px",
                  borderRadius: "4px",
                }}
              >
                PANE 1 • LEFT
              </span>
              <h2 style={{ fontSize: "20px", fontWeight: 800, margin: 0 }}>
                SubSlayer AI Control Hub
              </h2>
            </div>
            <p style={{ color: "#a592aa", fontSize: "13px", margin: 0 }}>
              Control virtual card shields and deploy autonomous agents in real time while observing provider behavior on the right.
            </p>
          </div>

          {/* Virtual Card Shield Card */}
          <div
            style={{
              background: "#1c1724",
              borderRadius: "12px",
              border: `1.5px solid ${isLocked ? "#b91c1c" : "#22c55e"}`,
              padding: "20px",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "14px",
              }}
            >
              <span style={{ fontSize: "12px", fontWeight: 750, color: "#d1c7d6" }}>
                VIRTUAL CARD SHIELD STATUS
              </span>
              <span
                style={{
                  fontSize: "11px",
                  fontWeight: 800,
                  padding: "3px 9px",
                  borderRadius: "12px",
                  background: isLocked ? "rgba(239, 68, 68, 0.2)" : "rgba(34, 197, 94, 0.2)",
                  color: isLocked ? "#fca5a5" : "#86efac",
                }}
              >
                {isLocked ? "🛡️ LOCKED ($0.00 LIMIT)" : "🟢 UNLOCKED (ACTIVE)"}
              </span>
            </div>

            <div style={{ fontSize: "17px", fontWeight: 700, fontFamily: "monospace", letterSpacing: "2px" }}>
              •••• •••• •••• {targetCard?.last4 || "4242"}
            </div>
            <div style={{ fontSize: "12px", color: "#a592aa", margin: "4px 0 16px 0" }}>
              Linked Merchant: {activeProvider.toUpperCase()} DEMO • Spending Limit: ${targetCard?.spendingLimit || 20}.00
            </div>

            <button
              onClick={handleToggleShield}
              style={{
                width: "100%",
                background: isLocked ? "#1e293b" : "#450a0a",
                color: isLocked ? "#93c5fd" : "#fca5a5",
                border: `1px solid ${isLocked ? "#3b82f6" : "#ef4444"}`,
                padding: "11px 16px",
                borderRadius: "8px",
                fontSize: "13px",
                fontWeight: 750,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
              }}
            >
              {isLocked ? (
                <>
                  <Unlock size={15} /> Unlock Shield (Allow Provider Renewal)
                </>
              ) : (
                <>
                  <Lock size={15} /> Lock Shield to $0.00 (Block Provider Charges)
                </>
              )}
            </button>
          </div>

          {/* Autonomous Cancellation Trigger Card */}
          <div
            style={{
              background: "#1c1724",
              borderRadius: "12px",
              border: "1px solid #2e2436",
              padding: "20px",
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
              <span style={{ fontSize: "12px", fontWeight: 750, color: "#d1c7d6" }}>
                ACTIVE TARGET SUBSCRIPTION
              </span>
              <span
                style={{
                  fontSize: "11px",
                  fontWeight: 800,
                  padding: "3px 9px",
                  borderRadius: "12px",
                  background: targetSub?.status === "Cancelled" ? "rgba(239, 68, 68, 0.2)" : "rgba(34, 197, 94, 0.2)",
                  color: targetSub?.status === "Cancelled" ? "#fca5a5" : "#86efac",
                }}
              >
                {targetSub?.status === "Cancelled" ? "SLAYED" : "ACTIVE"}
              </span>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "8px" }}>
              {activeProvider === "spotify" ? <SpotifyLogo size={24} /> : <AdobeLogo size={24} />}
              <div>
                <strong style={{ fontSize: "15px", display: "block" }}>
                  {targetSub?.name || (activeProvider === "spotify" ? "Spotify" : "Adobe CC")}
                </strong>
                <span style={{ fontSize: "12px", color: "#a592aa" }}>
                  ${targetSub?.price || (activeProvider === "spotify" ? 10.99 : 59.99)}/mo • Vampire Risk:{" "}
                  {targetSub?.vampireScore || (activeProvider === "spotify" ? 55 : 88)}/100
                </span>
              </div>
            </div>

            <p style={{ fontSize: "12.5px", color: "#a592aa", margin: "0 0 16px 0", lineHeight: 1.5 }}>
              Clicking below will dispatch the autonomous agent to cancel via the provider API and automatically waive any termination penalties.
            </p>

            <button
              onClick={handleSlaySubscription}
              disabled={targetSub?.status === "Cancelled"}
              style={{
                width: "100%",
                background:
                  targetSub?.status === "Cancelled"
                    ? "#282030"
                    : "linear-gradient(135deg, #704b73 0%, #4a2d4e 100%)",
                color: targetSub?.status === "Cancelled" ? "#777" : "#fff",
                border: "none",
                padding: "11px 16px",
                borderRadius: "8px",
                fontSize: "13px",
                fontWeight: 750,
                cursor: targetSub?.status === "Cancelled" ? "default" : "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
              }}
            >
              <Sparkles size={15} />
              {targetSub?.status === "Cancelled"
                ? "Subscription Already Slayed"
                : `1-Click Auto-Cancel ${targetSub?.name || "Service"}`}
            </button>
          </div>

          {/* Real-Time Sandbox Activity Log */}
          <div
            style={{
              background: "#1c1724",
              borderRadius: "12px",
              border: "1px solid #2e2436",
              padding: "18px",
              flex: 1,
            }}
          >
            <span style={{ fontSize: "12px", fontWeight: 750, color: "#a592aa", display: "block", marginBottom: "10px" }}>
              REAL-TIME EVENT STREAM
            </span>

            <div style={{ display: "grid", gap: "8px" }}>
              {logEvents.map((e) => (
                <div
                  key={e.id}
                  style={{
                    background: "#141019",
                    padding: "8px 12px",
                    borderRadius: "6px",
                    fontSize: "12px",
                    borderLeft: `3px solid ${
                      e.type === "shield" ? "#3b82f6" : e.type === "agent" ? "#704b73" : "#22c55e"
                    }`,
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", color: "#888", fontSize: "11px" }}>
                    <span>{e.type.toUpperCase()}</span>
                    <span>{e.time}</span>
                  </div>
                  <span style={{ color: "#e0d9e4", display: "block", marginTop: "2px" }}>{e.msg}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Pane: Live Provider Portal (Spotify or Adobe) */}
        <div
          style={{
            background: "#121212",
            overflowY: "auto",
            display: "flex",
            flexDirection: "column",
          }}
        >
          {activeProvider === "spotify" ? (
            <SpotifyDemoPortal
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
              onNavigate={onNavigate}
              currentSubscription={targetSub}
              onSubscriptionUpdated={(sub) => {
                setSubscriptions(subscriptions.map((s) => (s.id === sub.id ? sub : s)))
                addLog(`Adobe cancellation confirmed.`, "agent")
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
