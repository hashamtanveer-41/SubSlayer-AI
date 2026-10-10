import { RotateCcw } from "lucide-react"
import { Button } from "../ui/Button"
import { Dialog } from "../ui/Dialog"

export interface SettingsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onResetData: () => void
}

export function SettingsDialog({
  open,
  onOpenChange,
  onResetData,
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
          <span>Vision-LLM Browser-Use Engine (Local / Stagehand / Playwright)</span>
        </div>
        <div>
          <strong>Display Currency</strong>
          <span>USD ($) · Automatic annualized calculation enabled</span>
        </div>
        <div>
          <strong>Zero-Knowledge Security</strong>
          <span>No bank passwords or unmasked card PANs are stored in this demo</span>
        </div>
        <Button
          variant="secondary"
          onClick={onResetData}
        >
          <RotateCcw size={16} />
          Reset to default seed data
        </Button>
      </div>
    </Dialog>
  )
}
