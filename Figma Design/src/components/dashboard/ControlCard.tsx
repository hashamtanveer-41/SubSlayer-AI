import { ShieldCheck } from "lucide-react"

export function ControlCard() {
  return (
    <section className="control-card">
      <ShieldCheck size={25} />
      <span className="eyebrow">ACTIVE DEFENSE GUARANTEE</span>
      <h3>
        Permission first.
        <br />
        Autonomous execution.
      </h3>
      <p>
        SubSlayer sends a cancellation request only after you authorize it. The
        demo provider API returns the status and a request receipt.
      </p>
    </section>
  )
}
