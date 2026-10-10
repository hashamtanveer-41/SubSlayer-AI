import type { ToastData, ToastOptions, ToastType } from "./toast.types"

type Listener = (toasts: ToastData[]) => void

class ToastStore {
  private toasts: ToastData[] = []
  private listeners: Set<Listener> = new Set()
  private maxToasts = 5

  public subscribe(listener: Listener): () => void {
    this.listeners.add(listener)
    listener([...this.toasts])
    return () => {
      this.listeners.delete(listener)
    }
  }

  private notify() {
    const copy = [...this.toasts]
    for (const listener of this.listeners) {
      listener(copy)
    }
  }

  public add(
    title: string,
    type: ToastType = "info",
    options?: ToastOptions,
  ): string {
    const id = options?.id || `toast_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`

    // Default duration by type
    let defaultDuration = 4500
    if (type === "loading") defaultDuration = 0
    else if (type === "error") defaultDuration = 6000
    else if (type === "warning") defaultDuration = 5500

    const duration = options?.duration !== undefined ? options.duration : defaultDuration

    const newToast: ToastData = {
      id,
      title,
      description: options?.description,
      type,
      duration,
      action: options?.action,
      cancel: options?.cancel,
      createdAt: Date.now(),
    }

    // Check if toast with id already exists; update it if so
    const existingIndex = this.toasts.findIndex((t) => t.id === id)
    if (existingIndex !== -1) {
      this.toasts[existingIndex] = newToast
    } else {
      // Prepend or append up to maxToasts
      this.toasts = [newToast, ...this.toasts.slice(0, this.maxToasts - 1)]
    }

    this.notify()
    return id
  }

  public dismiss(id?: string) {
    if (!id) {
      this.toasts = []
    } else {
      this.toasts = this.toasts.filter((t) => t.id !== id)
    }
    this.notify()
  }

  public getSnapshot(): ToastData[] {
    return [...this.toasts]
  }
}

export const toastStore = new ToastStore()

export interface ToastFn {
  (title: string, options?: ToastOptions): string
  success: (title: string, options?: ToastOptions) => string
  error: (title: string, options?: ToastOptions) => string
  warning: (title: string, options?: ToastOptions) => string
  info: (title: string, options?: ToastOptions) => string
  loading: (title: string, options?: ToastOptions) => string
  promise: <T>(
    promise: Promise<T>,
    msgs: {
      loading: string
      success: string | ((data: T) => string)
      error: string | ((err: any) => string)
    },
    options?: ToastOptions,
  ) => Promise<T>
  dismiss: (id?: string) => void
}

const baseToast = (title: string, options?: ToastOptions) =>
  toastStore.add(title, "info", options)

baseToast.success = (title: string, options?: ToastOptions) =>
  toastStore.add(title, "success", options)

baseToast.error = (title: string, options?: ToastOptions) =>
  toastStore.add(title, "error", options)

baseToast.warning = (title: string, options?: ToastOptions) =>
  toastStore.add(title, "warning", options)

baseToast.info = (title: string, options?: ToastOptions) =>
  toastStore.add(title, "info", options)

baseToast.loading = (title: string, options?: ToastOptions) =>
  toastStore.add(title, "loading", options)

baseToast.promise = async <T>(
  promise: Promise<T>,
  msgs: {
    loading: string
    success: string | ((data: T) => string)
    error: string | ((err: any) => string)
  },
  options?: ToastOptions,
): Promise<T> => {
  const toastId = options?.id || `promise_${Date.now()}`
  baseToast.loading(msgs.loading, { ...options, id: toastId, duration: 0 })

  try {
    const data = await promise
    const message = typeof msgs.success === "function" ? msgs.success(data) : msgs.success
    baseToast.success(message, { ...options, id: toastId })
    return data
  } catch (err: any) {
    const message = typeof msgs.error === "function" ? msgs.error(err) : msgs.error
    baseToast.error(message, { ...options, id: toastId })
    throw err
  }
}

baseToast.dismiss = (id?: string) => toastStore.dismiss(id)

export const toast: ToastFn = baseToast
