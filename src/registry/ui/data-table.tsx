import * as React from "react"
import { ArrowDown, ArrowUp, ArrowsVertical, ChevronRight } from "@/registry/icons"
import { cn } from "@/registry/lib/utils"
import { Icon } from "@/registry/ui/icon"
import { Checkbox } from "@/registry/ui/checkbox"
import { Button } from "@/registry/ui/button"
import { Skeleton } from "@/registry/ui/loading"

/**
 * DataTable — view, compare, sort, select and act on MANY records with the same attributes.
 * < ~5 rows & no actions → StructuredList. Non-uniform items → ContainedList or Tiles.
 *
 * Anatomy: title/description → toolbar (search · filter · primary action) → batch actions (on selection) → header → rows → pagination.
 */
export interface DataTableColumn<T> {
  key: string
  header: string
  /** Custom cell. Defaults to String(row[key]). */
  cell?: (row: T) => React.ReactNode
  sortable?: boolean
  /** Numbers & currency right-aligned with tabular numerals. */
  align?: "start" | "end"
  /** Value used for sorting when the cell is custom. */
  sortValue?: (row: T) => string | number
}

type SortState = { key: string; dir: "asc" | "desc" } | null
const rowH = { xs: "h-control-xs", sm: "h-control-sm", md: "h-control-md", lg: "h-control-lg", xl: "h-control-xl" } as const

export interface DataTableProps<T extends { id: string }> {
  title?: React.ReactNode
  description?: React.ReactNode
  columns: DataTableColumn<T>[]
  rows: T[]
  size?: keyof typeof rowH
  zebra?: boolean
  stickyHeader?: boolean
  selectable?: boolean
  selected?: string[]
  onSelectedChange?: (ids: string[]) => void
  /** Rendered in the batch bar when ≥1 row is selected. Receives selected ids. */
  batchActions?: (ids: string[]) => React.ReactNode
  /** Toolbar content: Search, filter button, primary action. */
  toolbar?: React.ReactNode
  /** Trailing per-row action, usually an OverflowMenu. */
  rowActions?: (row: T) => React.ReactNode
  renderExpanded?: (row: T) => React.ReactNode
  loading?: boolean
  emptyState?: React.ReactNode
  footer?: React.ReactNode
  className?: string
  label?: string
}

