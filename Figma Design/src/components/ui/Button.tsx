import { forwardRef, type ButtonHTMLAttributes } from "react"
import { Loader2 } from "lucide-react"

export type ButtonVariant = "primary" | "secondary" | "ghost" | "danger"

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  loading?: boolean
  loadingText?: string
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = "primary",
      className = "",
      loading = false,
      loadingText,
      disabled,
      children,
      ...props
    },
    ref,
  ) => (
    <button
      ref={ref}
      disabled={disabled || loading}
      className={`button button-${variant} ${loading ? "button-loading" : ""} ${className}`}
      {...props}
    >
      {loading ? (
        <span style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
          <Loader2 size={15} className="spinning" />
          {loadingText || children}
        </span>
      ) : (
        children
      )}
    </button>
  ),
)

Button.displayName = "Button"
