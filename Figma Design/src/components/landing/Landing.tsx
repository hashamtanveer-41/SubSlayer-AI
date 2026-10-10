import type { Page } from "../../types"
import { useDemoOverview } from "../../hooks/useDemoOverview"
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
  const overview = useDemoOverview()
  return (
    <div className="landing">
      <LandingHeader navigate={navigate} />
      <main>
        <LandingHero navigate={navigate} overview={overview} />
        <ProviderStrip />
        <HowItWorks overview={overview} />
        <FeatureStatement navigate={navigate} />
        <FAQSection />
        <ClosingCTA navigate={navigate} />
      </main>
      <LandingFooter />
    </div>
  )
}
