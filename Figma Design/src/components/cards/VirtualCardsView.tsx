import { useState } from "react"
import { Lock, Plus, ShieldCheck, Unlock, Zap } from "lucide-react"
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
}

export function VirtualCardsView({
  cards,
  onToggleLock,
  onAddCard,
  onUpdateLimit,
}: VirtualCardsViewProps) {
  const [testCard, setTestCard] = useState<VirtualCard | null>(null)
  const [simulatorOpen, setSimulatorOpen] = useState(false)

  function createNewCard() {
    const randomSuffix = Math.floor(1000 + Math.random() * 9000)
    const newCard: VirtualCard = {
      id: `card_${Date.now()}`,
      merchant: "New Subscription / Trial",
      cardNumberMasked: `•••• •••• •••• ${randomSuffix}`,
      exp: "12/29",
      cvv: String(Math.floor(100 + Math.random() * 900)),
      spendingLimit: 25.0,
      balanceLocked: false,
      status: "Active",
      tone: "plum",
    }
    onAddCard(newCard)
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "28px" }}>
      {/* Feature Intro Banner */}
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
          <div className="eyebrow" style={{ marginBottom: "6px" }}>
            <ShieldCheck size={14} /> PRIVACY.COM-STYLE FINANCIAL SHIELD
          </div>
          <h2 style={{ fontSize: "22px", fontWeight: 650, margin: "4px 0 8px", color: "var(--color-ink)" }}>
            Zero-Out Balance Burner Cards
          </h2>
          <p style={{ fontSize: "12px", color: "#78657f", lineHeight: 1.7, margin: 0 }}>
            When a merchant makes cancellation difficult (or demands in-person visits),
            lock your virtual card balance to <strong>$0.00</strong>. Future charge attempts
            bounce instantly, shielding your real bank account and credit score.
          </p>
        </div>
        <Button onClick={createNewCard} style={{ gap: "8px" }}>
          <Plus size={16} /> Generate Burner Card
        </Button>
      </div>

      {/* Cards Display Grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
          gap: "24px",
        }}
      >
        {cards.map((card) => (
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
                <span>Shield Balance Control:</span>
                <Button
                  variant={card.balanceLocked ? "primary" : "secondary"}
                  onClick={() => onToggleLock(card.id)}
                  style={{
                    fontSize: "11px",
                    padding: "6px 12px",
                    gap: "6px",
                    background: card.balanceLocked ? "#dc2626" : undefined,
                    color: card.balanceLocked ? "#fff" : undefined,
                  }}
                >
                  {card.balanceLocked ? (
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
                <span>Spending Limit:</span>
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
                <Zap size={14} /> Simulate Merchant Charge Attempt
              </Button>
            </div>
          </div>
        ))}
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
