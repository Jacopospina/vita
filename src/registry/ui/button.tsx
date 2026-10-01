import * as React from "react"
import { Slot } from "radix-ui"
import { cva, type VariantProps } from "class-variance-authority"
import type { IconType } from "@/registry/icons"
import { cn } from "@/registry/lib/utils"
import { Icon, SwapIcon, DrawnMark } from "@/registry/ui/icon"
import { ErrorFilled } from "@/registry/icons"
import { Tooltip } from "@/registry/ui/tooltip"
import { Group } from "@/registry/ui/layout"
import { Kbd } from "@/registry/ui/kbd"
import { useShortcut } from "@/registry/hooks/use-shortcut"
import { useTilt } from "@/registry/hooks/use-tilt"
import { Thinking } from "@/registry/ui/thinking"
import { animateChildren } from "@/registry/ui/animated"

/**
 * Button — triggers an action. Clear hierarchy with restraint:
 * ONE primary per view. Everything else steps down: secondary → tertiary → ghost.
 */
const buttonVariants = cva(
  [
    "tilt relative inline-flex shrink-0 select-none items-center justify-center gap-2 whitespace-nowrap font-medium will-change-transform",
    // 240ms on the expressive curve: the hover lift and tilt ease in and out (110ms read as a snap).
    "squircle duration-moderate-02 ease-expressive",
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
        danger: "bg-error text-primary-foreground hover:bg-error-hover [--corpus-ring:var(--corpus-error)]",
        "danger-tertiary": "border border-error bg-transparent text-error-foreground hover:bg-error hover:text-primary-foreground [--corpus-ring:var(--corpus-error)]",
        "danger-ghost": "bg-transparent text-error-foreground hover:bg-error hover:text-primary-foreground [--corpus-ring:var(--corpus-error)]",
      },
      /* Symmetric padding, always. With an icon, the icon sits on the far right. */
      size: {
        sm: "h-control-sm px-2.5 text-body",
        md: "h-control-md px-3 text-body",
        lg: "h-control-lg px-4 text-body-lg",
        /** Hero calls to action, and dialog/panel actions. A rounder squircle, in proportion to its height. */
        xl: "h-12 px-5 text-body-lg [--corpus-squircle-r:var(--corpus-radius-lg)]",
      },
      fullWidth: { true: "w-full", false: "" },
    },
    defaultVariants: { variant: "primary", size: "md", fullWidth: false },
  },
)

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {
  asChild?: boolean
  /** Icon from @/registry/icons. Always on the FAR RIGHT, after the label. */
  icon?: IconType
  /** @deprecated (0.2) Icons are always on the far right; this prop is ignored. */
  iconPosition?: "start" | "end"
  /** Working state: the orb thinks in the icon slot, the label can say what's happening. Blocks re-submit. */
  loading?: boolean
  /**
   * The CONSEQUENCE of the action, shown IN the button — never elsewhere. The button is the last thing the
   * user looks at; they never look away to learn what their click did. Controlled; or use `onAction`.
   */
  status?: ButtonStatus
  /** Labels per consequence, e.g. { loading: "Deploying", success: "Deployed", error: "Couldn't deploy" }. */
  feedback?: Partial<Record<Exclude<ButtonStatus, "idle">, string>>
  /** Runs the whole lifecycle for you: loading → success (or error) in the button → back to idle. Throw to fail. */
  onAction?: (e: React.MouseEvent<HTMLButtonElement>) => unknown | Promise<unknown>
  /** Left-hand shortcut that triggers this button, e.g. "mod+s". Shown in tooltips; announced via aria-keyshortcuts. */
  shortcut?: string
}

export type ButtonStatus = "idle" | "loading" | "success" | "error"

/** How long a consequence stays in the button before it settles back. */
const settleMs = { success: 1600, error: 2400 } as const

