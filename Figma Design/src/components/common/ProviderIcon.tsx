import { Wallet } from "lucide-react"
import type { Subscription } from "../../types"

export interface ProviderIconProps {
  sub: Pick<Subscription, "mark" | "tone">
  small?: boolean
  className?: string
}

export function ProviderIcon({ sub, small = false, className = "" }: ProviderIconProps) {
  return (
    <span
      className={`provider-icon ${sub.tone || "custom"} ${small ? "provider-small" : ""} ${className}`}
      aria-hidden="true"
    >
      {sub.tone === "icloud" ? (
        <Wallet size={small ? 14 : 19} />
      ) : (
        sub.mark || sub.tone?.charAt(0).toUpperCase() || "★"
      )}
    </span>
  )
}
