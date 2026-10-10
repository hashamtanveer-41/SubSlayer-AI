import { useEffect, useState } from "react"
import { toastStore } from "./toastStore"
import type { ToastData } from "./toast.types"
import { ToastItem } from "./ToastItem"

export interface ToasterProps {
  position?: "top-right" | "top-left" | "bottom-right" | "bottom-left" | "top-center" | "bottom-center"
}

export function Toaster({ position = "bottom-right" }: ToasterProps) {
  const [toasts, setToasts] = useState<ToastData[]>([])

  useEffect(() => {
    const unsubscribe = toastStore.subscribe((newToasts) => {
      setToasts(newToasts)
    })
    return unsubscribe
  }, [])

  if (toasts.length === 0) return null

  return (
    <aside
      aria-label="Notifications"
      className={`subslayer-toaster-viewport subslayer-toaster-${position}`}
    >
      <div className="subslayer-toaster-list">
        {toasts.map((item) => (
          <ToastItem
            key={item.id}
            toast={item}
            onDismiss={(id) => toastStore.dismiss(id)}
          />
        ))}
      </div>
    </aside>
  )
}
