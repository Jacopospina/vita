import * as React from "react"
import { cn } from "@/registry/lib/utils"
import { DrawnMark } from "@/registry/ui/icon"

/**
 * StructuredList, a small, read-mostly set of rows with a few columns: key/value details, plan comparison, spec sheets.
 * No sorting, pagination, bulk actions → that's a DataTable. Selectable variant = choose one row (radio semantics).
 */
export function StructuredList({ columns, rows, selectable, value, onValueChange, condensed, flush, label, className }: {
  columns: React.ReactNode[]
  rows: { id: string; cells: React.ReactNode[] }[]
  selectable?: boolean
  value?: string
  onValueChange?: (id: string) => void
  condensed?: boolean
  /** Remove outer horizontal padding to align with surrounding text. */
  flush?: boolean
  label: string
  className?: string
}) {
  const cell = cn(condensed ? "py-1.5" : "py-2.5", flush ? "pr-3 first:pl-0" : "px-3", "text-left align-top")
  return (
    // Scrolls sideways on a narrow screen instead of pushing the page wider.
    <div className="max-w-full overflow-x-auto">
    <table aria-label={label} role={selectable ? "radiogroup" : undefined} className={cn("w-full border-collapse text-body", className)}>
      <thead>
        <tr className="border-b border-border">
          {columns.map((c, i) => (
            <th key={i} scope="col" className={cn(cell, "text-footnote font-semibold text-foreground")}>{c}</th>
          ))}
          {selectable && <th className="w-10"><span className="sr-only">Selected</span></th>}
        </tr>
      </thead>
      <tbody>
        {rows.map((r) => {
          const selected = value === r.id
          return (
            <tr
              key={r.id}
              role={selectable ? "radio" : undefined}
              aria-checked={selectable ? selected : undefined}
              tabIndex={selectable ? 0 : undefined}
              onClick={selectable ? () => onValueChange?.(r.id) : undefined}
              onKeyDown={selectable ? (e) => (e.key === " " || e.key === "Enter") && onValueChange?.(r.id) : undefined}
              className={cn("border-b border-border-subtle", selectable && "cursor-pointer hover:bg-hover focus-ring-inset", selected && "bg-selected hover:bg-selected")}
            >
              {r.cells.map((c, i) => (
                <td key={i} className={cn(cell, i === 0 ? "font-medium text-foreground" : "text-muted-foreground")}>{c}</td>
              ))}
              {selectable && <td className={cell}><DrawnMark on={selected} className="text-primary" /></td>}
            </tr>
          )
        })}
      </tbody>
    </table>
    </div>
  )
}
