import { useState } from "react"
import { ArrowUpRight, LayoutDashboard, LogOut } from "lucide-react"
import type { Page, User } from "../../types"
import { Brand } from "../common/Brand"
import { Button } from "../ui/Button"

export interface LandingHeaderProps {
  navigate: (p: Page) => void
  currentUser?: User | null
  onLogout?: () => void
}

export function LandingHeader({
  navigate,
  currentUser,
  onLogout,
}: LandingHeaderProps) {
  const [dropdownOpen, setDropdownOpen] = useState(false)

  return (
    <header className="site-header">
      <Brand onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })} />
      <div className="nav-actions">
        {currentUser ? (
          <div style={{ display: "flex", alignItems: "center", gap: "10px", position: "relative" }}>
            <Button
              variant="ghost"
              onClick={() => navigate("app")}
              style={{ fontWeight: 700, fontSize: "14px", color: "var(--color-ink)" }}
            >
              Dashboard
            </Button>
            <div style={{ position: "relative" }}>
              <button
                type="button"
                onClick={() => setDropdownOpen(!dropdownOpen)}
                title={`Signed in as ${currentUser.name} (${currentUser.email})`}
                aria-label="User account menu"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  padding: "4px 10px 4px 4px",
                  background: "rgba(255, 255, 255, 0.85)",
                  border: "1.5px solid #dfd3e3",
                  borderRadius: "24px",
                  cursor: "pointer",
                  boxShadow: "0 2px 6px rgba(0,0,0,0.06)",
                  transition: "all 0.15s ease",
                }}
              >
                {currentUser.avatar ? (
                  <img
                    src={currentUser.avatar}
                    alt={currentUser.name}
                    referrerPolicy="no-referrer"
                    style={{
                      width: "30px",
                      height: "30px",
                      borderRadius: "50%",
                      objectFit: "cover",
                      border: "1.5px solid #c9b4d0",
                      display: "block",
                    }}
                  />
                ) : (
                  <div
                    style={{
                      width: "30px",
                      height: "30px",
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
                    {currentUser.name ? currentUser.name.charAt(0).toUpperCase() : "U"}
                  </div>
                )}
                <span
                  style={{
                    fontSize: "13.5px",
                    fontWeight: 650,
                    color: "var(--color-ink)",
                    maxWidth: "120px",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {currentUser.name}
                </span>
              </button>

              {dropdownOpen && (
                <>
                  <div
                    style={{ position: "fixed", inset: 0, zIndex: 998 }}
                    onClick={() => setDropdownOpen(false)}
                  />
                  <div
                    style={{
                      position: "absolute",
                      right: 0,
                      top: "calc(100% + 8px)",
                      background: "#ffffff",
                      border: "1px solid #ebddee",
                      borderRadius: "12px",
                      boxShadow: "0 10px 28px rgba(35, 20, 40, 0.14)",
                      padding: "8px",
                      minWidth: "210px",
                      zIndex: 999,
                      display: "flex",
                      flexDirection: "column",
                      gap: "4px",
                    }}
                  >
                    <div style={{ padding: "8px 10px 10px", borderBottom: "1px solid #f2e9f3" }}>
                      <p style={{ margin: 0, fontSize: "13.5px", fontWeight: 750, color: "var(--color-ink)" }}>
                        {currentUser.name}
                      </p>
                      <p style={{ margin: "2px 0 0", fontSize: "12px", color: "#7a6e80" }}>
                        {currentUser.email}
                      </p>
                      {currentUser.provider === "google" && (
                        <span
                          style={{
                            display: "inline-block",
                            marginTop: "6px",
                            fontSize: "10.5px",
                            fontWeight: 700,
                            padding: "2px 8px",
                            borderRadius: "12px",
                            background: "#e8f0fe",
                            color: "#1a73e8",
                          }}
                        >
                          Google Account
                        </span>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setDropdownOpen(false)
                        navigate("app")
                      }}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        padding: "8px 10px",
                        background: "transparent",
                        border: "none",
                        borderRadius: "8px",
                        fontSize: "13px",
                        fontWeight: 600,
                        color: "var(--color-ink)",
                        cursor: "pointer",
                        textAlign: "left",
                        transition: "background 0.12s",
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = "#f7f1f9")}
                      onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                    >
                      <LayoutDashboard size={15} /> Open Dashboard
                    </button>
                    {onLogout && (
                      <button
                        type="button"
                        onClick={() => {
                          setDropdownOpen(false)
                          onLogout()
                        }}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "8px",
                          padding: "8px 10px",
                          background: "transparent",
                          border: "none",
                          borderRadius: "8px",
                          fontSize: "13px",
                          fontWeight: 600,
                          color: "#dc2626",
                          cursor: "pointer",
                          textAlign: "left",
                          transition: "background 0.12s",
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.background = "#fee2e2")}
                        onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                      >
                        <LogOut size={15} /> Sign Out
                      </button>
                    )}
                  </div>
                </>
              )}
            </div>
            <Button onClick={() => navigate("app")} style={{ marginLeft: "4px" }}>
              Launch App <ArrowUpRight size={16} />
            </Button>
          </div>
        ) : (
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <Button variant="ghost" onClick={() => navigate("login")}>
              Log in
            </Button>
            <Button onClick={() => navigate("signup")}>
              Launch App <ArrowUpRight size={16} />
            </Button>
          </div>
        )}
      </div>
    </header>
  )
}
