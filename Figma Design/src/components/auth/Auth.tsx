import type { Page } from "../../types"
import { AuthForm } from "./AuthForm"
import { AuthStory } from "./AuthStory"

export interface AuthProps {
  mode: "login" | "signup"
  navigate: (p: Page) => void
  onLogin: (name: string) => void
}

export function Auth({ mode, navigate, onLogin }: AuthProps) {
  return (
    <div className="auth-page">
      <AuthStory navigate={navigate} />
      <AuthForm mode={mode} navigate={navigate} onLogin={onLogin} />
    </div>
  )
}
