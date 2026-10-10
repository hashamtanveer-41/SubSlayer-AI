import { CalendarDays } from "lucide-react"
import type { Subscription } from "../../types"
import { money } from "../../utils/formatters"
import { ProviderIcon } from "../common/ProviderIcon"

export interface UpcomingRenewalsCardProps {
  renewals: Subscription[]
}

export function UpcomingRenewalsCard({ renewals }: UpcomingRenewalsCardProps) {
  return (
    <section className="renewal-card">
      <div className="lower-card-heading">
        <h3>Upcoming Auto-Renewals</h3>
        <CalendarDays size={18} />
      </div>
      {renewals.slice(0, 3).map((s) => (
        <div className="renewal-row" key={s.id}>
          <span className="renewal-date">
            <strong>{new Date(`${s.renewal}T12:00:00`).getDate()}</strong>
            {new Date(`${s.renewal}T12:00:00`).toLocaleDateString("en-US", {
              month: "short",
            })}
          </span>
          <ProviderIcon sub={s} small />
          <div>
            <strong>{s.name}</strong>
            <span>{s.cycle} billing cycle</span>
          </div>
          <strong>{money(s.price)}</strong>
        </div>
      ))}
      {!renewals.length && <p>No upcoming renewals detected.</p>}
    </section>
  )
}
