import { useState, type FormEvent } from "react"
import {
  Calendar,
  Check,
  Eye,
  EyeOff,
  KeyRound,
  Lock,
  LogOut,
  Mail,
  Shield,
  User as UserIcon,
} from "lucide-react"
import type { User } from "../../types"
import { updateProfileApi, changePasswordApi } from "../../services/api"
import { Dialog } from "../ui/Dialog"
import { Button } from "../ui/Button"
import { Input } from "../ui/Input"
import { toast } from "../ui"

export interface ProfileDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  user: User
  onUserUpdated: (user: User) => void
  onLogout: () => void
}

export function ProfileDialog({
  open,
  onOpenChange,
  user,
  onUserUpdated,
  onLogout,
}: ProfileDialogProps) {
  const [name, setName] = useState(user.name)
  const [savingName, setSavingName] = useState(false)

  // Password state
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showCurrent, setShowCurrent] = useState(false)
  const [showNew, setShowNew] = useState(false)
  const [savingPassword, setSavingPassword] = useState(false)

  const isGoogle = user.provider === "google"

  async function handleUpdateName(e: FormEvent) {
    e.preventDefault()
    if (!name.trim()) {
      toast.warning("Name cannot be empty")
      return
    }
    setSavingName(true)
    try {
      const updated = await updateProfileApi(name.trim())
      onUserUpdated(updated)
      toast.success("Profile updated", {
        description: `Your display name has been updated to "${updated.name}".`,
      })
    } catch (err: any) {
      toast.error("Could not update name", {
        description: err?.message || "Please try again.",
      })
    } finally {
      setSavingName(false)
    }
  }

  async function handleChangePassword(e: FormEvent) {
    e.preventDefault()
    if (newPassword.length < 6) {
      toast.warning("Password too short", {
        description: "New password must be at least 6 characters.",
      })
      return
    }
    if (newPassword !== confirmPassword) {
      toast.warning("Passwords do not match", {
        description: "New password and confirmation must match.",
      })
      return
    }
    setSavingPassword(true)
    try {
      await changePasswordApi(newPassword, currentPassword || undefined)
      toast.success("Password updated!", {
        description: "Your account password has been changed securely.",
      })
      setCurrentPassword("")
      setNewPassword("")
      setConfirmPassword("")
    } catch (err: any) {
      toast.error("Password change failed", {
        description: err?.message || "Please check your current password.",
      })
    } finally {
      setSavingPassword(false)
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
      title="Profile & Settings"
      description="Manage your identity, security credentials, and active workspace preferences."
    >
      <div style={{ display: "flex", flexDirection: "column", gap: "22px", marginTop: "14px" }}>
        {/* User Card Header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "16px",
            padding: "16px",
            background: "#f7f2f8",
            borderRadius: "12px",
            border: "1px solid #ebdfee",
          }}
        >
          <div
            style={{
              width: "52px",
              height: "52px",
              borderRadius: "50%",
              background: "linear-gradient(135deg, #704b73 0%, #4a2d4e 100%)",
              color: "#ffffff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "22px",
              fontWeight: 800,
              boxShadow: "0 4px 12px rgba(74, 45, 78, 0.2)",
              flexShrink: 0,
            }}
          >
            {user.name.charAt(0).toUpperCase()}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
              <strong style={{ fontSize: "16px", color: "var(--color-ink)" }}>
                {user.name}
              </strong>
              {isGoogle ? (
                <span
                  style={{
                    fontSize: "12px",
                    fontWeight: 750,
                    padding: "3px 8px",
                    borderRadius: "6px",
                    background: "#e8f0fe",
                    color: "#1a73e8",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "4px",
                    border: "1px solid #c2d7fa",
                  }}
                >
                  <svg width="12" height="12" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                    />
                  </svg>
                  Google OAuth
                </span>
              ) : (
                <span
                  style={{
                    fontSize: "12px",
                    fontWeight: 750,
                    padding: "3px 8px",
                    borderRadius: "6px",
                    background: "#f3ebf6",
                    color: "#411d4b",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "4px",
                    border: "1px solid #d8bddf",
                  }}
                >
                  <KeyRound size={12} />
                  Password
                </span>
              )}
            </div>
            <div
              style={{
                fontSize: "14px",
                color: "#19141c",
                fontWeight: 600,
                marginTop: "3px",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {user.email}
            </div>
            {user.createdAt && (
              <div
                style={{
                  fontSize: "13px",
                  color: "#2d1f33",
                  fontWeight: 550,
                  marginTop: "4px",
                  display: "flex",
                  alignItems: "center",
                  gap: "4px",
                }}
              >
                <Calendar size={13} />
                <span>Joined {new Date(user.createdAt).toLocaleDateString()}</span>
              </div>
            )}
          </div>
        </div>

        {/* Section 1: Edit Display Name */}
        <form onSubmit={handleUpdateName} style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          <strong style={{ fontSize: "15px", color: "var(--color-ink)", fontWeight: 800 }}>
            Display Name
          </strong>
          <div style={{ display: "flex", gap: "8px" }}>
            <div style={{ position: "relative", flex: 1 }}>
              <UserIcon
                size={16}
                style={{
                  position: "absolute",
                  left: "12px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: "#7e7082",
                }}
              />
              <Input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your Full Name"
                style={{ paddingLeft: "36px" }}
                required
              />
            </div>
            <Button
              type="submit"
              loading={savingName}
              loadingText="Saving..."
              disabled={savingName || name.trim() === user.name}
              style={{ padding: "0 18px", fontSize: "13.5px", fontWeight: 700 }}
            >
              Save
            </Button>
          </div>
        </form>

        <div style={{ height: "1px", background: "#ebdfee" }} />

        {/* Section 2: Security & Password */}
        <div>
          <strong style={{ fontSize: "15px", color: "var(--color-ink)", fontWeight: 800, display: "block", marginBottom: "10px" }}>
            Security & Authentication
          </strong>

          {isGoogle ? (
            <div
              style={{
                display: "flex",
                gap: "10px",
                padding: "12px 14px",
                background: "#f0fdf4",
                border: "1px solid #bbf7d0",
                borderRadius: "9px",
                fontSize: "13.5px",
                color: "#14532d",
                lineHeight: 1.5,
              }}
            >
              <Shield size={16} style={{ flexShrink: 0, marginTop: "2px" }} />
              <div>
                <strong style={{ fontSize: "14px" }}>Google Managed Account</strong>
                <p style={{ margin: "2px 0 0", color: "#14532d" }}>
                  Your account is secured via Google OAuth (<strong>{user.email}</strong>).
                  Two-factor authentication and passwords are automatically managed by your Google security center.
                </p>
              </div>
            </div>
          ) : (
            <form onSubmit={handleChangePassword} style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              <div>
                <label style={{ fontSize: "13.5px", fontWeight: 750, color: "#19141c", display: "block", marginBottom: "4px" }}>
                  Current Password
                </label>
                <div style={{ position: "relative" }}>
                  <Lock size={15} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "#7e7082" }} />
                  <Input
                    type={showCurrent ? "text" : "password"}
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="Enter current password"
                    style={{ paddingLeft: "36px", paddingRight: "36px" }}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrent(!showCurrent)}
                    style={{ position: "absolute", right: "10px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", color: "#412f47", cursor: "pointer", padding: "4px" }}
                  >
                    {showCurrent ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>

              <div>
                <label style={{ fontSize: "13.5px", fontWeight: 750, color: "#19141c", display: "block", marginBottom: "4px" }}>
                  New Password (at least 6 characters)
                </label>
                <div style={{ position: "relative" }}>
                  <Lock size={15} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "#7e7082" }} />
                  <Input
                    type={showNew ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter new password"
                    style={{ paddingLeft: "36px", paddingRight: "36px" }}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowNew(!showNew)}
                    style={{ position: "absolute", right: "10px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", color: "#412f47", cursor: "pointer", padding: "4px" }}
                  >
                    {showNew ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>

              <div>
                <label style={{ fontSize: "13.5px", fontWeight: 750, color: "#19141c", display: "block", marginBottom: "4px" }}>
                  Confirm New Password
                </label>
                <Input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repeat new password"
                  required
                />
              </div>

              <Button
                type="submit"
                variant="secondary"
                loading={savingPassword}
                loadingText="Updating..."
                disabled={savingPassword || !newPassword}
                style={{ marginTop: "4px", padding: "10px", fontWeight: 750, fontSize: "13.5px" }}
              >
                Update Password
              </Button>
            </form>
          )}
        </div>

        <div style={{ height: "1px", background: "#ebdfee" }} />

        {/* Section 3: Sign Out Button */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontSize: "13.5px", color: "#251829", fontWeight: 600 }}>
            End current session on this device
          </span>
          <Button
            type="button"
            variant="ghost"
            onClick={() => {
              onOpenChange(false)
              onLogout()
            }}
            style={{ color: "#dc2626", fontWeight: 750, fontSize: "14px", display: "inline-flex", alignItems: "center", gap: "6px" }}
          >
            <LogOut size={16} />
            Sign Out
          </Button>
        </div>
      </div>
    </Dialog>
  )
}
