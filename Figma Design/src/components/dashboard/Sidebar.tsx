import {
  CircleHelp,
  CirclePause,
  CreditCard,
  FlaskConical,
  LayoutDashboard,
  LogOut,
  Shield,
  SlidersHorizontal,
} from "lucide-react"
import type { DashboardSection, Page, User } from "../../types"
import { Brand } from "../common/Brand"
import { Button } from "../ui/Button"

export interface SidebarProps {
  name: string
  user?: User | null
  section: DashboardSection
  setSection: (s: DashboardSection) => void
  sidebarOpen: boolean
  setSidebarOpen: (open: boolean) => void
  activeCount: number
  onOpenSettings: () => void
  onOpenHelp: () => void
  logout: () => void
  onNavigate?: (p: Page) => void
}

export function Sidebar({
  name,
  user,
  section,
  setSection,
  sidebarOpen,
  setSidebarOpen,
  activeCount,
  onOpenSettings,
  onOpenHelp,
  logout,
  onNavigate,
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
        />
        <span className="nav-label" style={{ marginTop: "24px" }}>CONTROL CENTER</span>
        <nav className="dashboard-nav">
          {navItems.map(({ label, icon: Icon }) => (
            <Button
              key={label}
              variant="ghost"
              className={section === label ? "selected" : ""}
              title={label}
              onClick={() => {
                setSection(label)
                setSidebarOpen(false)
              }}
            >
              <Icon size={18} className="nav-icon" />
              <span className="nav-label-text">{label}</span>
              {label === "Subscriptions" && (
                <span className="nav-count">{activeCount}</span>
              )}
            </Button>
          ))}
          <Button
            variant="ghost"
            title="Provider Sandboxes (Live Demo Sites)"
            onClick={() => {
              setSidebarOpen(false)
              onNavigate?.("sandbox")
            }}
            style={{
              marginTop: "4px",
              border: "1px dashed #d8cbdc",
              background: "rgba(112, 75, 115, 0.04)",
            }}
          >
            <FlaskConical size={18} className="nav-icon" style={{ color: "var(--accent)" }} />
            <span className="nav-label-text">Provider Sandboxes</span>
            <span
              style={{
                marginLeft: "auto",
                fontSize: "9px",
                fontWeight: 800,
                background: "#10b981",
                color: "#ffffff",
                padding: "2px 5px",
                borderRadius: "4px",
                lineHeight: 1,
              }}
            >
              LIVE
            </span>
          </Button>
        </nav>
        <div className="sidebar-bottom">
          <Button variant="ghost" title="Preferences" onClick={onOpenSettings}>
            <SlidersHorizontal size={18} className="nav-icon" />
            <span className="nav-label-text">Preferences</span>
          </Button>
          <Button variant="ghost" title="How Agent Works" onClick={onOpenHelp}>
            <CircleHelp size={18} className="nav-icon" />
            <span className="nav-label-text">How Agent Works</span>
          </Button>
          <div className="sidebar-profile">
            {user?.avatar ? (
              <img
                src={user.avatar}
                alt={name}
                referrerPolicy="no-referrer"
                className="profile-avatar"
                style={{ objectFit: "cover", width: "36px", height: "36px", borderRadius: "50%" }}
              />
            ) : (
              <span className="profile-avatar" title={name}>
                {name.charAt(0).toUpperCase()}
              </span>
            )}
            <div className="sidebar-profile-info">
              <strong>{name}</strong>
              <span style={{ fontSize: "11px", opacity: 0.85, overflow: "hidden", textOverflow: "ellipsis", maxWidth: "120px" }}>
                {user?.email || "Demo Account"}
              </span>
            </div>
            <Button variant="ghost" aria-label="Log out" title="Log out" onClick={logout} className="logout-button">
              <LogOut size={17} />
            </Button>
          </div>
        </div>
      </aside>
    </>
  )
}
