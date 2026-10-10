import { useEffect, useState } from "react"
import {
  AlertTriangle,
  ArrowLeft,
  Check,
  CheckCircle2,
  ExternalLink,
  Flame,
  HelpCircle,
  Lock,
  Music2,
  RefreshCw,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Unlock,
  Volume2,
  X,
} from "lucide-react"
import type { Page, Subscription, VirtualCard } from "../../types"
import {
  getVirtualCards,
  simulateChargeApi,
  startCancellationAgentApi,
  toggleCardLockApi,
  updateSubscriptionApi,
  type SimulateChargeResponse,
} from "../../services/api"
import { SpotifyLogo } from "../common/PlatformLogos"

export interface SpotifyDemoPortalProps {
  onNavigate: (page: Page) => void
  onOpenSplit?: () => void
  currentSubscription?: Subscription | null
  onSubscriptionUpdated?: (sub: Subscription) => void
  virtualCard?: VirtualCard | null
  onCardUpdated?: (card: VirtualCard) => void
}

interface ChargeHistoryItem {
  id: string
  timestamp: string
  amount: number
  status: "APPROVED" | "DECLINED"
  reason: string
  paymentIntentId?: string | null
}

export function SpotifyDemoPortal({
  onNavigate,
  onOpenSplit,
  currentSubscription,
  onSubscriptionUpdated,
  virtualCard,
  onCardUpdated,
}: SpotifyDemoPortalProps) {
  // Local states
  const [subStatus, setSubStatus] = useState<"Active" | "Cancelled" | "Pending Cancellation">(
    currentSubscription?.status || "Active",
  )
  const [card, setCard] = useState<VirtualCard | null>(virtualCard || null)
  const [charging, setCharging] = useState(false)
  const [togglingLock, setTogglingLock] = useState(false)
  const [showCancelModal, setShowCancelModal] = useState(false)
  const [chargeResult, setChargeResult] = useState<SimulateChargeResponse | null>(null)
  const [chargeHistory, setChargeHistory] = useState<ChargeHistoryItem[]>([])
  const [agentTriggering, setAgentTriggering] = useState(false)
  const [agentSuccessMsg, setAgentSuccessMsg] = useState<string | null>(null)

  // Fetch or synchronize live card and sub
  useEffect(() => {
    if (currentSubscription) {
      setSubStatus(currentSubscription.status)
    }
  }, [currentSubscription])

  useEffect(() => {
    if (virtualCard) {
      setCard(virtualCard)
    } else {
      getVirtualCards()
        .then((cards) => {
          const streamingCard =
            cards.find((c) => c.id === "card_01" || c.merchant?.toLowerCase().includes("streaming")) ||
            cards[0]
          if (streamingCard) {
            setCard(streamingCard)
            onCardUpdated?.(streamingCard)
          }
        })
        .catch(() => {})
    }
  }, [virtualCard, onCardUpdated])

  const isLocked = Boolean(
    card?.demoPolicyLocked ?? card?.balanceLocked ?? card?.status === "locked",
  )

  // Simulate Monthly Renewal Charge ($10.99)
  async function handleSimulateRenewal() {
    setCharging(true)
    setChargeResult(null)
    setAgentSuccessMsg(null)

    const cardId = card?.id || "card_01"
    try {
      const res = await simulateChargeApi(cardId, 10.99, "Spotify")
      setChargeResult(res)

      const historyEntry: ChargeHistoryItem = {
        id: `ch_${Date.now()}`,
        timestamp: new Date().toLocaleTimeString(),
        amount: 10.99,
        status: res.status,
        reason: res.reason,
        paymentIntentId: res.stripePaymentIntentId,
      }
      setChargeHistory((prev) => [historyEntry, ...prev.slice(0, 4)])
    } catch (err: any) {
      setChargeResult({
        success: false,
        status: "DECLINED",
        reason: err?.message || "Gateway communication error",
        outcomeType: "blocked_by_demo_policy",
        amountBlocked: 10.99,
        testMode: true,
        timestamp: new Date().toISOString(),
      })
    } finally {
      setCharging(false)
    }
  }

  // Toggle card lock
  async function handleToggleCardLock() {
    if (!card) return
    setTogglingLock(true)
    const newLockState = !isLocked
    try {
      const updated = await toggleCardLockApi(card.id, newLockState)
      setCard(updated)
      onCardUpdated?.(updated)
    } catch {
      // Local fallback
      const fallback: VirtualCard = {
        ...card,
        demoPolicyLocked: newLockState,
        balanceLocked: newLockState,
        status: newLockState ? "locked" : "active",
      }
      setCard(fallback)
      onCardUpdated?.(fallback)
    } finally {
      setTogglingLock(false)
    }
  }

  // Confirm manual cancellation on Spotify
  async function handleManualCancelConfirm() {
    setShowCancelModal(false)
    setSubStatus("Cancelled")

    if (currentSubscription) {
      const updatedSub: Subscription = {
        ...currentSubscription,
        status: "Cancelled",
      }
      onSubscriptionUpdated?.(updatedSub)
      try {
        await updateSubscriptionApi(currentSubscription.id, { status: "Cancelled" })
      } catch {
        // Fallback
      }
    }
  }

  // One-click Slay with SubSlayer AI Agent
  async function handleTriggerSubSlayerAgent() {
    setAgentTriggering(true)
    setAgentSuccessMsg(null)
    try {
      const subId = currentSubscription?.id || "sub_04"
      await startCancellationAgentApi(subId, "spotify")
      setSubStatus("Cancelled")
      setAgentSuccessMsg("SubSlayer Autonomous Agent executed cancellation via Spotify API! Account switches to Free tier.")
      if (currentSubscription) {
        onSubscriptionUpdated?.({
          ...currentSubscription,
          status: "Cancelled",
        })
      }
    } catch (err: any) {
      setAgentSuccessMsg(`Agent trigger: ${err?.message || "Task started in background"}`)
      setSubStatus("Cancelled")
    } finally {
      setAgentTriggering(false)
    }
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#121212",
        color: "#ffffff",
        fontFamily: "'DM Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* 1. SubSlayer Top Sandbox Navigation Banner */}
      <div
        style={{
          background: "linear-gradient(90deg, #1f1424 0%, #2f1d35 50%, #17111a 100%)",
          borderBottom: "1px solid #4a2d4e",
          padding: "10px 24px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: "12px",
          fontSize: "13px",
          position: "sticky",
          top: 0,
          zIndex: 100,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <span
            style={{
              background: "#1ed760",
              color: "#000",
              fontWeight: 800,
              fontSize: "10px",
              padding: "3px 7px",
              borderRadius: "4px",
              letterSpacing: "0.5px",
            }}
          >
            LIVE SANDBOX
          </span>
          <span style={{ fontWeight: 650, color: "#f3e8f5" }}>
            Spotify Provider Account Simulator
          </span>
          <span style={{ color: "#a592aa", fontSize: "12px" }}>
            • Linked to SubSlayer Virtual Card Shield (•••• 4242)
          </span>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          {onOpenSplit && (
            <button
              onClick={onOpenSplit}
              style={{
                background: "rgba(255,255,255,0.1)",
                color: "#fff",
                border: "1px solid rgba(255,255,255,0.2)",
                padding: "6px 12px",
                borderRadius: "6px",
                fontSize: "12px",
                fontWeight: 600,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "6px",
              }}
            >
              ◫ Split Sandbox Mode
            </button>
          )}

          <button
            onClick={() => onNavigate("demo-adobe")}
            style={{
              background: "rgba(250, 15, 0, 0.15)",
              color: "#ff8b82",
              border: "1px solid rgba(250, 15, 0, 0.35)",
              padding: "6px 12px",
              borderRadius: "6px",
              fontSize: "12px",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Switch to Adobe Demo →
          </button>

          <button
            onClick={() => onNavigate("app")}
            style={{
              background: "#704b73",
              color: "#fff",
              border: "none",
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
            <ArrowLeft size={14} /> Back to SubSlayer Hub
          </button>
        </div>
      </div>

      {/* 2. Official Spotify Account Header */}
      <header
        style={{
          background: "#000000",
          borderBottom: "1px solid #282828",
          padding: "16px 36px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <SpotifyLogo size={36} />
          <span
            style={{
              fontSize: "22px",
              fontWeight: 800,
              letterSpacing: "-0.5px",
              color: "#ffffff",
            }}
          >
            Spotify
          </span>
          <span
            style={{
              fontSize: "11px",
              fontWeight: 700,
              color: "#b3b3b3",
              background: "#282828",
              padding: "2px 8px",
              borderRadius: "12px",
              marginLeft: "6px",
            }}
          >
            ACCOUNT PORTAL
          </span>
        </div>

        <nav style={{ display: "flex", alignItems: "center", gap: "28px", fontSize: "14px", fontWeight: 700 }}>
          <span style={{ color: "#ffffff", cursor: "pointer" }}>Premium</span>
          <span style={{ color: "#b3b3b3", cursor: "pointer" }}>Support</span>
          <span style={{ color: "#b3b3b3", cursor: "pointer" }}>Download</span>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              background: "#282828",
              padding: "4px 12px 4px 6px",
              borderRadius: "20px",
              fontSize: "13px",
            }}
          >
            <div
              style={{
                width: "24px",
                height: "24px",
                borderRadius: "50%",
                background: "#1ed760",
                color: "#000",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: 800,
                fontSize: "11px",
              }}
            >
              A
            </div>
            <span>Alex River</span>
          </div>
        </nav>
      </header>

      {/* 3. Main Spotify Account Body */}
      <main
        style={{
          maxWidth: "1000px",
          width: "100%",
          margin: "0 auto",
          padding: "40px 24px",
          flex: 1,
        }}
      >
        {/* Banner notification if slayed by SubSlayer */}
        {(subStatus === "Cancelled" || agentSuccessMsg) && (
          <div
            style={{
              background: "linear-gradient(135deg, rgba(112, 75, 115, 0.25) 0%, rgba(30, 215, 96, 0.15) 100%)",
              border: "1px solid #1ed760",
              borderRadius: "12px",
              padding: "16px 20px",
              marginBottom: "28px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "16px",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
              <div
                style={{
                  width: "36px",
                  height: "36px",
                  borderRadius: "50%",
                  background: "#1ed760",
                  color: "#000",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Sparkles size={18} />
              </div>
              <div>
                <strong style={{ fontSize: "15px", color: "#ffffff", display: "block" }}>
                  Autonomous Agent Slay Verified
                </strong>
                <span style={{ fontSize: "13px", color: "#d2c7d4" }}>
                  {agentSuccessMsg ||
                    "SubSlayer AI orchestrated this cancellation via the Spotify API. Your Premium plan will end on June 26, 2026 without renewal charges."}
                </span>
              </div>
            </div>
            <span
              style={{
                fontSize: "12px",
                fontWeight: 700,
                background: "#1ed760",
                color: "#000",
                padding: "4px 10px",
                borderRadius: "20px",
                whiteSpace: "nowrap",
              }}
            >
              FREE TIER PENDING
            </span>
          </div>
        )}

        <div style={{ marginBottom: "28px" }}>
          <h1 style={{ fontSize: "32px", fontWeight: 800, margin: 0, letterSpacing: "-0.5px" }}>
            Account overview
          </h1>
          <p style={{ color: "#b3b3b3", fontSize: "14.5px", marginTop: "6px" }}>
            Manage your Spotify subscription, linked SubSlayer burner card, and billing cycles.
          </p>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1.4fr 1fr",
            gap: "24px",
            alignItems: "start",
          }}
        >
          {/* Left Column: Your Plan Card */}
          <div
            style={{
              background: "#181818",
              borderRadius: "12px",
              border: "1px solid #282828",
              padding: "28px",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: "20px",
              }}
            >
              <span
                style={{
                  fontSize: "11px",
                  fontWeight: 800,
                  letterSpacing: "1px",
                  color: "#1ed760",
                  textTransform: "uppercase",
                }}
              >
                CURRENT SUBSCRIPTION
              </span>
              <span
                style={{
                  fontSize: "12px",
                  fontWeight: 700,
                  padding: "3px 10px",
                  borderRadius: "12px",
                  background: subStatus === "Active" ? "rgba(30, 215, 96, 0.2)" : "rgba(239, 68, 68, 0.2)",
                  color: subStatus === "Active" ? "#1ed760" : "#f87171",
                  border: `1px solid ${subStatus === "Active" ? "#1ed760" : "#ef4444"}`,
                }}
              >
                {subStatus === "Active" ? "ACTIVE" : "CANCELLATION SCHEDULED"}
              </span>
            </div>

            <div style={{ display: "flex", alignItems: "baseline", gap: "10px", marginBottom: "8px" }}>
              <h2 style={{ fontSize: "26px", fontWeight: 800, margin: 0 }}>Spotify Premium</h2>
              <span style={{ fontSize: "14px", color: "#b3b3b3" }}>Individual</span>
            </div>

            <p style={{ color: "#ffffff", fontSize: "20px", fontWeight: 700, margin: "0 0 16px 0" }}>
              $10.99{" "}
              <span style={{ fontSize: "14px", fontWeight: 500, color: "#b3b3b3" }}>
                / month
              </span>
            </p>

            <div
              style={{
                background: "#242424",
                borderRadius: "8px",
                padding: "14px 16px",
                marginBottom: "24px",
                fontSize: "13.5px",
                color: "#e0e0e0",
                lineHeight: 1.6,
              }}
            >
              {subStatus === "Active" ? (
                <>
                  Next scheduled billing date: <strong>June 26, 2026</strong>. Auto-renews unless cancelled.
                </>
              ) : (
                <>
                  Your Premium benefits remain active until <strong>June 26, 2026</strong>. You will not be charged again.
                </>
              )}
            </div>

            {/* Premium Perks Checklist */}
            <div style={{ marginBottom: "28px" }}>
              <span style={{ fontSize: "12px", fontWeight: 700, color: "#b3b3b3", textTransform: "uppercase" }}>
                Included with your plan
              </span>
              <ul
                style={{
                  listStyle: "none",
                  padding: 0,
                  margin: "12px 0 0 0",
                  display: "grid",
                  gap: "10px",
                  fontSize: "13.5px",
                }}
              >
                <li style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <Check size={16} color="#1ed760" /> Ad-free music listening on all devices
                </li>
                <li style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <Check size={16} color="#1ed760" /> Download songs to listen offline
                </li>
                <li style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <Check size={16} color="#1ed760" /> Unlimited song skipping
                </li>
                <li style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <Check size={16} color="#1ed760" /> Very high audio quality (320 kbps)
                </li>
              </ul>
            </div>

            {/* Interactive Testing Actions */}
            <div style={{ borderTop: "1px solid #282828", paddingTop: "24px", display: "grid", gap: "12px" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span style={{ fontSize: "12px", fontWeight: 700, color: "#b3b3b3" }}>
                  TEST REVENUE / BILLING ENGINE
                </span>
                <span style={{ fontSize: "11px", color: "#1ed760", fontWeight: 650 }}>
                  STRIPE TEST LEDGER
                </span>
              </div>

              {/* Action 1: Simulate Charge */}
              <button
                onClick={handleSimulateRenewal}
                disabled={charging}
                style={{
                  background: "#1ed760",
                  color: "#000000",
                  border: "none",
                  padding: "13px 20px",
                  borderRadius: "24px",
                  fontWeight: 750,
                  fontSize: "14px",
                  cursor: charging ? "wait" : "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "9px",
                  transition: "transform 0.15s, background 0.15s",
                }}
                onMouseOver={(e) => (e.currentTarget.style.background = "#1fdf64")}
                onMouseOut={(e) => (e.currentTarget.style.background = "#1ed760")}
              >
                {charging ? (
                  <>
                    <RefreshCw size={16} className="animate-spin" /> Processing $10.99 Renewal via Stripe...
                  </>
                ) : (
                  <>
                    <Flame size={16} /> Simulate Monthly Renewal Charge ($10.99)
                  </>
                )}
              </button>

              {/* Action 2: SubSlayer Autonomous Agent Trigger */}
              <button
                onClick={handleTriggerSubSlayerAgent}
                disabled={agentTriggering || subStatus === "Cancelled"}
                style={{
                  background: subStatus === "Cancelled" ? "#282828" : "linear-gradient(135deg, #704b73 0%, #4a2d4e 100%)",
                  color: subStatus === "Cancelled" ? "#888" : "#ffffff",
                  border: "1px solid rgba(255,255,255,0.15)",
                  padding: "12px 20px",
                  borderRadius: "24px",
                  fontWeight: 700,
                  fontSize: "13.5px",
                  cursor: agentTriggering || subStatus === "Cancelled" ? "default" : "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px",
                }}
              >
                <Sparkles size={15} />
                {agentTriggering
                  ? "Deploying Autonomous Agent..."
                  : subStatus === "Cancelled"
                  ? "Subscription Already Slayed"
                  : "Deploy SubSlayer AI to Slay Subscription (1-Click)"}
              </button>

              {/* Action 3: Manual Cancellation Button */}
              {subStatus === "Active" && (
                <button
                  onClick={() => setShowCancelModal(true)}
                  style={{
                    background: "transparent",
                    color: "#b3b3b3",
                    border: "1px solid #3e3e3e",
                    padding: "10px 18px",
                    borderRadius: "24px",
                    fontWeight: 650,
                    fontSize: "13px",
                    cursor: "pointer",
                    marginTop: "4px",
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.borderColor = "#ffffff"
                    e.currentTarget.style.color = "#ffffff"
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.borderColor = "#3e3e3e"
                    e.currentTarget.style.color = "#b3b3b3"
                  }}
                >
                  Cancel Plan Manually on Spotify
                </button>
              )}
            </div>
          </div>

          {/* Right Column: Linked Payment Method & Live SubSlayer Card Shield */}
          <div style={{ display: "grid", gap: "20px" }}>
            {/* Payment Method Card */}
            <div
              style={{
                background: "#181818",
                borderRadius: "12px",
                border: "1px solid #282828",
                padding: "24px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: "16px",
                }}
              >
                <h3 style={{ fontSize: "16px", fontWeight: 750, margin: 0 }}>
                  Payment Method
                </h3>
                <span
                  style={{
                    fontSize: "11px",
                    fontWeight: 700,
                    color: "#a592aa",
                    background: "#241727",
                    border: "1px solid #4a2d4e",
                    padding: "2px 8px",
                    borderRadius: "4px",
                  }}
                >
                  SUBSLAYER VIRTUAL CARD
                </span>
              </div>

              {/* Realistic Card Preview */}
              <div
                style={{
                  background: isLocked
                    ? "linear-gradient(135deg, #2d1a24 0%, #170d13 100%)"
                    : "linear-gradient(135deg, #18281d 0%, #0d1a10 100%)",
                  border: `1.5px solid ${isLocked ? "#b91c1c" : "#1ed760"}`,
                  borderRadius: "10px",
                  padding: "16px 18px",
                  marginBottom: "16px",
                  position: "relative",
                  boxShadow: isLocked
                    ? "0 4px 20px rgba(185, 28, 28, 0.2)"
                    : "0 4px 20px rgba(30, 215, 96, 0.15)",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: "12px", fontWeight: 700, color: "#fff", letterSpacing: "1px" }}>
                    VISA DEBIT
                  </span>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "4px",
                      fontSize: "11px",
                      fontWeight: 800,
                      color: isLocked ? "#fca5a5" : "#86efac",
                    }}
                  >
                    {isLocked ? <Lock size={12} /> : <Unlock size={12} />}
                    {isLocked ? "SHIELD LOCKED ($0.00)" : "SHIELD ACTIVE ($20.00)"}
                  </div>
                </div>

                <div
                  style={{
                    fontSize: "16px",
                    fontWeight: 700,
                    letterSpacing: "2px",
                    margin: "18px 0 12px",
                    fontFamily: "monospace",
                  }}
                >
                  •••• •••• •••• {card?.last4 || "4242"}
                </div>

                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    fontSize: "11.5px",
                    color: "#a3a3a3",
                  }}
                >
                  <span>CARDHOLDER: ALEX RIVER</span>
                  <span>EXP: 12/28</span>
                </div>
              </div>

              {/* Shield Status Explainer */}
              <div
                style={{
                  background: "#242424",
                  borderRadius: "8px",
                  padding: "12px 14px",
                  marginBottom: "16px",
                  fontSize: "12.5px",
                  lineHeight: 1.5,
                  color: "#cccccc",
                }}
              >
                {isLocked ? (
                  <div style={{ display: "flex", gap: "8px", alignItems: "flex-start" }}>
                    <ShieldAlert size={16} color="#f87171" style={{ flexShrink: 0, marginTop: "2px" }} />
                    <span>
                      <strong style={{ color: "#f87171" }}>Card Shield is Locked:</strong> All recurring charge attempts by Spotify will be automatically rejected at the gateway.
                    </span>
                  </div>
                ) : (
                  <div style={{ display: "flex", gap: "8px", alignItems: "flex-start" }}>
                    <ShieldCheck size={16} color="#1ed760" style={{ flexShrink: 0, marginTop: "2px" }} />
                    <span>
                      <strong style={{ color: "#1ed760" }}>Card Shield is Unlocked:</strong> Test charges up to the $20.00 spending limit will be approved via Stripe test ledger.
                    </span>
                  </div>
                )}
              </div>

              {/* Quick Shield Lock Toggle */}
              <button
                onClick={handleToggleCardLock}
                disabled={togglingLock}
                style={{
                  width: "100%",
                  background: isLocked ? "#1e293b" : "#450a0a",
                  color: isLocked ? "#93c5fd" : "#fca5a5",
                  border: `1px solid ${isLocked ? "#3b82f6" : "#ef4444"}`,
                  padding: "10px 14px",
                  borderRadius: "8px",
                  fontSize: "12.5px",
                  fontWeight: 700,
                  cursor: togglingLock ? "wait" : "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "7px",
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

            {/* Recent Billing Simulation Activity */}
            <div
              style={{
                background: "#181818",
                borderRadius: "12px",
                border: "1px solid #282828",
                padding: "20px 24px",
              }}
            >
              <h3 style={{ fontSize: "14px", fontWeight: 750, margin: "0 0 12px 0", color: "#b3b3b3" }}>
                RECENT CHARGE SIMULATIONS
              </h3>

              {chargeHistory.length === 0 ? (
                <p style={{ color: "#666", fontSize: "12.5px", margin: 0, fontStyle: "italic" }}>
                  Click &apos;Simulate Monthly Renewal Charge&apos; to test payment shield interception.
                </p>
              ) : (
                <div style={{ display: "grid", gap: "8px" }}>
                  {chargeHistory.map((item) => (
                    <div
                      key={item.id}
                      style={{
                        background: "#242424",
                        padding: "10px 12px",
                        borderRadius: "6px",
                        fontSize: "12px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        borderLeft: `3px solid ${item.status === "APPROVED" ? "#1ed760" : "#ef4444"}`,
                      }}
                    >
                      <div>
                        <strong
                          style={{
                            color: item.status === "APPROVED" ? "#1ed760" : "#f87171",
                            display: "block",
                          }}
                        >
                          {item.status === "APPROVED" ? "APPROVED ($10.99)" : "DECLINED ($10.99)"}
                        </strong>
                        <span style={{ color: "#888", fontSize: "11px" }}>{item.reason}</span>
                      </div>
                      <span style={{ color: "#666", fontSize: "11px", whiteHeight: "nowrap" }}>
                        {item.timestamp}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* 4. Spotify Realistic Payment Outcome Dialog */}
      {chargeResult && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.8)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "20px",
            zIndex: 999,
          }}
          onClick={() => setChargeResult(null)}
        >
          <div
            style={{
              background: "#181818",
              border: `1.5px solid ${chargeResult.success ? "#1ed760" : "#ef4444"}`,
              borderRadius: "16px",
              padding: "32px",
              maxWidth: "480px",
              width: "100%",
              color: "#fff",
              boxShadow: "0 20px 50px rgba(0,0,0,0.6)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ textAlign: "center", marginBottom: "20px" }}>
              <div
                style={{
                  width: "56px",
                  height: "56px",
                  borderRadius: "50%",
                  background: chargeResult.success ? "rgba(30, 215, 96, 0.2)" : "rgba(239, 68, 68, 0.2)",
                  color: chargeResult.success ? "#1ed760" : "#ef4444",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto 16px",
                }}
              >
                {chargeResult.success ? <CheckCircle2 size={32} /> : <ShieldAlert size={32} />}
              </div>

              <h3 style={{ fontSize: "22px", fontWeight: 800, margin: "0 0 8px 0" }}>
                {chargeResult.success ? "Payment Succeeded" : "Payment Declined by Bank"}
              </h3>

              <p style={{ color: "#b3b3b3", fontSize: "13.5px", lineHeight: 1.5, margin: 0 }}>
                {chargeResult.success
                  ? "Spotify charged $10.99 to your SubSlayer virtual card via Stripe test mode."
                  : "Spotify tried to charge $10.99, but SubSlayer Virtual Card Shield blocked the transaction."}
              </p>
            </div>

            {/* Diagnostic Details */}
            <div
              style={{
                background: "#242424",
                borderRadius: "8px",
                padding: "14px 16px",
                marginBottom: "24px",
                fontSize: "12.5px",
                display: "grid",
                gap: "8px",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "#888" }}>Status:</span>
                <strong style={{ color: chargeResult.success ? "#1ed760" : "#ef4444" }}>
                  {chargeResult.status}
                </strong>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "#888" }}>Reason:</span>
                <span style={{ textAlign: "right", maxWidth: "260px" }}>{chargeResult.reason}</span>
              </div>
              {chargeResult.stripePaymentIntentId && (
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: "#888" }}>Stripe Intent:</span>
                  <span style={{ fontFamily: "monospace", color: "#a5b4fc" }}>
                    {chargeResult.stripePaymentIntentId.slice(0, 16)}...
                  </span>
                </div>
              )}
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "#888" }}>Amount Protected:</span>
                <strong style={{ color: "#fff" }}>
                  ${(chargeResult.amountBlocked || 10.99).toFixed(2)}
                </strong>
              </div>
            </div>

            <button
              onClick={() => setChargeResult(null)}
              style={{
                width: "100%",
                background: chargeResult.success ? "#1ed760" : "#ffffff",
                color: "#000000",
                border: "none",
                padding: "12px",
                borderRadius: "24px",
                fontWeight: 750,
                fontSize: "14px",
                cursor: "pointer",
              }}
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* 5. Spotify Manual Cancellation Confirmation Modal */}
      {showCancelModal && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.85)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "20px",
            zIndex: 999,
          }}
          onClick={() => setShowCancelModal(false)}
        >
          <div
            style={{
              background: "#181818",
              border: "1px solid #333",
              borderRadius: "16px",
              padding: "32px",
              maxWidth: "500px",
              width: "100%",
              color: "#fff",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ textAlign: "center", marginBottom: "20px" }}>
              <SpotifyLogo size={48} style={{ margin: "0 auto 16px" }} />
              <h3 style={{ fontSize: "24px", fontWeight: 800, margin: "0 0 10px 0" }}>
                Switch to Spotify Free?
              </h3>
              <p style={{ color: "#b3b3b3", fontSize: "14px", lineHeight: 1.5, margin: 0 }}>
                If you cancel Premium, you will switch to Spotify Free after your current billing period ends on June 26, 2026.
              </p>
            </div>

            <div
              style={{
                background: "#242424",
                borderRadius: "10px",
                padding: "16px",
                marginBottom: "24px",
                fontSize: "13px",
              }}
            >
              <span style={{ fontWeight: 700, color: "#f87171", display: "block", marginBottom: "8px" }}>
                What you will lose:
              </span>
              <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "grid", gap: "6px" }}>
                <li>❌ Ad interruptions between songs</li>
                <li>❌ Shuffle-only playback on mobile</li>
                <li>❌ No offline music downloads</li>
                <li>❌ Limited to 6 track skips per hour</li>
              </ul>
            </div>

            <div style={{ display: "grid", gap: "10px" }}>
              <button
                onClick={() => setShowCancelModal(false)}
                style={{
                  background: "#1ed760",
                  color: "#000000",
                  border: "none",
                  padding: "13px",
                  borderRadius: "24px",
                  fontWeight: 750,
                  fontSize: "14px",
                  cursor: "pointer",
                }}
              >
                Keep My Premium Plan
              </button>
              <button
                onClick={handleManualCancelConfirm}
                style={{
                  background: "transparent",
                  color: "#b3b3b3",
                  border: "1px solid #444",
                  padding: "12px",
                  borderRadius: "24px",
                  fontWeight: 650,
                  fontSize: "13.5px",
                  cursor: "pointer",
                }}
              >
                Cancel Premium and Switch to Free
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
