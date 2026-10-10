import { Bell, ChevronRight, Menu } from "lucide-react"
import type { DashboardSection, User } from "../../types"
import { Button } from "../ui/Button"

export interface DashboardHeaderProps {
  name: string
  user?: User | null
  section: DashboardSection
  onToggleSidebar: () => void
  onOpenRenewals: () => void
}

export function DashboardHeader({
  name,
  user,
  section,
  onToggleSidebar,
  onOpenRenewals,
}: DashboardHeaderProps) {
  return (
    <header className="dashboard-header">
      <div>
        <Button
          className="mobile-menu-button"
          variant="ghost"
          aria-label="Open navigation"
          onClick={onToggleSidebar}
        >
          <Menu size={20} />
        </Button>
        <span>SubSlayer Hub</span>
        <ChevronRight size={14} />
        <strong>{section}</strong>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
        <Button
          variant="ghost"
          aria-label="Upcoming renewals"
          onClick={onOpenRenewals}
        >
          <Bell size={19} />
        </Button>
        {user?.avatar ? (
          <img
            src={user.avatar}
            alt={name}
            referrerPolicy="no-referrer"
            title={`${name} (${user.email || ""})`}
            style={{
              width: "32px",
              height: "32px",
              borderRadius: "50%",
              objectFit: "cover",
              border: "1.5px solid #d4c4d9",
              display: "block",
            }}
          />
        ) : (
          <div
            title={name}
            style={{
              width: "32px",
              height: "32px",
              borderRadius: "50%",
              background: "linear-gradient(135deg, #704b73 0%, #4a2d4e 100%)",
              color: "#ffffff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "13px",
              fontWeight: 750,
            }}
          >
            {name ? name.charAt(0).toUpperCase() : "U"}
          </div>
        )}
      </div>
    </header>
  )
}
