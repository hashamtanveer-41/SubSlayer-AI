import { CircleCheck, X } from "lucide-react"
import { Button } from "../ui/Button"

export interface ToastProps {
  message: string
  onClose: () => void
}

export function Toast({ message, onClose }: ToastProps) {
  if (!message) return null

  return (
    <div className="toast" role="status">
      <CircleCheck size={18} />
      <span>{message}</span>
      <Button
        variant="ghost"
        aria-label="Dismiss notification"
        onClick={onClose}
      >
        <X size={16} />
      </Button>
    </div>
  )
}
