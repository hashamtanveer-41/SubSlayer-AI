import { Bell, ChevronRight, Menu } from "lucide-react"
import type { DashboardSection } from "../../types"
import { Button } from "../ui/Button"

export interface DashboardHeaderProps {
  name: string
  section: DashboardSection
  onToggleSidebar: () => void
  onOpenRenewals: () => void
}

export function DashboardHeader({
  name,
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
      <div>
        <Button
          variant="ghost"
          aria-label="Upcoming renewals"
          onClick={onOpenRenewals}
        >
          <Bell size={19} />
        </Button>
      </div>
    </header>
  )
}
