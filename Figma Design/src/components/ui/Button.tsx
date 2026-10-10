import { forwardRef, type ButtonHTMLAttributes } from "react"

export type ButtonVariant = "primary" | "secondary" | "ghost" | "danger"

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = "primary", className = "", ...props }, ref) => (
    <button
      ref={ref}
      className={`button button-${variant} ${className}`}
      {...props}
    />
  ),
)

Button.displayName = "Button"
