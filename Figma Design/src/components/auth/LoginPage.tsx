import { useEffect, useState, type FormEvent } from "react"
import {
  ArrowLeft,
  ArrowUpRight,
  ChevronDown,
  Eye,
  EyeOff,
  Loader2,
  Lock,
  Mail,
  ShieldCheck,
  Sparkles,
  User as UserIcon,
  AlertCircle,
} from "lucide-react"
import type { Page, User } from "../../types"
import {
  loginApi,
  signupApi,
  getGoogleAuthConfigApi,
} from "../../services/api"
import { toast } from "../ui"
import { SubSlayerLogo } from "../common/SubSlayerLogo"

export interface LoginPageProps {
  initialMode?: "login" | "signup"
  navigate: (p: Page) => void
  onSuccess: (user: User) => void
}

export function LoginPage({
  initialMode = "login",
  navigate,
  onSuccess,
}: LoginPageProps) {
  const [mode, setMode] = useState<"login" | "signup">(initialMode)
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [googleConfig, setGoogleConfig] = useState<{
    configured: boolean
    clientId?: string | null
    authUrl?: string | null
  }>({ configured: false })
  const [googleNotice, setGoogleNotice] = useState<string | null>(null)

  useEffect(() => {
    getGoogleAuthConfigApi().then(setGoogleConfig)
  }, [])

  function switchMode(newMode: "login" | "signup") {
    setMode(newMode)
    setError(null)
    setGoogleNotice(null)
    toast.info(newMode === "signup" ? "Switched to Account Registration" : "Switched to Account Sign In")
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      if (mode === "login") {
        const user = await loginApi(email.trim(), password)
        toast.success(`Welcome back, ${user.name}!`, {
          description: "Signed in to SubSlayer Hub successfully.",
        })
        onSuccess(user)
      } else {
        if (!name.trim()) {
          toast.warning("Name required", {
            description: "Please enter your full name to create an account.",
          })
          throw new Error("Please enter your name")
        }
        if (password.length < 6) {
          toast.warning("Password too short", {
            description: "Password must be at least 6 characters long.",
          })
          throw new Error("Password must be at least 6 characters")
        }
        const user = await signupApi(email.trim(), password, name.trim())
        toast.success("Account created successfully!", {
          description: `Welcome to SubSlayer AI, ${user.name}. Your financial defense is active.`,
        })
        onSuccess(user)
      }
    } catch (err: any) {
      const msg = err?.message || "Authentication failed. Please check your credentials."
      setError(msg)
      toast.error(mode === "login" ? "Sign in failed" : "Account creation failed", {
        description: msg,
      })
    } finally {
      setLoading(false)
    }
  }

  async function handleExploreSample() {
    setError(null)
    setLoading(true)
    try {
      const user = await loginApi("demo@subslayer.ai", "password123")
      toast.success("Signed in as Demo User", {
        description: "Loaded demo workspace with pre-configured providers & virtual cards.",
      })
      onSuccess(user)
    } catch (err: any) {
      const msg = err?.message || "Sample exploration failed. Gateway may be starting."
      setError(msg)
      toast.error("Demo login unavailable", {
        description: msg,
      })
    } finally {
      setLoading(false)
    }
  }

  function handleGoogleLogin() {
    if (googleConfig.configured && googleConfig.authUrl) {
      toast.loading("Redirecting to Google...", { duration: 2500 })
      window.location.href = googleConfig.authUrl
    } else {
      const msg = "Google OAuth backend is ready! Provide your GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET to enable Google login."
      setGoogleNotice(msg)
      toast.info("Google OAuth Configuration", {
        description: msg,
      })
    }
  }

  return (
    <div className="login-screen-wrapper">
      {/* LEFT COLUMN: HERO SHOWCASE (Unloop/SubSlayer aesthetic) */}
      <div className="login-showcase-panel">
        <div className="login-showcase-content">
          {/* Brand header */}
          <div
            className="login-showcase-brand"
            onClick={() => navigate("landing")}
            style={{ cursor: "pointer" }}
          >
            <SubSlayerLogo size={34} glow />
            <span className="login-brand-text">
              SubSlayer<span>.ai</span>
            </span>
          </div>

          {/* Hero Copy */}
          <div className="login-hero-copy">
            <h1 className="login-hero-title">
              Less on repeat.
              <br />
              More on purpose.
            </h1>
          </div>

          {/* Floating Overview Mock Card */}
          <div className="login-preview-card">
            <div className="login-card-header">
              <div className="login-card-title">
                <SubSlayerLogo size={18} glow={false} />
                <span>Your overview</span>
              </div>
              <div className="login-card-date">
                June 2026 <ChevronDown size={14} />
              </div>
            </div>

            {/* Stat Row */}
            <div className="login-card-stats">
              <div className="login-stat-col">
                <span className="login-stat-label">MONTHLY SPEND</span>
                <strong className="login-stat-value">
                  $111.46 <span className="login-stat-period">/mo</span>
                </strong>
                <span className="login-stat-caption">A little clarity goes a long way.</span>
              </div>
              <div className="login-stat-col">
                <span className="login-stat-label">POTENTIAL SAVINGS</span>
                <strong className="login-stat-value login-stat-savings">
                  $59.99 <span className="login-stat-period">/mo</span>
                </strong>
                <span className="login-stat-caption">One less thing. More room to live.</span>
              </div>
            </div>

            {/* Subscriptions List */}
            <div className="login-subs-header">
              <span>Your subscriptions</span>
              <span className="login-subs-count">6 active</span>
            </div>

            <div className="login-subs-list">
              {/* Netflix */}
              <div className="login-sub-row">
                <div className="login-sub-icon login-icon-netflix">N</div>
                <div className="login-sub-info">
                  <strong>Netflix</strong>
                  <span>Entertainment</span>
                </div>
                <div className="login-sub-price">$15.49/mo</div>
                <span className="login-active-pill">Active</span>
              </div>

              {/* Spotify */}
              <div className="login-sub-row">
                <div className="login-sub-icon login-icon-spotify">≈</div>
                <div className="login-sub-info">
                  <strong>Spotify</strong>
                  <span>Entertainment</span>
                </div>
                <div className="login-sub-price">$10.99/mo</div>
                <span className="login-active-pill">Active</span>
              </div>

              {/* Adobe */}
              <div className="login-sub-row">
                <div className="login-sub-icon login-icon-adobe">A</div>
                <div className="login-sub-info">
                  <strong>Adobe Creative Cloud</strong>
                  <span>Productivity</span>
                </div>
                <div className="login-sub-price">$59.99/mo</div>
                <span className="login-active-pill">Active</span>
              </div>
            </div>

            {/* Bottom Insight Cardlet */}
            <div className="login-card-banner">
              <div className="login-banner-sparkle">
                <Sparkles size={16} />
              </div>
              <div className="login-banner-text">
                <strong>A little less subscription. A little more you.</strong>
                <span>Your next smart move is one click away.</span>
              </div>
              <ArrowUpRight size={16} className="login-banner-arrow" />
            </div>
          </div>

          {/* Bottom Security Note */}
          <div className="login-bottom-trust">
            <ShieldCheck size={16} />
            <span>Your permission comes first. Always.</span>
          </div>
        </div>
      </div>

      {/* RIGHT COLUMN: AUTH ACTION PANEL */}
      <div className="login-form-panel">
        <div className="login-form-container">
          {/* Back Link */}
          <button
            type="button"
            className="login-back-button"
            onClick={() => {
              toast.info("Authentication cancelled", {
                description: "Returned to the SubSlayer landing page.",
              })
              navigate("landing")
            }}
          >
            <ArrowLeft size={15} />
            <span>Back to home</span>
          </button>

          {/* Eyebrow and Headings */}
          <div className="login-header-group">
            <span className="login-action-eyebrow">
              {mode === "login" ? "LET'S GET YOU UNLOOPED." : "LET'S GET YOU STARTED."}
            </span>
            <h2 className="login-action-heading">
              {mode === "login" ? "Welcome back." : "Create your account."}
            </h2>
            <p className="login-action-subheading">
              {mode === "login"
                ? "Your subscriptions. Right where you left them."
                : "A clear view of recurring costs and instant AI cancellation."}
            </p>
          </div>

          {/* Google OAuth Button */}
          <button
            type="button"
            className="google-oauth-button"
            onClick={handleGoogleLogin}
            disabled={loading}
          >
            <svg width="18" height="18" viewBox="0 0 24 24">
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
            <span>Continue with Google</span>
          </button>

          {/* Google Notice if not yet configured */}
          {googleNotice && (
            <div className="google-setup-notice">
              <AlertCircle size={15} style={{ flexShrink: 0, marginTop: "2px" }} />
              <div>
                <strong>Google OAuth Configured</strong>
                <p>{googleNotice}</p>
              </div>
            </div>
          )}

          {/* Form Divider */}
          <div className="login-divider">
            <span />
            <p>or continue with email</p>
            <span />
          </div>

          {/* Error Message */}
          {error && (
            <div className="login-error-banner">
              <AlertCircle size={16} style={{ flexShrink: 0 }} />
              <span>{error}</span>
            </div>
          )}

          {/* Credentials Form */}
          <form onSubmit={handleSubmit} className="login-form-fields">
            {mode === "signup" && (
              <div className="login-field">
                <label>Full name</label>
                <div className="login-input-box">
                  <UserIcon size={16} className="login-input-icon" />
                  <input
                    type="text"
                    placeholder="e.g. Jane Doe"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required={mode === "signup"}
                    autoComplete="name"
                  />
                </div>
              </div>
            )}

            <div className="login-field">
              <label>Email address</label>
              <div className="login-input-box">
                <Mail size={16} className="login-input-icon" />
                <input
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                />
              </div>
            </div>

            <div className="login-field">
              <label>Password</label>
              <div className="login-input-box">
                <Lock size={16} className="login-input-icon" />
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="At least 6 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete={mode === "login" ? "current-password" : "new-password"}
                />
                <button
                  type="button"
                  className="login-toggle-password"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Primary Action Button */}
            <button
              type="submit"
              className="login-primary-button"
              disabled={loading}
              style={{
                cursor: loading ? "not-allowed" : "pointer",
                opacity: loading ? 0.7 : 1,
                pointerEvents: loading ? "none" : "auto",
              }}
            >
              <span>
                {loading
                  ? mode === "login"
                    ? "Signing in..."
                    : "Creating account..."
                  : mode === "login"
                  ? "Enter your dashboard"
                  : "Create your account"}
              </span>
              {loading ? (
                <Loader2 size={17} className="spinning" />
              ) : (
                <ArrowUpRight size={17} />
              )}
            </button>
          </form>

          {/* Mode Switcher */}
          <div className="login-mode-switcher">
            {mode === "login" ? (
              <span>
                New around here?{" "}
                <button type="button" disabled={loading} onClick={() => switchMode("signup")}>
                  Sign up
                </button>
              </span>
            ) : (
              <span>
                Already have an account?{" "}
                <button type="button" disabled={loading} onClick={() => switchMode("login")}>
                  Sign in
                </button>
              </span>
            )}
          </div>

          {/* Sample Data Divider */}
          <div className="login-divider">
            <span />
            <p>or just take a look</p>
            <span />
          </div>

          {/* Explore with Sample Data Button */}
          <button
            type="button"
            className="login-sample-button"
            onClick={handleExploreSample}
            disabled={loading}
            style={{
              cursor: loading ? "not-allowed" : "pointer",
              opacity: loading ? 0.7 : 1,
              pointerEvents: loading ? "none" : "auto",
            }}
          >
            <span>{loading ? "Entering demo hub..." : "Explore with sample data"}</span>
            {loading ? <Loader2 size={16} className="spinning" /> : <span style={{ fontSize: "16px" }}>→</span>}
          </button>

          {/* Fine print footnote */}
          <p className="login-footnote">
            This is a prototype, not a live financial service. Never enter a password
            you use elsewhere.
          </p>
        </div>
      </div>
    </div>
  )
}