export function DataTable<T extends { id: string }>({
  title, description, columns, rows, size = "lg", zebra, stickyHeader, selectable, selected: selectedProp, onSelectedChange,
  batchActions, toolbar, rowActions, renderExpanded, loading, emptyState, footer, className, label,
}: DataTableProps<T>) {
  const [sort, setSort] = React.useState<SortState>(null)
  const [innerSel, setInnerSel] = React.useState<string[]>([])
  const [open, setOpen] = React.useState<Set<string>>(new Set())
  const selected = selectedProp ?? innerSel
  const setSelected = (ids: string[]) => { setInnerSel(ids); onSelectedChange?.(ids) }

  const sorted = React.useMemo(() => {
    if (!sort) return rows
    const col = columns.find((c) => c.key === sort.key)
    const get = (r: T) => (col?.sortValue ? col.sortValue(r) : (r as Record<string, unknown>)[sort.key]) as string | number
    return [...rows].sort((a, b) => {
      const va = get(a), vb = get(b)
      const cmp = typeof va === "number" && typeof vb === "number" ? va - vb : String(va).localeCompare(String(vb), undefined, { numeric: true })
      return sort.dir === "asc" ? cmp : -cmp
    })
  }, [rows, sort, columns])

  const allSel = rows.length > 0 && selected.length === rows.length
  const someSel = selected.length > 0 && !allSel
  const cycleSort = (key: string) =>
    setSort((s) => (s?.key !== key ? { key, dir: "asc" } : s.dir === "asc" ? { key, dir: "desc" } : null))

  const colCount = columns.length + (selectable ? 1 : 0) + (renderExpanded ? 1 : 0) + (rowActions ? 1 : 0)
  const cellPad = "px-4"

  return (
    <section className={cn("flex w-full flex-col overflow-hidden rounded-lg bg-layer-1", className)} aria-label={typeof title === "string" ? title : label}>
      {(title || description) && (
        <header className="flex flex-col gap-1 px-4 pt-4 pb-6">
          {title && <h3 className="text-title-3">{title}</h3>}
          {description && <p className="text-body text-muted-foreground">{description}</p>}
        </header>
      )}
      {(toolbar || batchActions) && (
        <div className="relative flex h-control-lg items-center">
          {toolbar && <div className="flex h-full w-full items-center justify-end gap-1 pl-2">{toolbar}</div>}
          {batchActions && selected.length > 0 && (
            <div className="absolute inset-0 flex animate-enter-fade items-center bg-primary text-primary-foreground">
              <span className="px-4 text-body tabular-nums" aria-live="polite">{selected.length} {selected.length === 1 ? "item" : "items"} selected</span>
              <div className="ml-auto flex h-full items-center [&_button]:h-full [&_button]:rounded-none [&_button]:bg-transparent [&_button]:text-primary-foreground [&_button:hover]:bg-primary-hover">
                {batchActions(selected)}
                <span aria-hidden className="h-4 w-px bg-primary-foreground/40" />
                <Button variant="primary" onClick={() => setSelected([])}>Cancel</Button>
              </div>
            </div>
          )}
        </div>
      )}
      <div className={cn("w-full overflow-x-auto", stickyHeader && "max-h-120 overflow-y-auto")}>
        <table className="w-full border-collapse text-body" aria-label={typeof title === "string" ? title : label}>
          <thead className={cn("bg-layer-3", stickyHeader && "sticky top-0 z-10")}>
            <tr className={rowH[size === "xl" ? "lg" : size]}>
              {renderExpanded && <th className="w-control-md"><span className="sr-only">Expand</span></th>}
              {selectable && (
                <th className="w-control-md pl-4">
                  <Checkbox aria-label="Select all rows" checked={allSel ? true : someSel ? "indeterminate" : false} onCheckedChange={() => setSelected(allSel ? [] : rows.map((r) => r.id))} />
                </th>
              )}
              {columns.map((c) => {
                const active = sort?.key === c.key
                const aria = active ? (sort!.dir === "asc" ? "ascending" : "descending") : c.sortable ? "none" : undefined
                return (
                  <th key={c.key} scope="col" aria-sort={aria} className={cn("text-footnote font-semibold text-foreground", c.align === "end" ? "text-right" : "text-left", !c.sortable && cellPad)}>
                    {c.sortable ? (
                      <button type="button" onClick={() => cycleSort(c.key)} className={cn("group flex h-full w-full items-center gap-2 px-4 py-2 transition-colors hover:bg-layer-2 focus-ring-inset", c.align === "end" && "flex-row-reverse")}>
                        {c.header}
                        <Icon as={active ? (sort!.dir === "asc" ? ArrowUp : ArrowDown) : ArrowsVertical} className={cn(!active && "opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100")} />
                      </button>
                    ) : (
                      c.header
                    )}
                  </th>
                )
              })}
              {rowActions && <th className="w-control-md"><span className="sr-only">Actions</span></th>}
            </tr>
          </thead>
          <tbody>
            {loading &&
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i} className={cn(rowH[size], "border-b border-border-subtle")}>
                  {Array.from({ length: colCount }).map((__, j) => (
                    <td key={j} className={cellPad}><Skeleton shape="text" className="w-3/4" /></td>
                  ))}
                </tr>
              ))}
            {!loading && rows.length === 0 && (
              <tr><td colSpan={colCount} className="p-0">{emptyState}</td></tr>
            )}
            {!loading &&
              sorted.map((row, idx) => {
                const isSel = selected.includes(row.id)
                const isOpen = open.has(row.id)
                return (
                  <React.Fragment key={row.id}>
                    <tr
                      aria-selected={selectable ? isSel : undefined}
                      className={cn(
                        rowH[size],
                        "border-b border-border-subtle transition-colors duration-fast-02 hover:bg-hover",
                        zebra && idx % 2 === 1 && "bg-layer-2",
                        isSel && "bg-selected hover:bg-selected",
                      )}
                    >
                      {renderExpanded && (
                        <td className="pl-2">
                          <button type="button" aria-expanded={isOpen} aria-label={isOpen ? "Collapse row" : "Expand row"} onClick={() => setOpen((s) => { const n = new Set(s); if (n.has(row.id)) n.delete(row.id); else n.add(row.id); return n })} className="flex size-control-sm items-center justify-center rounded-sm hover:bg-hover focus-ring">
                            <Icon as={ChevronRight} className={cn("transition-transform duration-moderate-01 ease-productive", isOpen && "rotate-90")} />
                          </button>
                        </td>
                      )}
                      {selectable && (
                        <td className="pl-4">
                          <Checkbox aria-label={`Select row ${idx + 1}`} checked={isSel} onCheckedChange={() => setSelected(isSel ? selected.filter((s) => s !== row.id) : [...selected, row.id])} />
                        </td>
                      )}
                      {columns.map((c) => (
                        <td key={c.key} className={cn(cellPad, "whitespace-nowrap text-muted-foreground first-of-type:text-foreground", c.align === "end" && "text-right tabular-nums")}>
                          {c.cell ? c.cell(row) : String((row as Record<string, unknown>)[c.key] ?? "")}
                        </td>
                      ))}
                      {rowActions && <td className="pr-2 text-right">{rowActions(row)}</td>}
                    </tr>
                    {renderExpanded && isOpen && (
                      <tr className="border-b border-border-subtle bg-layer-2">
                        <td colSpan={colCount} className="animate-enter-fade px-4 py-4 pl-14">{renderExpanded(row)}</td>
                      </tr>
                    )}
                  </React.Fragment>
                )
              })}
          </tbody>
        </table>
      </div>
      {footer}
    </section>
  )
}
