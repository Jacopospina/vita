import * as React from "react"
import { Collapsible } from "radix-ui"
import { ArrowRight, CheckmarkFilled, ChevronDown, RadioButton as RadioEmpty, Checkbox as CheckboxEmpty } from "@/registry/icons"
import { cn } from "@/registry/lib/utils"
import { Icon } from "@/registry/ui/icon"

/**
 * Tile — a surface that groups related content (a card that defers to its content).
 *   base        → static container. Don't nest tiles.
 *   clickable   → the WHOLE tile navigates somewhere (one destination, no inner buttons).
 *   selectable  → choosing among rich options (plans, templates). Single = radio semantics, multi = checkbox.
 *   expandable  → shows a summary; reveals details on demand.
 */
const base = "relative flex flex-col gap-2 rounded-lg bg-layer-1 p-4 text-foreground"

export function Tile({ className, elevated, ...props }: React.HTMLAttributes<HTMLDivElement> & { elevated?: boolean }) {
  return <div className={cn(base, elevated && "border border-border-subtle bg-raised shadow-raised", className)} {...props} />
}

export const ClickableTile = React.forwardRef<HTMLAnchorElement, React.AnchorHTMLAttributes<HTMLAnchorElement> & { disabled?: boolean }>(
  ({ className, children, disabled, ...props }, ref) => (
    <a
      ref={ref}
      aria-disabled={disabled || undefined}
      className={cn(
        base,
        "group cursor-pointer pb-12 transition-[background-color,box-shadow,transform] duration-fast-02 ease-productive hover:bg-layer-2 focus-ring active:scale-99",
        disabled && "pointer-events-none text-disabled-foreground",
        className,
      )}
      {...props}
    >
      {children}
      <Icon as={ArrowRight} size="md" className="absolute right-4 bottom-4 text-primary transition-transform duration-moderate-01 ease-productive group-hover:translate-x-1" />
    </a>
  ),
)
ClickableTile.displayName = "ClickableTile"

export interface SelectableTileProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "onChange"> {
  selected: boolean
  onSelectedChange: (selected: boolean) => void
  /** "single" behaves like a radio (use inside role="radiogroup"), "multi" like a checkbox. */
  mode?: "single" | "multi"
}

export function SelectableTile({ selected, onSelectedChange, mode = "multi", className, children, disabled, ...props }: SelectableTileProps) {
  return (
    <button
      type="button"
      role={mode === "single" ? "radio" : "checkbox"}
      aria-checked={selected}
      disabled={disabled}
      onClick={() => onSelectedChange(mode === "single" ? true : !selected)}
      className={cn(
        base,
        "cursor-pointer border border-transparent text-left transition-[background-color,border-color] duration-fast-02 ease-productive hover:bg-layer-2 focus-ring",
        selected && "border-primary bg-selected hover:bg-selected",
        disabled && "pointer-events-none text-disabled-foreground",
        className,
      )}
      {...props}
    >
      <span className="absolute top-4 right-4 flex text-primary">
        {selected ? <Icon as={CheckmarkFilled} size="md" /> : <Icon as={mode === "single" ? RadioEmpty : CheckboxEmpty} size="md" className="text-border-strong" />}
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
        <Icon as={ChevronDown} size="md" className="mt-0.5 text-muted-foreground transition-transform duration-moderate-01 ease-productive group-data-[state=open]:rotate-180" />
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
