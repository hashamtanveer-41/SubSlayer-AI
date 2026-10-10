import { useState, useRef, useEffect } from "react"
import { Bell, ChevronDown, ChevronRight, Menu } from "lucide-react"
import type { DashboardSection, Page, User } from "../../types"
import { Button } from "../ui/Button"
import { SpotifyLogo, AdobeLogo } from "../common/PlatformLogos"

export interface DashboardHeaderProps {
  name: string
  user?: User | null
  section: DashboardSection
  onToggleSidebar: () => void
  onOpenRenewals: () => void
  onNavigate?: (p: Page) => void
}

export function DashboardHeader({
  name,
  user,
  section,
  onToggleSidebar,
  onOpenRenewals,
  onNavigate,
}: DashboardHeaderProps) {
  const [sandboxMenuOpen, setSandboxMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setSandboxMenuOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

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
        {/* Live Sandboxes Dropdown */}
        <div ref={menuRef} style={{ position: "relative" }}>
          <Button
            variant="secondary"
            onClick={() => setSandboxMenuOpen(!sandboxMenuOpen)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "7px",
              fontSize: "12.5px",
              fontWeight: 650,
              padding: "6px 12px",
              borderRadius: "20px",
              background: "#f7f1f8",
              borderColor: "#e3d3e6",
              color: "#5b3c5e",
            }}
          >
            <span
              style={{
                display: "inline-block",
                width: "7px",
                height: "7px",
                borderRadius: "50%",
                background: "#10b981",
              }}
            />
            Live Sandboxes
            <ChevronDown size={13} />
          </Button>

          {sandboxMenuOpen && (
            <div
              style={{
                position: "absolute",
                top: "calc(100% + 8px)",
                right: 0,
                width: "260px",
                background: "#ffffff",
                border: "1px solid #e8e4e6",
                borderRadius: "12px",
                boxShadow: "0 10px 30px rgba(0,0,0,0.12)",
                padding: "8px",
                zIndex: 100,
                display: "grid",
                gap: "4px",
              }}
            >
              <div
                style={{
                  padding: "6px 10px",
                  fontSize: "11px",
                  fontWeight: 750,
                  color: "#817a83",
                  letterSpacing: "0.5px",
                }}
              >
                INTERACTIVE TEST ENVIRONMENTS
              </div>
              <button
                onClick={() => {
                  setSandboxMenuOpen(false)
                  onNavigate?.("demo-spotify")
                }}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  padding: "8px 10px",
                  borderRadius: "8px",
                  border: "none",
                  background: "transparent",
                  textAlign: "left",
                  cursor: "pointer",
                  width: "100%",
                }}
                onMouseOver={(e) => (e.currentTarget.style.background = "#f9f6fa")}
                onMouseOut={(e) => (e.currentTarget.style.background = "transparent")}
              >
                <SpotifyLogo size={20} />
                <div>
                  <strong style={{ fontSize: "13px", display: "block", color: "#19141c" }}>
                    Spotify Portal
                  </strong>
                  <span style={{ fontSize: "11.5px", color: "#817a83" }}>
                    Test Card Shield Interception
                  </span>
                </div>
              </button>

              <button
                onClick={() => {
                  setSandboxMenuOpen(false)
                  onNavigate?.("demo-adobe")
                }}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  padding: "8px 10px",
                  borderRadius: "8px",
                  border: "none",
                  background: "transparent",
                  textAlign: "left",
                  cursor: "pointer",
                  width: "100%",
                }}
                onMouseOver={(e) => (e.currentTarget.style.background = "#f9f6fa")}
                onMouseOut={(e) => (e.currentTarget.style.background = "transparent")}
              >
                <AdobeLogo size={20} />
                <div>
                  <strong style={{ fontSize: "13px", display: "block", color: "#19141c" }}>
                    Adobe CC Portal
                  </strong>
                  <span style={{ fontSize: "11.5px", color: "#817a83" }}>
                    4-Step Dark Pattern Maze
                  </span>
                </div>
              </button>

              <div style={{ height: "1px", background: "#f0ebf2", margin: "4px 0" }} />

              <button
                onClick={() => {
                  setSandboxMenuOpen(false)
                  onNavigate?.("sandbox")
                }}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  padding: "8px 10px",
                  borderRadius: "8px",
                  border: "none",
                  background: "#f5eef7",
                  textAlign: "left",
                  cursor: "pointer",
                  width: "100%",
                }}
              >
                <span style={{ fontSize: "15px" }}>◫</span>
                <div>
                  <strong style={{ fontSize: "13px", display: "block", color: "#5b3c5e" }}>
                    Side-by-Side Split View
                  </strong>
                  <span style={{ fontSize: "11.5px", color: "#7a5c7d" }}>
                    SubSlayer + Provider Live
                  </span>
                </div>
              </button>
            </div>
          )}
        </div>

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
