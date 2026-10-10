import { type FormEvent } from "react"
import { Plus } from "lucide-react"
import type { Subscription } from "../../types"
import { Button } from "../ui/Button"
import { Dialog } from "../ui/Dialog"
import { Input } from "../ui/Input"

export interface AddEditSubscriptionDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  editing: Subscription | null
  onSave: (sub: Subscription) => void
}

export function AddEditSubscriptionDialog({
  open,
  onOpenChange,
  editing,
  onSave,
}: AddEditSubscriptionDialogProps) {
  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const f = new FormData(e.currentTarget)
    const name = String(f.get("name"))
    const sub: Subscription = {
      id: editing?.id || crypto.randomUUID(),
      name,
      category: String(f.get("category")),
      price: Number(f.get("price")),
      cycle: f.get("cycle") as Subscription["cycle"],
      renewal: String(f.get("renewal")),
      status: editing?.status || "Active",
      mark: name.charAt(0).toUpperCase(),
      tone: editing?.tone || "custom",
      vampireScore: editing?.vampireScore || Math.floor(Math.random() * 50) + 30,
    }
    onSave(sub)
  }

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
      title={editing ? "Tune subscription details." : "Add recurring subscription."}
      description={
        editing
          ? "Update details of this subscription for active monitoring."
          : "Add a service to track costs and enable autonomous cancellation."
      }
    >
      <form
        className="subscription-form"
        onSubmit={handleSubmit}
        key={editing?.id || "new"}
      >
        <label>
          Subscription name
          <Input
            name="name"
            defaultValue={editing?.name}
            placeholder="e.g. Netflix, Adobe, Gym"
            required
            maxLength={60}
          />
        </label>
        <div className="form-row">
          <label>
            Amount (USD)
            <Input
              name="price"
              type="number"
              step="0.01"
              min="0.01"
              max="100000"
              defaultValue={editing?.price}
              placeholder="14.99"
              required
            />
          </label>
          <label>
            Billing cycle
            <select name="cycle" defaultValue={editing?.cycle || "Monthly"}>
              <option>Monthly</option>
              <option>Yearly</option>
            </select>
          </label>
        </div>
        <label>
          Category
          <select
            name="category"
            defaultValue={editing?.category || "Entertainment"}
          >
            {["Entertainment", "Productivity", "Storage", "Other"].map(
              (c) => (
                <option key={c}>{c}</option>
              ),
            )}
          </select>
        </label>
        <label>
          Next renewal date
          <Input
            name="renewal"
            type="date"
            defaultValue={
              editing?.renewal || new Date().toISOString().slice(0, 10)
            }
            required
          />
        </label>
        <Button className="full-width" type="submit">
          {editing ? "Save changes" : "Add to SubSlayer"}
          <Plus size={16} />
        </Button>
      </form>
    </Dialog>
  )
}
