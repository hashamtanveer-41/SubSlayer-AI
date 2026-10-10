import { useState } from "react"
import {
  CheckCircle,
  Copy,
  LoaderCircle,
  ShieldAlert,
  ShieldCheck,
  Zap,
} from "lucide-react"
import { simulateChargeApi } from "../../services/api"
import type { SimulateChargeResponse, VirtualCard } from "../../types"
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
  const [merchantName, setMerchantName] = useState<string>("Netflix")
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<SimulateChargeResponse | null>(null)
  const [copiedId, setCopiedId] = useState(false)

  if (!card) return null

  const isLocked =
    card.balanceLocked ?? card.demoPolicyLocked ?? card.status === "locked"

  async function handleSimulate() {
    setLoading(true)
    try {
      // Call live FastAPI Stripe test endpoint
      const res = await simulateChargeApi(
        card?.id || "card_01",
        chargeAmount,
        merchantName || card?.merchant || card?.label || "Subscription",
      )
      setResult(res)
    } catch (err: any) {
      // Fallback local calculation if backend is disconnected
      setResult({
        success: !isLocked,
        status: isLocked ? "DECLINED" : "APPROVED",
        reason: isLocked
          ? `Blocked by SubSlayer Shield demo policy ($0 balance lock) for ${merchantName}`
          : `Simulated Stripe authorization succeeded for $${chargeAmount}`,
        outcomeType: isLocked ? "blocked_by_demo_policy" : "succeeded",
        stripePaymentIntentId: isLocked ? null : "pi_test_offline_fallback",
        testMode: true,
        amountBlocked: isLocked ? chargeAmount : 0.0,
        timestamp: new Date().toISOString(),
      })
    } finally {
      setLoading(false)
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
      title="Stripe Payment Shield Simulator"
      description="Test live payment interception and $0-balance protection against merchant charges."
    >
      <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        {/* Card info summary */}
        <div
          style={{
            background: "#f7f1fa",
            padding: "14px 16px",
            borderRadius: "8px",
            border: "1px solid #e7deeb",
            fontSize: "11px",
            color: "#6b5973",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginBottom: "6px",
            }}
          >
            <span>Target Virtual Card:</span>
            <strong>
              {card.cardNumberMasked || `•••• ${card.last4 || "4242"}`} (
              {(card.cardBrand || "visa").toUpperCase()})
            </strong>
          </div>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginBottom: "6px",
            }}
          >
            <span>Shield Policy Status:</span>
            <strong style={{ color: isLocked ? "#dc2626" : "#16a34a" }}>
              {isLocked
                ? "LOCKED ($0.00 ZERO-OUT SHIELD)"
                : `ACTIVE (${money(card.spendingLimit)} Limit)`}
            </strong>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span>Stripe Customer ID:</span>
            <code style={{ fontSize: "10px", color: "var(--accent)" }}>
              {card.stripeCustomerId || "cus_test_demo"}
            </code>
          </div>
        </div>

        {/* Input fields */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
          <div>
            <label
              style={{
                display: "block",
                fontSize: "11px",
                fontWeight: 600,
                marginBottom: "6px",
              }}
            >
              Merchant Name
            </label>
            <input
              type="text"
              value={merchantName}
              onChange={(e) => {
                setMerchantName(e.target.value)
                setResult(null)
              }}
              className="input"
              placeholder="e.g. Netflix, Adobe"
            />
          </div>
          <div>
            <label
              style={{
                display: "block",
                fontSize: "11px",
                fontWeight: 600,
                marginBottom: "6px",
              }}
            >
              Attempted Charge (USD)
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
        </div>

        {/* Action Button or Results Display */}
        {!result ? (
          <Button
            onClick={handleSimulate}
            disabled={loading}
            className="full-width"
            style={{ gap: "8px" }}
          >
            {loading ? (
              <>
                <LoaderCircle className="spinning" size={16} />
                Executing Stripe Gateway Authorization...
              </>
            ) : (
              <>
                <Zap size={16} />
                Execute Test Charge via Backend API
              </>
            )}
          </Button>
        ) : (
          <div
            style={{
              padding: "16px",
              borderRadius: "8px",
              border: `1px solid ${
                result.status === "DECLINED" ? "#fca5a5" : "#86efac"
              }`,
              background: result.status === "DECLINED" ? "#fef2f2" : "#f0fdf4",
              display: "flex",
              flexDirection: "column",
              gap: "10px",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                }}
              >
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
              <span
                style={{
                  fontSize: "9px",
                  fontWeight: 700,
                  textTransform: "uppercase",
                  padding: "2px 6px",
                  borderRadius: "4px",
                  background:
                    result.status === "DECLINED"
                      ? "rgba(220, 38, 38, 0.15)"
                      : "rgba(22, 163, 74, 0.15)",
                  color: result.status === "DECLINED" ? "#dc2626" : "#16a34a",
                }}
              >
                {result.outcomeType}
              </span>
            </div>

            <p style={{ fontSize: "11px", color: "#374151", margin: "2px 0" }}>
              {result.reason}
            </p>

            {result.stripePaymentIntentId && (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  background: "rgba(0,0,0,0.05)",
                  padding: "6px 10px",
                  borderRadius: "5px",
                  fontSize: "10px",
                  fontFamily: "ui-monospace, monospace",
                }}
              >
                <span>PaymentIntent: {result.stripePaymentIntentId}</span>
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(result.stripePaymentIntentId || "")
                    setCopiedId(true)
                    setTimeout(() => setCopiedId(false), 2000)
                  }}
                  style={{
                    border: "none",
                    background: "transparent",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "4px",
                    fontSize: "10px",
                    color: "var(--accent)",
                  }}
                >
                  <Copy size={11} /> {copiedId ? "Copied" : "Copy"}
                </button>
              </div>
            )}

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
              <strong
                style={{
                  color:
                    result.status === "DECLINED" ? "#16a34a" : "#dc2626",
                }}
              >
                ${(result.status === "DECLINED" ? 0 : chargeAmount).toFixed(2)}{" "}
                {result.status === "DECLINED" ? "(100% Shielded)" : "(Charged from limit)"}
              </strong>
            </div>

            <Button
              variant="secondary"
              onClick={handleReset}
              style={{ marginTop: "6px" }}
            >
              Simulate Another Amount
            </Button>
          </div>
        )}
      </div>
    </Dialog>
  )
}
