import { Dialog } from "../ui/Dialog"

export interface SettingsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function SettingsDialog({
  open,
  onOpenChange,
}: SettingsDialogProps) {
  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
      title="Workspace Preferences"
      description="Configure your SubSlayer AI local environment settings."
    >
      <div className="settings-content">
        <div>
          <strong>AI Agent Engine</strong>
          <span>Qwen3.8 Flash analysis and four demo provider APIs</span>
        </div>
        <div>
          <strong>Display Currency</strong>
          <span>USD ($) · Automatic annualized calculation enabled</span>
        </div>
        <div>
          <strong>Zero-Knowledge Security</strong>
          <span>No bank passwords or unmasked card PANs are stored in this demo</span>
        </div>
        <p>Subscription and payment state comes from the local FastAPI demo backend.</p>
      </div>
    </Dialog>
  )
}
