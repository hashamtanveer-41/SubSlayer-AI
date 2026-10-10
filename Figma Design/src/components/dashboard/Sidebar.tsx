import {
  ChevronDown,
  CircleHelp,
  CirclePause,
  CreditCard,
  LayoutDashboard,
  LogOut,
  Shield,
  Sparkles,
} from "lucide-react"
import type { DashboardSection } from "../../types"
import { Brand } from "../common/Brand"
import { Button } from "../ui/Button"

export interface SidebarProps {
  name: string
  section: DashboardSection
  setSection: (s: DashboardSection) => void
  sidebarOpen: boolean
  setSidebarOpen: (open: boolean) => void
  activeCount: number
  backendReady: boolean
  onOpenHelp: () => void
  logout: () => void
}

export function Sidebar({
  name,
  section,
  setSection,
  sidebarOpen,
  setSidebarOpen,
  activeCount,
  backendReady,
  onOpenHelp,
  logout,
}: SidebarProps) {
  const navItems: { label: DashboardSection; icon: typeof LayoutDashboard }[] = [
    { label: "Overview", icon: LayoutDashboard },
    { label: "Subscriptions", icon: CreditCard },
    { label: "Cancellation history", icon: CirclePause },
    { label: "Virtual cards shield", icon: Shield },
  ]

  return (
    <>
      {sidebarOpen && (
        <div
          className="sidebar-backdrop"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      <aside className={`sidebar ${sidebarOpen ? "sidebar-open" : ""}`}>
        <Brand
          onClick={() => {
            setSection("Overview")
            setSidebarOpen(false)
          }}
          showBadge
        />
        <div className="workspace">
          <span className="workspace-avatar">
            {name.charAt(0).toUpperCase()}
          </span>
          <div>
            <strong>Personal Workspace</strong>
            <span>Active Financial Defense</span>
          </div>
          <ChevronDown size={15} />
        </div>
        <span className="nav-label">CONTROL CENTER</span>
        <nav className="dashboard-nav">
          {navItems.map(({ label, icon: Icon }) => (
            <Button
              key={label}
              variant="ghost"
              className={section === label ? "selected" : ""}
              onClick={() => {
                setSection(label)
                setSidebarOpen(false)
              }}
            >
              <Icon size={18} />
              {label}
              {label === "Subscriptions" && (
                <span className="nav-count">{activeCount}</span>
              )}
            </Button>
          ))}
        </nav>
        <div className="sidebar-note">
          <span className="agent-symbol">
            <Sparkles size={20} />
          </span>
          <strong>{backendReady ? "Demo Gateway Connected" : "Demo Gateway Offline"}</strong>
          <p>Request cancellation through Netflix, Spotify, Canva, or Adobe demo services.</p>
          <Button
            variant="secondary"
            onClick={() => {
              setSection("Subscriptions")
              setSidebarOpen(false)
            }}
          >
            Review Subscriptions
          </Button>
        </div>
        <div className="sidebar-bottom">
          <Button variant="ghost" onClick={onOpenHelp}>
            <CircleHelp size={18} />
            How Agent Works
          </Button>
          <div className="sidebar-profile">
            <span className="profile-avatar">
              {name.charAt(0).toUpperCase()}
            </span>
            <div>
              <strong>{name}</strong>
              <span>Shared demo workspace</span>
            </div>
            <Button variant="ghost" aria-label="Back to home" onClick={logout}>
              <LogOut size={17} />
            </Button>
          </div>
        </div>
      </aside>
    </>
  )
}
