import { useEffect, useState } from "react"
import {
  AlertCircle,
  AlertTriangle,
  ArrowLeft,
  Check,
  CheckCircle2,
  ExternalLink,
  Flame,
  HardDrive,
  Info,
  Layers,
  Lock,
  RefreshCw,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Unlock,
  X,
  Zap,
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
import { AdobeLogo } from "../common/PlatformLogos"

export interface AdobeDemoPortalProps {
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

export function AdobeDemoPortal({
  onNavigate,
  onOpenSplit,
  currentSubscription,
  onSubscriptionUpdated,
  virtualCard,
  onCardUpdated,
}: AdobeDemoPortalProps) {
  // Local state
  const [subStatus, setSubStatus] = useState<"Active" | "Cancelled" | "Pending Cancellation">(
    currentSubscription?.status || "Active",
  )
  const [card, setCard] = useState<VirtualCard | null>(virtualCard || null)
  const [charging, setCharging] = useState(false)
  const [togglingLock, setTogglingLock] = useState(false)
  const [chargeResult, setChargeResult] = useState<SimulateChargeResponse | null>(null)
  const [chargeHistory, setChargeHistory] = useState<ChargeHistoryItem[]>([])
  const [agentTriggering, setAgentTriggering] = useState(false)
  const [agentSuccessMsg, setAgentSuccessMsg] = useState<string | null>(null)

  // 4-Step Dark Pattern Maze state
  const [showMazeModal, setShowMazeModal] = useState(false)
  const [mazeStep, setMazeStep] = useState<1 | 2 | 3 | 4>(1)
  const [surveyReason, setSurveyReason] = useState<string>("")
  const [typedConfirmation, setTypedConfirmation] = useState<string>("")
  const [claimedDiscount, setClaimedDiscount] = useState(false)

  // Sync subscription and card
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
          const adobeCard =
            cards.find((c) => c.id === "card_02" || c.merchant?.toLowerCase().includes("adobe")) ||
            cards[1] ||
            cards[0]
          if (adobeCard) {
            setCard(adobeCard)
            onCardUpdated?.(adobeCard)
          }
        })
        .catch(() => {})
    }
  }, [virtualCard, onCardUpdated])

  const isLocked = Boolean(
    card?.demoPolicyLocked ?? card?.balanceLocked ?? card?.status === "locked",
  )

  // Simulate Monthly Renewal Charge ($59.99)
  async function handleSimulateRenewal() {
    setCharging(true)
    setChargeResult(null)
    setAgentSuccessMsg(null)

    const cardId = card?.id || "card_02"
    try {
      const res = await simulateChargeApi(cardId, 59.99, "Adobe")
      setChargeResult(res)

      const historyEntry: ChargeHistoryItem = {
        id: `ch_${Date.now()}`,
        timestamp: new Date().toLocaleTimeString(),
        amount: 59.99,
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
        amountBlocked: 59.99,
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

  // Complete manual cancellation through dark pattern gauntlet
  async function handleCompleteManualGauntlet() {
    setShowMazeModal(false)
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

  // One-click Slay with SubSlayer AI Agent (Bypasses dark pattern maze & waives fees!)
  async function handleTriggerSubSlayerAgent() {
    setShowMazeModal(false)
    setAgentTriggering(true)
    setAgentSuccessMsg(null)

    try {
      const subId = currentSubscription?.id || "sub_01"
      await startCancellationAgentApi(subId, "adobe")
      setSubStatus("Cancelled")
      setAgentSuccessMsg(
        "SubSlayer AI bypassed the 4-step retention maze! Injected contract waiver protocols via Adobe API with $0.00 early cancellation penalty fees.",
      )
      if (currentSubscription) {
        onSubscriptionUpdated?.({
          ...currentSubscription,
          status: "Cancelled",
        })
      }
    } catch (err: any) {
      setAgentSuccessMsg(`Agent executed: ${err?.message || "Subscription slayed via backend orchestrator"}`)
      setSubStatus("Cancelled")
    } finally {
      setAgentTriggering(false)
    }
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#1e1e1e",
        color: "#ffffff",
        fontFamily: "'DM Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* 1. SubSlayer Top Sandbox Banner */}
      <div
        style={{
          background: "linear-gradient(90deg, #2b1115 0%, #3d151c 50%, #1a0a0d 100%)",
          borderBottom: "1px solid #751b22",
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
              background: "#fa0f00",
              color: "#fff",
              fontWeight: 800,
              fontSize: "10px",
              padding: "3px 7px",
              borderRadius: "4px",
              letterSpacing: "0.5px",
            }}
          >
            DARK PATTERN SANDBOX
          </span>
          <span style={{ fontWeight: 650, color: "#ffebee" }}>
            Adobe Creative Cloud Account Simulator
          </span>
          <span style={{ color: "#d99aa1", fontSize: "12px" }}>
            • Test 4-step retention maze, asset threats, &amp; SubSlayer fee-waiver agent
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
            onClick={() => onNavigate("demo-spotify")}
            style={{
              background: "rgba(30, 215, 96, 0.15)",
              color: "#86efac",
              border: "1px solid rgba(30, 215, 96, 0.35)",
              padding: "6px 12px",
              borderRadius: "6px",
              fontSize: "12px",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Switch to Spotify Demo →
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

      {/* 2. Official Adobe Creative Cloud Header */}
      <header
        style={{
          background: "#141414",
          borderBottom: "1px solid #333333",
          padding: "14px 36px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
          <AdobeLogo size={32} />
          <span
            style={{
              fontSize: "19px",
              fontWeight: 800,
              letterSpacing: "-0.4px",
              color: "#ffffff",
            }}
          >
            Adobe Account
          </span>
          <span
            style={{
              fontSize: "11px",
              fontWeight: 700,
              color: "#aaa",
              background: "#2a2a2a",
              padding: "2px 8px",
              borderRadius: "4px",
              marginLeft: "4px",
            }}
          >
            CREATIVE CLOUD
          </span>
        </div>

        <nav style={{ display: "flex", alignItems: "center", gap: "28px", fontSize: "13.5px", fontWeight: 650 }}>
          <span style={{ color: "#ffffff", borderBottom: "2px solid #fa0f00", paddingBottom: "14px" }}>
            Plans &amp; Payment
          </span>
          <span style={{ color: "#999", cursor: "pointer" }}>Profile</span>
          <span style={{ color: "#999", cursor: "pointer" }}>Password &amp; Security</span>
          <span style={{ color: "#999", cursor: "pointer" }}>Connected Apps</span>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              background: "#2a2a2a",
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
                background: "#fa0f00",
                color: "#fff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: 800,
                fontSize: "11px",
              }}
            >
              A
            </div>
            <span>alex.river@subslayer.demo</span>
          </div>
        </nav>
      </header>

      {/* 3. Main Adobe Body Content */}
      <main
        style={{
          maxWidth: "1050px",
          width: "100%",
          margin: "0 auto",
          padding: "36px 24px",
          flex: 1,
        }}
      >
        {/* Banner notification if slayed by SubSlayer */}
        {(subStatus === "Cancelled" || agentSuccessMsg) && (
          <div
            style={{
              background: "linear-gradient(135deg, rgba(112, 75, 115, 0.3) 0%, rgba(250, 15, 0, 0.15) 100%)",
              border: "1px solid #704b73",
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
                  width: "38px",
                  height: "38px",
                  borderRadius: "50%",
                  background: "#704b73",
                  color: "#fff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Sparkles size={19} />
              </div>
              <div>
                <strong style={{ fontSize: "15px", color: "#ffffff", display: "block" }}>
                  SubSlayer AI Fee-Waived Cancellation Verified
                </strong>
                <span style={{ fontSize: "13px", color: "#d2c7d4" }}>
                  {agentSuccessMsg ||
                    "SubSlayer AI orchestrated this cancellation via Adobe's billing gateway. The $119.98 early termination fee was successfully waived! Plan ends on June 28, 2026."}
                </span>
              </div>
            </div>
            <span
              style={{
                fontSize: "12px",
                fontWeight: 700,
                background: "#704b73",
                color: "#fff",
                padding: "5px 12px",
                borderRadius: "20px",
                whiteSpace: "nowrap",
              }}
            >
              $0 FEE WAIVER CONFIRMED
            </span>
          </div>
        )}

        <div style={{ marginBottom: "26px" }}>
          <h1 style={{ fontSize: "28px", fontWeight: 800, margin: 0, letterSpacing: "-0.5px" }}>
            Plans &amp; Subscriptions
          </h1>
          <p style={{ color: "#aaa", fontSize: "14px", marginTop: "5px" }}>
            View your active Creative Cloud licenses, cloud storage quota, and payment methods.
          </p>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1.45fr 1fr",
            gap: "24px",
            alignItems: "start",
          }}
        >
          {/* Left Column: Plan Details Card */}
          <div
            style={{
              background: "#252525",
              borderRadius: "12px",
              border: "1px solid #363636",
              padding: "28px",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: "18px",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <div
                  style={{
                    width: "32px",
                    height: "32px",
                    borderRadius: "6px",
                    background: "#fa0f00",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#fff",
                    fontWeight: 900,
                    fontSize: "14px",
                  }}
                >
                  CC
                </div>
                <div>
                  <h2 style={{ fontSize: "20px", fontWeight: 800, margin: 0 }}>
                    Creative Cloud All Apps
                  </h2>
                  <span style={{ fontSize: "12.5px", color: "#aaa" }}>
                    Annual commitment, paid monthly
                  </span>
                </div>
              </div>

              <span
                style={{
                  fontSize: "11.5px",
                  fontWeight: 700,
                  padding: "4px 10px",
                  borderRadius: "12px",
                  background: subStatus === "Active" ? "rgba(34, 197, 94, 0.2)" : "rgba(239, 68, 68, 0.2)",
                  color: subStatus === "Active" ? "#4ade80" : "#f87171",
                  border: `1px solid ${subStatus === "Active" ? "#22c55e" : "#ef4444"}`,
                }}
              >
                {subStatus === "Active" ? "ACTIVE CONTRACT" : "CANCELLATION PENDING"}
              </span>
            </div>

            <div
              style={{
                display: "flex",
                alignItems: "baseline",
                gap: "8px",
                marginBottom: "20px",
                padding: "14px 16px",
                background: "#1c1c1c",
                borderRadius: "8px",
              }}
            >
              <span style={{ fontSize: "28px", fontWeight: 800, color: "#fff" }}>
                {claimedDiscount ? "$29.99" : "$59.99"}
              </span>
              <span style={{ color: "#aaa", fontSize: "14px" }}>
                / month (incl. VAT)
              </span>
              {claimedDiscount && (
                <span
                  style={{
                    marginLeft: "auto",
                    background: "#22c55e",
                    color: "#000",
                    fontWeight: 800,
                    fontSize: "11px",
                    padding: "2px 8px",
                    borderRadius: "4px",
                  }}
                >
                  RETENTION 50% DISCOUNT APPLIED
                </span>
              )}
            </div>

            {/* Cloud Storage Usage Bar */}
            <div style={{ marginBottom: "24px" }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  fontSize: "12.5px",
                  marginBottom: "8px",
                  color: "#ccc",
                }}
              >
                <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <HardDrive size={14} /> Cloud Storage
                </span>
                <span>
                  <strong>42.8 GB</strong> of 100 GB used (42%)
                </span>
              </div>
              <div
                style={{
                  height: "8px",
                  background: "#1a1a1a",
                  borderRadius: "4px",
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    width: "42.8%",
                    height: "100%",
                    background: "linear-gradient(90deg, #fa0f00 0%, #ff6b6b 100%)",
                  }}
                />
              </div>
            </div>

            {/* Contract Notice */}
            <div
              style={{
                background: "#1c1c1c",
                borderRadius: "8px",
                padding: "14px 16px",
                marginBottom: "24px",
                fontSize: "13px",
                lineHeight: 1.55,
                color: "#ddd",
                borderLeft: "3px solid #fa0f00",
              }}
            >
              {subStatus === "Active" ? (
                <>
                  Contract status: <strong>Annual commitment (6 months remaining)</strong>. Next billing date: <strong>June 28, 2026</strong>.
                  <span style={{ display: "block", color: "#f87171", fontSize: "12px", marginTop: "4px" }}>
                    *Standard early cancellation fee: 50% of remaining term ($119.98).
                  </span>
                </>
              ) : (
                <>
                  Cancellation processed. Access remains active until <strong>June 28, 2026</strong>. Early termination fee waived by SubSlayer AI defense protocol ($0.00 charged).
                </>
              )}
            </div>

            {/* Included Apps Pill Grid */}
            <div style={{ marginBottom: "26px" }}>
              <span style={{ fontSize: "12px", fontWeight: 700, color: "#888", textTransform: "uppercase" }}>
                20+ Creative Apps Included
              </span>
              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: "6px",
                  marginTop: "8px",
                }}
              >
                {[
                  "Photoshop",
                  "Illustrator",
                  "Premiere Pro",
                  "After Effects",
                  "InDesign",
                  "Lightroom",
                  "Acrobat Pro",
                  "Firefly AI",
                ].map((app) => (
                  <span
                    key={app}
                    style={{
                      background: "#1a1a1a",
                      fontSize: "12px",
                      padding: "4px 10px",
                      borderRadius: "4px",
                      color: "#eee",
                      border: "1px solid #333",
                    }}
                  >
                    {app}
                  </span>
                ))}
              </div>
            </div>

            {/* Interactive Testing Actions */}
            <div style={{ borderTop: "1px solid #333", paddingTop: "24px", display: "grid", gap: "12px" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span style={{ fontSize: "12px", fontWeight: 700, color: "#888" }}>
                  SIMULATE BILLING &amp; AGENT DEFENSE
                </span>
                <span style={{ fontSize: "11px", color: "#ff8b82", fontWeight: 700 }}>
                  DEMO POLICY HUB
                </span>
              </div>

              {/* Action 1: Simulate Charge */}
              <button
                onClick={handleSimulateRenewal}
                disabled={charging}
                style={{
                  background: "#fa0f00",
                  color: "#ffffff",
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
                }}
                onMouseOver={(e) => (e.currentTarget.style.background = "#d60d00")}
                onMouseOut={(e) => (e.currentTarget.style.background = "#fa0f00")}
              >
                {charging ? (
                  <>
                    <RefreshCw size={16} className="animate-spin" /> Processing $59.99 Adobe Invoice...
                  </>
                ) : (
                  <>
                    <Flame size={16} /> Simulate Monthly Renewal Charge ($59.99)
                  </>
                )}
              </button>

              {/* Action 2: Trigger SubSlayer AI Fee-Waived Agent */}
              <button
                onClick={handleTriggerSubSlayerAgent}
                disabled={agentTriggering || subStatus === "Cancelled"}
                style={{
                  background: subStatus === "Cancelled" ? "#2a2a2a" : "linear-gradient(135deg, #704b73 0%, #4a2d4e 100%)",
                  color: subStatus === "Cancelled" ? "#777" : "#ffffff",
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
                  ? "Slaying via SubSlayer Agent..."
                  : subStatus === "Cancelled"
                  ? "Subscription Already Slayed ($0 Fee)"
                  : "Slay with SubSlayer AI (Bypass Dark Patterns & Waive Fee)"}
              </button>

              {/* Action 3: Enter the 4-Step Dark Pattern Maze (Manual Flow) */}
              {subStatus === "Active" && (
                <button
                  onClick={() => {
                    setMazeStep(1)
                    setSurveyReason("")
                    setTypedConfirmation("")
                    setShowMazeModal(true)
                  }}
                  style={{
                    background: "transparent",
                    color: "#bbb",
                    border: "1px solid #444",
                    padding: "10px 18px",
                    borderRadius: "24px",
                    fontWeight: 650,
                    fontSize: "13px",
                    cursor: "pointer",
                    marginTop: "4px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "6px",
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.borderColor = "#fa0f00"
                    e.currentTarget.style.color = "#ff8b82"
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.borderColor = "#444"
                    e.currentTarget.style.color = "#bbb"
                  }}
                >
                  <AlertTriangle size={14} /> Experience Adobe Manual Dark Pattern Maze (4 Steps)
                </button>
              )}
            </div>
          </div>

          {/* Right Column: Virtual Card Shield & Activity */}
          <div style={{ display: "grid", gap: "20px" }}>
            {/* Payment Method Card */}
            <div
              style={{
                background: "#252525",
                borderRadius: "12px",
                border: "1px solid #363636",
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
                  Billing Card
                </h3>
                <span
                  style={{
                    fontSize: "11px",
                    fontWeight: 700,
                    color: "#f87171",
                    background: "#331215",
                    border: "1px solid #751b22",
                    padding: "2px 8px",
                    borderRadius: "4px",
                  }}
                >
                  CARD_02 (ADOBE DEMO)
                </span>
              </div>

              {/* Virtual Card Rendering */}
              <div
                style={{
                  background: isLocked
                    ? "linear-gradient(135deg, #2b1115 0%, #15090b 100%)"
                    : "linear-gradient(135deg, #17241b 0%, #0c140f 100%)",
                  border: `1.5px solid ${isLocked ? "#ef4444" : "#22c55e"}`,
                  borderRadius: "10px",
                  padding: "16px 18px",
                  marginBottom: "16px",
                  position: "relative",
                  boxShadow: isLocked
                    ? "0 4px 20px rgba(239, 68, 68, 0.2)"
                    : "0 4px 20px rgba(34, 197, 94, 0.15)",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: "12px", fontWeight: 700, color: "#fff", letterSpacing: "1px" }}>
                    VISA SIGNATURE
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
                    {isLocked ? "SHIELD LOCKED ($0.00)" : "SHIELD ACTIVE ($60.00)"}
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
                    color: "#888",
                  }}
                >
                  <span>CARDHOLDER: ALEX RIVER</span>
                  <span>EXP: 12/28</span>
                </div>
              </div>

              {/* Shield Status Explainer */}
              <div
                style={{
                  background: "#1c1c1c",
                  borderRadius: "8px",
                  padding: "12px 14px",
                  marginBottom: "16px",
                  fontSize: "12.5px",
                  lineHeight: 1.5,
                  color: "#ccc",
                }}
              >
                {isLocked ? (
                  <div style={{ display: "flex", gap: "8px", alignItems: "flex-start" }}>
                    <ShieldAlert size={16} color="#f87171" style={{ flexShrink: 0, marginTop: "2px" }} />
                    <span>
                      <strong style={{ color: "#f87171" }}>Card Shield is Locked:</strong> Recurring Adobe charges and penalty fees of $119.98 will be blocked at the gateway before billing.
                    </span>
                  </div>
                ) : (
                  <div style={{ display: "flex", gap: "8px", alignItems: "flex-start" }}>
                    <ShieldCheck size={16} color="#22c55e" style={{ flexShrink: 0, marginTop: "2px" }} />
                    <span>
                      <strong style={{ color: "#22c55e" }}>Card Shield is Unlocked:</strong> Test charges up to the $60.00 spending limit will be approved via Stripe test mode.
                    </span>
                  </div>
                )}
              </div>

              {/* Toggle Card Lock Button */}
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
                background: "#252525",
                borderRadius: "12px",
                border: "1px solid #363636",
                padding: "20px 24px",
              }}
            >
              <h3 style={{ fontSize: "14px", fontWeight: 750, margin: "0 0 12px 0", color: "#aaa" }}>
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
                        background: "#1c1c1c",
                        padding: "10px 12px",
                        borderRadius: "6px",
                        fontSize: "12px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        borderLeft: `3px solid ${item.status === "APPROVED" ? "#22c55e" : "#ef4444"}`,
                      }}
                    >
                      <div>
                        <strong
                          style={{
                            color: item.status === "APPROVED" ? "#4ade80" : "#f87171",
                            display: "block",
                          }}
                        >
                          {item.status === "APPROVED" ? "APPROVED ($59.99)" : "DECLINED ($59.99)"}
                        </strong>
                        <span style={{ color: "#777", fontSize: "11px" }}>{item.reason}</span>
                      </div>
                      <span style={{ color: "#555", fontSize: "11px", whiteSpace: "nowrap" }}>
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

      {/* 4. Realistic Adobe Charge Outcome Dialog */}
      {chargeResult && (
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
          onClick={() => setChargeResult(null)}
        >
          <div
            style={{
              background: "#252525",
              border: `1.5px solid ${chargeResult.success ? "#22c55e" : "#ef4444"}`,
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
                  background: chargeResult.success ? "rgba(34, 197, 94, 0.2)" : "rgba(239, 68, 68, 0.2)",
                  color: chargeResult.success ? "#4ade80" : "#f87171",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto 16px",
                }}
              >
                {chargeResult.success ? <CheckCircle2 size={32} /> : <ShieldAlert size={32} />}
              </div>

              <h3 style={{ fontSize: "22px", fontWeight: 800, margin: "0 0 8px 0" }}>
                {chargeResult.success ? "Adobe Payment Processed" : "Adobe Charge Blocked by Shield"}
              </h3>

              <p style={{ color: "#aaa", fontSize: "13.5px", lineHeight: 1.5, margin: 0 }}>
                {chargeResult.success
                  ? "Adobe billed $59.99 against Visa ending in 4242 via Stripe test mode."
                  : "Adobe attempted to charge $59.99, but SubSlayer Virtual Card Shield blocked the charge."}
              </p>
            </div>

            <div
              style={{
                background: "#1c1c1c",
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
                <strong style={{ color: chargeResult.success ? "#4ade80" : "#f87171" }}>
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
                  ${(chargeResult.amountBlocked || 59.99).toFixed(2)}
                </strong>
              </div>
            </div>

            <button
              onClick={() => setChargeResult(null)}
              style={{
                width: "100%",
                background: chargeResult.success ? "#fa0f00" : "#ffffff",
                color: chargeResult.success ? "#ffffff" : "#000000",
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

      {/* 5. The Legendary 4-Step Dark Pattern Maze Simulator Modal */}
      {showMazeModal && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.88)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "20px",
            zIndex: 999,
          }}
          onClick={() => setShowMazeModal(false)}
        >
          <div
            style={{
              background: "#252525",
              border: "1px solid #444",
              borderRadius: "16px",
              padding: "36px",
              maxWidth: "580px",
              width: "100%",
              color: "#fff",
              position: "relative",
              boxShadow: "0 25px 60px rgba(0,0,0,0.8)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Step Progress Header */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: "20px",
                borderBottom: "1px solid #363636",
                paddingBottom: "14px",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <span
                  style={{
                    fontSize: "11px",
                    fontWeight: 800,
                    color: "#fa0f00",
                    background: "rgba(250, 15, 0, 0.15)",
                    padding: "3px 8px",
                    borderRadius: "4px",
                  }}
                >
                  DARK PATTERN MAZE: STEP {mazeStep} OF 4
                </span>
                <span style={{ fontSize: "12px", color: "#888" }}>
                  {mazeStep === 1
                    ? "Asset Threat"
                    : mazeStep === 2
                    ? "Retention Discount Trap"
                    : mazeStep === 3
                    ? "Penalty Fee Shock"
                    : "Typing Gauntlet"}
                </span>
              </div>
              <button
                onClick={() => setShowMazeModal(false)}
                style={{
                  background: "none",
                  border: "none",
                  color: "#aaa",
                  cursor: "pointer",
                }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Persistent SubSlayer AI Contrast Banner */}
            <div
              style={{
                background: "linear-gradient(135deg, rgba(112, 75, 115, 0.25) 0%, rgba(250, 15, 0, 0.1) 100%)",
                border: "1px dashed #704b73",
                borderRadius: "8px",
                padding: "10px 14px",
                marginBottom: "22px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: "10px",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "12.5px" }}>
                <Sparkles size={16} color="#d4b4db" />
                <span>
                  <strong style={{ color: "#f3e8f5" }}>Tired of Adobe&apos;s maze?</strong> SubSlayer AI waives fees in 1 click.
                </span>
              </div>
              <button
                onClick={handleTriggerSubSlayerAgent}
                style={{
                  background: "#704b73",
                  color: "#fff",
                  border: "none",
                  padding: "5px 11px",
                  borderRadius: "16px",
                  fontSize: "11.5px",
                  fontWeight: 700,
                  cursor: "pointer",
                  whiteSpace: "nowrap",
                }}
              >
                🚀 Slay with AI ($0 Fee)
              </button>
            </div>

            {/* STEP 1: Loss of Apps & Assets Guilt */}
            {mazeStep === 1 && (
              <div>
                <div style={{ textAlign: "center", marginBottom: "22px" }}>
                  <div
                    style={{
                      width: "52px",
                      height: "52px",
                      borderRadius: "50%",
                      background: "rgba(250, 15, 0, 0.15)",
                      color: "#fa0f00",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      margin: "0 auto 14px",
                    }}
                  >
                    <AlertTriangle size={28} />
                  </div>
                  <h3 style={{ fontSize: "22px", fontWeight: 800, margin: "0 0 6px 0" }}>
                    Alex, are you sure you want to cancel?
                  </h3>
                  <p style={{ color: "#aaa", fontSize: "13.5px", margin: 0, lineHeight: 1.5 }}>
                    You will permanently lose access to all Creative Cloud services and synced project assets.
                  </p>
                </div>

                <div
                  style={{
                    background: "#1c1c1c",
                    borderRadius: "10px",
                    padding: "16px",
                    marginBottom: "24px",
                    fontSize: "13px",
                  }}
                >
                  <span style={{ fontWeight: 700, color: "#fa0f00", display: "block", marginBottom: "8px" }}>
                    What you will immediately lose:
                  </span>
                  <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "grid", gap: "6px" }}>
                    <li>❌ Desktop access to 20+ applications (Photoshop, Premiere, Illustrator, etc.)</li>
                    <li>❌ 42.8 GB Cloud Storage — files will be permanently purged after 30 days</li>
                    <li>❌ 1,000 monthly Generative AI Firefly credits</li>
                    <li>❌ 20,000+ Adobe Fonts sync library</li>
                  </ul>
                </div>

                <div style={{ display: "grid", gap: "10px" }}>
                  {/* Big bold primary button urging user to stay */}
                  <button
                    onClick={() => setShowMazeModal(false)}
                    style={{
                      background: "#0265dc",
                      color: "#ffffff",
                      border: "none",
                      padding: "13px",
                      borderRadius: "24px",
                      fontWeight: 750,
                      fontSize: "14px",
                      cursor: "pointer",
                    }}
                  >
                    Keep My Plan (Recommended)
                  </button>

                  {/* Tiny, faint text link at bottom */}
                  <button
                    onClick={() => setMazeStep(2)}
                    style={{
                      background: "none",
                      border: "none",
                      color: "#777",
                      fontSize: "12px",
                      padding: "8px",
                      cursor: "pointer",
                      textDecoration: "underline",
                    }}
                    onMouseOver={(e) => (e.currentTarget.style.color = "#aaa")}
                    onMouseOut={(e) => (e.currentTarget.style.color = "#777")}
                  >
                    ...continue to cancellation (Step 2/4)
                  </button>
                </div>
              </div>
            )}

            {/* STEP 2: Desperate Discount Trap */}
            {mazeStep === 2 && (
              <div>
                <div style={{ textAlign: "center", marginBottom: "22px" }}>
                  <div
                    style={{
                      width: "52px",
                      height: "52px",
                      borderRadius: "50%",
                      background: "rgba(34, 197, 94, 0.15)",
                      color: "#22c55e",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      margin: "0 auto 14px",
                    }}
                  >
                    <Zap size={28} />
                  </div>
                  <h3 style={{ fontSize: "22px", fontWeight: 800, margin: "0 0 6px 0" }}>
                    Special Limited Offer for Alex
                  </h3>
                  <p style={{ color: "#aaa", fontSize: "13.5px", margin: 0, lineHeight: 1.5 }}>
                    We want you to keep creating. Stay today with an exclusive 50% discount!
                  </p>
                </div>

                <div
                  style={{
                    background: "#1c1c1c",
                    border: "1.5px solid #22c55e",
                    borderRadius: "10px",
                    padding: "20px",
                    marginBottom: "24px",
                    textAlign: "center",
                  }}
                >
                  <span style={{ fontSize: "12px", fontWeight: 800, color: "#22c55e", textTransform: "uppercase" }}>
                    EXCLUSIVE 50% OFF RETENTION PRICING
                  </span>
                  <div style={{ fontSize: "32px", fontWeight: 900, color: "#fff", margin: "8px 0" }}>
                    $29.99{" "}
                    <span style={{ fontSize: "14px", fontWeight: 500, color: "#888" }}>
                      / month (Save $90.00)
                    </span>
                  </div>
                  <p style={{ fontSize: "12.5px", color: "#ccc", margin: 0 }}>
                    Keep all 20+ apps, 100 GB storage, and Firefly credits for $29.99/mo for the next 3 months.
                  </p>
                </div>

                <div style={{ display: "grid", gap: "10px" }}>
                  <button
                    onClick={() => {
                      setClaimedDiscount(true)
                      setShowMazeModal(false)
                    }}
                    style={{
                      background: "#22c55e",
                      color: "#000000",
                      border: "none",
                      padding: "13px",
                      borderRadius: "24px",
                      fontWeight: 800,
                      fontSize: "14px",
                      cursor: "pointer",
                    }}
                  >
                    Claim 50% Discount &amp; Stay
                  </button>

                  <button
                    onClick={() => setMazeStep(3)}
                    style={{
                      background: "none",
                      border: "none",
                      color: "#777",
                      fontSize: "12px",
                      padding: "8px",
                      cursor: "pointer",
                      textDecoration: "underline",
                    }}
                    onMouseOver={(e) => (e.currentTarget.style.color = "#aaa")}
                    onMouseOut={(e) => (e.currentTarget.style.color = "#777")}
                  >
                    ...no thanks, continue to cancel (Step 3/4)
                  </button>
                </div>
              </div>
            )}

            {/* STEP 3: Early Termination Penalty Fee Shock */}
            {mazeStep === 3 && (
              <div>
                <div style={{ textAlign: "center", marginBottom: "22px" }}>
                  <div
                    style={{
                      width: "52px",
                      height: "52px",
                      borderRadius: "50%",
                      background: "rgba(250, 15, 0, 0.2)",
                      color: "#fa0f00",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      margin: "0 auto 14px",
                    }}
                  >
                    <AlertCircle size={28} />
                  </div>
                  <h3 style={{ fontSize: "22px", fontWeight: 800, margin: "0 0 6px 0" }}>
                    Early Termination Fee Warning
                  </h3>
                  <p style={{ color: "#aaa", fontSize: "13.5px", margin: 0, lineHeight: 1.5 }}>
                    Your contract requires an early cancellation penalty fee.
                  </p>
                </div>

                <div
                  style={{
                    background: "#2d1115",
                    border: "1.5px solid #fa0f00",
                    borderRadius: "10px",
                    padding: "18px",
                    marginBottom: "24px",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                    <span style={{ fontSize: "13px", color: "#fca5a5", fontWeight: 700 }}>
                      Contract Penalty Amount:
                    </span>
                    <span style={{ fontSize: "22px", fontWeight: 900, color: "#fff" }}>
                      $119.98
                    </span>
                  </div>
                  <p style={{ fontSize: "12px", color: "#fca5a5", margin: 0, lineHeight: 1.5 }}>
                    Because your contract is an Annual commitment with 6 months remaining, your terms of service require 50% of your remaining balance ($119.98). This fee will be charged today to your card ending in 4242.
                  </p>
                </div>

                <div style={{ display: "grid", gap: "10px" }}>
                  <button
                    onClick={() => setShowMazeModal(false)}
                    style={{
                      background: "#0265dc",
                      color: "#ffffff",
                      border: "none",
                      padding: "13px",
                      borderRadius: "24px",
                      fontWeight: 750,
                      fontSize: "14px",
                      cursor: "pointer",
                    }}
                  >
                    Switch to a Cheaper Plan Instead
                  </button>

                  <button
                    onClick={() => setMazeStep(4)}
                    style={{
                      background: "none",
                      border: "none",
                      color: "#777",
                      fontSize: "12px",
                      padding: "8px",
                      cursor: "pointer",
                      textDecoration: "underline",
                    }}
                    onMouseOver={(e) => (e.currentTarget.style.color = "#aaa")}
                    onMouseOut={(e) => (e.currentTarget.style.color = "#777")}
                  >
                    ...acknowledge $119.98 fee and proceed (Step 4/4)
                  </button>
                </div>
              </div>
            )}

            {/* STEP 4: Mandatory Survey & Typing Confirmation Friction */}
            {mazeStep === 4 && (
              <div>
                <h3 style={{ fontSize: "20px", fontWeight: 800, margin: "0 0 12px 0" }}>
                  Final Confirmation &amp; Survey
                </h3>

                <div style={{ marginBottom: "18px" }}>
                  <span style={{ fontSize: "12.5px", fontWeight: 700, color: "#aaa", display: "block", marginBottom: "8px" }}>
                    Why are you cancelling? (Required)
                  </span>
                  <div style={{ display: "grid", gap: "6px" }}>
                    {[
                      "Too expensive for my budget",
                      "Switching to another tool (Canva, Figma)",
                      "Not using it frequently enough",
                      "Software is buggy or slow",
                    ].map((reason) => (
                      <label
                        key={reason}
                        style={{
                          background: "#1c1c1c",
                          padding: "8px 12px",
                          borderRadius: "6px",
                          fontSize: "12.5px",
                          display: "flex",
                          alignItems: "center",
                          gap: "8px",
                          cursor: "pointer",
                        }}
                      >
                        <input
                          type="radio"
                          name="reason"
                          checked={surveyReason === reason}
                          onChange={() => setSurveyReason(reason)}
                        />
                        {reason}
                      </label>
                    ))}
                  </div>
                </div>

                <div style={{ marginBottom: "24px" }}>
                  <span style={{ fontSize: "12.5px", fontWeight: 700, color: "#f87171", display: "block", marginBottom: "6px" }}>
                    To confirm and authorize the $119.98 fee, type CANCEL below:
                  </span>
                  <input
                    type="text"
                    value={typedConfirmation}
                    onChange={(e) => setTypedConfirmation(e.target.value)}
                    placeholder="Type CANCEL in uppercase"
                    style={{
                      width: "100%",
                      padding: "10px 14px",
                      background: "#1c1c1c",
                      border: "1px solid #444",
                      borderRadius: "6px",
                      color: "#fff",
                      fontSize: "14px",
                      fontFamily: "monospace",
                    }}
                  />
                </div>

                <div style={{ display: "grid", gap: "10px" }}>
                  <button
                    onClick={handleCompleteManualGauntlet}
                    disabled={!surveyReason || typedConfirmation !== "CANCEL"}
                    style={{
                      background:
                        surveyReason && typedConfirmation === "CANCEL"
                          ? "#fa0f00"
                          : "#3a2022",
                      color:
                        surveyReason && typedConfirmation === "CANCEL"
                          ? "#ffffff"
                          : "#888",
                      border: "none",
                      padding: "13px",
                      borderRadius: "24px",
                      fontWeight: 750,
                      fontSize: "14px",
                      cursor:
                        surveyReason && typedConfirmation === "CANCEL"
                          ? "pointer"
                          : "not-allowed",
                    }}
                  >
                    Confirm Cancellation &amp; Bill $119.98
                  </button>

                  <button
                    onClick={() => setShowMazeModal(false)}
                    style={{
                      background: "none",
                      border: "none",
                      color: "#aaa",
                      fontSize: "13px",
                      padding: "6px",
                      cursor: "pointer",
                    }}
                  >
                    Cancel and Keep Creative Cloud
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
