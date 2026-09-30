import * as React from "react"
import type { IconType } from "@/registry/icons"
import { Close } from "@/registry/icons"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/registry/lib/utils"
import { Icon, SwapIcon } from "@/registry/ui/icon"
import { animateChildren } from "@/registry/ui/animated"
import { useExit } from "@/registry/hooks/use-exit"

/**
 * Tag — label, categorise or filter. Four types:
 *   read-only   → metadata/status label. Not interactive.
 *   dismissible → an applied filter/selection the user can remove.
 *   selectable  → toggle a filter on/off (use a group).
 *   operational → opens something (popover with details). Rare.
 * Status (success/warning/error) must ALSO be conveyed by text; color is never the only signal.
 */
const tagVariants = cva(
  "inline-flex h-6 max-w-full shrink-0 items-center gap-1 rounded-full px-2 text-caption font-medium whitespace-nowrap duration-fast-02 ease-productive",
  {
    variants: {
      tone: {
        neutral: "bg-layer-3 text-foreground",
        brand: "bg-primary-subtle text-selected-foreground",
        success: "bg-success-subtle text-success-foreground",
        warning: "bg-warning-subtle text-warning-foreground",
        error: "bg-error-subtle text-error-foreground",
        info: "bg-info-subtle text-info-foreground",
        outline: "border border-border-strong bg-transparent text-foreground",
        inverse: "bg-inverse text-inverse-foreground",
      },
      size: { sm: "h-5 px-1.5", md: "h-6 px-2", lg: "h-control-sm px-3 text-footnote" },
    },
    defaultVariants: { tone: "neutral", size: "md" },
  },
)

export interface TagProps extends React.HTMLAttributes<HTMLSpanElement>, VariantProps<typeof tagVariants> {
  icon?: IconType
  onDismiss?: () => void
  dismissLabel?: string
  disabled?: boolean
}

export function Tag({ tone, size, icon, onDismiss, dismissLabel, disabled, className, children, ...props }: TagProps) {
  const [leaving, exit] = useExit()
  return (
    <span className={cn(tagVariants({ tone, size }), onDismiss && "pr-0.5", disabled && "opacity-50", leaving && "animate-exit-scale", className)} {...props}>
      {icon && <SwapIcon as={icon} size="sm" />}
      <span className="truncate">{animateChildren(children)}</span>
      {onDismiss && (
        <button
          type="button"
          disabled={disabled}
          onClick={() => exit(onDismiss)}
          aria-label={dismissLabel ?? `Remove ${typeof children === "string" ? children : "tag"}`}
          className="flex size-5 items-center justify-center rounded-full hover:bg-hover focus-ring"
        >
          <Icon as={Close} size="sm" />
        </button>
      )}
    </span>
  )
}

/** SelectableTag — on/off filter chip. Group them with role="group" and a label. */
export function SelectableTag({ selected, onSelectedChange, disabled, children, className }: { selected: boolean; onSelectedChange: (s: boolean) => void; disabled?: boolean; children: React.ReactNode; className?: string }) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      disabled={disabled}
      onClick={() => onSelectedChange(!selected)}
      className={cn(
        tagVariants({ tone: selected ? "inverse" : "outline" }),
        "cursor-pointer focus-ring hover:bg-hover disabled:pointer-events-none disabled:opacity-50",
        selected && "hover:bg-inverse",
        className,
      )}
    >
      {children}
    </button>
  )
}

/** OperationalTag — a tag that opens something (e.g. a popover listing more items: "+3"). */
export const OperationalTag = React.forwardRef<HTMLButtonElement, React.ButtonHTMLAttributes<HTMLButtonElement> & { tone?: TagProps["tone"] }>(
  ({ tone = "neutral", className, ...props }, ref) => (
    <button ref={ref} type="button" className={cn(tagVariants({ tone }), "cursor-pointer underline-offset-2 underline decoration-transparent hover:decoration-current focus-ring", className)} {...props} />
  ),
)
OperationalTag.displayName = "OperationalTag"

export { tagVariants }
