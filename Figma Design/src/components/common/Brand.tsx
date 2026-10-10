import { Button } from "../ui/Button"

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
      style={{ display: "inline-flex", alignItems: "center", textDecoration: "none" }}
    >
      <span className="brand-symbol" style={{ color: light ? "white" : "var(--accent)" }}>
        ⚡
      </span>
      <span>SubSlayer</span>
      <span className="brand-period" style={{ color: light ? "#f0ebf2" : "var(--accent)" }}>
        .ai
      </span>
      {showBadge && (
        <span
          style={{
            fontSize: "9px",
            letterSpacing: "0.5px",
            fontWeight: 600,
            textTransform: "uppercase",
            background: light ? "rgba(255,255,255,0.2)" : "var(--pale)",
            color: light ? "white" : "var(--accent)",
            padding: "2px 6px",
            borderRadius: "4px",
            marginLeft: "6px",
          }}
        >
          Agent
        </span>
      )}
    </Button>
  )
}
