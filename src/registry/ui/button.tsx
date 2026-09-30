import * as React from "react"
import { Slot } from "radix-ui"
import { cva, type VariantProps } from "class-variance-authority"
import type { IconType } from "@/registry/icons"
import { cn } from "@/registry/lib/utils"
import { Icon } from "@/registry/ui/icon"
import { Tooltip } from "@/registry/ui/tooltip"

/**
 * Button — triggers an action. Clear hierarchy with restraint:
 * ONE primary per view. Everything else steps down: secondary → tertiary → ghost.
 */
const buttonVariants = cva(
  [
    "relative inline-flex shrink-0 select-none items-center justify-center gap-2 whitespace-nowrap font-medium",
    "rounded-md transition-[background-color,color,border-color,box-shadow,transform] duration-fast-02 ease-productive",
    "focus-ring active:scale-98 motion-reduce:active:scale-100",
    "disabled:pointer-events-none disabled:bg-layer-2 disabled:text-disabled-foreground disabled:border-transparent",
    "aria-disabled:pointer-events-none aria-disabled:opacity-60",
  ],
  {
    variants: {
      variant: {
        primary: "bg-primary text-primary-foreground hover:bg-primary-hover active:bg-primary-active",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary-hover",
        tertiary: "border border-primary bg-transparent text-primary hover:bg-primary hover:text-primary-foreground",
        ghost: "bg-transparent text-foreground hover:bg-hover active:bg-active",
        danger: "bg-error text-primary-foreground hover:bg-error-hover",
        "danger-tertiary": "border border-error bg-transparent text-error-foreground hover:bg-error hover:text-primary-foreground",
        "danger-ghost": "bg-transparent text-error-foreground hover:bg-error hover:text-primary-foreground",
      },
      size: {
        sm: "h-control-sm px-inset text-body",
        md: "h-control-md px-inset-lg text-body",
        lg: "h-control-lg px-inset-lg text-body-lg",
      },
      fullWidth: { true: "w-full", false: "" },
    },
    defaultVariants: { variant: "primary", size: "md", fullWidth: false },
  },
)

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {
  asChild?: boolean
  /** Icon from @/registry/icons. Placed after the label unless iconPosition="start". */
  icon?: IconType
  iconPosition?: "start" | "end"
  /** Shows an inline spinner, keeps width, blocks re-submit. */
  loading?: boolean
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, fullWidth, asChild, icon, iconPosition = "end", loading, disabled, children, ...props }, ref) => {
    const Comp = asChild ? Slot.Root : "button"
    const iconEl = icon ? <Icon as={icon} size="sm" /> : null
    return (
      <Comp
        ref={ref}
        className={cn(buttonVariants({ variant, size, fullWidth }), fullWidth && icon && "justify-between", className)}
        disabled={asChild ? undefined : disabled || loading}
        aria-busy={loading || undefined}
        {...props}
      >
        {asChild ? (
          children
        ) : (
          <>
            {iconPosition === "start" && iconEl}
            <span className={cn("inline-flex items-center gap-2", loading && "invisible")}>{children}</span>
            {iconPosition === "end" && iconEl}
            {loading && (
              <span className="absolute inset-0 flex items-center justify-center">
                <span className="size-4 animate-spin rounded-full border-2 border-current border-r-transparent" />
              </span>
            )}
          </>
        )}
      </Comp>
    )
  },
)
Button.displayName = "Button"

const iconButtonSize = { sm: "size-control-sm", md: "size-control-md", lg: "size-control-lg" } as const

export interface IconButtonProps extends Omit<ButtonProps, "icon" | "iconPosition" | "children" | "fullWidth"> {
  icon: IconType
  /** Required. Becomes aria-label AND the tooltip. An icon without a name is a bug. */
  label: string
  tooltipSide?: "top" | "bottom" | "left" | "right"
  /** Pressed state for toggle-style icon buttons (e.g. bold in a text toolbar). */
  pressed?: boolean
}

/** IconButton — icon-only action. Defaults to ghost. Always has a tooltip. */
export const IconButton = React.forwardRef<HTMLButtonElement, IconButtonProps>(
  ({ icon, label, variant = "ghost", size = "md", tooltipSide = "bottom", pressed, className, ...props }, ref) => (
    <Tooltip content={label} side={tooltipSide}>
      <Button
        ref={ref}
        variant={variant}
        size={size}
        aria-label={label}
        aria-pressed={pressed}
        className={cn(iconButtonSize[size ?? "md"], "px-0", pressed && "bg-selected text-selected-foreground", className)}
        {...props}
      >
        <Icon as={icon} size={size === "lg" ? "md" : "sm"} />
      </Button>
    </Tooltip>
  ),
)
IconButton.displayName = "IconButton"

/**
 * ButtonSet — groups up to 3 related buttons. Primary goes LAST (right).
 * `stacked` for narrow containers (mobile, side panels): primary on top, full width.
 */
export function ButtonSet({ className, stacked, ...props }: React.HTMLAttributes<HTMLDivElement> & { stacked?: boolean }) {
  return (
    <div
      role="group"
      className={cn(stacked ? "flex flex-col-reverse gap-2 *:w-full" : "flex flex-wrap items-center justify-end gap-2", className)}
      {...props}
    />
  )
}

export { buttonVariants }
