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
  MoreHorizontal,
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

export interface AdobeDemoPortalProps {
  onNavigate: (page: Page) => void
  onOpenSplit?: () => void
  currentSubscription?: Subscription | null
  onSubscriptionUpdated?: (sub: Subscription) => void
  virtualCard?: VirtualCard | null
  onCardUpdated?: (card: VirtualCard) => void
}

export function AdobeDemoPortal({
  onNavigate,
  onOpenSplit,
  currentSubscription,
  onSubscriptionUpdated,
  virtualCard,
  onCardUpdated,
}: AdobeDemoPortalProps) {
  const [subStatus, setSubStatus] = useState<"Active" | "Cancelled" | "Pending Cancellation">(
    currentSubscription?.status || "Active",
  )
  const [card, setCard] = useState<VirtualCard | null>(virtualCard || null)
  const [charging, setCharging] = useState(false)
  const [togglingLock, setTogglingLock] = useState(false)
  const [chargeResult, setChargeResult] = useState<SimulateChargeResponse | null>(null)
  const [agentTriggering, setAgentTriggering] = useState(false)
  const [agentSuccessMsg, setAgentSuccessMsg] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState("plans")

  // 4-Step Dark Pattern Maze state
  const [showMazeModal, setShowMazeModal] = useState(false)
  const [mazeStep, setMazeStep] = useState<1 | 2 | 3 | 4>(1)
  const [surveyReason, setSurveyReason] = useState<string>("")
  const [typedConfirmation, setTypedConfirmation] = useState<string>("")
  const [claimedDiscount, setClaimedDiscount] = useState(false)

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

  // One-click Slay with SubSlayer AI Agent
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
        background: "#f5f5f5",
        color: "#222222",
        fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* 1. SubSlayer Demo Floating Controller */}
      <div
        style={{
          background: "#1f1422",
          borderBottom: "1px solid #3d2342",
          padding: "8px 24px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          fontSize: "12px",
          position: "sticky",
          top: 0,
          zIndex: 1000,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <span
            style={{
              background: "#fa0f00",
              color: "#fff",
              fontWeight: 800,
              fontSize: "10px",
              padding: "2px 6px",
              borderRadius: "4px",
            }}
          >
            DEMO
          </span>
          <span style={{ color: "#eedef0", fontWeight: 600 }}>
            Simulated Adobe Creative Cloud Account • Test 4-Step Dark Pattern Maze &amp; $119.98 Fee Waiver
          </span>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          {onOpenSplit && (
            <button
              onClick={onOpenSplit}
              style={{
                background: "rgba(255,255,255,0.08)",
                border: "1px solid rgba(255,255,255,0.2)",
                color: "#fff",
                padding: "4px 10px",
                borderRadius: "4px",
                cursor: "pointer",
                fontSize: "11.5px",
                fontWeight: 600,
              }}
            >
              ◫ Split Screen
            </button>
          )}

          <button
            onClick={() => onNavigate("demo-spotify")}
            style={{
              background: "rgba(30, 215, 96, 0.15)",
              border: "1px solid rgba(30, 215, 96, 0.35)",
              color: "#86efac",
              padding: "4px 10px",
              borderRadius: "4px",
              cursor: "pointer",
              fontSize: "11.5px",
              fontWeight: 600,
            }}
          >
            Switch to Spotify Demo →
          </button>

          <button
            onClick={() => onNavigate("app")}
            style={{
              background: "#704b73",
              border: "none",
              color: "#fff",
              padding: "4px 12px",
              borderRadius: "4px",
              cursor: "pointer",
              fontSize: "11.5px",
              fontWeight: 700,
              display: "flex",
              alignItems: "center",
              gap: "4px",
            }}
          >
            <ArrowLeft size={12} /> SubSlayer Hub
          </button>
        </div>
      </div>

      {/* 2. Official Adobe Global Navigation Header (account.adobe.com) */}
      <header
        style={{
          background: "#ffffff",
          height: "64px",
          padding: "0 36px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          borderBottom: "1px solid #e1e1e1",
          boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
          <AdobeLogo size={28} />
          <span style={{ fontSize: "19px", fontWeight: 800, letterSpacing: "-0.5px", color: "#fa0f00" }}>
            Adobe
          </span>
          <div style={{ width: "1px", height: "18px", background: "#d0d0d0" }} />
          <span style={{ fontSize: "16px", fontWeight: 700, color: "#222222" }}>
            Account
          </span>
        </div>

        {/* Global Navigation Tabs (Adobe Spectrum Style) */}
        <nav style={{ display: "flex", alignItems: "center", gap: "28px", height: "100%" }}>
          <button
            onClick={() => setActiveTab("overview")}
            style={{
              background: "none",
              border: "none",
              height: "100%",
              fontSize: "14px",
              fontWeight: activeTab === "overview" ? 700 : 500,
              color: activeTab === "overview" ? "#0265dc" : "#505050",
              borderBottom: activeTab === "overview" ? "3px solid #0265dc" : "3px solid transparent",
              cursor: "pointer",
              padding: "0 4px",
            }}
          >
            Overview
          </button>

          <button
            onClick={() => setActiveTab("plans")}
            style={{
              background: "none",
              border: "none",
              height: "100%",
              fontSize: "14px",
              fontWeight: activeTab === "plans" ? 700 : 500,
              color: activeTab === "plans" ? "#0265dc" : "#505050",
              borderBottom: activeTab === "plans" ? "3px solid #0265dc" : "3px solid transparent",
              cursor: "pointer",
              padding: "0 4px",
            }}
          >
            Plans
          </button>

          <button
            onClick={() => setActiveTab("payment")}
            style={{
              background: "none",
              border: "none",
              height: "100%",
              fontSize: "14px",
              fontWeight: activeTab === "payment" ? 700 : 500,
              color: activeTab === "payment" ? "#0265dc" : "#505050",
              borderBottom: activeTab === "payment" ? "3px solid #0265dc" : "3px solid transparent",
              cursor: "pointer",
              padding: "0 4px",
            }}
          >
            Payment
          </button>

          <button
            style={{
              background: "none",
              border: "none",
              height: "100%",
              fontSize: "14px",
              fontWeight: 500,
              color: "#505050",
              cursor: "pointer",
              padding: "0 4px",
            }}
          >
            Password &amp; Security
          </button>

          <button
            style={{
              background: "none",
              border: "none",
              height: "100%",
              fontSize: "14px",
              fontWeight: 500,
              color: "#505050",
              cursor: "pointer",
              padding: "0 4px",
            }}
          >
            Privacy
          </button>
        </nav>

        {/* Right Nav Icons */}
        <div style={{ display: "flex", alignItems: "center", gap: "18px" }}>
          <div
            title="Help"
            style={{
              width: "32px",
              height: "32px",
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#505050",
              cursor: "pointer",
            }}
          >
            <HelpCircle size={19} />
          </div>

          <div
            style={{
              width: "36px",
              height: "36px",
              borderRadius: "50%",
              background: "#0265dc",
              color: "#ffffff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: 750,
              fontSize: "14px",
              cursor: "pointer",
            }}
            title="Alex River (alex.river@subslayer.demo)"
          >
            A
          </div>
        </div>
      </header>

      {/* 3. Main Content Container (account.adobe.com/plans) */}
      <main
        style={{
          maxWidth: "1080px",
          width: "100%",
          margin: "0 auto",
          padding: "40px 24px 80px",
          flex: 1,
        }}
      >
        <div style={{ marginBottom: "28px" }}>
          <h1 style={{ fontSize: "32px", fontWeight: 800, margin: "0 0 6px 0", color: "#222222", letterSpacing: "-0.5px" }}>
            Plans
          </h1>
          <p style={{ color: "#6e6e6e", fontSize: "14.5px", margin: 0 }}>
            Manage your Adobe subscriptions, cloud storage, and billing options.
          </p>
        </div>

        {/* Slay Announcement Banner */}
        {(subStatus === "Cancelled" || agentSuccessMsg) && (
          <div
            style={{
              background: "#f4eff5",
              border: "1.5px solid #704b73",
              borderRadius: "8px",
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
                <Sparkles size={18} />
              </div>
              <div>
                <strong style={{ fontSize: "15px", color: "#321d36", display: "block" }}>
                  SubSlayer AI Fee-Waived Cancellation Verified
                </strong>
                <span style={{ fontSize: "13px", color: "#5a4360" }}>
                  {agentSuccessMsg ||
                    "SubSlayer AI orchestrated this cancellation via Adobe API. The $119.98 penalty fee was waived! Account ends on June 28, 2026."}
                </span>
              </div>
            </div>
            <span
              style={{
                fontSize: "12px",
                fontWeight: 750,
                background: "#704b73",
                color: "#ffffff",
                padding: "4px 12px",
                borderRadius: "16px",
                whiteSpace: "nowrap",
              }}
            >
              $0 EARLY TERMINATION FEE
            </span>
          </div>
        )}

        {/* Primary Adobe Subscription Card (Clean White Spectrum Card) */}
        <div
          style={{
            background: "#ffffff",
            borderRadius: "12px",
            border: "1px solid #e1e1e1",
            boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
            padding: "32px",
            marginBottom: "32px",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              borderBottom: "1px solid #f0f0f0",
              paddingBottom: "24px",
              marginBottom: "24px",
            }}
          >
            <div style={{ display: "flex", gap: "18px", alignItems: "center" }}>
              <AdobeCreativeCloudLogo size={52} />
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <h2 style={{ fontSize: "24px", fontWeight: 800, margin: 0, color: "#222222" }}>
                    Creative Cloud All Apps
                  </h2>
                  <span
                    style={{
                      fontSize: "12px",
                      fontWeight: 700,
                      padding: "2px 8px",
                      borderRadius: "12px",
                      background: subStatus === "Active" ? "#e6f9ed" : "#fef2f2",
                      color: subStatus === "Active" ? "#0f7b3d" : "#b91c1c",
                      border: `1px solid ${subStatus === "Active" ? "#b7ebd0" : "#fecaca"}`,
                    }}
                  >
                    {subStatus === "Active" ? "Active" : "Cancellation Pending"}
                  </span>
                </div>
                <span style={{ fontSize: "13.5px", color: "#6e6e6e", marginTop: "3px", display: "block" }}>
                  Annual plan, paid monthly
                </span>
              </div>
            </div>

            {/* Price block */}
            <div style={{ textAlign: "right" }}>
              <span style={{ fontSize: "28px", fontWeight: 800, color: "#222222" }}>
                {claimedDiscount ? "US$29.99" : "US$59.99"}
              </span>
              <span style={{ fontSize: "13.5px", color: "#6e6e6e" }}> / mo (incl. taxes)</span>
              {claimedDiscount && (
                <div
                  style={{
                    fontSize: "11px",
                    fontWeight: 800,
                    color: "#0f7b3d",
                    background: "#e6f9ed",
                    padding: "2px 6px",
                    borderRadius: "4px",
                    marginTop: "4px",
                  }}
                >
                  50% RETENTION DISCOUNT ACTIVE
                </div>
              )}
            </div>
          </div>

          {/* Details Row: Cloud Storage, Renewal, and Payment */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr 1fr",
              gap: "24px",
              marginBottom: "28px",
              fontSize: "13.5px",
            }}
          >
            {/* Cloud Storage */}
            <div>
              <span style={{ color: "#6e6e6e", fontWeight: 600, display: "block", marginBottom: "6px" }}>
                Cloud storage
              </span>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px", fontSize: "12.5px" }}>
                <strong>42.8 GB of 100 GB used</strong>
                <span style={{ color: "#6e6e6e" }}>42%</span>
              </div>
              <div style={{ height: "6px", background: "#eaeaea", borderRadius: "3px", overflow: "hidden" }}>
                <div style={{ width: "42.8%", height: "100%", background: "#0265dc" }} />
              </div>
            </div>

            {/* Renewal status */}
            <div>
              <span style={{ color: "#6e6e6e", fontWeight: 600, display: "block", marginBottom: "4px" }}>
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
                    Fee waived by SubSlayer AI ($0.00 charged)
                  </span>
                </div>
              )}
            </div>

            {/* Payment Method */}
            <div>
              <span style={{ color: "#6e6e6e", fontWeight: 600, display: "block", marginBottom: "4px" }}>
                Payment method
              </span>
              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <CreditCard size={15} color="#505050" />
                <strong style={{ color: "#222222" }}>Visa ending in {card?.last4 || "4242"}</strong>
              </div>
              <span style={{ fontSize: "12px", color: "#6e6e6e" }}>Expires 12/28</span>
            </div>
          </div>

          {/* Action Row (Adobe Spectrum Blue Pill buttons & Cancel link) */}
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
                  fontSize: "14px",
                  fontWeight: 700,
                  cursor: "pointer",
                }}
                onMouseOver={(e) => (e.currentTarget.style.background = "#0054b6")}
                onMouseOut={(e) => (e.currentTarget.style.background = "#0265dc")}
              >
                Change plan
              </button>

              <button
                style={{
                  background: "#ffffff",
                  color: "#222222",
                  border: "1px solid #b3b3b3",
                  borderRadius: "20px",
                  padding: "10px 24px",
                  fontSize: "14px",
                  fontWeight: 700,
                  cursor: "pointer",
                }}
                onMouseOver={(e) => (e.currentTarget.style.background = "#f5f5f5")}
                onMouseOut={(e) => (e.currentTarget.style.background = "#ffffff")}
              >
                Edit payment details
              </button>
            </div>

            {subStatus === "Active" ? (
              <button
                onClick={() => {
                  setMazeStep(1)
                  setSurveyReason("")
                  setTypedConfirmation("")
                  setShowMazeModal(true)
                }}
                style={{
                  background: "none",
                  border: "none",
                  color: "#0265dc",
                  fontSize: "14px",
                  fontWeight: 650,
                  cursor: "pointer",
                  textDecoration: "underline",
                }}
              >
                Cancel plan
              </button>
            ) : (
              <span style={{ fontSize: "13.5px", color: "#6e6e6e", fontWeight: 600 }}>
                Cancellation request submitted
              </span>
            )}
          </div>
        </div>

        {/* Included Apps Section (Photoshop, Illustrator, Premiere, etc.) */}
        <div
          style={{
            background: "#ffffff",
            borderRadius: "12px",
            border: "1px solid #e1e1e1",
            boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
            padding: "28px",
            marginBottom: "32px",
          }}
        >
          <h3 style={{ fontSize: "18px", fontWeight: 750, margin: "0 0 16px 0", color: "#222222" }}>
            Included with Creative Cloud All Apps
          </h3>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
              gap: "16px",
            }}
          >
            {[
              { name: "Photoshop", icon: <PhotoshopIcon size={36} /> },
              { name: "Illustrator", icon: <IllustratorIcon size={36} /> },
              { name: "Premiere Pro", icon: <PremiereIcon size={36} /> },
              { name: "After Effects", icon: <AfterEffectsIcon size={36} /> },
              { name: "InDesign", icon: <InDesignIcon size={36} /> },
              { name: "Acrobat Pro", icon: <AcrobatIcon size={36} /> },
            ].map((app) => (
              <div
                key={app.name}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  padding: "10px 12px",
                  borderRadius: "8px",
                  background: "#f9f9f9",
                  border: "1px solid #ebebeb",
                }}
              >
                {app.icon}
                <strong style={{ fontSize: "13px", color: "#222222" }}>{app.name}</strong>
              </div>
            ))}
          </div>
        </div>

        {/* SubSlayer Payment Shield & Simulation Controls Card */}
        <div
          style={{
            background: "#ffffff",
            borderRadius: "12px",
            border: `1.5px solid ${isLocked ? "#ef4444" : "#10b981"}`,
            boxShadow: "0 4px 14px rgba(0,0,0,0.05)",
            padding: "28px",
            marginBottom: "32px",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "16px",
            }}
          >
            <div>
              <span
                style={{
                  fontSize: "11px",
                  fontWeight: 800,
                  color: "#704b73",
                  letterSpacing: "0.5px",
                  textTransform: "uppercase",
                }}
              >
                ACTIVE PAYMENT DEFENSE
              </span>
              <h3 style={{ fontSize: "18px", fontWeight: 750, margin: "2px 0 0 0", color: "#222222" }}>
                SubSlayer Virtual Card Shield (•••• {card?.last4 || "4242"})
              </h3>
            </div>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                background: isLocked ? "#fef2f2" : "#ecfdf5",
                border: `1px solid ${isLocked ? "#f87171" : "#34d399"}`,
                color: isLocked ? "#b91c1c" : "#065f46",
                padding: "6px 14px",
                borderRadius: "20px",
                fontSize: "12.5px",
                fontWeight: 750,
              }}
            >
              {isLocked ? <Lock size={14} /> : <Unlock size={14} />}
              {isLocked ? "SHIELD LOCKED ($0.00 LIMIT)" : "SHIELD ACTIVE ($60.00 LIMIT)"}
            </div>
          </div>

          <div
            style={{
              background: isLocked ? "#fef2f2" : "#f0fdf4",
              borderRadius: "8px",
              padding: "14px 16px",
              fontSize: "13px",
              lineHeight: 1.5,
              color: isLocked ? "#991b1b" : "#166534",
              marginBottom: "20px",
            }}
          >
            {isLocked ? (
              <span>
                <strong>Shield Locked:</strong> Recurring Adobe charges and penalty fees of $119.98 are blocked at the gateway before billing occurs.
              </span>
            ) : (
              <span>
                <strong>Shield Active:</strong> Test charges up to the $60.00 limit will be authorized via Stripe test ledger.
              </span>
            )}
          </div>

          {/* Test Buttons */}
          <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
            <button
              onClick={handleSimulateRenewal}
              disabled={charging}
              style={{
                background: "#fa0f00",
                color: "#ffffff",
                border: "none",
                borderRadius: "20px",
                padding: "11px 24px",
                fontSize: "13.5px",
                fontWeight: 750,
                cursor: charging ? "wait" : "pointer",
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
              onMouseOver={(e) => (e.currentTarget.style.background = "#d60d00")}
              onMouseOut={(e) => (e.currentTarget.style.background = "#fa0f00")}
            >
              {charging ? (
                <>
                  <RefreshCw size={14} className="animate-spin" /> Charging $59.99...
                </>
              ) : (
                <>
                  <Flame size={14} /> Simulate Monthly Renewal Charge ($59.99)
                </>
              )}
            </button>

            <button
              onClick={handleToggleCardLock}
              disabled={togglingLock}
              style={{
                background: isLocked ? "#1e293b" : "#450a0a",
                color: isLocked ? "#93c5fd" : "#fca5a5",
                border: `1px solid ${isLocked ? "#3b82f6" : "#ef4444"}`,
                borderRadius: "20px",
                padding: "11px 22px",
                fontSize: "13px",
                fontWeight: 700,
                cursor: togglingLock ? "wait" : "pointer",
                display: "flex",
                alignItems: "center",
                gap: "7px",
              }}
            >
              {isLocked ? <Unlock size={14} /> : <Lock size={14} />}
              {isLocked ? "Unlock Card Shield" : "Lock Card Shield to $0.00"}
            </button>

            <button
              onClick={handleTriggerSubSlayerAgent}
              disabled={agentTriggering || subStatus === "Cancelled"}
              style={{
                background: subStatus === "Cancelled" ? "#eaeaea" : "#704b73",
                color: subStatus === "Cancelled" ? "#888" : "#fff",
                border: "none",
                borderRadius: "20px",
                padding: "11px 22px",
                fontSize: "13px",
                fontWeight: 700,
                cursor: agentTriggering || subStatus === "Cancelled" ? "default" : "pointer",
                display: "flex",
                alignItems: "center",
                gap: "7px",
              }}
            >
              <Sparkles size={14} />
              {subStatus === "Cancelled" ? "Slayed ($0 Penalty Fee)" : "1-Click Slay with SubSlayer AI"}
            </button>
          </div>
        </div>
      </main>

      {/* 4. Official Adobe Footer */}
      <footer
        style={{
          background: "#ffffff",
          borderTop: "1px solid #e1e1e1",
          padding: "24px 36px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          fontSize: "12px",
          color: "#6e6e6e",
        }}
      >
        <div style={{ display: "flex", gap: "20px" }}>
          <span>Privacy</span>
          <span>Terms of Use</span>
          <span>Cookie preferences</span>
          <span>Do not sell my personal info</span>
        </div>
        <span>Copyright © 2026 Adobe. All rights reserved.</span>
      </footer>

      {/* 5. Realistic Adobe Charge Outcome Dialog */}
      {chargeResult && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.6)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "20px",
            zIndex: 9999,
          }}
          onClick={() => setChargeResult(null)}
        >
          <div
            style={{
              background: "#ffffff",
              border: `1.5px solid ${chargeResult.success ? "#10b981" : "#ef4444"}`,
              borderRadius: "12px",
              padding: "32px",
              maxWidth: "460px",
              width: "100%",
              color: "#222",
              boxShadow: "0 20px 40px rgba(0,0,0,0.2)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ textAlign: "center", marginBottom: "20px" }}>
              <div
                style={{
                  width: "56px",
                  height: "56px",
                  borderRadius: "50%",
                  background: chargeResult.success ? "#ecfdf5" : "#fef2f2",
                  color: chargeResult.success ? "#10b981" : "#ef4444",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto 16px",
                }}
              >
                {chargeResult.success ? <CheckCircle2 size={32} /> : <ShieldAlert size={32} />}
              </div>

              <h3 style={{ fontSize: "22px", fontWeight: 800, margin: "0 0 8px 0" }}>
                {chargeResult.success ? "Payment Processed" : "Payment Declined"}
              </h3>

              <p style={{ color: "#6e6e6e", fontSize: "14px", lineHeight: 1.5, margin: 0 }}>
                {chargeResult.success
                  ? "Adobe billed $59.99 to your SubSlayer virtual card via Stripe test mode."
                  : "Adobe attempted to charge $59.99, but SubSlayer Virtual Card Shield blocked the charge."}
              </p>
            </div>

            <div
              style={{
                background: "#f9f9f9",
                borderRadius: "8px",
                padding: "14px 16px",
                marginBottom: "24px",
                fontSize: "12.5px",
                display: "grid",
                gap: "8px",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "#6e6e6e" }}>Status:</span>
                <strong style={{ color: chargeResult.success ? "#10b981" : "#ef4444" }}>
                  {chargeResult.status}
                </strong>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "#6e6e6e" }}>Reason:</span>
                <span style={{ textAlign: "right", maxWidth: "260px" }}>{chargeResult.reason}</span>
              </div>
              {chargeResult.stripePaymentIntentId && (
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: "#6e6e6e" }}>Stripe Intent:</span>
                  <span style={{ fontFamily: "monospace", color: "#0265dc" }}>
                    {chargeResult.stripePaymentIntentId.slice(0, 16)}...
                  </span>
                </div>
              )}
            </div>

            <button
              onClick={() => setChargeResult(null)}
              style={{
                width: "100%",
                background: chargeResult.success ? "#fa0f00" : "#222222",
                color: "#ffffff",
                border: "none",
                padding: "12px",
                borderRadius: "20px",
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

      {/* 6. Authentic Adobe 4-Step Dark Pattern Maze (Spectrum Light Theme) */}
      {showMazeModal && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.7)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "20px",
            zIndex: 9999,
          }}
          onClick={() => setShowMazeModal(false)}
        >
          <div
            style={{
              background: "#ffffff",
              border: "1px solid #d5d5d5",
              borderRadius: "12px",
              padding: "36px",
              maxWidth: "560px",
              width: "100%",
              color: "#222",
              boxShadow: "0 25px 60px rgba(0,0,0,0.25)",
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
                  STEP {mazeStep} OF 4
                </span>
                <span style={{ fontSize: "13px", color: "#6e6e6e" }}>
                  {mazeStep === 1
                    ? "Asset Loss Warning"
                    : mazeStep === 2
                    ? "Retention Offer"
                    : mazeStep === 3
                    ? "Early Termination Fee"
                    : "Final Confirmation"}
                </span>
              </div>

              <button
                onClick={() => setShowMazeModal(false)}
                style={{ background: "none", border: "none", cursor: "pointer", color: "#6e6e6e" }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Persistent SubSlayer AI Contrast Banner */}
            <div
              style={{
                background: "#f7f1f8",
                border: "1.5px dashed #704b73",
                borderRadius: "8px",
                padding: "12px 16px",
                marginBottom: "24px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: "12px",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "12.5px" }}>
                <Sparkles size={16} color="#704b73" />
                <span style={{ color: "#3e2444" }}>
                  <strong>Skip this maze:</strong> SubSlayer AI waives the $119.98 fee in 1 click.
                </span>
              </div>
              <button
                onClick={handleTriggerSubSlayerAgent}
                style={{
                  background: "#704b73",
                  color: "#fff",
                  border: "none",
                  padding: "6px 14px",
                  borderRadius: "16px",
                  fontSize: "12px",
                  fontWeight: 700,
                  cursor: "pointer",
                  whiteSpace: "nowrap",
                }}
              >
                🚀 Slay ($0 Fee)
              </button>
            </div>

            {/* STEP 1: Loss of Apps & Assets Threat */}
            {mazeStep === 1 && (
              <div>
                <h3 style={{ fontSize: "22px", fontWeight: 800, margin: "0 0 10px 0", color: "#222222" }}>
                  Alex, are you sure you want to cancel?
                </h3>
                <p style={{ fontSize: "14px", color: "#6e6e6e", lineHeight: 1.5, margin: "0 0 20px 0" }}>
                  You will permanently lose access to all Creative Cloud apps, cloud files, and synced fonts.
                </p>

                {/* Grayed App Grid */}
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(3, 1fr)",
                    gap: "10px",
                    marginBottom: "20px",
                  }}
                >
                  {[
                    { name: "Photoshop", icon: <PhotoshopIcon size={30} /> },
                    { name: "Illustrator", icon: <IllustratorIcon size={30} /> },
                    { name: "Premiere", icon: <PremiereIcon size={30} /> },
                    { name: "After Effects", icon: <AfterEffectsIcon size={30} /> },
                    { name: "InDesign", icon: <InDesignIcon size={30} /> },
                    { name: "Acrobat", icon: <AcrobatIcon size={30} /> },
                  ].map((app) => (
                    <div
                      key={app.name}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        padding: "8px 10px",
                        borderRadius: "6px",
                        background: "#f5f5f5",
                        filter: "grayscale(70%)",
                      }}
                    >
                      {app.icon}
                      <span style={{ fontSize: "12px", fontWeight: 600, color: "#6e6e6e" }}>{app.name}</span>
                    </div>
                  ))}
                </div>

                <div
                  style={{
                    background: "#fff8f8",
                    border: "1px solid #fecaca",
                    borderRadius: "8px",
                    padding: "14px",
                    marginBottom: "24px",
                    fontSize: "13px",
                    color: "#b91c1c",
                  }}
                >
                  <strong>What happens to your work:</strong>
                  <ul style={{ margin: "6px 0 0 0", paddingLeft: "18px" }}>
                    <li>42.8 GB cloud files will be locked and permanently deleted after 30 days</li>
                    <li>1,000 monthly Firefly generative AI credits will expire</li>
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
                      padding: "14px",
                      borderRadius: "24px",
                      fontWeight: 750,
                      fontSize: "14.5px",
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
                      color: "#6e6e6e",
                      fontSize: "12.5px",
                      padding: "6px",
                      cursor: "pointer",
                      textDecoration: "underline",
                    }}
                  >
                    Continue to cancellation
                  </button>
                </div>
              </div>
            )}

            {/* STEP 2: Retention Discount Trap */}
            {mazeStep === 2 && (
              <div>
                <h3 style={{ fontSize: "22px", fontWeight: 800, margin: "0 0 8px 0", color: "#222222" }}>
                  Special Offer Just For You
                </h3>
                <p style={{ fontSize: "14px", color: "#6e6e6e", margin: "0 0 20px 0" }}>
                  We’d hate to see you go. Keep Creative Cloud for 50% off for the next 3 months!
                </p>

                <div
                  style={{
                    background: "#f0fdf4",
                    border: "1.5px solid #10b981",
                    borderRadius: "10px",
                    padding: "24px",
                    marginBottom: "24px",
                    textAlign: "center",
                  }}
                >
                  <span style={{ fontSize: "12px", fontWeight: 800, color: "#065f46", textTransform: "uppercase" }}>
                    EXCLUSIVE 50% RETENTION DISCOUNT
                  </span>
                  <div style={{ fontSize: "32px", fontWeight: 900, color: "#111827", margin: "8px 0" }}>
                    US$29.99{" "}
                    <span style={{ fontSize: "14px", fontWeight: 500, color: "#6e6e6e" }}>
                      / month (Save US$90.00)
                    </span>
                  </div>
                  <p style={{ fontSize: "13px", color: "#374151", margin: 0 }}>
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
                      padding: "14px",
                      borderRadius: "24px",
                      fontWeight: 750,
                      fontSize: "14.5px",
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
                      color: "#6e6e6e",
                      fontSize: "12.5px",
                      padding: "6px",
                      cursor: "pointer",
                      textDecoration: "underline",
                    }}
                  >
                    No thanks, continue to cancel
                  </button>
                </div>
              </div>
            )}

            {/* STEP 3: Early Termination Fee Warning */}
            {mazeStep === 3 && (
              <div>
                <div style={{ textAlign: "center", marginBottom: "16px" }}>
                  <div
                    style={{
                      width: "52px",
                      height: "52px",
                      borderRadius: "50%",
                      background: "#fffbeb",
                      color: "#b45309",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      margin: "0 auto 12px",
                    }}
                  >
                    <AlertTriangle size={28} />
                  </div>
                  <h3 style={{ fontSize: "22px", fontWeight: 800, margin: "0 0 6px 0", color: "#222222" }}>
                    Early Cancellation Fee Warning
                  </h3>
                  <p style={{ fontSize: "13.5px", color: "#6e6e6e", margin: 0 }}>
                    Your annual contract specifies an early termination fee.
                  </p>
                </div>

                <div
                  style={{
                    background: "#fffbeb",
                    border: "1.5px solid #f59e0b",
                    borderRadius: "8px",
                    padding: "20px",
                    marginBottom: "24px",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                    <span style={{ fontSize: "14px", fontWeight: 700, color: "#92400e" }}>
                      Penalty Fee Due Today:
                    </span>
                    <span style={{ fontSize: "24px", fontWeight: 900, color: "#78350f" }}>
                      US$119.98
                    </span>
                  </div>
                  <p style={{ fontSize: "12.5px", color: "#92400e", margin: 0, lineHeight: 1.5 }}>
                    Because you have 6 months remaining in your annual commitment, cancelling early requires a 50% contract termination fee (US$119.98), which will be charged immediately to your card ending in 4242.
                  </p>
                </div>

                <div style={{ display: "grid", gap: "10px" }}>
                  <button
                    onClick={() => setShowMazeModal(false)}
                    style={{
                      background: "#0265dc",
                      color: "#ffffff",
                      border: "none",
                      padding: "14px",
                      borderRadius: "24px",
                      fontWeight: 750,
                      fontSize: "14.5px",
                      cursor: "pointer",
                    }}
                  >
                    Switch to a cheaper plan instead
                  </button>

                  <button
                    onClick={() => setMazeStep(4)}
                    style={{
                      background: "none",
                      border: "none",
                      color: "#6e6e6e",
                      fontSize: "12.5px",
                      padding: "6px",
                      cursor: "pointer",
                      textDecoration: "underline",
                    }}
                  >
                    Acknowledge US$119.98 fee and proceed
                  </button>
                </div>
              </div>
            )}

            {/* STEP 4: Survey & Typing Confirmation Friction */}
            {mazeStep === 4 && (
              <div>
                <h3 style={{ fontSize: "20px", fontWeight: 800, margin: "0 0 12px 0", color: "#222222" }}>
                  Why are you cancelling?
                </h3>

                <div style={{ display: "grid", gap: "8px", marginBottom: "20px" }}>
                  {[
                    "Too expensive for my budget",
                    "Switching to another tool (Canva, Figma)",
                    "Not using it frequently enough",
                    "Software is buggy or slow",
                  ].map((reason) => (
                    <label
                      key={reason}
                      style={{
                        background: "#f9f9f9",
                        border: "1px solid #e1e1e1",
                        padding: "10px 14px",
                        borderRadius: "6px",
                        fontSize: "13px",
                        display: "flex",
                        alignItems: "center",
                        gap: "10px",
                        cursor: "pointer",
                      }}
                    >
                      <input
                        type="radio"
                        name="cancel_reason"
                        checked={surveyReason === reason}
                        onChange={() => setSurveyReason(reason)}
                      />
                      <span>{reason}</span>
                    </label>
                  ))}
                </div>

                <div style={{ marginBottom: "24px" }}>
                  <span style={{ fontSize: "13px", fontWeight: 700, color: "#b91c1c", display: "block", marginBottom: "6px" }}>
                    To confirm and authorize the US$119.98 fee, type CANCEL below:
                  </span>
                  <input
                    type="text"
                    value={typedConfirmation}
                    onChange={(e) => setTypedConfirmation(e.target.value)}
                    placeholder="Type CANCEL in uppercase"
                    style={{
                      width: "100%",
                      padding: "10px 14px",
                      border: "1px solid #ccc",
                      borderRadius: "6px",
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
                        surveyReason && typedConfirmation === "CANCEL" ? "#b91c1c" : "#e5e7eb",
                      color:
                        surveyReason && typedConfirmation === "CANCEL" ? "#ffffff" : "#9ca3af",
                      border: "none",
                      padding: "14px",
                      borderRadius: "24px",
                      fontWeight: 750,
                      fontSize: "14px",
                      cursor:
                        surveyReason && typedConfirmation === "CANCEL" ? "pointer" : "not-allowed",
                    }}
                  >
                    Confirm Cancellation &amp; Bill US$119.98
                  </button>

                  <button
                    onClick={() => setShowMazeModal(false)}
                    style={{
                      background: "none",
                      border: "none",
                      color: "#6e6e6e",
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
