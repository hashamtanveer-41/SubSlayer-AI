import { useEffect, useState } from "react"
import {
  Lock,
  Plus,
  RefreshCw,
  ShieldCheck,
  Unlock,
  Zap,
} from "lucide-react"
import { getApiHealth, getVirtualCards } from "../../services/api"
import type { VirtualCard } from "../../types"
import { money } from "../../utils/formatters"
import { Button } from "../ui/Button"
import { ChargeSimulationModal } from "./ChargeSimulationModal"
import { VirtualCardVisual } from "./VirtualCardVisual"

export interface VirtualCardsViewProps {
  cards: VirtualCard[]
  onToggleLock: (cardId: string) => void
  onAddCard: (card: VirtualCard) => void
  onUpdateLimit: (cardId: string, limit: number) => void
  onSyncBackendCards?: (cards: VirtualCard[]) => void
}

export function VirtualCardsView({
  cards,
  onToggleLock,
  onAddCard,
  onSyncBackendCards,
}: VirtualCardsViewProps) {
  const [testCard, setTestCard] = useState<VirtualCard | null>(null)
  const [simulatorOpen, setSimulatorOpen] = useState(false)
  const [backendStatus, setBackendStatus] = useState<string>("Checking backend...")
  const [syncing, setSyncing] = useState(false)

  // Check backend health & Stripe test mode on mount
  useEffect(() => {
    async function checkHealth() {
      const health = await getApiHealth()
      if (health) {
        setBackendStatus(`Stripe Gateway Live (${health.service})`)
      } else {
        setBackendStatus("Running in Local Demo Mode")
      }
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
    } catch (err) {
      console.warn("Could not sync live cards:", err)
    } finally {
      setSyncing(false)
    }
  }

  function createNewCard() {
    const randomSuffix = Math.floor(1000 + Math.random() * 9000)
    const newCard: VirtualCard = {
      id: `card_${Date.now()}`,
      label: "New Subscription / Trial",
      merchant: "New Subscription / Trial",
      cardNumberMasked: `•••• •••• •••• ${randomSuffix}`,
      last4: String(randomSuffix),
      cardBrand: "visa",
      exp: "12/29",
      cvv: String(Math.floor(100 + Math.random() * 900)),
      spendingLimit: 25.0,
      balanceLocked: false,
      demoPolicyLocked: false,
      status: "active",
      testMode: true,
      stripeCustomerId: `cus_test_${randomSuffix}`,
      paymentMethodId: `pm_card_${randomSuffix}`,
    }
    onAddCard(newCard)
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
            Zero-Out Balance Virtual Cards
          </h2>
          <p
            style={{
              fontSize: "12px",
              color: "#78657f",
              lineHeight: 1.7,
              margin: 0,
            }}
          >
            When a merchant makes cancellation difficult or locks you in,
            switch your virtual card policy to <strong>$0.00 Balance Shield</strong>.
            Incoming Stripe charge attempts are blocked by our demo policy before
            ever reaching your bank account.
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
            Sync Stripe API
          </Button>
          <Button onClick={createNewCard} style={{ gap: "8px" }}>
            <Plus size={16} /> Generate Virtual Card
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
      />
    </div>
  )
}
