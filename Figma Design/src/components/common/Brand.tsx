import { Button } from "../ui/Button"
import { SubSlayerLogo } from "./SubSlayerLogo"

export interface BrandProps {
  light?: boolean
  onClick?: () => void
  showBadge?: boolean
}

export function Brand({ light = false, onClick, showBadge = false }: BrandProps) {
  return (
    <Button
      variant="ghost"
      className={`brand ${light ? "brand-light" : ""}`}
      onClick={onClick}
      aria-label="SubSlayer AI home"
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "10px",
        padding: "4px 8px",
        textDecoration: "none",
        fontFamily: "var(--font-display)",
      }}
    >
      <SubSlayerLogo size={32} glow={!light} />
      <span
        style={{
          display: "inline-flex",
          alignItems: "baseline",
          fontSize: "22px",
          fontWeight: 800,
          letterSpacing: "-0.8px",
          color: light ? "#ffffff" : "var(--color-ink)",
        }}
      >
        <span>SubSlayer</span>
        <span
          style={{
            color: light ? "#f0abfc" : "var(--accent)",
            fontWeight: 800,
            marginLeft: "1px",
          }}
        >
          .ai
        </span>
      </span>

      {showBadge && (
        <span
          style={{
            fontSize: "9px",
            letterSpacing: "0.5px",
            fontWeight: 700,
            textTransform: "uppercase",
            background: light ? "rgba(255,255,255,0.2)" : "rgba(114, 85, 110, 0.12)",
            color: light ? "#ffffff" : "var(--accent)",
            padding: "2px 7px",
            borderRadius: "6px",
            border: light ? "1px solid rgba(255,255,255,0.3)" : "1px solid rgba(114, 85, 110, 0.2)",
          }}
        >
          AGENT
        </span>
      )}
    </Button>
  )
}
