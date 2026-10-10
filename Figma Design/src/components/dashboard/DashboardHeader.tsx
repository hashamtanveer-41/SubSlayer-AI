import { Bell, ChevronRight, Menu } from "lucide-react"
import type { DashboardSection } from "../../types"
import { Button } from "../ui/Button"

export interface DashboardHeaderProps {
  name: string
  section: DashboardSection
  onToggleSidebar: () => void
  onOpenRenewals: () => void
  backendReady: boolean
}

export function DashboardHeader({
  name,
  section,
  onToggleSidebar,
  onOpenRenewals,
  backendReady,
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
      <div>
        <span className="demo-pill">
          <span style={{ backgroundColor: backendReady ? "#16a34a" : "#dc2626" }} /> {backendReady ? "Gateway connected" : "Gateway offline"}
        </span>
        <Button
          variant="ghost"
          aria-label="Upcoming renewals"
          onClick={onOpenRenewals}
        >
          <Bell size={19} />
        </Button>
        <span className="profile-avatar">
          {name.charAt(0).toUpperCase()}
        </span>
      </div>
    </header>
  )
}
