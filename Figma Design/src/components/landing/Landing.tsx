import type { Page } from "../../types"
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
}

export function Landing({ navigate }: LandingProps) {
  return (
    <div className="landing">
      <LandingHeader navigate={navigate} />
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
