import { ArrowUpRight } from "lucide-react"
import { Brand } from "../common/Brand"

export function LandingFooter() {
  return (
    <footer className="site-footer">
      <Brand onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })} />
      <span>Intelligent Subscription Management & Financial Shield.</span>
      <span>© {new Date().getFullYear()} SubSlayer AI · Hackathon Edition</span>
      <a href="#questions">
        Questions? View FAQs <ArrowUpRight size={14} />
      </a>
    </footer>
  )
}
