import * as React from "react"
import { cn } from "@/registry/lib/utils"

/**
 * ContainedList — a titled list of similar items, each a row that may hold an action (members, connected apps, recent files).
 * Needs sorting/columns → DataTable. Pure text bullets → List.
 */
export function ContainedList({ label, action, kind = "on-page", size = "md", className, children }: {
  label: React.ReactNode
  /** Action for the whole list, e.g. "Add member" button or a Search. */
  action?: React.ReactNode
  /** on-page = full width with section header · disclosed = inside a popover/panel, compact header */
  kind?: "on-page" | "disclosed"
  size?: "sm" | "md" | "lg"
  className?: string
  children: React.ReactNode
}) {
  const id = React.useId()
  return (
    <section data-size={size} className={cn("group/list flex w-full flex-col", className)} aria-labelledby={id}>
      <div className={cn("flex items-center justify-between gap-2 border-b border-border-subtle", kind === "on-page" ? "min-h-control-md pb-2" : "min-h-control-sm")}>
        <h3 id={id} className={kind === "on-page" ? "text-headline" : "text-footnote font-medium text-muted-foreground"}>{label}</h3>
        {action}
      </div>
      <ul role="list">{children}</ul>
    </section>
  )
}

export function ContainedListItem({ icon, action, onClick, disabled, className, children }: {
  icon?: React.ReactNode
  /** Trailing action (IconButton / OverflowMenu). Don't combine with onClick. */
  action?: React.ReactNode
  onClick?: () => void
  disabled?: boolean
  className?: string
  children: React.ReactNode
}) {
  const inner = (
    <>
      {icon && <span className="flex shrink-0 text-muted-foreground">{icon}</span>}
      <div className="min-w-0 flex-1">{children}</div>
    </>
  )
  const row = cn(
    "flex w-full items-center gap-3 px-4 text-left text-body",
    "min-h-control-md group-data-[size=sm]/list:min-h-control-sm group-data-[size=lg]/list:min-h-control-lg",
  )
  return (
    <li className={cn("flex items-center border-b border-border-subtle", className)}>
      {onClick ? (
        <button type="button" disabled={disabled} onClick={onClick} className={cn(row, "transition-colors duration-fast-02 hover:bg-hover focus-ring-inset disabled:text-disabled-foreground")}>
          {inner}
        </button>
      ) : (
        <div className={cn(row, disabled && "text-disabled-foreground")}>{inner}</div>
      )}
      {action && <div className="shrink-0 pr-2">{action}</div>}
    </li>
  )
}
