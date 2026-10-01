import * as React from "react"
import type { IconType } from "@/registry/icons"
import { cn } from "@/registry/lib/utils"
import { Icon, DrawnMark } from "@/registry/ui/icon"

/**
 * Option — the list item inside every dropdown list (Dropdown, Select, Combobox, MultiSelect). One row anatomy:
 *   [tick slot] [icon?] label / description?
 * The tick has a reserved left slot, so labels never move as it draws in or out. Highlighted = the accent row
 * (pointer or keyboard), text and tick invert. The WHOLE row is the target — never a checkbox inside it.
 * Actions (verbs) belong in a Menu item, not an Option.
 */

// Menu-style list surface: 6px inset, rows 28px with 10px side padding, concentric 6px row radius (12 − 6).
export const listClasses = cn(
  "z-50 max-h-80 min-w-(--radix-select-trigger-width) overflow-hidden scope-lg glass glass-3 p-1.5 text-foreground",
  // Slides in from below the field (no scale, no width growth) and sinks back out.
  "data-[state=open]:animate-enter-list data-[state=closed]:animate-exit-list",
)

/** The selection tick: left slot, primary; turns white with the text on the highlighted row. */
export const tickClasses = "absolute left-2.5 text-primary group-data-[highlighted]/item:text-primary-foreground"

export const itemClasses = cn(
  // The selection tick lives in a reserved left slot (pl-8), so labels never move when it draws in or out.
  "group/item relative flex min-h-control-md w-full cursor-default items-center gap-2 rounded-inner-1.5 py-1 pr-2.5 pl-8 text-body outline-none select-none",
  "data-[highlighted]:bg-primary data-[highlighted]:text-primary-foreground data-[highlighted]:[&_.text-muted-foreground]:text-primary-foreground/80 data-[highlighted]:[&_.text-helper]:text-primary-foreground/80 data-[disabled]:pointer-events-none data-[disabled]:text-disabled-foreground",
)

export interface OptionProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "children"> {
  label: React.ReactNode
  description?: React.ReactNode
  icon?: IconType
  selected?: boolean
  highlighted?: boolean
  disabled?: boolean
}

export const Option = React.forwardRef<HTMLDivElement, OptionProps>(({ label, description, icon, selected = false, highlighted, disabled, className, ...props }, ref) => (
  <div
    ref={ref}
    role="option"
    aria-selected={selected}
    aria-disabled={disabled || undefined}
    data-disabled={disabled ? "" : undefined}
    data-highlighted={highlighted ? "" : undefined}
    className={cn(itemClasses, className)}
    {...props}
  >
    <DrawnMark on={selected} className={tickClasses} />
    {icon && <Icon as={icon} className="text-muted-foreground" />}
    <span className="flex min-w-0 flex-col">
      <span className="truncate">{label}</span>
      {description && <span className="text-caption text-helper">{description}</span>}
    </span>
  </div>
))
Option.displayName = "Option"

/** OptionList — the list surface, for static/in-page use (dropdowns render their own floating one). */
export function OptionList({ multiple, className, ...props }: React.HTMLAttributes<HTMLDivElement> & { multiple?: boolean }) {
  return <div role="listbox" aria-multiselectable={multiple || undefined} className={cn("flex w-64 flex-col scope-lg glass glass-3 p-1.5 text-foreground", className)} {...props} />
}
