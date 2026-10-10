import { useEffect, useState } from "react"
import {
  AlertTriangle,
  ArrowLeft,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  ExternalLink,
  Flame,
  Globe,
  HelpCircle,
  Lock,
  Music,
  Music2,
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

export interface SpotifyDemoPortalProps {
  onNavigate: (page: Page) => void
  onOpenSplit?: () => void
  currentSubscription?: Subscription | null
  onSubscriptionUpdated?: (sub: Subscription) => void
  virtualCard?: VirtualCard | null
  onCardUpdated?: (card: VirtualCard) => void
}

export function SpotifyDemoPortal({
  onNavigate,
  onOpenSplit,
  currentSubscription,
  onSubscriptionUpdated,
  virtualCard,
  onCardUpdated,
}: SpotifyDemoPortalProps) {
  const [subStatus, setSubStatus] = useState<"Active" | "Cancelled" | "Pending Cancellation">(
    currentSubscription?.status || "Active",
  )
  const [card, setCard] = useState<VirtualCard | null>(virtualCard || null)
  const [charging, setCharging] = useState(false)
  const [togglingLock, setTogglingLock] = useState(false)
  const [showCancelModal, setShowCancelModal] = useState(false)
  const [chargeResult, setChargeResult] = useState<SimulateChargeResponse | null>(null)
  const [agentTriggering, setAgentTriggering] = useState(false)
  const [agentSuccessMsg, setAgentSuccessMsg] = useState<string | null>(null)
  const [activeSidebarItem, setActiveSidebarItem] = useState("overview")
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false)

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
        fontFamily: "-apple-system, BlinkMacSystemFont, 'Circular Std', 'DM Sans', Roboto, Helvetica, Arial, sans-serif",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* 1. SubSlayer Demo Floating Controller (Non-intrusive) */}
      <div
        style={{
          background: "#1e1422",
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
              background: "#1ed760",
              color: "#000",
              fontWeight: 800,
              fontSize: "10px",
              padding: "2px 6px",
              borderRadius: "4px",
            }}
          >
            DEMO
          </span>
          <span style={{ color: "#eedef0", fontWeight: 600 }}>
            Simulated Spotify Environment • Linked to SubSlayer Virtual Card Shield (•••• 4242)
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
            onClick={() => onNavigate("demo-adobe")}
            style={{
              background: "rgba(250, 15, 0, 0.15)",
              border: "1px solid rgba(250, 15, 0, 0.35)",
              color: "#ff9da2",
              padding: "4px 10px",
              borderRadius: "4px",
              cursor: "pointer",
              fontSize: "11.5px",
              fontWeight: 600,
            }}
          >
            Switch to Adobe Demo →
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

      {/* 2. Official Spotify Account Header (accounts.spotify.com) */}
      <header
        style={{
          background: "#000000",
          height: "80px",
          padding: "0 40px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          borderBottom: "1px solid #1c1c1c",
        }}
      >
        <SpotifyWordmark height={38} />

        <nav style={{ display: "flex", alignItems: "center", gap: "32px" }}>
          <span
            style={{
              color: "#ffffff",
              fontSize: "16px",
              fontWeight: 700,
              cursor: "pointer",
              transition: "color 0.15s",
            }}
            onMouseOver={(e) => (e.currentTarget.style.color = "#1ed760")}
            onMouseOut={(e) => (e.currentTarget.style.color = "#ffffff")}
          >
            Premium
          </span>
          <span
            style={{
              color: "#ffffff",
              fontSize: "16px",
              fontWeight: 700,
              cursor: "pointer",
              transition: "color 0.15s",
            }}
            onMouseOver={(e) => (e.currentTarget.style.color = "#1ed760")}
            onMouseOut={(e) => (e.currentTarget.style.color = "#ffffff")}
          >
            Support
          </span>
          <span
            style={{
              color: "#ffffff",
              fontSize: "16px",
              fontWeight: 700,
              cursor: "pointer",
              transition: "color 0.15s",
            }}
            onMouseOver={(e) => (e.currentTarget.style.color = "#1ed760")}
            onMouseOut={(e) => (e.currentTarget.style.color = "#ffffff")}
          >
            Download
          </span>

          <div style={{ width: "1px", height: "18px", background: "#404040" }} />

          {/* User Profile Pill */}
          <div style={{ position: "relative" }}>
            <button
              onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                background: "transparent",
                border: "none",
                color: "#ffffff",
                cursor: "pointer",
                padding: "6px 8px",
              }}
            >
              <div
                style={{
                  width: "32px",
                  height: "32px",
                  borderRadius: "50%",
                  background: "#282828",
                  color: "#ffffff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontWeight: 700,
                  fontSize: "14px",
                }}
              >
                <User size={18} />
              </div>
              <span style={{ fontSize: "15px", fontWeight: 700 }}>Profile</span>
              <ChevronDown size={14} />
            </button>

            {profileDropdownOpen && (
              <div
                style={{
                  position: "absolute",
                  top: "100%",
                  right: 0,
                  width: "180px",
                  background: "#282828",
                  borderRadius: "4px",
                  padding: "6px 0",
                  boxShadow: "0 10px 24px rgba(0,0,0,0.5)",
                  zIndex: 200,
                }}
              >
                <div style={{ padding: "8px 16px", fontSize: "14px", fontWeight: 650, color: "#fff" }}>
                  Alex River
                </div>
                <div style={{ height: "1px", background: "#3e3e3e", margin: "4px 0" }} />
                <button
                  onClick={() => setProfileDropdownOpen(false)}
                  style={{
                    width: "100%",
                    padding: "8px 16px",
                    textAlign: "left",
                    background: "none",
                    border: "none",
                    color: "#b3b3b3",
                    fontSize: "13px",
                    cursor: "pointer",
                  }}
                  onMouseOver={(e) => (e.currentTarget.style.color = "#fff")}
                  onMouseOut={(e) => (e.currentTarget.style.color = "#b3b3b3")}
                >
                  Account
                </button>
                <button
                  onClick={() => onNavigate("app")}
                  style={{
                    width: "100%",
                    padding: "8px 16px",
                    textAlign: "left",
                    background: "none",
                    border: "none",
                    color: "#b3b3b3",
                    fontSize: "13px",
                    cursor: "pointer",
                  }}
                  onMouseOver={(e) => (e.currentTarget.style.color = "#fff")}
                  onMouseOut={(e) => (e.currentTarget.style.color = "#b3b3b3")}
                >
                  Log out
                </button>
              </div>
            )}
          </div>
        </nav>
      </header>

      {/* 3. Main Body Container (accounts.spotify.com 2-column layout) */}
      <div
        style={{
          maxWidth: "1170px",
          width: "100%",
          margin: "0 auto",
          padding: "48px 24px",
          flex: 1,
          display: "grid",
          gridTemplateColumns: "250px 1fr",
          gap: "48px",
          alignItems: "start",
        }}
      >
        {/* Left Sidebar: Official Spotify Account Navigation */}
        <aside style={{ display: "grid", gap: "24px" }}>
          {/* User profile tile */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "14px",
              paddingBottom: "20px",
              borderBottom: "1px solid #282828",
            }}
          >
            <div
              style={{
                width: "48px",
                height: "48px",
                borderRadius: "50%",
                background: "#282828",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#1ed760",
                fontSize: "20px",
                fontWeight: 800,
              }}
            >
              A
            </div>
            <div>
              <strong style={{ fontSize: "16px", display: "block", color: "#ffffff" }}>
                Alex River
              </strong>
              <span style={{ fontSize: "12px", color: subStatus === "Active" ? "#1ed760" : "#a7a7a7" }}>
                {subStatus === "Active" ? "Premium Individual" : "Free Plan"}
              </span>
            </div>
          </div>

          {/* Navigation Menu Links */}
          <nav style={{ display: "grid", gap: "4px" }}>
            {[
              { id: "overview", label: "Account overview" },
              { id: "edit-profile", label: "Edit profile" },
              { id: "change-password", label: "Change password" },
              { id: "notification", label: "Notification settings" },
              { id: "privacy", label: "Privacy settings" },
              { id: "recover", label: "Recover playlists" },
              { id: "receipts", label: "Receipts" },
              { id: "apps", label: "Apps" },
              { id: "redeem", label: "Redeem" },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveSidebarItem(item.id)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  padding: "11px 16px",
                  borderRadius: "4px",
                  border: "none",
                  textAlign: "left",
                  fontSize: "14px",
                  fontWeight: activeSidebarItem === item.id ? 700 : 500,
                  cursor: "pointer",
                  background: activeSidebarItem === item.id ? "#282828" : "transparent",
                  color: activeSidebarItem === item.id ? "#ffffff" : "#a7a7a7",
                  borderLeft:
                    activeSidebarItem === item.id ? "4px solid #1ed760" : "4px solid transparent",
                  transition: "all 0.15s",
                }}
                onMouseOver={(e) => {
                  if (activeSidebarItem !== item.id) {
                    e.currentTarget.style.color = "#ffffff"
                  }
                }}
                onMouseOut={(e) => {
                  if (activeSidebarItem !== item.id) {
                    e.currentTarget.style.color = "#a7a7a7"
                  }
                }}
              >
                {item.label}
              </button>
            ))}
          </nav>
        </aside>

        {/* Right Main Content Panel: Account Overview */}
        <main style={{ display: "grid", gap: "48px" }}>
          <div>
            <h1
              style={{
                fontSize: "40px",
                fontWeight: 900,
                letterSpacing: "-1px",
                margin: "0 0 32px 0",
                color: "#ffffff",
              }}
            >
              Account overview
            </h1>

            {/* Slayed Announcement Banner */}
            {(subStatus === "Cancelled" || agentSuccessMsg) && (
              <div
                style={{
                  background: "linear-gradient(135deg, rgba(30, 215, 96, 0.15) 0%, rgba(112, 75, 115, 0.25) 100%)",
                  border: "1.5px solid #1ed760",
                  borderRadius: "8px",
                  padding: "20px 24px",
                  marginBottom: "32px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: "16px",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                  <div
                    style={{
                      width: "40px",
                      height: "40px",
                      borderRadius: "50%",
                      background: "#1ed760",
                      color: "#000",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Sparkles size={20} />
                  </div>
                  <div>
                    <strong style={{ fontSize: "16px", color: "#fff", display: "block" }}>
                      Subscription Slayed by SubSlayer AI Agent
                    </strong>
                    <span style={{ fontSize: "13.5px", color: "#d1c7d6" }}>
                      {agentSuccessMsg ||
                        "Your Spotify Premium subscription will end on June 26, 2026. Account will switch to Free tier without renewal charges."}
                    </span>
                  </div>
                </div>
                <span
                  style={{
                    background: "#1ed760",
                    color: "#000000",
                    fontWeight: 800,
                    fontSize: "12px",
                    padding: "6px 14px",
                    borderRadius: "20px",
                    whiteSpace: "nowrap",
                  }}
                >
                  FREE TIER PENDING
                </span>
              </div>
            )}

            {/* Section 1: Profile Details */}
            <section style={{ marginBottom: "48px" }}>
              <h2
                style={{
                  fontSize: "20px",
                  fontWeight: 700,
                  margin: "0 0 16px 0",
                  color: "#ffffff",
                }}
              >
                Profile
              </h2>

              <div
                style={{
                  background: "#181818",
                  borderRadius: "8px",
                  border: "1px solid #282828",
                  padding: "24px 28px",
                  display: "grid",
                  gap: "16px",
                  fontSize: "14px",
                }}
              >
                <div style={{ display: "grid", gridTemplateColumns: "180px 1fr", borderBottom: "1px solid #282828", paddingBottom: "14px" }}>
                  <span style={{ color: "#a7a7a7" }}>Username</span>
                  <span style={{ fontWeight: 600 }}>alex_river_demo</span>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "180px 1fr", borderBottom: "1px solid #282828", paddingBottom: "14px" }}>
                  <span style={{ color: "#a7a7a7" }}>Email</span>
                  <span style={{ fontWeight: 600 }}>alex.river@subslayer.demo</span>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "180px 1fr", borderBottom: "1px solid #282828", paddingBottom: "14px" }}>
                  <span style={{ color: "#a7a7a7" }}>Date of birth</span>
                  <span style={{ fontWeight: 600 }}>14 October 1998</span>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "180px 1fr" }}>
                  <span style={{ color: "#a7a7a7" }}>Country or region</span>
                  <span style={{ fontWeight: 600 }}>United States</span>
                </div>
              </div>

              <div style={{ marginTop: "16px" }}>
                <button
                  style={{
                    background: "transparent",
                    color: "#ffffff",
                    border: "1px solid #878787",
                    borderRadius: "500px",
                    padding: "10px 28px",
                    fontSize: "14px",
                    fontWeight: 700,
                    cursor: "pointer",
                    transition: "all 0.15s ease",
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.borderColor = "#ffffff"
                    e.currentTarget.style.transform = "scale(1.03)"
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.borderColor = "#878787"
                    e.currentTarget.style.transform = "scale(1)"
                  }}
                >
                  Edit profile
                </button>
              </div>
            </section>

            {/* Section 2: Your Plan Card (The iconic Spotify Premium Card) */}
            <section style={{ marginBottom: "48px" }}>
              <h2
                style={{
                  fontSize: "20px",
                  fontWeight: 700,
                  margin: "0 0 16px 0",
                  color: "#ffffff",
                }}
              >
                Your plan
              </h2>

              <div
                style={{
                  background: "#242424",
                  borderRadius: "8px",
                  overflow: "hidden",
                  border: "1px solid #333333",
                }}
              >
                {/* Top Colored Banner Header */}
                <div
                  style={{
                    background:
                      subStatus === "Active"
                        ? "linear-gradient(135deg, rgb(255, 100, 180) 0%, rgb(180, 80, 240) 100%)"
                        : "linear-gradient(135deg, #444 0%, #222 100%)",
                    padding: "20px 28px",
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
                        marginBottom: "6px",
                      }}
                    >
                      {subStatus === "Active" ? "SPOTIFY PREMIUM" : "FREE TIER PENDING"}
                    </span>
                    <h3 style={{ fontSize: "28px", fontWeight: 900, margin: 0, color: "#ffffff", letterSpacing: "-0.5px" }}>
                      Individual
                    </h3>
                  </div>

                  <span
                    style={{
                      fontSize: "13px",
                      fontWeight: 700,
                      background: "rgba(0,0,0,0.4)",
                      color: "#ffffff",
                      padding: "4px 12px",
                      borderRadius: "16px",
                    }}
                  >
                    1 account
                  </span>
                </div>

                {/* Card Body Details */}
                <div style={{ padding: "28px" }}>
                  <div style={{ fontSize: "14px", color: "#e0e0e0", lineHeight: 1.6, marginBottom: "20px" }}>
                    {subStatus === "Active" ? (
                      <>
                        You are currently on <strong>Spotify Premium Individual</strong>. Your next payment of{" "}
                        <strong>$10.99</strong> will be on <strong>June 26, 2026</strong>.
                      </>
                    ) : (
                      <>
                        Your Premium benefits will end on <strong>June 26, 2026</strong>. After this date, your
                        account switches to Spotify Free.
                      </>
                    )}
                  </div>

                  {/* Feature Checklist */}
                  <div style={{ display: "grid", gap: "10px", marginBottom: "24px", fontSize: "14px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <Check size={18} color="#1ed760" /> Ad-free music listening
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <Check size={18} color="#1ed760" /> Play anywhere - even offline
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <Check size={18} color="#1ed760" /> On-demand playback
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <Check size={18} color="#1ed760" /> High audio quality
                    </div>
                  </div>

                  {/* Plan Price & Payment Method */}
                  <div
                    style={{
                      background: "#181818",
                      borderRadius: "8px",
                      padding: "16px 20px",
                      marginBottom: "28px",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
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

                  {/* Official Action Buttons */}
                  <div style={{ display: "flex", gap: "14px", flexWrap: "wrap" }}>
                    <button
                      style={{
                        background: "#ffffff",
                        color: "#000000",
                        border: "none",
                        borderRadius: "500px",
                        padding: "12px 32px",
                        fontSize: "14px",
                        fontWeight: 700,
                        cursor: "pointer",
                        transition: "all 0.15s ease",
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
                          border: "1px solid #878787",
                          borderRadius: "500px",
                          padding: "12px 32px",
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
                          e.currentTarget.style.borderColor = "#878787"
                          e.currentTarget.style.transform = "scale(1)"
                        }}
                      >
                        Cancel plan
                      </button>
                    ) : (
                      <button
                        style={{
                          background: "#282828",
                          color: "#888888",
                          border: "1px solid #3e3e3e",
                          borderRadius: "500px",
                          padding: "12px 32px",
                          fontSize: "14px",
                          fontWeight: 700,
                          cursor: "default",
                        }}
                      >
                        Plan Cancelled
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </section>

            {/* Section 3: SubSlayer Payment Shield & Simulation Controls */}
            <section style={{ marginBottom: "48px" }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: "16px",
                }}
              >
                <h2 style={{ fontSize: "20px", fontWeight: 700, margin: 0, color: "#ffffff" }}>
                  Payment Method &amp; Virtual Card Shield
                </h2>
                <span
                  style={{
                    background: "rgba(112, 75, 115, 0.2)",
                    border: "1px solid #704b73",
                    color: "#f3e8f5",
                    fontSize: "11px",
                    fontWeight: 750,
                    padding: "3px 8px",
                    borderRadius: "4px",
                  }}
                >
                  POWERED BY SUBSLAYER
                </span>
              </div>

              <div
                style={{
                  background: "#181818",
                  borderRadius: "8px",
                  border: `1.5px solid ${isLocked ? "#b91c1c" : "#1ed760"}`,
                  padding: "24px 28px",
                  display: "grid",
                  gap: "20px",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <span style={{ fontSize: "12px", color: "#a7a7a7" }}>
                      Registered Card
                    </span>
                    <div style={{ fontSize: "16px", fontWeight: 700, fontFamily: "monospace", letterSpacing: "1px", marginTop: "2px" }}>
                      VISA •••• •••• •••• {card?.last4 || "4242"}
                    </div>
                  </div>

                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                      background: isLocked ? "rgba(185, 28, 28, 0.2)" : "rgba(30, 215, 96, 0.2)",
                      border: `1px solid ${isLocked ? "#ef4444" : "#1ed760"}`,
                      color: isLocked ? "#fca5a5" : "#86efac",
                      padding: "6px 14px",
                      borderRadius: "20px",
                      fontSize: "12px",
                      fontWeight: 750,
                    }}
                  >
                    {isLocked ? <Lock size={14} /> : <Unlock size={14} />}
                    {isLocked ? "SHIELD LOCKED ($0.00 LIMIT)" : "SHIELD ACTIVE ($20.00 LIMIT)"}
                  </div>
                </div>

                <div
                  style={{
                    background: "#222222",
                    borderRadius: "6px",
                    padding: "12px 16px",
                    fontSize: "13px",
                    color: "#ccc",
                    lineHeight: 1.5,
                  }}
                >
                  {isLocked ? (
                    <span style={{ color: "#fca5a5" }}>
                      <strong>Active Defense:</strong> Card balance locked to $0.00. Any monthly billing charge attempts by Spotify will be automatically rejected before Stripe processes them.
                    </span>
                  ) : (
                    <span style={{ color: "#86efac" }}>
                      <strong>Card Unlocked:</strong> Test payments up to $20.00 will succeed against the Stripe test ledger and demo wallet.
                    </span>
                  )}
                </div>

                {/* Simulation Action Controls */}
                <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
                  <button
                    onClick={handleSimulateRenewal}
                    disabled={charging}
                    style={{
                      background: "#1ed760",
                      color: "#000000",
                      border: "none",
                      borderRadius: "500px",
                      padding: "11px 24px",
                      fontSize: "13.5px",
                      fontWeight: 750,
                      cursor: charging ? "wait" : "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      transition: "transform 0.15s ease",
                    }}
                    onMouseOver={(e) => (e.currentTarget.style.transform = "scale(1.03)")}
                    onMouseOut={(e) => (e.currentTarget.style.transform = "scale(1)")}
                  >
                    {charging ? (
                      <>
                        <RefreshCw size={14} className="animate-spin" /> Charging $10.99...
                      </>
                    ) : (
                      <>
                        <Flame size={14} /> Simulate Monthly Renewal Charge ($10.99)
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
                      borderRadius: "500px",
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
                      background: subStatus === "Cancelled" ? "#282828" : "#704b73",
                      color: subStatus === "Cancelled" ? "#777" : "#fff",
                      border: "none",
                      borderRadius: "500px",
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
                    {subStatus === "Cancelled" ? "Slayed by SubSlayer AI" : "1-Click Slay with SubSlayer AI"}
                  </button>
                </div>
              </div>
            </section>

            {/* Section 4: Sign out everywhere */}
            <section>
              <h2
                style={{
                  fontSize: "20px",
                  fontWeight: 700,
                  margin: "0 0 16px 0",
                  color: "#ffffff",
                }}
              >
                Sign out everywhere
              </h2>
              <div
                style={{
                  background: "#181818",
                  borderRadius: "8px",
                  border: "1px solid #282828",
                  padding: "24px 28px",
                }}
              >
                <p style={{ fontSize: "14px", color: "#a7a7a7", margin: "0 0 20px 0", lineHeight: 1.5 }}>
                  Sign out of Spotify everywhere you’re logged in, including mobile, tablet, web player and desktop app.
                </p>
                <button
                  style={{
                    background: "transparent",
                    color: "#ffffff",
                    border: "1px solid #878787",
                    borderRadius: "500px",
                    padding: "10px 28px",
                    fontSize: "14px",
                    fontWeight: 700,
                    cursor: "pointer",
                    transition: "all 0.15s ease",
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.borderColor = "#ffffff"
                    e.currentTarget.style.transform = "scale(1.03)"
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.borderColor = "#878787"
                    e.currentTarget.style.transform = "scale(1)"
                  }}
                >
                  Sign out everywhere
                </button>
              </div>
            </section>
          </div>
        </main>
      </div>

      {/* 4. Official Spotify Footer (accounts.spotify.com) */}
      <footer
        style={{
          background: "#000000",
          borderTop: "1px solid #1c1c1c",
          padding: "60px 40px 40px",
          marginTop: "60px",
        }}
      >
        <div
          style={{
            maxWidth: "1170px",
            margin: "0 auto",
            display: "grid",
            gridTemplateColumns: "1.5fr 1fr 1fr 1fr 1fr",
            gap: "32px",
            marginBottom: "40px",
          }}
        >
          <div>
            <SpotifyWordmark height={32} />
          </div>

          <div>
            <span style={{ fontSize: "12px", fontWeight: 900, textTransform: "uppercase", color: "#919496", display: "block", marginBottom: "16px" }}>
              Company
            </span>
            <div style={{ display: "grid", gap: "10px", fontSize: "14px", color: "#ffffff" }}>
              <span>About</span>
              <span>Jobs</span>
              <span>For the Record</span>
            </div>
          </div>

          <div>
            <span style={{ fontSize: "12px", fontWeight: 900, textTransform: "uppercase", color: "#919496", display: "block", marginBottom: "16px" }}>
              Communities
            </span>
            <div style={{ display: "grid", gap: "10px", fontSize: "14px", color: "#ffffff" }}>
              <span>For Artists</span>
              <span>Developers</span>
              <span>Advertising</span>
              <span>Investors</span>
            </div>
          </div>

          <div>
            <span style={{ fontSize: "12px", fontWeight: 900, textTransform: "uppercase", color: "#919496", display: "block", marginBottom: "16px" }}>
              Useful links
            </span>
            <div style={{ display: "grid", gap: "10px", fontSize: "14px", color: "#ffffff" }}>
              <span>Support</span>
              <span>Web Player</span>
              <span>Free Mobile App</span>
            </div>
          </div>

          <div style={{ display: "flex", gap: "16px", justifyContent: "flex-end" }}>
            <div
              style={{
                width: "40px",
                height: "40px",
                borderRadius: "50%",
                background: "#222326",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
              </svg>
            </div>
            <div
              style={{
                width: "40px",
                height: "40px",
                borderRadius: "50%",
                background: "#222326",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
            </div>
          </div>
        </div>


        <div
          style={{
            maxWidth: "1170px",
            margin: "0 auto",
            display: "flex",
            justifyContent: "space-between",
            fontSize: "12px",
            color: "#919496",
            borderTop: "1px solid #1c1c1c",
            paddingTop: "24px",
          }}
        >
          <div style={{ display: "flex", gap: "20px" }}>
            <span>Legal</span>
            <span>Safety &amp; Privacy Center</span>
            <span>Privacy Policy</span>
            <span>Cookies</span>
            <span>About Ads</span>
          </div>
          <span>USA · © 2026 Spotify AB</span>
        </div>
      </footer>

      {/* 5. Realistic Spotify Charge Result Modal */}
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
            zIndex: 9999,
          }}
          onClick={() => setChargeResult(null)}
        >
          <div
            style={{
              background: "#181818",
              border: `1.5px solid ${chargeResult.success ? "#1ed760" : "#ef4444"}`,
              borderRadius: "12px",
              padding: "32px",
              maxWidth: "460px",
              width: "100%",
              color: "#fff",
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
                {chargeResult.success ? "Payment Processed" : "Payment Declined"}
              </h3>

              <p style={{ color: "#a7a7a7", fontSize: "14px", lineHeight: 1.5, margin: 0 }}>
                {chargeResult.success
                  ? "Spotify charged $10.99 to your SubSlayer virtual card via Stripe test mode."
                  : "Spotify tried to charge $10.99, but SubSlayer Virtual Card Shield blocked the transaction."}
              </p>
            </div>

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
            </div>

            <button
              onClick={() => setChargeResult(null)}
              style={{
                width: "100%",
                background: chargeResult.success ? "#1ed760" : "#ffffff",
                color: "#000000",
                border: "none",
                padding: "12px",
                borderRadius: "500px",
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

      {/* 6. Realistic Spotify 2-Step Cancellation Confirmation Modal */}
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
            zIndex: 9999,
          }}
          onClick={() => setShowCancelModal(false)}
        >
          <div
            style={{
              background: "#181818",
              border: "1px solid #333",
              borderRadius: "12px",
              padding: "36px",
              maxWidth: "520px",
              width: "100%",
              color: "#fff",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ textAlign: "center", marginBottom: "24px" }}>
              <SpotifyLogo size={52} style={{ margin: "0 auto 16px" }} />
              <h3 style={{ fontSize: "26px", fontWeight: 900, margin: "0 0 10px 0", letterSpacing: "-0.5px" }}>
                Switch to Spotify Free?
              </h3>
              <p style={{ color: "#a7a7a7", fontSize: "14px", lineHeight: 1.5, margin: 0 }}>
                If you cancel Premium, you will switch to Spotify Free after your current billing period ends on June 26, 2026.
              </p>
            </div>

            <div
              style={{
                background: "#242424",
                borderRadius: "8px",
                padding: "18px 20px",
                marginBottom: "28px",
                fontSize: "13.5px",
              }}
            >
              <span style={{ fontWeight: 700, color: "#f87171", display: "block", marginBottom: "10px" }}>
                What you will lose:
              </span>
              <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "grid", gap: "8px" }}>
                <li>❌ Ad interruptions between songs</li>
                <li>❌ Shuffle-only playback on mobile</li>
                <li>❌ No offline music downloads</li>
                <li>❌ Limited to 6 track skips per hour</li>
              </ul>
            </div>

            <div style={{ display: "grid", gap: "12px" }}>
              <button
                onClick={() => setShowCancelModal(false)}
                style={{
                  background: "#1ed760",
                  color: "#000000",
                  border: "none",
                  padding: "14px",
                  borderRadius: "500px",
                  fontWeight: 750,
                  fontSize: "14px",
                  cursor: "pointer",
                }}
              >
                Keep my Premium Individual
              </button>
              <button
                onClick={handleManualCancelConfirm}
                style={{
                  background: "transparent",
                  color: "#a7a7a7",
                  border: "1px solid #444",
                  padding: "12px",
                  borderRadius: "500px",
                  fontWeight: 700,
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
