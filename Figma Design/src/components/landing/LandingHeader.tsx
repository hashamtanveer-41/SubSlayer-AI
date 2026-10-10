import { ArrowUpRight } from "lucide-react"
import type { Page } from "../../types"
import { Brand } from "../common/Brand"
import { Button } from "../ui/Button"

export interface LandingHeaderProps {
  navigate: (p: Page) => void
}

export function LandingHeader({ navigate }: LandingHeaderProps) {
  return (
    <header className="site-header">
      <Brand onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })} />
      <div className="nav-actions">
        <Button variant="ghost" onClick={() => navigate("login")}>
          Log in
        </Button>
        <Button onClick={() => navigate("signup")}>
          Launch App <ArrowUpRight size={16} />
        </Button>
      </div>
    </header>
  )
}
