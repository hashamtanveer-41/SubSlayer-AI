import type { Page, User } from "../../types"
import { ClosingCTA } from "./ClosingCTA"
import { FAQSection } from "./FAQSection"
import { FeatureStatement } from "./FeatureStatement"
import { HowItWorks } from "./HowItWorks"
import { LandingFooter } from "./LandingFooter"
import { LandingHeader } from "./LandingHeader"
import { LandingHero } from "./LandingHero"
import { ProviderStrip } from "./ProviderStrip"

export interface LandingProps {
  navigate: (p: Page) => void
  currentUser?: User | null
  onLogout?: () => void
}

export function Landing({ navigate, currentUser, onLogout }: LandingProps) {
  return (
    <div className="landing">
      <LandingHeader navigate={navigate} currentUser={currentUser} onLogout={onLogout} />
      <main>
        <LandingHero navigate={navigate} />
        <ProviderStrip />
        <HowItWorks />
        <FeatureStatement navigate={navigate} />
        <FAQSection />
        <ClosingCTA navigate={navigate} />
      </main>
      <LandingFooter />
    </div>
  )
}
