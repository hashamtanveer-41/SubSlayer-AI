import { useEffect, useState } from "react"
import {
  AlertCircle,
  ArrowLeft,
  Check,
  CheckCircle2,
  ChevronDown,
  ExternalLink,
  Flame,
  Globe,
  Lock,
  Music,
  RefreshCw,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Unlock,
  User,
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
import { SpotifyLogo, SpotifyWordmark } from "../common/PlatformLogos"
import { BrowserWindowFrame } from "./BrowserWindowFrame"
import { AgentActionOverlay } from "./AgentActionOverlay"

export interface SpotifyDemoPortalProps {
  onNavigate: (page: Page) => void
  onOpenSplit?: () => void
  currentSubscription?: Subscription | null
  onSubscriptionUpdated?: (sub: Subscription) => void
  virtualCard?: VirtualCard | null
  onCardUpdated?: (card: VirtualCard) => void
  embedded?: boolean
}

export function SpotifyDemoPortal({
  onNavigate,
  onOpenSplit,
  currentSubscription,
  onSubscriptionUpdated,
  virtualCard,
  onCardUpdated,
  embedded = false,
}: SpotifyDemoPortalProps) {
  const [subStatus, setSubStatus] = useState<"Active" | "Cancelled">(
    currentSubscription?.status === "Cancelled" ? "Cancelled" : "Active",
  )
  const [card, setCard] = useState<VirtualCard | null>(virtualCard || null)
  const [charging, setCharging] = useState(false)
  const [togglingLock, setTogglingLock] = useState(false)
  const [showCancelModal, setShowCancelModal] = useState(false)
  const [chargeResult, setChargeResult] = useState<SimulateChargeResponse | null>(null)

  // AI Agent Animation Overlay State
  const [isAgentRunning, setIsAgentRunning] = useState(false)
  const [agentStep, setAgentStep] = useState(1)
  const [showAgentOverlay, setShowAgentOverlay] = useState(false)

  const agentStepMessages = [
    "Connecting to Spotify Account Gateway...",
    "Locating Premium Individual Plan (Visa •••• 4242)...",
    "Submitting autonomous cancellation protocol via Spotify API...",
    "Verified: Cancellation successful! Next billing $0.00.",
  ]

  useEffect(() => {
    if (currentSubscription) {
      setSubStatus(currentSubscription.status === "Cancelled" ? "Cancelled" : "Active")
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

    const cardId = card?.id || "card_01"
    try {
      const res = await simulateChargeApi(cardId, 10.99, "Spotify")
      setChargeResult(res)
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

  // Autonomous AI Cancellation Agent Execution
  async function handleRunAIAgent() {
    if (isAgentRunning || subStatus === "Cancelled") return

    setIsAgentRunning(true)
    setShowAgentOverlay(true)
    setAgentStep(1)

    // Step 1: Navigating
    await new Promise((r) => setTimeout(r, 650))
    setAgentStep(2)

    // Step 2: Locating
    await new Promise((r) => setTimeout(r, 750))
    setAgentStep(3)

    // Step 3: Trigger API
    const subId = currentSubscription?.id || "sub_04"
    try {
      await startCancellationAgentApi(subId, "spotify")
    } catch {
      // Backend simulation fallback
    }

    // Step 4: Verification
    await new Promise((r) => setTimeout(r, 700))
    setAgentStep(4)
    setSubStatus("Cancelled")

    if (currentSubscription) {
      const updatedSub: Subscription = {
        ...currentSubscription,
        status: "Cancelled",
      }
      onSubscriptionUpdated?.(updatedSub)
      try {
        await updateSubscriptionApi(currentSubscription.id, { status: "Cancelled" })
      } catch {}
    }

    setIsAgentRunning(false)
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
      } catch {}
    }
  }

  // The Pure Spotify Page Content
  const portalContent = (
    <div
      style={{
        background: "#121212",
        color: "#ffffff",
        minHeight: "100%",
        fontFamily: "-apple-system, BlinkMacSystemFont, 'Circular Std', 'DM Sans', Roboto, sans-serif",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* 1. Authentic Spotify Black Top Bar */}
      <header
        style={{
          background: "#000000",
          height: "64px",
          padding: "0 32px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          borderBottom: "1px solid #202020",
        }}
      >
        <SpotifyWordmark height={32} />

        <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
          <span style={{ fontSize: "14px", fontWeight: 700, color: "#ffffff", cursor: "pointer" }}>
            Premium
          </span>
          <span style={{ fontSize: "14px", fontWeight: 700, color: "#b3b3b3", cursor: "pointer" }}>
            Support
          </span>

          <div style={{ width: "1px", height: "16px", background: "#333333" }} />

          {/* User Profile Pill */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              background: "#181818",
              padding: "4px 12px 4px 6px",
              borderRadius: "20px",
              border: "1px solid #282828",
            }}
          >
            <div
              style={{
                width: "26px",
                height: "26px",
                borderRadius: "50%",
                background: "#282828",
                color: "#1ed760",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: 800,
                fontSize: "12px",
              }}
            >
              A
            </div>
            <span style={{ fontSize: "13px", fontWeight: 700, color: "#ffffff" }}>Alex River</span>
          </div>
        </div>
      </header>

      {/* 2. Main Account View Container */}
      <main
        style={{
          maxWidth: "860px",
          width: "100%",
          margin: "0 auto",
          padding: "40px 24px 60px",
          flex: 1,
        }}
      >
        {/* Breadcrumb / Title */}
        <div style={{ marginBottom: "28px" }}>
          <span style={{ fontSize: "12px", fontWeight: 700, color: "#a7a7a7", textTransform: "uppercase", letterSpacing: "1px" }}>
            Account Overview
          </span>
          <h1
            style={{
              fontSize: "36px",
              fontWeight: 900,
              letterSpacing: "-1px",
              margin: "6px 0 0 0",
              color: "#ffffff",
            }}
          >
            Your plan
          </h1>
        </div>

        {/* Live Charge Simulation Result Banner */}
        {chargeResult && (
          <div
            style={{
              background: chargeResult.success ? "rgba(16, 185, 129, 0.12)" : "rgba(239, 68, 68, 0.12)",
              border: `1.5px solid ${chargeResult.success ? "#10b981" : "#ef4444"}`,
              borderRadius: "10px",
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
                  background: chargeResult.success ? "#10b981" : "#ef4444",
                  color: "#000",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                {chargeResult.success ? <CheckCircle2 size={20} color="#000" /> : <ShieldAlert size={20} color="#fff" />}
              </div>
              <div>
                <strong style={{ fontSize: "15px", color: "#fff", display: "block" }}>
                  {chargeResult.success
                    ? "Recurring Charge Approved ($10.99)"
                    : "Recurring Charge Declined ($10.99)"}
                </strong>
                <span style={{ fontSize: "13px", color: chargeResult.success ? "#a7f3d0" : "#fca5a5" }}>
                  {chargeResult.success
                    ? "Spotify monthly renewal of $10.99 was processed successfully via Stripe test mode."
                    : "Spotify attempted to bill $10.99 to Visa •••• 4242, but SubSlayer Virtual Card Shield blocked the transaction ($0.00 spend limit enforced)."}
                </span>
              </div>
            </div>

            <button
              onClick={() => setChargeResult(null)}
              style={{
                background: "transparent",
                border: "none",
                color: "#a7a7a7",
                cursor: "pointer",
                padding: "4px",
              }}
            >
              <X size={18} />
            </button>
          </div>
        )}

        {/* Slayed Announcement Banner */}
        {subStatus === "Cancelled" && (
          <div
            style={{
              background: "linear-gradient(135deg, rgba(30, 215, 96, 0.15) 0%, rgba(112, 75, 115, 0.25) 100%)",
              border: "1.5px solid #1ed760",
              borderRadius: "10px",
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
                  flexShrink: 0,
                }}
              >
                <Sparkles size={18} />
              </div>
              <div>
                <strong style={{ fontSize: "15px", color: "#fff", display: "block" }}>
                  Subscription Slayed by SubSlayer AI
                </strong>
                <span style={{ fontSize: "13px", color: "#d1c7d6" }}>
                  Your Spotify Premium will end on June 26, 2026. Account will switch to Spotify Free with $0.00 further charges.
                </span>
              </div>
            </div>

            <span
              style={{
                background: "#1ed760",
                color: "#000000",
                fontWeight: 800,
                fontSize: "11px",
                padding: "4px 12px",
                borderRadius: "20px",
                whiteSpace: "nowrap",
              }}
            >
              FREE TIER PENDING
            </span>
          </div>
        )}

        {/* 3. The Iconic Spotify Plan Card */}
        <div
          style={{
            background: "#242424",
            borderRadius: "12px",
            overflow: "hidden",
            border: "1px solid #333333",
            boxShadow: "0 10px 30px rgba(0,0,0,0.4)",
          }}
        >
          {/* Top Vibrant Banner Header */}
          <div
            style={{
              background:
                subStatus === "Active"
                  ? "linear-gradient(135deg, #f037a5 0%, #9030ea 100%)"
                  : "linear-gradient(135deg, #37333a 0%, #201c22 100%)",
              padding: "24px 32px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <div>
              <span
                style={{
                  fontSize: "11px",
                  fontWeight: 900,
                  letterSpacing: "1px",
                  textTransform: "uppercase",
                  color: "#000000",
                  background: "#ffffff",
                  padding: "3px 8px",
                  borderRadius: "4px",
                  display: "inline-block",
                  marginBottom: "8px",
                }}
              >
                {subStatus === "Active" ? "SPOTIFY PREMIUM" : "CANCELLATION SCHEDULED"}
              </span>
              <h2 style={{ fontSize: "28px", fontWeight: 900, margin: 0, color: "#ffffff", letterSpacing: "-0.5px" }}>
                Individual
              </h2>
            </div>

            <span
              style={{
                fontSize: "13px",
                fontWeight: 700,
                background: "rgba(0,0,0,0.4)",
                color: "#ffffff",
                padding: "5px 14px",
                borderRadius: "20px",
              }}
            >
              1 account
            </span>
          </div>

          {/* Card Body Details */}
          <div style={{ padding: "32px" }}>
            <p style={{ fontSize: "14.5px", color: "#e0e0e0", lineHeight: 1.6, margin: "0 0 24px 0" }}>
              {subStatus === "Active" ? (
                <>
                  Next billing date is <strong>June 26, 2026</strong>. You will be automatically charged{" "}
                  <strong>$10.99 / month</strong>.
                </>
              ) : (
                <>
                  Your Premium benefits will end on <strong>June 26, 2026</strong>. After this date, your
                  account will switch to Spotify Free with no further renewal charges.
                </>
              )}
            </p>

            {/* Feature Checklist */}
            <div style={{ display: "grid", gap: "12px", marginBottom: "28px", fontSize: "14px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <Check size={18} color="#1ed760" /> Ad-free music listening
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <Check size={18} color="#1ed760" /> Download songs to listen offline
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <Check size={18} color="#1ed760" /> Unlimited skips &amp; high audio quality
              </div>
            </div>

            {/* Payment Method & Status Row */}
            <div
              style={{
                background: "#181818",
                borderRadius: "8px",
                padding: "16px 20px",
                marginBottom: "28px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                flexWrap: "wrap",
                gap: "12px",
              }}
            >
              <div>
                <span style={{ fontSize: "12px", color: "#a7a7a7", display: "block" }}>
                  Payment method
                </span>
                <strong style={{ fontSize: "15px", color: "#ffffff" }}>
                  Visa ending in {card?.last4 || "4242"}
                </strong>
              </div>

              <div style={{ textAlign: "right" }}>
                <span style={{ fontSize: "12px", color: "#a7a7a7", display: "block" }}>
                  Monthly billing
                </span>
                <strong style={{ fontSize: "18px", color: "#ffffff" }}>
                  $10.99 / mo
                </strong>
              </div>
            </div>

            {/* Action Buttons */}
            <div style={{ display: "flex", gap: "14px", alignItems: "center", flexWrap: "wrap" }}>
              <button
                style={{
                  background: "#ffffff",
                  color: "#000000",
                  border: "none",
                  borderRadius: "500px",
                  padding: "12px 30px",
                  fontSize: "14px",
                  fontWeight: 700,
                  cursor: "pointer",
                  transition: "transform 0.15s ease",
                }}
                onMouseOver={(e) => (e.currentTarget.style.transform = "scale(1.04)")}
                onMouseOut={(e) => (e.currentTarget.style.transform = "scale(1)")}
              >
                Change plan
              </button>

              {subStatus === "Active" ? (
                <button
                  onClick={() => setShowCancelModal(true)}
                  style={{
                    background: "transparent",
                    color: "#ffffff",
                    border: "1px solid #727272",
                    borderRadius: "500px",
                    padding: "12px 30px",
                    fontSize: "14px",
                    fontWeight: 700,
                    cursor: "pointer",
                    transition: "all 0.15s ease",
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.borderColor = "#ffffff"
                    e.currentTarget.style.transform = "scale(1.04)"
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.borderColor = "#727272"
                    e.currentTarget.style.transform = "scale(1)"
                  }}
                >
                  Cancel subscription
                </button>
              ) : (
                <button
                  disabled
                  style={{
                    background: "#282828",
                    color: "#777777",
                    border: "1px solid #383838",
                    borderRadius: "500px",
                    padding: "12px 30px",
                    fontSize: "14px",
                    fontWeight: 700,
                    cursor: "default",
                  }}
                >
                  Subscription Cancelled
                </button>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Manual Cancellation Confirmation Modal */}
      {showCancelModal && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.75)",
            backdropFilter: "blur(4px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "20px",
            zIndex: 1000,
          }}
          onClick={() => setShowCancelModal(false)}
        >
          <div
            style={{
              background: "#242424",
              border: "1px solid #3e3e3e",
              borderRadius: "12px",
              padding: "36px",
              maxWidth: "480px",
              width: "100%",
              color: "#ffffff",
              boxShadow: "0 25px 60px rgba(0,0,0,0.7)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ fontSize: "24px", fontWeight: 800, margin: "0 0 12px 0", color: "#ffffff" }}>
              Cancel Spotify Premium?
            </h3>
            <p style={{ fontSize: "14.5px", color: "#b3b3b3", lineHeight: 1.5, margin: "0 0 24px 0" }}>
              You will switch to Spotify Free on <strong>June 26, 2026</strong>. You can still play all your playlists and favorite artists, with occasional audio ads between songs.
            </p>

            <div style={{ display: "grid", gap: "10px" }}>
              <button
                onClick={handleManualCancelConfirm}
                style={{
                  background: "#1ed760",
                  color: "#000000",
                  border: "none",
                  padding: "14px",
                  borderRadius: "500px",
                  fontWeight: 800,
                  fontSize: "14.5px",
                  cursor: "pointer",
                }}
              >
                Yes, cancel Premium
              </button>

              <button
                onClick={() => setShowCancelModal(false)}
                style={{
                  background: "transparent",
                  color: "#ffffff",
                  border: "1px solid #727272",
                  padding: "14px",
                  borderRadius: "500px",
                  fontWeight: 700,
                  fontSize: "14.5px",
                  cursor: "pointer",
                }}
              >
                Keep my Premium
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Autonomous Agent Execution Overlay */}
      {showAgentOverlay && (
        <AgentActionOverlay
          currentStep={agentStep}
          stepMessages={agentStepMessages}
          providerName="Spotify Premium"
          onClose={() => setShowAgentOverlay(false)}
        />
      )}
    </div>
  )

  if (embedded) {
    return portalContent
  }

  return (
    <BrowserWindowFrame
      url="https://accounts.spotify.com/en/account/overview"
      title="Spotify — Account Overview"
      provider="spotify"
      isLocked={isLocked}
      onToggleLock={handleToggleCardLock}
      onSimulateCharge={handleSimulateRenewal}
      onRunAgent={handleRunAIAgent}
      isCharging={charging}
      isAgentRunning={isAgentRunning}
      isCancelled={subStatus === "Cancelled"}
      onBackToHub={() => onNavigate("app")}
      onSwitchProvider={() => onNavigate("demo-adobe")}
    >
      {portalContent}
    </BrowserWindowFrame>
  )
}
