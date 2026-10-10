import { ArrowUpRight, Check, CircleHelp, Plus, SlidersHorizontal, Sparkles, Wallet } from "lucide-react"
import { seedSubscriptions } from "../../data/seedData"
import { ProviderIcon } from "../common/ProviderIcon"

export function HowItWorks() {
  return (
    <section className="how-section" id="how-it-works">
      <div className="section-heading">
        <div>
          <span className="eyebrow">HOW IT WORKS</span>
          <h2>
            From vampire drain
            <br />
            <span>to liberated cash in 3 steps.</span>
          </h2>
        </div>
        <p>
          No more calling customer support.
          <br />
          No more clicking through complex retention screens.
        </p>
      </div>
      <div className="steps">
        <article className="step">
          <div className="step-top">
            <span>01 / DETECT</span>
            <Wallet size={22} />
          </div>
          <h3>Detect Subscriptions</h3>
          <p>
            Sync accounts or upload statements to identify all active recurring charges.
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
          <h3>Analyze Spending</h3>
          <p>
            Review renewal dates, price changes, and calculated yearly spend for each service.
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
            <span>03 / CANCEL</span>
            <Sparkles size={22} />
          </div>
          <h3>Cancel Automatically</h3>
          <p>
            Select any unwanted service, and our AI browser agent completes the cancellation with verified proof.
          </p>
          <div className="step-visual unloop-visual">
            <span className="agent-symbol">
              <Sparkles size={18} />
            </span>
            <div>
              <strong>Cancelled in seconds.</strong>
              <span>Proof screenshot captured.</span>
            </div>
            <Check size={18} />
          </div>
        </article>
      </div>
      <div className="demo-disclosure">
        <CircleHelp size={14} /> Demonstrates automated cancellation with browser sessions and DOM verification.
      </div>
    </section>
  )
}
