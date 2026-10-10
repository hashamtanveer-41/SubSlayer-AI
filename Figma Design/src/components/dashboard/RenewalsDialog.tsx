import type { Subscription } from "../../types"
import { money } from "../../utils/formatters"
import { ProviderIcon } from "../common/ProviderIcon"
import { Dialog } from "../ui/Dialog"

export interface RenewalsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  renewals: Subscription[]
}

export function RenewalsDialog({
  open,
  onOpenChange,
  renewals,
}: RenewalsDialogProps) {
  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
      title="Upcoming Auto-Renewals Timeline"
      description="Clear notice of upcoming renewals to prevent surprise credit card charges."
    >
      <div className="renewal-dialog">
        {renewals.map((s) => (
          <div className="renewal-row" key={s.id}>
            <ProviderIcon sub={s} small />
            <div>
              <strong>{s.name}</strong>
              <span>
                {new Date(`${s.renewal}T12:00:00`).toLocaleDateString(
                  "en-US",
                  { month: "long", day: "numeric", year: "numeric" },
                )}
              </span>
            </div>
            <strong>{money(s.price)}</strong>
          </div>
        ))}
        {!renewals.length && <p>No active subscriptions in the pipeline.</p>}
      </div>
    </Dialog>
  )
}
