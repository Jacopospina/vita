import * as React from "react"
import { Collapsible } from "radix-ui"
import { ArrowRight, CheckmarkFilled, ChevronDown, RadioButton as RadioEmpty, Checkbox as CheckboxEmpty } from "@/registry/icons"
import { cn } from "@/registry/lib/utils"
import { Icon } from "@/registry/ui/icon"
import { useTilt } from "@/registry/hooks/use-tilt"

/**
 * Tile — a surface that groups related content (a card that defers to its content).
 *   base        → static container. Don't nest tiles.
 *   clickable   → the WHOLE tile navigates somewhere (one destination, no inner buttons).
 *   selectable  → choosing among rich options (plans, templates). Single = radio semantics, multi = checkbox.
 *   expandable  → shows a summary; reveals details on demand.
 */
const base = "relative flex flex-col gap-2 scope-lg bg-layer-1 p-4 text-foreground"

export function Tile({ className, elevated, ...props }: React.HTMLAttributes<HTMLDivElement> & { elevated?: boolean }) {
  return <div className={cn(base, elevated && "border border-border-subtle bg-raised shadow-raised", className)} {...props} />
}

export const ClickableTile = React.forwardRef<HTMLAnchorElement, React.AnchorHTMLAttributes<HTMLAnchorElement> & { disabled?: boolean }>(
  ({ className, children, disabled, ...props }, ref) => {
    const tilt = useTilt<HTMLAnchorElement>({ max: 6, lift: 1.02 }, { onPointerMove: props.onPointerMove, onPointerLeave: props.onPointerLeave })
    return (
      <a
        ref={ref}
        aria-disabled={disabled || undefined}
        className={cn(
          base,
          "tilt group cursor-pointer pb-12 duration-moderate-01 ease-spring hover:bg-layer-2 hover:shadow-floating focus-ring active:scale-99",
          disabled && "pointer-events-none text-disabled-foreground",
          className,
        )}
        {...props}
        {...tilt}
      >
        {children}
        <Icon as={ArrowRight} size="md" className="absolute right-4 bottom-4 text-primary duration-moderate-01 ease-productive group-hover:translate-x-1" />
      </a>
    )
  },
)
ClickableTile.displayName = "ClickableTile"

export interface SelectableTileProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "onChange"> {
  selected: boolean
  onSelectedChange: (selected: boolean) => void
  /** "single" behaves like a radio (use inside role="radiogroup"), "multi" like a checkbox. */
  mode?: "single" | "multi"
}

export function SelectableTile({ selected, onSelectedChange, mode = "multi", className, children, disabled, ...props }: SelectableTileProps) {
  const tilt = useTilt<HTMLButtonElement>({ max: 6, lift: 1.02 }, { onPointerMove: props.onPointerMove, onPointerLeave: props.onPointerLeave })
  return (
    <button
      type="button"
      role={mode === "single" ? "radio" : "checkbox"}
      aria-checked={selected}
      disabled={disabled}
      onClick={() => onSelectedChange(mode === "single" ? true : !selected)}
      className={cn(
        base,
        "tilt cursor-pointer border border-transparent text-left duration-moderate-01 ease-spring hover:bg-layer-2 hover:shadow-floating focus-ring",
        selected && "border-primary bg-selected hover:bg-selected",
        disabled && "pointer-events-none text-disabled-foreground",
        className,
      )}
      {...props}
      {...tilt}
    >
      <span className="absolute top-4 right-4 flex text-primary">
        {/* Empty and selected marks are stacked and cross-fade. */}
        <Icon as={mode === "single" ? RadioEmpty : CheckboxEmpty} size="md" className={cn("text-border-strong duration-moderate-01", selected ? "scale-75 opacity-0" : "opacity-100")} />
        <Icon as={CheckmarkFilled} size="md" className={cn("absolute inset-0 duration-moderate-01 ease-spring", selected ? "scale-100 opacity-100" : "scale-50 opacity-0")} />
      </span>
      <div className="pr-8">{children}</div>
    </button>
  )
}

export function ExpandableTile({ summary, children, defaultOpen, className }: { summary: React.ReactNode; children: React.ReactNode; defaultOpen?: boolean; className?: string }) {
  return (
    <Collapsible.Root defaultOpen={defaultOpen} className={cn(base, "p-0", className)}>
      <Collapsible.Trigger className="group flex w-full items-start justify-between gap-4 rounded-lg p-4 text-left hover:bg-layer-2 focus-ring">
        <div className="min-w-0 flex-1">{summary}</div>
        <Icon as={ChevronDown} size="md" className="mt-0.5 text-muted-foreground duration-moderate-01 ease-productive group-data-[state=open]:rotate-180" />
      </Collapsible.Trigger>
      <Collapsible.Content className="overflow-hidden data-[state=closed]:animate-collapse data-[state=open]:animate-expand">
        <div className="px-4 pb-4">{children}</div>
      </Collapsible.Content>
    </Collapsible.Root>
  )
}

/** TileGroup — selectable tiles in a grid. single → radiogroup semantics. */
export function TileGroup({ label, mode = "single", className, children }: { label: string; mode?: "single" | "multi"; className?: string; children: React.ReactNode }) {
  return (
    <div role={mode === "single" ? "radiogroup" : "group"} aria-label={label} className={cn("grid gap-4 sm:grid-cols-2 lg:grid-cols-3", className)}>
      {children}
    </div>
  )
}

/**
 * TileSet — cards that share one meaning are ONE object (belonging has no gaps).
 * The set owns the surface: background, radius, clipping. Items inside are flat — no background,
 * no radius — separated only by hairlines.
 */
export function TileSet({ columns = 2, tone = "default", className, children }: { columns?: 1 | 2 | 3; tone?: "default" | "negative" | "positive"; className?: string; children: React.ReactNode }) {
  return (
    <div className={cn("overflow-hidden scope-lg", tone === "negative" ? "bg-error-subtle" : tone === "positive" ? "bg-success-subtle" : "bg-layer-1", className)}>
      <div className={cn("-mr-px -mb-px grid", columns === 2 && "md:grid-cols-2", columns === 3 && "md:grid-cols-2 lg:grid-cols-3")}>{children}</div>
    </div>
  )
}

export function TileSetItem({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("flex flex-col gap-2 border-r border-b border-border-subtle p-4 text-foreground", className)} {...props} />
}
