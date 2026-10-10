import { useEffect, useState } from "react"
import {
  AlertCircle,
  AlertTriangle,
  ArrowLeft,
  Check,
  CheckCircle2,
  ChevronDown,
  Cloud,
  CreditCard,
  Download,
  ExternalLink,
  Flame,
  Globe,
  HardDrive,
  HelpCircle,
  Info,
  Lock,
  RefreshCw,
  Search,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Unlock,
  User,
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
import {
  AdobeLogo,
  AdobeCreativeCloudLogo,
  PhotoshopIcon,
  IllustratorIcon,
  PremiereIcon,
  AfterEffectsIcon,
  InDesignIcon,
  AcrobatIcon,
} from "../common/PlatformLogos"
import { BrowserWindowFrame } from "./BrowserWindowFrame"
import { AgentActionOverlay } from "./AgentActionOverlay"

export interface AdobeDemoPortalProps {
  onNavigate: (page: Page) => void
  onOpenSplit?: () => void
  currentSubscription?: Subscription | null
  onSubscriptionUpdated?: (sub: Subscription) => void
  virtualCard?: VirtualCard | null
  onCardUpdated?: (card: VirtualCard) => void
  embedded?: boolean
}

export function AdobeDemoPortal({
  onNavigate,
  onOpenSplit,
  currentSubscription,
  onSubscriptionUpdated,
  virtualCard,
  onCardUpdated,
  embedded = false,
}: AdobeDemoPortalProps) {
  const [subStatus, setSubStatus] = useState<"Active" | "Cancelled">(
    currentSubscription?.status === "Cancelled" ? "Cancelled" : "Active",
  )
  const [card, setCard] = useState<VirtualCard | null>(virtualCard || null)
  const [charging, setCharging] = useState(false)
  const [togglingLock, setTogglingLock] = useState(false)
  const [chargeResult, setChargeResult] = useState<SimulateChargeResponse | null>(null)

  // 3-Step Dark Pattern Maze Modal state
  const [showMazeModal, setShowMazeModal] = useState(false)
  const [mazeStep, setMazeStep] = useState<1 | 2 | 3>(1)
  const [claimedDiscount, setClaimedDiscount] = useState(false)

  // AI Agent Animation Overlay State
  const [isAgentRunning, setIsAgentRunning] = useState(false)
  const [agentStep, setAgentStep] = useState(1)
  const [showAgentOverlay, setShowAgentOverlay] = useState(false)

  const agentStepMessages = [
    "Connecting to Adobe Account Gateway...",
    "Bypassing retention discount traps & asset loss hurdles...",
    "Injecting SubSlayer contract waiver protocol ($119.98 fee waived)...",
    "Verified: Creative Cloud cancelled with $0.00 penalty fee!",
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

    const cardId = card?.id || "card_02"
    try {
      const res = await simulateChargeApi(cardId, 59.99, "Adobe")
      setChargeResult(res)
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

    setShowMazeModal(false)
    setIsAgentRunning(true)
    setShowAgentOverlay(true)
    setAgentStep(1)

    // Step 1: Navigating
    await new Promise((r) => setTimeout(r, 650))
    setAgentStep(2)

    // Step 2: Bypassing dark patterns
    await new Promise((r) => setTimeout(r, 750))
    setAgentStep(3)

    // Step 3: Trigger API & Waive fee
    const subId = currentSubscription?.id || "sub_01"
    try {
      await startCancellationAgentApi(subId, "adobe")
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

  // Complete manual cancellation through dark pattern gauntlet
  async function handleManualGauntletConfirm() {
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
      } catch {}
    }
  }

  // The Pure Adobe Spectrum Page Content
  const portalContent = (
    <div
      style={{
        background: "#f8f9fa",
        color: "#222222",
        minHeight: "100%",
        fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* 1. Authentic Adobe White Header */}
      <header
        style={{
          background: "#ffffff",
          height: "64px",
          padding: "0 32px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          borderBottom: "1px solid #e5e5e5",
          boxShadow: "0 1px 3px rgba(0,0,0,0.02)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <AdobeLogo size={28} />
          <span style={{ fontSize: "18px", fontWeight: 800, color: "#fa0f00", letterSpacing: "-0.5px" }}>
            Adobe
          </span>
          <div style={{ width: "1px", height: "16px", background: "#dcdcdc" }} />
          <span style={{ fontSize: "15px", fontWeight: 700, color: "#222222" }}>
            Account
          </span>
        </div>

        {/* Navigation Tabs */}
        <nav style={{ display: "flex", alignItems: "center", gap: "28px", height: "100%" }}>
          <span
            style={{
              fontSize: "14px",
              fontWeight: 700,
              color: "#0265dc",
              borderBottom: "3px solid #0265dc",
              height: "100%",
              display: "flex",
              alignItems: "center",
              cursor: "pointer",
            }}
          >
            Plans &amp; Products
          </span>
          <span
            style={{
              fontSize: "14px",
              fontWeight: 500,
              color: "#555555",
              height: "100%",
              display: "flex",
              alignItems: "center",
              cursor: "pointer",
            }}
          >
            Order history
          </span>
          <span
            style={{
              fontSize: "14px",
              fontWeight: 500,
              color: "#555555",
              height: "100%",
              display: "flex",
              alignItems: "center",
              cursor: "pointer",
            }}
          >
            Profile
          </span>
        </nav>

        {/* User Avatar */}
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div
            style={{
              width: "32px",
              height: "32px",
              borderRadius: "50%",
              background: "#0265dc",
              color: "#ffffff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: 800,
              fontSize: "13px",
            }}
          >
            A
          </div>
          <span style={{ fontSize: "13px", fontWeight: 600, color: "#444444" }}>Alex River</span>
        </div>
      </header>

      {/* 2. Main Account View Container */}
      <main
        style={{
          maxWidth: "880px",
          width: "100%",
          margin: "0 auto",
          padding: "36px 24px 60px",
          flex: 1,
        }}
      >
        {/* Title */}
        <div style={{ marginBottom: "24px" }}>
          <h1 style={{ fontSize: "30px", fontWeight: 800, margin: "0 0 6px 0", color: "#111111", letterSpacing: "-0.5px" }}>
            Plans &amp; Products
          </h1>
          <p style={{ color: "#666666", fontSize: "14px", margin: 0 }}>
            Manage your Adobe subscriptions, cloud storage, and annual commitments.
          </p>
        </div>

        {/* Live Charge Simulation Result Banner */}
        {chargeResult && (
          <div
            style={{
              background: chargeResult.success ? "#f0fdf4" : "#fef2f2",
              border: `1.5px solid ${chargeResult.success ? "#10b981" : "#ef4444"}`,
              borderRadius: "10px",
              padding: "16px 20px",
              marginBottom: "24px",
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
                  color: "#fff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                {chargeResult.success ? <CheckCircle2 size={20} /> : <ShieldAlert size={20} />}
              </div>
              <div>
                <strong style={{ fontSize: "15px", color: "#111827", display: "block" }}>
                  {chargeResult.success
                    ? "Monthly Charge Approved ($59.99)"
                    : "Monthly Charge Declined ($59.99)"}
                </strong>
                <span style={{ fontSize: "13px", color: chargeResult.success ? "#166534" : "#991b1b" }}>
                  {chargeResult.success
                    ? "Adobe monthly renewal of US$59.99 was processed successfully via Stripe test mode."
                    : "Adobe attempted to charge US$59.99 to Visa •••• 4242, but SubSlayer Virtual Card Shield blocked the charge ($0.00 spend limit enforced)."}
                </span>
              </div>
            </div>

            <button
              onClick={() => setChargeResult(null)}
              style={{
                background: "transparent",
                border: "none",
                color: "#666",
                cursor: "pointer",
                padding: "4px",
              }}
            >
              <X size={18} />
            </button>
          </div>
        )}

        {/* Slay Announcement Banner */}
        {subStatus === "Cancelled" && (
          <div
            style={{
              background: "#f4eff5",
              border: "1.5px solid #704b73",
              borderRadius: "10px",
              padding: "16px 20px",
              marginBottom: "24px",
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
                  background: "#704b73",
                  color: "#fff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <Sparkles size={18} />
              </div>
              <div>
                <strong style={{ fontSize: "15px", color: "#321d36", display: "block" }}>
                  SubSlayer AI Fee-Waived Cancellation Verified
                </strong>
                <span style={{ fontSize: "13px", color: "#5a4360" }}>
                  SubSlayer AI orchestrated this cancellation via Adobe API. The $119.98 early termination fee was waived! Creative Cloud access ends on June 28, 2026.
                </span>
              </div>
            </div>

            <span
              style={{
                fontSize: "11px",
                fontWeight: 800,
                background: "#704b73",
                color: "#ffffff",
                padding: "4px 12px",
                borderRadius: "20px",
                whiteSpace: "nowrap",
              }}
            >
              $0 PENALTY FEE
            </span>
          </div>
        )}

        {/* 3. The Pure Adobe Creative Cloud Plan Card */}
        <div
          style={{
            background: "#ffffff",
            borderRadius: "12px",
            border: "1px solid #e1e1e1",
            boxShadow: "0 2px 10px rgba(0,0,0,0.04)",
            padding: "28px",
          }}
        >
          {/* Card Top Row: CC Logo, Title, Price */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              borderBottom: "1px solid #f0f0f0",
              paddingBottom: "22px",
              marginBottom: "22px",
            }}
          >
            <div style={{ display: "flex", gap: "16px", alignItems: "center" }}>
              <AdobeCreativeCloudLogo size={48} />
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <h2 style={{ fontSize: "22px", fontWeight: 800, margin: 0, color: "#111111" }}>
                    Creative Cloud All Apps
                  </h2>
                  <span
                    style={{
                      fontSize: "12px",
                      fontWeight: 700,
                      padding: "2px 8px",
                      borderRadius: "10px",
                      background: subStatus === "Active" ? "#e6f9ed" : "#fef2f2",
                      color: subStatus === "Active" ? "#0f7b3d" : "#b91c1c",
                      border: `1px solid ${subStatus === "Active" ? "#b7ebd0" : "#fecaca"}`,
                    }}
                  >
                    {subStatus === "Active" ? "Active" : "Cancellation Scheduled"}
                  </span>
                </div>
                <span style={{ fontSize: "13px", color: "#666666", marginTop: "3px", display: "block" }}>
                  Annual plan, paid monthly
                </span>
              </div>
            </div>

            <div style={{ textAlign: "right" }}>
              <span style={{ fontSize: "26px", fontWeight: 800, color: "#111111" }}>
                {claimedDiscount ? "US$29.99" : "US$59.99"}
              </span>
              <span style={{ fontSize: "13px", color: "#666666" }}> / mo</span>
              {claimedDiscount && (
                <div
                  style={{
                    fontSize: "11px",
                    fontWeight: 800,
                    color: "#0f7b3d",
                    background: "#e6f9ed",
                    padding: "2px 6px",
                    borderRadius: "4px",
                    marginTop: "3px",
                  }}
                >
                  50% DISCOUNT APPLIED
                </div>
              )}
            </div>
          </div>

          {/* Details Row: Cloud Storage, Contract, Payment */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr 1fr",
              gap: "24px",
              marginBottom: "24px",
              fontSize: "13.5px",
            }}
          >
            {/* Cloud Storage */}
            <div>
              <span style={{ color: "#666666", fontWeight: 600, display: "block", marginBottom: "6px" }}>
                Cloud storage
              </span>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px", fontSize: "12.5px" }}>
                <strong>42.8 GB of 100 GB used</strong>
                <span style={{ color: "#666666" }}>42%</span>
              </div>
              <div style={{ height: "6px", background: "#f0f0f0", borderRadius: "3px", overflow: "hidden" }}>
                <div style={{ width: "42.8%", height: "100%", background: "#0265dc" }} />
              </div>
            </div>

            {/* Contract Commitment Status */}
            <div>
              <span style={{ color: "#666666", fontWeight: 600, display: "block", marginBottom: "4px" }}>
                Contract status
              </span>
              {subStatus === "Active" ? (
                <div>
                  <strong style={{ color: "#222222" }}>Renews on June 28, 2026</strong>
                  <span style={{ display: "block", fontSize: "12px", color: "#b91c1c", marginTop: "2px" }}>
                    *Annual commitment (6 months remaining)
                  </span>
                </div>
              ) : (
                <div>
                  <strong style={{ color: "#b91c1c" }}>Access ends June 28, 2026</strong>
                  <span style={{ display: "block", fontSize: "12px", color: "#0f7b3d", marginTop: "2px" }}>
                    Fee waived by SubSlayer ($0.00 charged)
                  </span>
                </div>
              )}
            </div>

            {/* Payment Method */}
            <div>
              <span style={{ color: "#666666", fontWeight: 600, display: "block", marginBottom: "4px" }}>
                Payment method
              </span>
              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <CreditCard size={15} color="#555555" />
                <strong style={{ color: "#222222" }}>Visa ending in {card?.last4 || "4242"}</strong>
              </div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: "6px" }}>
                <span style={{ fontSize: "12px", color: "#666666" }}>Expires 12/28</span>
                <button
                  onClick={handleSimulateRenewal}
                  disabled={charging}
                  style={{
                    background: "#ffffff",
                    border: "1px solid #d0d0d0",
                    color: "#222222",
                    borderRadius: "20px",
                    padding: "4px 10px",
                    fontSize: "11.5px",
                    fontWeight: 600,
                    cursor: charging ? "wait" : "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "5px",
                  }}
                  title="Simulate monthly Adobe renewal charge"
                >
                  {charging ? <RefreshCw size={11} className="animate-spin" /> : <Flame size={11} color="#fa0f00" />}
                  {charging ? "Charging..." : "Test US$59.99 Charge"}
                </button>
              </div>
            </div>
          </div>

          {/* Included Apps Preview */}
          <div style={{ marginBottom: "24px" }}>
            <span style={{ fontSize: "12.5px", fontWeight: 700, color: "#666666", display: "block", marginBottom: "10px" }}>
              INCLUDED APPS
            </span>
            <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
              {[
                { name: "Photoshop", icon: <PhotoshopIcon size={30} /> },
                { name: "Illustrator", icon: <IllustratorIcon size={30} /> },
                { name: "Premiere Pro", icon: <PremiereIcon size={30} /> },
                { name: "After Effects", icon: <AfterEffectsIcon size={30} /> },
                { name: "InDesign", icon: <InDesignIcon size={30} /> },
                { name: "Acrobat Pro", icon: <AcrobatIcon size={30} /> },
              ].map((app) => (
                <div
                  key={app.name}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    padding: "6px 10px",
                    borderRadius: "6px",
                    background: "#f9f9f9",
                    border: "1px solid #ebebeb",
                    fontSize: "12.5px",
                    fontWeight: 600,
                  }}
                >
                  {app.icon}
                  <span>{app.name}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Action Row */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              paddingTop: "20px",
              borderTop: "1px solid #f0f0f0",
              flexWrap: "wrap",
              gap: "12px",
            }}
          >
            <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
              <button
                style={{
                  background: "#0265dc",
                  color: "#ffffff",
                  border: "none",
                  borderRadius: "20px",
                  padding: "10px 24px",
                  fontSize: "13.5px",
                  fontWeight: 700,
                  cursor: "pointer",
                }}
                onMouseOver={(e) => (e.currentTarget.style.background = "#0054b6")}
                onMouseOut={(e) => (e.currentTarget.style.background = "#0265dc")}
              >
                Manage plan
              </button>

              <button
                style={{
                  background: "#ffffff",
                  color: "#222222",
                  border: "1px solid #b3b3b3",
                  borderRadius: "20px",
                  padding: "10px 24px",
                  fontSize: "13.5px",
                  fontWeight: 700,
                  cursor: "pointer",
                }}
                onMouseOver={(e) => (e.currentTarget.style.background = "#f5f5f5")}
                onMouseOut={(e) => (e.currentTarget.style.background = "#ffffff")}
              >
                Edit payment
              </button>
            </div>

            {subStatus === "Active" ? (
              <button
                onClick={() => {
                  setMazeStep(1)
                  setShowMazeModal(true)
                }}
                style={{
                  background: "none",
                  border: "none",
                  color: "#0265dc",
                  fontSize: "13.5px",
                  fontWeight: 650,
                  cursor: "pointer",
                  textDecoration: "underline",
                }}
              >
                Cancel plan
              </button>
            ) : (
              <span style={{ fontSize: "13px", color: "#666666", fontWeight: 600 }}>
                Cancellation request confirmed
              </span>
            )}
          </div>
        </div>
      </main>

      {/* 4. Authentic Adobe 3-Step Dark Pattern Maze Modal */}
      {showMazeModal && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.7)",
            backdropFilter: "blur(4px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "20px",
            zIndex: 1000,
          }}
          onClick={() => setShowMazeModal(false)}
        >
          <div
            style={{
              background: "#ffffff",
              border: "1px solid #d5d5d5",
              borderRadius: "12px",
              padding: "36px",
              maxWidth: "520px",
              width: "100%",
              color: "#222",
              boxShadow: "0 25px 60px rgba(0,0,0,0.3)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header / Step indicator */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                paddingBottom: "16px",
                borderBottom: "1px solid #ebebeb",
                marginBottom: "20px",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <span
                  style={{
                    background: "#fef2f2",
                    color: "#b91c1c",
                    fontSize: "11px",
                    fontWeight: 800,
                    padding: "3px 8px",
                    borderRadius: "4px",
                  }}
                >
                  STEP {mazeStep} OF 3
                </span>
                <span style={{ fontSize: "13px", color: "#666666" }}>
                  {mazeStep === 1
                    ? "Asset Loss Warning"
                    : mazeStep === 2
                    ? "Retention Offer"
                    : "Early Termination Penalty Fee"}
                </span>
              </div>

              <button
                onClick={() => setShowMazeModal(false)}
                style={{ background: "none", border: "none", cursor: "pointer", color: "#666666" }}
              >
                <X size={18} />
              </button>
            </div>

            {/* SubSlayer 1-Click Waiver Banner */}
            <div
              style={{
                background: "#f7f1fa",
                border: "1.5px dashed var(--accent, #72556e)",
                borderRadius: "8px",
                padding: "12px 16px",
                marginBottom: "20px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: "12px",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "12.5px" }}>
                <Sparkles size={16} color="var(--accent, #72556e)" />
                <span style={{ color: "var(--color-ink, #302b32)" }}>
                  <strong>Skip this dark pattern:</strong> SubSlayer AI waives the $119.98 fee.
                </span>
              </div>
              <button
                onClick={handleRunAIAgent}
                style={{
                  background: "var(--accent, #72556e)",
                  color: "#ffffff",
                  border: "none",
                  padding: "7px 14px",
                  borderRadius: "7px",
                  fontSize: "12px",
                  fontWeight: 650,
                  cursor: "pointer",
                  whiteSpace: "nowrap",
                  transition: "background 0.15s",
                }}
                onMouseOver={(e) => (e.currentTarget.style.background = "var(--accent-dark, #5b4058)")}
                onMouseOut={(e) => (e.currentTarget.style.background = "var(--accent, #72556e)")}
              >
                ⚡ Slay ($0 Fee)
              </button>
            </div>

            {/* STEP 1: Loss of Apps & Assets Threat */}
            {mazeStep === 1 && (
              <div>
                <h3 style={{ fontSize: "20px", fontWeight: 800, margin: "0 0 10px 0", color: "#222222" }}>
                  Alex, are you sure you want to cancel?
                </h3>
                <p style={{ fontSize: "13.5px", color: "#666666", lineHeight: 1.5, margin: "0 0 18px 0" }}>
                  You will lose access to all Creative Cloud apps, cloud files, and synced fonts.
                </p>

                <div
                  style={{
                    background: "#fff8f8",
                    border: "1px solid #fecaca",
                    borderRadius: "8px",
                    padding: "14px",
                    marginBottom: "20px",
                    fontSize: "12.5px",
                    color: "#b91c1c",
                  }}
                >
                  <strong>What happens to your work:</strong>
                  <ul style={{ margin: "6px 0 0 0", paddingLeft: "18px" }}>
                    <li>42.8 GB cloud files will be locked and deleted after 30 days</li>
                    <li>Firefly generative AI credits will expire immediately</li>
                    <li>Adobe Fonts library will be deactivated across your design files</li>
                  </ul>
                </div>

                <div style={{ display: "grid", gap: "10px" }}>
                  <button
                    onClick={() => setShowMazeModal(false)}
                    style={{
                      background: "#0265dc",
                      color: "#ffffff",
                      border: "none",
                      padding: "12px",
                      borderRadius: "20px",
                      fontWeight: 750,
                      fontSize: "14px",
                      cursor: "pointer",
                    }}
                  >
                    Keep my plan (Recommended)
                  </button>

                  <button
                    onClick={() => setMazeStep(2)}
                    style={{
                      background: "none",
                      border: "none",
                      color: "#666666",
                      fontSize: "12.5px",
                      padding: "6px",
                      cursor: "pointer",
                      textDecoration: "underline",
                    }}
                  >
                    Continue to cancellation →
                  </button>
                </div>
              </div>
            )}

            {/* STEP 2: Retention Discount Trap */}
            {mazeStep === 2 && (
              <div>
                <h3 style={{ fontSize: "20px", fontWeight: 800, margin: "0 0 8px 0", color: "#222222" }}>
                  Special Offer Just For You
                </h3>
                <p style={{ fontSize: "13.5px", color: "#666666", margin: "0 0 18px 0" }}>
                  We’d hate to see you go. Keep Creative Cloud for 50% off for the next 3 months!
                </p>

                <div
                  style={{
                    background: "#f0fdf4",
                    border: "1.5px solid #10b981",
                    borderRadius: "10px",
                    padding: "20px",
                    marginBottom: "20px",
                    textAlign: "center",
                  }}
                >
                  <span style={{ fontSize: "11px", fontWeight: 800, color: "#065f46", textTransform: "uppercase" }}>
                    EXCLUSIVE 50% RETENTION DISCOUNT
                  </span>
                  <div style={{ fontSize: "28px", fontWeight: 900, color: "#111827", margin: "6px 0" }}>
                    US$29.99{" "}
                    <span style={{ fontSize: "13px", fontWeight: 500, color: "#666666" }}>
                      / month (Save US$90.00)
                    </span>
                  </div>
                  <p style={{ fontSize: "12.5px", color: "#374151", margin: 0 }}>
                    Keep all 20+ apps, 100 GB storage, and Firefly AI credits for only $29.99/mo.
                  </p>
                </div>

                <div style={{ display: "grid", gap: "10px" }}>
                  <button
                    onClick={() => {
                      setClaimedDiscount(true)
                      setShowMazeModal(false)
                    }}
                    style={{
                      background: "#0265dc",
                      color: "#ffffff",
                      border: "none",
                      padding: "12px",
                      borderRadius: "20px",
                      fontWeight: 750,
                      fontSize: "14px",
                      cursor: "pointer",
                    }}
                  >
                    Accept offer &amp; Keep Plan
                  </button>

                  <button
                    onClick={() => setMazeStep(3)}
                    style={{
                      background: "none",
                      border: "none",
                      color: "#666666",
                      fontSize: "12.5px",
                      padding: "6px",
                      cursor: "pointer",
                      textDecoration: "underline",
                    }}
                  >
                    No thanks, continue to cancel →
                  </button>
                </div>
              </div>
            )}

            {/* STEP 3: Early Termination Fee Warning */}
            {mazeStep === 3 && (
              <div>
                <div style={{ textAlign: "center", marginBottom: "14px" }}>
                  <div
                    style={{
                      width: "48px",
                      height: "48px",
                      borderRadius: "50%",
                      background: "#fffbeb",
                      color: "#b45309",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      margin: "0 auto 10px",
                    }}
                  >
                    <AlertTriangle size={24} />
                  </div>
                  <h3 style={{ fontSize: "20px", fontWeight: 800, margin: "0 0 6px 0", color: "#222222" }}>
                    Early Cancellation Fee Warning
                  </h3>
                  <p style={{ fontSize: "13px", color: "#666666", margin: 0 }}>
                    Your annual contract specifies an early termination fee.
                  </p>
                </div>

                <div
                  style={{
                    background: "#fffbeb",
                    border: "1.5px solid #f59e0b",
                    borderRadius: "8px",
                    padding: "16px",
                    marginBottom: "20px",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                    <span style={{ fontSize: "13px", fontWeight: 700, color: "#92400e" }}>
                      Penalty Fee Due Today:
                    </span>
                    <span style={{ fontSize: "22px", fontWeight: 900, color: "#78350f" }}>
                      US$119.98
                    </span>
                  </div>
                  <p style={{ fontSize: "12px", color: "#92400e", margin: 0, lineHeight: 1.5 }}>
                    Because you have 6 months remaining in your annual commitment, cancelling early requires a 50% contract termination fee (US$119.98), billed to your card ending in 4242.
                  </p>
                </div>

                <div style={{ display: "grid", gap: "10px" }}>
                  <button
                    onClick={handleManualGauntletConfirm}
                    style={{
                      background: "#b91c1c",
                      color: "#ffffff",
                      border: "none",
                      padding: "12px",
                      borderRadius: "20px",
                      fontWeight: 750,
                      fontSize: "14px",
                      cursor: "pointer",
                    }}
                  >
                    Confirm Cancellation &amp; Bill US$119.98
                  </button>

                  <button
                    onClick={() => setShowMazeModal(false)}
                    style={{
                      background: "none",
                      border: "none",
                      color: "#666666",
                      fontSize: "12.5px",
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

      {/* Autonomous Agent Execution Overlay */}
      {showAgentOverlay && (
        <AgentActionOverlay
          currentStep={agentStep}
          stepMessages={agentStepMessages}
          providerName="Adobe Creative Cloud"
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
      url="https://account.adobe.com/plans"
      title="Adobe Account — Plans"
      provider="adobe"
      isLocked={isLocked}
      onToggleLock={handleToggleCardLock}
      onSimulateCharge={handleSimulateRenewal}
      onRunAgent={handleRunAIAgent}
      isCharging={charging}
      isAgentRunning={isAgentRunning}
      isCancelled={subStatus === "Cancelled"}
      onBackToHub={() => onNavigate("app")}
      onSwitchProvider={() => onNavigate("demo-spotify")}
    >
      {portalContent}
    </BrowserWindowFrame>
  )
}
