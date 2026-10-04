import * as React from "react"
import type { IconType } from "@/registry/icons"
import { cn } from "@/registry/lib/utils"
import { Icon, DrawnMark } from "@/registry/ui/icon"

/**
 * Option, the list item inside every dropdown list (Dropdown, Select, Combobox, MultiSelect). One row anatomy:
 *   [tick slot] [icon?] label / description?
 * The tick has a reserved left slot, so labels never move as it draws in or out. Highlighted = the accent row
 * (pointer or keyboard), text and tick invert. The WHOLE row is the target, never a checkbox inside it.
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

/**
 * Option rows. SINGLE choice (Dropdown, Combobox, Select): no tick, the chosen row is a selected row (soft selected
 * fill + medium weight). MULTIPLE choice (Multiselect): a tick in a reserved left slot (pl-8), so labels never move.
 */
export const itemClasses = cn(
  "group/item relative flex min-h-control-md w-full cursor-pointer items-center gap-2 rounded-inner-1.5 py-1 pr-2.5 pl-2.5 text-body outline-none select-none",
  // The selected fill yields to the highlight: a highlighted row is always full primary with white text.
  "aria-selected:font-medium data-[state=checked]:font-medium aria-selected:not-data-[highlighted]:bg-selected data-[state=checked]:not-data-[highlighted]:bg-selected",
  "data-[highlighted]:bg-primary data-[highlighted]:text-primary-foreground data-[highlighted]:[&_.text-muted-foreground]:text-primary-foreground/80 data-[highlighted]:[&_.text-helper]:text-primary-foreground/80 data-[disabled]:pointer-events-none data-[disabled]:text-disabled-foreground",
)

/** What one option shows. `meta` = a small label on the right; `trailingIcon` = a symbol on the right (either or both). */
export interface OptionContentProps {
  label: React.ReactNode
  description?: React.ReactNode
  icon?: IconType
  meta?: React.ReactNode
  trailingIcon?: IconType
  selected?: boolean
  /** Multiple choice: a tick in the left slot instead of a selected row. */
  multiple?: boolean
}

/** The inside of every option row, shared by Option and the Radix-based lists, so all dropdowns look the same. */
/** Multiple-choice rows reserve the left tick slot. */
export const multiItemClasses = "pl-8 aria-selected:not-data-[highlighted]:bg-transparent aria-selected:font-normal"

export function OptionContent({ label, description, icon, meta, trailingIcon, selected = false, multiple = false }: OptionContentProps) {
  return (
    <>
      {multiple && <DrawnMark on={selected} className={tickClasses} />}
      {icon && <Icon as={icon} className="text-muted-foreground" />}
      <span className="flex min-w-0 flex-1 flex-col">
        <span className="truncate">{label}</span>
        {description && <span className="text-caption text-helper">{description}</span>}
      </span>
      {(meta || trailingIcon) && (
        <span className="ml-2 flex shrink-0 items-center gap-1.5 text-muted-foreground">
          {meta && <span className="text-caption">{meta}</span>}
          {trailingIcon && <Icon as={trailingIcon} />}
        </span>
      )}
    </>
  )
}

export interface OptionProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "children">, OptionContentProps {
  highlighted?: boolean
  disabled?: boolean
}

export const Option = React.forwardRef<HTMLDivElement, OptionProps>(({ label, description, icon, meta, trailingIcon, selected = false, multiple = false, highlighted, disabled, className, ...props }, ref) => (
  <div
    ref={ref}
    role="option"
    aria-selected={selected}
    aria-disabled={disabled || undefined}
    data-disabled={disabled ? "" : undefined}
    data-highlighted={highlighted ? "" : undefined}
    className={cn(itemClasses, multiple && multiItemClasses, className)}
    {...props}
  >
    <OptionContent {...{ label, description, icon, meta, trailingIcon, selected, multiple }} />
  </div>
))
Option.displayName = "Option"

/** OptionList, the list surface, for static/in-page use (dropdowns render their own floating one). */
export function OptionList({ multiple, label = "Options", className, ...props }: React.HTMLAttributes<HTMLDivElement> & { multiple?: boolean; label?: string }) {
  return <div role="listbox" aria-label={label} aria-multiselectable={multiple || undefined} className={cn("flex w-64 flex-col scope-lg glass glass-3 p-1.5 text-foreground", className)} {...props} />
}
