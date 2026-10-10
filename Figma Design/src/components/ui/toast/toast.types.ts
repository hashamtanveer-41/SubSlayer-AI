export type ToastType = "success" | "error" | "warning" | "info" | "loading"

export interface ToastAction {
  label: string
  onClick: () => void
}

export interface ToastData {
  id: string
  title: string
  description?: string
  type: ToastType
  duration?: number // duration in ms, 0 means infinite / until manual dismissal
  action?: ToastAction
  cancel?: {
    label: string
    onClick?: () => void
  }
  createdAt: number
}

export interface ToastOptions {
  id?: string
  description?: string
  duration?: number
  action?: ToastAction
  cancel?: {
    label: string
    onClick?: () => void
  }
}
