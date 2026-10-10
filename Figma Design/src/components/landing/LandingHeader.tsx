import { useState } from "react"
import { ArrowUpRight, Menu } from "lucide-react"
import type { Page } from "../../types"
import { Brand } from "../common/Brand"
import { Button } from "../ui/Button"

export interface LandingHeaderProps {
  navigate: (p: Page) => void
}

export function LandingHeader({ navigate }: LandingHeaderProps) {
  const [mobileMenu, setMobileMenu] = useState(false)

  return (
    <header className="site-header">
      <Brand onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })} />
      <nav className={mobileMenu ? "site-nav mobile-open" : "site-nav"}>
        <a href="#how-it-works" onClick={() => setMobileMenu(false)}>
          How it works
        </a>
        <a href="#features" onClick={() => setMobileMenu(false)}>
          Why SubSlayer
        </a>
        <a href="#virtual-cards" onClick={() => setMobileMenu(false)}>
          Virtual Shield
        </a>
        <a href="#questions" onClick={() => setMobileMenu(false)}>
          FAQs
        </a>
      </nav>
      <div className="nav-actions">
        <Button onClick={() => navigate("app")}>
          Open Demo <ArrowUpRight size={16} />
        </Button>
        <Button
          variant="ghost"
          className="mobile-menu-button"
          aria-label="Toggle navigation"
          onClick={() => setMobileMenu(!mobileMenu)}
        >
          <Menu size={20} />
        </Button>
      </div>
    </header>
  )
}
