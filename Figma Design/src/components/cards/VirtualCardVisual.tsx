import { Check, Lock, ShieldCheck, Wifi } from "lucide-react"
import type { VirtualCard } from "../../types"

export interface VirtualCardVisualProps {
  card: VirtualCard
  onToggleLock: (cardId: string) => void
  disabled?: boolean
}

export function VirtualCardVisual({
  card,
  onToggleLock,
  disabled = false,
}: VirtualCardVisualProps) {
  const isLocked = card.balanceLocked ?? card.demoPolicyLocked ?? (card.status === "locked")
  const brand = (card.cardBrand || "visa").toUpperCase()

  const cardBackground = isLocked
    ? "linear-gradient(135deg, #2a202f 0%, #17111c 100%)"
    : "linear-gradient(135deg, #72556e 0%, #473246 100%)"

  return (
    <div
      style={{
        width: "100%",
        maxWidth: "340px",
        height: "210px",
        borderRadius: "14px",
        background: cardBackground,
        color: "#ffffff",
        padding: "18px 22px",
        boxShadow: isLocked
          ? "0 10px 30px rgba(42, 32, 47, 0.35)"
          : "0 14px 35px rgba(114, 85, 110, 0.35)",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        position: "relative",
        border: isLocked
          ? "1px solid rgba(220, 38, 38, 0.35)"
          : "1px solid rgba(255, 255, 255, 0.2)",
        transition: "all 0.3s ease",
      }}
    >
      {/* Top Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "7px" }}>
          <span
            style={{
              fontWeight: 800,
              fontSize: "14px",
              letterSpacing: "-0.5px",
            }}
          >
            SubSlayer
          </span>
          <span
            style={{
              fontSize: "8px",
              padding: "2px 6px",
              background: "rgba(99, 102, 241, 0.3)",
              color: "#c7d2fe",
              borderRadius: "4px",
              textTransform: "uppercase",
              fontWeight: 700,
              border: "1px solid rgba(99, 102, 241, 0.4)",
            }}
          >
            Stripe Shield
          </span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <span
            style={{
              fontSize: "10px",
              fontWeight: 800,
              letterSpacing: "0.5px",
              opacity: 0.85,
            }}
          >
            {brand}
          </span>
          <Wifi
            size={16}
            style={{ transform: "rotate(90deg)", opacity: 0.8 }}
          />
        </div>
      </div>

      {/* Chip and Shield Badge */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          margin: "8px 0",
        }}
      >
        {/* EMV Chip */}
        <div
          style={{
            width: "36px",
            height: "26px",
            background: "linear-gradient(135deg, #e4d5be 0%, #c4ab89 100%)",
            borderRadius: "5px",
            border: "1px solid #9c8466",
            boxShadow: "inset 0 1px 2px rgba(255,255,255,0.5)",
          }}
        />

        {/* Lock status badge */}
        <button
          type="button"
          disabled={disabled}
          onClick={() => onToggleLock(card.id)}
          style={{
            cursor: disabled ? "not-allowed" : "pointer",
            border: "none",
            display: "inline-flex",
            alignItems: "center",
            gap: "5px",
            padding: "4px 10px",
            borderRadius: "20px",
            fontSize: "9px",
            fontWeight: 700,
            letterSpacing: "0.5px",
            color: "#ffffff",
            background: isLocked ? "#dc2626" : "#16a34a",
            boxShadow: isLocked
              ? "0 0 14px rgba(220, 38, 38, 0.6)"
              : "0 0 14px rgba(22, 163, 74, 0.4)",
            transition: "transform 0.15s ease",
          }}
        >
          {isLocked ? (
            <>
              <Lock size={11} />
              $0 SHIELD LOCKED
            </>
          ) : (
            <>
              <Check size={11} />
              ACTIVE (${card.spendingLimit.toFixed(2)})
            </>
          )}
        </button>
      </div>

      {/* Masked Card Number */}
      <div
        style={{
          fontFamily:
            "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
          fontSize: "17px",
          letterSpacing: "2px",
          fontWeight: 600,
          textShadow: "0 1px 2px rgba(0,0,0,0.5)",
        }}
      >
        {card.cardNumberMasked || `•••• •••• •••• ${card.last4 || "4242"}`}
      </div>

      {/* Footer Info */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-end",
          fontSize: "10px",
        }}
      >
        <div>
          <div
            style={{
              fontSize: "8px",
              opacity: 0.7,
              textTransform: "uppercase",
              letterSpacing: "0.5px",
            }}
          >
            Assigned Merchant / Demo
          </div>
          <div
            style={{
              fontWeight: 600,
              fontSize: "11px",
              marginTop: "1px",
              maxWidth: "180px",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {card.merchant || card.label || "Subscription Service"}
          </div>
        </div>

        <div style={{ textAlign: "right" }}>
          <div
            style={{
              fontSize: "8px",
              opacity: 0.7,
              textTransform: "uppercase",
              letterSpacing: "0.5px",
            }}
          >
            Stripe PM
          </div>
          <div
            style={{
              fontFamily: "ui-monospace, monospace",
              fontWeight: 600,
              fontSize: "9px",
              opacity: 0.85,
            }}
          >
            {card.paymentMethodId || `pm_${card.last4 || "4242"}`}
          </div>
        </div>
      </div>
    </div>
  )
}
