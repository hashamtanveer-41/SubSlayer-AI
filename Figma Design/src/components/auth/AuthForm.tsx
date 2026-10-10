import { useState, type FormEvent } from "react"
import { ArrowRight, ArrowUpRight, Sparkles } from "lucide-react"
import type { Page } from "../../types"
import { Button } from "../ui/Button"
import { Input } from "../ui/Input"

export interface AuthFormProps {
  mode: "login" | "signup"
  navigate: (p: Page) => void
  onLogin: (name: string) => void
}

export function AuthForm({ mode, navigate, onLogin }: AuthFormProps) {
  const [error, setError] = useState("")

  function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const data = new FormData(e.currentTarget)
    const password = String(data.get("password"))
    if (password.length < 6) {
      setError("Use at least 6 characters for your demo password.")
      return
    }
    onLogin(String(data.get("name") || String(data.get("email")).split("@")[0] || "Alex"))
  }

  return (
    <div className="auth-form-side">
      <Button
        variant="ghost"
        className="back-home"
        onClick={() => navigate("landing")}
      >
        ← Back to home
      </Button>
      <div className="auth-form-wrap">
        <span className="eyebrow">ENTER SUBSLAYER AI</span>
        <h2>{mode === "signup" ? "Create your workspace." : "Welcome back."}</h2>
        <p>
          {mode === "signup"
            ? "Your autonomous defense against subscription drain starts here."
            : "Your subscriptions and agent logs are waiting."}
        </p>
        <div className="demo-banner">
          <Sparkles size={17} />
          <span>Demo mode · No credit card or real password stored.</span>
        </div>
        <form onSubmit={submit}>
          {mode === "signup" && (
            <label>
              Your name
              <Input
                name="name"
                placeholder="Alex Morgan"
                required
                autoComplete="name"
              />
            </label>
          )}
          <label>
            Email address
            <Input
              type="email"
              name="email"
              placeholder="alex@example.com"
              required
              autoComplete="email"
            />
          </label>
          <label>
            Password
            <Input
              name="password"
              type="password"
              placeholder="At least 6 characters"
              minLength={6}
              required
              autoComplete={mode === "signup" ? "new-password" : "current-password"}
            />
          </label>
          {error && (
            <p role="alert" className="form-error">
              {error}
            </p>
          )}
          <Button type="submit" className="full-width">
            {mode === "signup" ? "Create demo account" : "Enter Dashboard"}
            <ArrowUpRight size={17} />
          </Button>
        </form>
        <div className="auth-switch">
          {mode === "signup" ? "Already have an account?" : "New to SubSlayer?"}
          <Button
            variant="ghost"
            onClick={() => navigate(mode === "signup" ? "login" : "signup")}
          >
            {mode === "signup" ? "Log in" : "Sign up"}
          </Button>
        </div>
        <div className="auth-divider">
          <span />
          or jump straight in
          <span />
        </div>
        <Button
          variant="secondary"
          className="full-width"
          onClick={() => onLogin("Alex")}
        >
          Explore with sample data <ArrowRight size={16} />
        </Button>
        <p className="auth-disclaimer">
          This is an interactive hackathon prototype.
          Session data is preserved safely in your local browser state.
        </p>
      </div>
    </div>
  )
}
