import { useState } from "react"
import { Plus } from "lucide-react"
import { landingFaqs } from "../../data/seedData"
import { Button } from "../ui/Button"

export function FAQSection() {
  const [faq, setFaq] = useState<number | null>(null)

  return (
    <section className="faq-section" id="questions">
      <div>
        <span className="eyebrow">FREQUENTLY ASKED QUESTIONS</span>
        <h2>
          Clear answers.
          <br />
          <span>Total transparency.</span>
        </h2>
      </div>
      <div className="faq-list">
        {landingFaqs.map(([q, a], i) => (
          <div
            className={`faq-item ${faq === i ? "faq-open" : ""}`}
            key={q}
          >
            <Button
              variant="ghost"
              onClick={() => setFaq(faq === i ? null : i)}
              aria-expanded={faq === i}
            >
              {q}
              <Plus size={18} />
            </Button>
            {faq === i && <p>{a}</p>}
          </div>
        ))}
      </div>
    </section>
  )
}
