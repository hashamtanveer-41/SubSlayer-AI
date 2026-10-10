import { ArrowUpRight, Check, CircleHelp, Plus, SlidersHorizontal, Sparkles, Wallet } from "lucide-react"
import { seedSubscriptions } from "../../data/seedData"
import { ProviderIcon } from "../common/ProviderIcon"

export function HowItWorks() {
  return (
    <section className="how-section" id="how-it-works">
      <div className="section-heading">
        <div>
          <span className="eyebrow">ACTIVE AGENTIC INTERVENTION</span>
          <h2>
            From vampire drain
            <br />
            <span>to liberated cash in 3 steps.</span>
          </h2>
        </div>
        <p>
          No more calling customer support.
          <br />
          No more clicking through 8 pages of discount bribes.
        </p>
      </div>
      <div className="steps">
        <article className="step">
          <div className="step-top">
            <span>01 / DETECT</span>
            <Wallet size={22} />
          </div>
          <h3>Ingest & Uncover.</h3>
          <p>
            Upload your statement or sync transactions. Our AI scans for forgotten,
            price-hiked, and unused vampire subscriptions.
          </p>
          <div className="step-visual connect-visual">
            {seedSubscriptions.slice(0, 4).map((s) => (
              <ProviderIcon key={s.id} sub={s} />
            ))}
            <span className="connect-plus">
              <Plus size={18} />
            </span>
          </div>
        </article>
        <article className="step">
          <div className="step-top">
            <span>02 / ANALYZE</span>
            <SlidersHorizontal size={22} />
          </div>
          <h3>Vampire Risk Scoring.</h3>
          <p>
            Instantly see total annualized waste. Flag highest-cost services and
            preview immediate reclaimed cash.
          </p>
          <div className="step-visual discover-visual">
            <span>Potential yearly savings</span>
            <strong>
              $719.88 <ArrowUpRight size={22} />
            </strong>
            <div className="discovery-bars">
              <i />
              <i />
              <i />
              <i />
              <i />
              <i />
              <i />
            </div>
          </div>
        </article>
        <article className="step">
          <div className="step-top">
            <span>03 / SLAY & SHIELD</span>
            <Sparkles size={22} />
          </div>
          <h3>Autonomous Cancellation.</h3>
          <p>
            Hit "Cancel via AI". Our headless browser agent bypasses dark retention
            patterns, cancels the plan, and delivers photographic proof.
          </p>
          <div className="step-visual unloop-visual">
            <span className="agent-symbol">
              <Sparkles size={18} />
            </span>
            <div>
              <strong>Auto-cancelled in seconds.</strong>
              <span>Proof screenshot captured.</span>
            </div>
            <Check size={18} />
          </div>
        </article>
      </div>
      <div className="demo-disclosure">
        <CircleHelp size={14} /> Hackathon demo preview connects to simulated
        or live headless AI agent sessions with photographic DOM verification.
      </div>
    </section>
  )
}
