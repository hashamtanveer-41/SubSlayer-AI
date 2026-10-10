import { useEffect, useState } from "react"
import { toast, toastStore } from "./toastStore"
import type { ToastData } from "./toast.types"

export function useToast() {
  const [toasts, setToasts] = useState<ToastData[]>(toastStore.getSnapshot())

  useEffect(() => {
    return toastStore.subscribe(setToasts)
  }, [])

  return {
    toast,
    toasts,
    dismiss: toast.dismiss,
  }
}
