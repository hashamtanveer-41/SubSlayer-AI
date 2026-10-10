import { useEffect, useState } from "react"
import {
  Lock,
  RefreshCw,
  ShieldCheck,
  Unlock,
  Zap,
} from "lucide-react"
import { getApiHealth, getDemoWalletApi, getVirtualCards } from "../../services/api"
import type { DemoWallet, VirtualCard } from "../../types"
import { money } from "../../utils/formatters"
import { Button } from "../ui/Button"
import { ChargeSimulationModal } from "./ChargeSimulationModal"
import { VirtualCardVisual } from "./VirtualCardVisual"

export interface VirtualCardsViewProps {
  cards: VirtualCard[]
  onToggleLock: (cardId: string) => void
  onSyncBackendCards?: (cards: VirtualCard[]) => void
}

export function VirtualCardsView({
  cards,
  onToggleLock,
  onSyncBackendCards,
}: VirtualCardsViewProps) {
  const [testCard, setTestCard] = useState<VirtualCard | null>(null)
  const [simulatorOpen, setSimulatorOpen] = useState(false)
  const [backendStatus, setBackendStatus] = useState<string>("Checking backend...")
  const [syncing, setSyncing] = useState(false)
  const [wallet, setWallet] = useState<DemoWallet | null>(null)

  // Check backend health & Stripe test mode on mount
  useEffect(() => {
    async function checkHealth() {
      const health = await getApiHealth()
      if (health) {
        setBackendStatus(health.stripeMode === "test" ? "Stripe test mode connected" : "Stripe test key unavailable")
      } else {
        setBackendStatus("Backend unavailable")
      }
      try { setWallet(await getDemoWalletApi()) } catch { setWallet(null) }
    }
    checkHealth()
  }, [])

  // Manual sync from backend
  async function handleRefreshBackend() {
    setSyncing(true)
    try {
      const liveCards = await getVirtualCards()
      if (onSyncBackendCards && liveCards.length > 0) {
        onSyncBackendCards(liveCards)
      }
      setWallet(await getDemoWalletApi())
    } catch (err) {
      console.warn("Could not sync live cards:", err)
    } finally {
      setSyncing(false)
    }
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "28px" }}>
      {/* Feature Intro & Status Banner */}
      <div
        style={{
          background: "linear-gradient(135deg, #f7f1fa 0%, #eee4f2 100%)",
          border: "1px solid #e1d3e7",
          borderRadius: "12px",
          padding: "24px 28px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "18px",
        }}
      >
        <div style={{ maxWidth: "680px" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              marginBottom: "8px",
            }}
          >
            <div className="eyebrow" style={{ display: "inline-flex", margin: 0 }}>
              <ShieldCheck size={14} /> STRIPE TEST PAYMENT SHIELD
            </div>
            <span
              style={{
                fontSize: "9px",
                fontWeight: 700,
                padding: "2px 8px",
                borderRadius: "12px",
                background: "#dcfce7",
                color: "#166534",
                border: "1px solid #bbf7d0",
                display: "inline-flex",
                alignItems: "center",
                gap: "4px",
              }}
            >
              <span
                style={{
                  width: "5px",
                  height: "5px",
                  borderRadius: "50%",
                  background: "#16a34a",
                }}
              />
              {backendStatus}
            </span>
          </div>
          <h2
            style={{
              fontSize: "22px",
              fontWeight: 650,
              margin: "4px 0 8px",
              color: "var(--color-ink)",
            }}
          >
            Demo Payment Shield
          </h2>
          <p
            style={{
              fontSize: "12px",
              color: "#78657f",
              lineHeight: 1.7,
              margin: 0,
            }}
          >
            A locked demo card blocks a test charge before Stripe. An unlocked test charge
            uses Stripe test mode and decreases the separate customer demo wallet.
            No bank account or real virtual card is involved.
          </p>
          <p style={{ marginTop: 10, fontWeight: 700 }}>
            Customer demo wallet: {wallet ? money(wallet.balance_cents / 100) : "Unavailable"}
          </p>
        </div>

        <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
          <Button
            variant="secondary"
            onClick={handleRefreshBackend}
            disabled={syncing}
            style={{ gap: "6px" }}
          >
            <RefreshCw size={14} className={syncing ? "spinning" : ""} />
              Refresh demo state
            </Button>
        </div>
      </div>

      {/* Cards Display Grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
          gap: "24px",
        }}
      >
        {cards.map((card) => {
          const isLocked =
            card.balanceLocked ??
            card.demoPolicyLocked ??
            card.status === "locked"

          return (
            <div
              key={card.id}
              style={{
                background: "#ffffff",
                border: "1px solid var(--border)",
                borderRadius: "12px",
                padding: "22px",
                display: "flex",
                flexDirection: "column",
                gap: "18px",
              }}
            >
              <VirtualCardVisual card={card} onToggleLock={onToggleLock} />

              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    fontSize: "12px",
                  }}
                >
                  <span>Shield Policy Control:</span>
                  <Button
                    variant={isLocked ? "primary" : "secondary"}
                    onClick={() => onToggleLock(card.id)}
                    style={{
                      fontSize: "11px",
                      padding: "6px 12px",
                      gap: "6px",
                      background: isLocked ? "#dc2626" : undefined,
                      color: isLocked ? "#fff" : undefined,
                    }}
                  >
                    {isLocked ? (
                      <>
                        <Lock size={13} /> Unlock Card
                      </>
                    ) : (
                      <>
                        <Unlock size={13} /> Lock to $0
                      </>
                    )}
                  </Button>
                </div>

                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    fontSize: "12px",
                  }}
                >
                  <span>Authorized Spending Limit:</span>
                  <strong>{money(card.spendingLimit)}/mo</strong>
                </div>

                <Button
                  variant="ghost"
                  className="full-width"
                  onClick={() => {
                    setTestCard(card)
                    setSimulatorOpen(true)
                  }}
                  style={{
                    border: "1px dashed #d8cbdc",
                    fontSize: "11px",
                    gap: "6px",
                    color: "var(--accent)",
                  }}
                >
                  <Zap size={14} /> Test Stripe Charge via API
                </Button>
              </div>
            </div>
          )
        })}
      </div>

      {/* Simulator Modal */}
      <ChargeSimulationModal
        open={simulatorOpen}
        onOpenChange={setSimulatorOpen}
        card={testCard}
        onChargeComplete={handleRefreshBackend}
      />
    </div>
  )
}
