import { Check, Lock, ShieldAlert, ShieldCheck, Wifi } from "lucide-react"
import type { VirtualCard } from "../../types"

export interface VirtualCardVisualProps {
  card: VirtualCard
  onToggleLock: (cardId: string) => void
}

export function VirtualCardVisual({ card, onToggleLock }: VirtualCardVisualProps) {
  const isLocked = card.balanceLocked

  const cardBackground = isLocked
    ? "linear-gradient(135deg, #2d2432 0%, #1e1722 100%)"
    : "linear-gradient(135deg, #72556e 0%, #4a3449 100%)"

  return (
    <div
      style={{
        width: "100%",
        maxWidth: "340px",
        height: "205px",
        borderRadius: "14px",
        background: cardBackground,
        color: "#ffffff",
        padding: "20px 22px",
        boxShadow: isLocked
          ? "0 10px 30px rgba(45, 36, 50, 0.25)"
          : "0 14px 35px rgba(114, 85, 110, 0.35)",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        position: "relative",
        border: isLocked ? "1px solid #4a3a52" : "1px solid rgba(255,255,255,0.2)",
        transition: "all 0.3s ease",
      }}
    >
      {/* Top Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <span style={{ fontWeight: 800, fontSize: "14px", letterSpacing: "-0.5px" }}>
            SubSlayer
          </span>
          <span
            style={{
              fontSize: "8px",
              padding: "2px 6px",
              background: "rgba(255,255,255,0.2)",
              borderRadius: "4px",
              textTransform: "uppercase",
              fontWeight: 600,
            }}
          >
            Shield
          </span>
        </div>
        <Wifi size={18} style={{ transform: "rotate(90deg)", opacity: 0.8 }} />
      </div>

      {/* Chip and Shield Badge */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", margin: "10px 0" }}>
        {/* EMV Chip mockup */}
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

        <div
          onClick={() => onToggleLock(card.id)}
          style={{
            cursor: "pointer",
            display: "inline-flex",
            alignItems: "center",
            gap: "5px",
            padding: "4px 9px",
            borderRadius: "20px",
            fontSize: "9px",
            fontWeight: 700,
            letterSpacing: "0.5px",
            background: isLocked ? "#dc2626" : "#16a34a",
            boxShadow: isLocked
              ? "0 0 12px rgba(220, 38, 38, 0.5)"
              : "0 0 12px rgba(22, 163, 74, 0.4)",
          }}
        >
          {isLocked ? (
            <>
              <Lock size={11} />
              $0 LOCKED SHIELD
            </>
          ) : (
            <>
              <Check size={11} />
              ACTIVE (${card.spendingLimit.toFixed(2)})
            </>
          )}
        </div>
      </div>

      {/* Card Number */}
      <div
        style={{
          fontFamily: "ui-monospace, monospace",
          fontSize: "17px",
          letterSpacing: "2.5px",
          fontWeight: 600,
          textShadow: "0 1px 2px rgba(0,0,0,0.4)",
        }}
      >
        {card.cardNumberMasked}
      </div>

      {/* Footer Info */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", fontSize: "10px" }}>
        <div>
          <div style={{ fontSize: "8px", opacity: 0.7, textTransform: "uppercase", letterSpacing: "0.5px" }}>
            Assigned Merchant
          </div>
          <div style={{ fontWeight: 600, fontSize: "11px", marginTop: "2px" }}>
            {card.merchant}
          </div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontSize: "8px", opacity: 0.7, textTransform: "uppercase", letterSpacing: "0.5px" }}>
            Expires
          </div>
          <div style={{ fontFamily: "ui-monospace, monospace", fontWeight: 600 }}>
            {card.exp}
          </div>
        </div>
      </div>
    </div>
  )
}
