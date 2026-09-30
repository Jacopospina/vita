import * as React from "react"
import { Slot } from "radix-ui"
import { cva, type VariantProps } from "class-variance-authority"
import type { IconType } from "@/registry/icons"
import { cn } from "@/registry/lib/utils"
import { Icon, SwapIcon } from "@/registry/ui/icon"
import { Tooltip } from "@/registry/ui/tooltip"
import { Group } from "@/registry/ui/layout"
import { Kbd } from "@/registry/ui/kbd"
import { useShortcut } from "@/registry/hooks/use-shortcut"
import { useTilt } from "@/registry/hooks/use-tilt"
import { animateChildren } from "@/registry/ui/animated"

/**
 * Button — triggers an action. Clear hierarchy with restraint:
 * ONE primary per view. Everything else steps down: secondary → tertiary → ghost.
 */
const buttonVariants = cva(
  [
    "tilt relative inline-flex shrink-0 select-none items-center justify-center gap-2 whitespace-nowrap font-medium will-change-transform",
    "rounded-md duration-fast-02 ease-productive",
    "focus-ring active:scale-98 motion-reduce:active:scale-100",
    "disabled:pointer-events-none disabled:bg-layer-2 disabled:text-disabled-foreground disabled:border-transparent",
    "aria-disabled:pointer-events-none aria-disabled:opacity-60",
  ],
  {
    variants: {
      variant: {
        primary: "bg-primary text-primary-foreground ease-expressive hover:bg-primary-hover active:bg-primary-active active:scale-97",
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
  /** Left-hand shortcut that triggers this button, e.g. "mod+s". Shown in tooltips; announced via aria-keyshortcuts. */
  shortcut?: string
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, fullWidth, asChild, icon, iconPosition = "end", loading, disabled, shortcut, children, ...props }, ref) => {
    const Comp = asChild ? Slot.Root : "button"
    const inner = React.useRef<HTMLButtonElement | null>(null)
    React.useImperativeHandle(ref, () => inner.current as HTMLButtonElement)
    useShortcut(shortcut, () => inner.current?.click(), { enabled: !!shortcut && !disabled && !loading })
    const tilt = useTilt<HTMLButtonElement>({ max: 12, lift: 1.05 }, { onPointerMove: props.onPointerMove, onPointerLeave: props.onPointerLeave })
    const iconEl = icon ? <Icon as={icon} size="sm" /> : null
    return (
      <Comp
        ref={inner}
        aria-keyshortcuts={shortcut}
        className={cn(buttonVariants({ variant, size, fullWidth }), fullWidth && icon && "justify-between", className)}
        disabled={asChild ? undefined : disabled || loading}
        aria-busy={loading || undefined}
        {...props}
        {...tilt}
      >
        {asChild ? (
          children
        ) : (
          <>
            {iconPosition === "start" && iconEl}
            <span className={cn("inline-flex items-center gap-2", loading && "invisible")}>{animateChildren(children)}</span>
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
  ({ icon, label, variant = "ghost", size = "md", tooltipSide = "bottom", pressed, className, shortcut, ...props }, ref) => (
    <Tooltip content={shortcut ? <span className="inline-flex items-center gap-2">{label}<Kbd keys={shortcut} className="border-transparent bg-transparent text-inverse-foreground" /></span> : label} side={tooltipSide}>
      <Button
        ref={ref}
        variant={variant}
        size={size}
        aria-label={label}
        aria-pressed={pressed}
        shortcut={shortcut}
        className={cn(iconButtonSize[size ?? "md"], "px-0", pressed && "bg-selected text-selected-foreground", className)}
        {...props}
      >
        <SwapIcon as={icon} size={size === "lg" ? "md" : "sm"} />
      </Button>
    </Tooltip>
  ),
)
IconButton.displayName = "IconButton"

/**
 * ButtonSet — related buttons BELONG TOGETHER, so they touch: zero gap, joined edges. Max 3. Primary goes LAST.
 * `stacked` for narrow containers: vertical join, primary on top.
 */
export function ButtonSet({ className, stacked, ...props }: React.HTMLAttributes<HTMLDivElement> & { stacked?: boolean }) {
  return <Group orientation={stacked ? "vertical" : "horizontal"} className={cn(stacked && "w-full flex-col-reverse *:w-full", className)} {...props} />
}

/**
 * ActionBar — the action row of a surface (modal, side panel). Full-bleed, joined, no gaps.
 * NEVER include Cancel/Close/Dismiss: the surface's × , Escape and click-outside already do that.
 * 1 action = full width. 2 actions = a secondary alternative (not a dismissal) + the primary.
 */
export function ActionBar({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      role="group"
      className={cn(
        "flex shrink-0 gap-0 border-t border-border-subtle",
        "*:h-control-xl *:flex-1 *:justify-start *:rounded-none *:px-inset-lg *:text-body *:active:scale-100",
        className,
      )}
      {...props}
    />
  )
}

export { buttonVariants }
