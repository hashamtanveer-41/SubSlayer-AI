import { useState, type FormEvent } from "react"
import { Eye, EyeOff, Lock, Mail, User as UserIcon, AlertCircle } from "lucide-react"
import type { User } from "../../types"
import { loginApi, signupApi } from "../../services/api"
import { toast } from "../ui"
import { Dialog } from "../ui/Dialog"
import { Button } from "../ui/Button"
import { Input } from "../ui/Input"
import { SubSlayerLogo } from "../common/SubSlayerLogo"

export interface AuthModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  initialMode?: "login" | "signup"
  onSuccess: (user: User) => void
}

export function AuthModal({
  open,
  onOpenChange,
  initialMode = "login",
  onSuccess,
}: AuthModalProps) {
  const [mode, setMode] = useState<"login" | "signup">(initialMode)
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function resetForm() {
    setError(null)
    setName("")
    setEmail("")
    setPassword("")
  }

  function switchMode(newMode: "login" | "signup") {
    setMode(newMode)
    setError(null)
    toast.info(newMode === "signup" ? "Switched to Registration" : "Switched to Sign In")
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      if (mode === "login") {
        const user = await loginApi(email.trim(), password)
        resetForm()
        toast.success(`Welcome back, ${user.name}!`, {
          description: "Signed in to SubSlayer Hub successfully.",
        })
        onSuccess(user)
        onOpenChange(false)
      } else {
        if (!name.trim()) {
          toast.warning("Name required", { description: "Please enter your name." })
          throw new Error("Please enter your name")
        }
        if (password.length < 6) {
          toast.warning("Password too short", { description: "Password must be at least 6 characters." })
          throw new Error("Password must be at least 6 characters")
        }
        const user = await signupApi(email.trim(), password, name.trim())
        resetForm()
        toast.success("Account created successfully!", {
          description: `Welcome to SubSlayer AI, ${user.name}.`,
        })
        onSuccess(user)
        onOpenChange(false)
      }
    } catch (err: any) {
      const msg = err?.message || "Authentication failed. Please check your details."
      setError(msg)
      toast.error(mode === "login" ? "Sign in failed" : "Sign up failed", {
        description: msg,
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen) {
          resetForm()
          toast.info("Authentication modal closed")
        }
        onOpenChange(nextOpen)
      }}
      title={mode === "login" ? "Sign in to SubSlayer" : "Create your account"}
      description={
        mode === "login"
          ? "Access your active financial defense hub and subscription cancellation agent."
          : "Start monitoring subscriptions and deploying autonomous cancellation agents."
      }
    >
      <div style={{ marginTop: "12px" }}>
        {/* Mode Switcher Tabs */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            background: "#f3ebf6",
            padding: "4px",
            borderRadius: "10px",
            marginBottom: "20px",
            gap: "4px",
          }}
        >
          <button
            type="button"
            onClick={() => switchMode("login")}
            style={{
              padding: "8px 12px",
              borderRadius: "8px",
              border: "none",
              fontSize: "13px",
              fontWeight: mode === "login" ? 700 : 500,
              background: mode === "login" ? "#ffffff" : "transparent",
              color: mode === "login" ? "var(--color-ink)" : "#7a6e80",
              boxShadow: mode === "login" ? "0 2px 6px rgba(0,0,0,0.08)" : "none",
              cursor: "pointer",
              transition: "all 0.15s ease",
            }}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => switchMode("signup")}
            style={{
              padding: "8px 12px",
              borderRadius: "8px",
              border: "none",
              fontSize: "13px",
              fontWeight: mode === "signup" ? 700 : 500,
              background: mode === "signup" ? "#ffffff" : "transparent",
              color: mode === "signup" ? "var(--color-ink)" : "#7a6e80",
              boxShadow: mode === "signup" ? "0 2px 6px rgba(0,0,0,0.08)" : "none",
              cursor: "pointer",
              transition: "all 0.15s ease",
            }}
          >
            Create Account
          </button>
        </div>


        {/* Error Notice */}
        {error && (
          <div
            style={{
              display: "flex",
              alignItems: "flex-start",
              gap: "10px",
              padding: "10px 12px",
              background: "#fee2e2",
              border: "1px solid #fca5a5",
              borderRadius: "8px",
              color: "#991b1b",
              fontSize: "12px",
              marginBottom: "16px",
            }}
          >
            <AlertCircle size={16} style={{ flexShrink: 0, marginTop: "2px" }} />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          {mode === "signup" && (
            <div>
              <label
                style={{
                  display: "block",
                  fontSize: "12px",
                  fontWeight: 600,
                  marginBottom: "5px",
                  color: "var(--color-ink)",
                }}
              >
                Full Name
              </label>
              <div style={{ position: "relative" }}>
                <UserIcon
                  size={16}
                  style={{
                    position: "absolute",
                    left: "12px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    color: "#a49ca6",
                  }}
                />
                <Input
                  type="text"
                  placeholder="e.g. Jane Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required={mode === "signup"}
                  style={{ paddingLeft: "36px" }}
                  autoComplete="name"
                />
              </div>
            </div>
          )}

          <div>
            <label
              style={{
                display: "block",
                fontSize: "12px",
                fontWeight: 600,
                marginBottom: "5px",
                color: "var(--color-ink)",
              }}
            >
              Email Address
            </label>
            <div style={{ position: "relative" }}>
              <Mail
                size={16}
                style={{
                  position: "absolute",
                  left: "12px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: "#a49ca6",
                }}
              />
              <Input
                type="email"
                placeholder="you@domain.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                style={{ paddingLeft: "36px" }}
                autoComplete="email"
              />
            </div>
          </div>

          <div>
            <label
              style={{
                display: "block",
                fontSize: "12px",
                fontWeight: 600,
                marginBottom: "5px",
                color: "var(--color-ink)",
              }}
            >
              Password
            </label>
            <div style={{ position: "relative" }}>
              <Lock
                size={16}
                style={{
                  position: "absolute",
                  left: "12px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: "#a49ca6",
                }}
              />
              <Input
                type={showPassword ? "text" : "password"}
                placeholder={mode === "signup" ? "At least 6 characters" : "Enter your password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                style={{ paddingLeft: "36px", paddingRight: "36px" }}
                autoComplete={mode === "login" ? "current-password" : "new-password"}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: "absolute",
                  right: "10px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  background: "transparent",
                  border: "none",
                  color: "#a49ca6",
                  cursor: "pointer",
                  padding: "4px",
                  display: "flex",
                  alignItems: "center",
                }}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <Button
            type="submit"
            loading={loading}
            loadingText={mode === "login" ? "Signing in..." : "Creating account..."}
            disabled={loading}
            style={{
              marginTop: "8px",
              padding: "12px",
              fontWeight: 700,
              fontSize: "13.5px",
            }}
          >
            {mode === "login" ? "Sign In" : "Create Account"}
          </Button>
        </form>

      </div>
    </Dialog>
  )
}
