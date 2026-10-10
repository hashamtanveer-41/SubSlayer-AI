import { useEffect, useRef, useState } from "react"
import {
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  Info,
  Loader2,
  X,
} from "lucide-react"
import type { ToastData, ToastType } from "./toast.types"

interface ToastItemProps {
  toast: ToastData
  onDismiss: (id: string) => void
}

function getToastIcon(type: ToastType) {
  switch (type) {
    case "success":
      return <CheckCircle2 className="toast-icon toast-icon-success" size={18} />
    case "error":
      return <AlertCircle className="toast-icon toast-icon-error" size={18} />
    case "warning":
      return <AlertTriangle className="toast-icon toast-icon-warning" size={18} />
    case "loading":
      return <Loader2 className="toast-icon toast-icon-loading spinning" size={18} />
    case "info":
    default:
      return <Info className="toast-icon toast-icon-info" size={18} />
  }
}

export function ToastItem({ toast, onDismiss }: ToastItemProps) {
  const [isExiting, setIsExiting] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const remainingTimeRef = useRef(toast.duration || 0)
  const startTimeRef = useRef(Date.now())
  const timerRef = useRef<number | null>(null)

  function startTimer(duration: number) {
    if (duration <= 0) return
    startTimeRef.current = Date.now()
    timerRef.current = window.setTimeout(() => {
      triggerDismiss()
    }, duration)
  }

  function pauseTimer() {
    if (!toast.duration || toast.duration <= 0) return
    setIsPaused(true)
    if (timerRef.current) {
      clearTimeout(timerRef.current)
      timerRef.current = null
      const elapsed = Date.now() - startTimeRef.current
      remainingTimeRef.current = Math.max(0, remainingTimeRef.current - elapsed)
    }
  }

  function resumeTimer() {
    if (!toast.duration || toast.duration <= 0) return
    setIsPaused(false)
    if (remainingTimeRef.current > 0) {
      startTimer(remainingTimeRef.current)
    }
  }

  function triggerDismiss() {
    setIsExiting(true)
    setTimeout(() => {
      onDismiss(toast.id)
    }, 220)
  }

  useEffect(() => {
    if (toast.duration && toast.duration > 0) {
      remainingTimeRef.current = toast.duration
      startTimer(toast.duration)
    }
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [toast.id, toast.duration])

  return (
    <div
      role="status"
      aria-live="polite"
      className={`subslayer-toast-card subslayer-toast-${toast.type} ${
        isExiting ? "toast-exit" : "toast-enter"
      }`}
      onMouseEnter={pauseTimer}
      onMouseLeave={resumeTimer}
    >
      <div className="subslayer-toast-header">
        <div className="subslayer-toast-icon-wrap">
          {getToastIcon(toast.type)}
        </div>

        <div className="subslayer-toast-body">
          <div className="subslayer-toast-title">{toast.title}</div>
          {toast.description && (
            <div className="subslayer-toast-desc">{toast.description}</div>
          )}

          {(toast.action || toast.cancel) && (
            <div className="subslayer-toast-actions">
              {toast.action && (
                <button
                  type="button"
                  className="subslayer-toast-btn-action"
                  onClick={() => {
                    toast.action?.onClick()
                    triggerDismiss()
                  }}
                >
                  {toast.action.label}
                </button>
              )}
              {toast.cancel && (
                <button
                  type="button"
                  className="subslayer-toast-btn-cancel"
                  onClick={() => {
                    toast.cancel?.onClick?.()
                    triggerDismiss()
                  }}
                >
                  {toast.cancel.label}
                </button>
              )}
            </div>
          )}
        </div>

        <button
          type="button"
          className="subslayer-toast-close"
          aria-label="Dismiss notification"
          onClick={triggerDismiss}
        >
          <X size={15} />
        </button>
      </div>

      {toast.duration && toast.duration > 0 ? (
        <div className="subslayer-toast-progress-track">
          <div
            className="subslayer-toast-progress-bar"
            style={{
              animationDuration: `${toast.duration}ms`,
              animationPlayState: isPaused ? "paused" : "running",
            }}
          />
        </div>
      ) : null}
    </div>
  )
}
