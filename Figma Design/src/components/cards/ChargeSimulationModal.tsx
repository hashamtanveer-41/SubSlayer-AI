import { useState } from "react"
import { AlertTriangle, CheckCircle, ShieldAlert, ShieldCheck } from "lucide-react"
import type { VirtualCard } from "../../types"
import { money } from "../../utils/formatters"
import { Button } from "../ui/Button"
import { Dialog } from "../ui/Dialog"

export interface ChargeSimulationModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  card: VirtualCard | null
}

export function ChargeSimulationModal({
  open,
  onOpenChange,
  card,
}: ChargeSimulationModalProps) {
  const [chargeAmount, setChargeAmount] = useState<number>(14.99)
  const [result, setResult] = useState<{
    status: "APPROVED" | "DECLINED"
    message: string
    bankImpact: number
  } | null>(null)

  if (!card) return null

  function handleSimulate() {
    if (card?.balanceLocked) {
      setResult({
        status: "DECLINED",
        message: "Card balance locked to $0.00 by SubSlayer Shield. Merchant authorization rejected instantly.",
        bankImpact: 0.0,
      })
    } else if (chargeAmount > card.spendingLimit) {
      setResult({
        status: "DECLINED",
        message: `Charge exceeds designated card spending limit of ${money(card.spendingLimit)}.`,
        bankImpact: 0.0,
      })
    } else {
      setResult({
        status: "APPROVED",
        message: `Transaction processed within safe spending limit of ${money(card.spendingLimit)}.`,
        bankImpact: chargeAmount,
      })
    }
  }

  function handleReset() {
    setResult(null)
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        onOpenChange(isOpen)
        if (!isOpen) setResult(null)
      }}
      title="Merchant Charge Simulator"
      description="Test what happens when a merchant attempts an unauthorized recurring transaction."
    >
      <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        <div
          style={{
            background: "#f7f1fa",
            padding: "14px",
            borderRadius: "8px",
            border: "1px solid #e7deeb",
            fontSize: "11px",
            color: "#6b5973",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
            <span>Target Card:</span>
            <strong>{card.cardNumberMasked}</strong>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
            <span>Current Shield Status:</span>
            <strong style={{ color: card.balanceLocked ? "#dc2626" : "#16a34a" }}>
              {card.balanceLocked ? "LOCKED ($0 BALANCE)" : `ACTIVE (${money(card.spendingLimit)})`}
            </strong>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span>Merchant:</span>
            <strong>{card.merchant}</strong>
          </div>
        </div>

        <div>
          <label style={{ display: "block", fontSize: "11px", fontWeight: 600, marginBottom: "6px" }}>
            Simulated Attempted Charge Amount (USD)
          </label>
          <input
            type="number"
            value={chargeAmount}
            onChange={(e) => {
              setChargeAmount(Number(e.target.value))
              setResult(null)
            }}
            className="input"
            step="0.01"
            min="0.01"
          />
        </div>

        {!result ? (
          <Button
            onClick={handleSimulate}
            className="full-width"
            style={{ gap: "8px" }}
          >
            <ShieldAlert size={16} />
            Simulate Merchant Billing Attempt
          </Button>
        ) : (
          <div
            style={{
              padding: "16px",
              borderRadius: "8px",
              border: `1px solid ${result.status === "DECLINED" ? "#fca5a5" : "#86efac"}`,
              background: result.status === "DECLINED" ? "#fef2f2" : "#f0fdf4",
              display: "flex",
              flexDirection: "column",
              gap: "8px",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              {result.status === "DECLINED" ? (
                <ShieldAlert size={22} color="#dc2626" />
              ) : (
                <CheckCircle size={22} color="#16a34a" />
              )}
              <strong
                style={{
                  fontSize: "13px",
                  color: result.status === "DECLINED" ? "#dc2626" : "#16a34a",
                }}
              >
                TRANSACTION {result.status}
              </strong>
            </div>
            <p style={{ fontSize: "11px", color: "#4b5563", margin: "4px 0" }}>
              {result.message}
            </p>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                paddingTop: "8px",
                borderTop: "1px dashed rgba(0,0,0,0.1)",
                fontSize: "11px",
                fontWeight: 600,
              }}
            >
              <span>Impact on Main Bank Account:</span>
              <strong style={{ color: result.bankImpact === 0 ? "#16a34a" : "#dc2626" }}>
                ${result.bankImpact.toFixed(2)} (100% Protected)
              </strong>
            </div>
            <Button
              variant="secondary"
              onClick={handleReset}
              style={{ marginTop: "8px" }}
            >
              Test Another Amount
            </Button>
          </div>
        )}
      </div>
    </Dialog>
  )
}