const statusTone = {
  success: "bg-success! text-primary-foreground! border-transparent!",
  error: "bg-error! text-primary-foreground! border-transparent!",
} as const

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, fullWidth, asChild, icon, iconPosition: _iconPosition, loading, status: statusProp, feedback, onAction, disabled, shortcut, children, onClick, ...props }, ref) => {
    void _iconPosition
    const [auto, setAuto] = React.useState<ButtonStatus>("idle")
    const settle = React.useRef(0)
    React.useEffect(() => () => window.clearTimeout(settle.current), [])
    const status: ButtonStatus = statusProp ?? (loading ? "loading" : auto)
    const busy = status === "loading"
    const run = async (e: React.MouseEvent<HTMLButtonElement>) => {
      onClick?.(e)
      if (!onAction || busy) return
      window.clearTimeout(settle.current)
      setAuto("loading")
      let next: "success" | "error" = "success"
      try {
        await onAction(e)
      } catch {
        next = "error"
      }
      setAuto(next)
      settle.current = window.setTimeout(() => setAuto("idle"), settleMs[next])
    }
    const Comp = asChild ? Slot.Root : "button"
    const inner = React.useRef<HTMLButtonElement | null>(null)
    React.useImperativeHandle(ref, () => inner.current as HTMLButtonElement)
    useShortcut(shortcut, () => inner.current?.click(), { enabled: !!shortcut && !disabled && !busy })
    const tilt = useTilt<HTMLButtonElement>({ max: 12, lift: 1.05 }, { onPointerMove: props.onPointerMove, onPointerLeave: props.onPointerLeave })
    const label = status !== "idle" && feedback?.[status] ? feedback[status] : children
    // The far-right slot carries the consequence: icon → thinking orb → drawn check / error mark.
    const slot =
      status === "loading" ? <Thinking mode="basic" size="sm" tone="current" label={feedback?.loading ?? "Working"} />
      : status === "success" ? <DrawnMark on className="animate-enter-fade" />
      : status === "error" ? <Icon as={ErrorFilled} size="sm" draw="in" />
      : icon ? <Icon as={icon} size="sm" /> : null
    // With an icon: label left, icon on the far right, a normal gap between.
    const withIcon = { sm: "gap-2", md: "gap-2.5", lg: "gap-3", xl: "gap-3" }[size ?? "md"]
    return (
      <Comp
        ref={inner}
        aria-keyshortcuts={shortcut}
        className={cn(buttonVariants({ variant, size, fullWidth }), slot && cn("justify-between", withIcon), busy && "pointer-events-none", status !== "idle" && status !== "loading" && statusTone[status], className)}
        disabled={asChild ? undefined : disabled}
        aria-busy={busy || undefined}
        data-status={status === "idle" ? undefined : status}
        onClick={asChild ? onClick : run}
        {...props}
        {...tilt}
      >
        {asChild ? (
          children
        ) : (
          <>
            <span aria-live="polite" className="inline-flex items-center gap-2">{animateChildren(label)}</span>
            {slot && <span key={status === "idle" ? "icon" : status} className="flex shrink-0 items-center animate-enter-scale">{slot}</span>}
          </>
        )}
      </Comp>
    )
  },
)
Button.displayName = "Button"

const iconButtonSize = { sm: "size-control-sm", md: "size-control-md", lg: "size-control-lg", xl: "size-12" } as const

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
 * ActionBar — the action row of a surface (modal, popover, side panel). Full-bleed, joined, no gaps; the surface owns the corners.
 * NEVER include Cancel/Close/Dismiss: the surface's × , Escape and click-outside already do that.
 * 1 action = full width. 2 actions = a secondary alternative (not a dismissal) + the primary.
 */
export function ActionBar({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      role="group"
      className={cn(
        "flex shrink-0 gap-0 border-t border-border-subtle",
        // Extra-large actions (the xl button size): decisive, easy targets at the bottom of the surface.
        "*:h-12 *:flex-1 *:justify-start *:rounded-none *:px-5 *:text-body-lg *:active:scale-100 *:[--corpus-squircle-r:0px]",
        className,
      )}
      {...props}
    />
  )
}

export { buttonVariants }
