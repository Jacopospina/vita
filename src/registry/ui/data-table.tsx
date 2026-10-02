import * as React from "react"
import { ArrowDown, ArrowUp, ArrowsVertical, ChevronDown, Close } from "@/registry/icons"
import { cn } from "@/registry/lib/utils"
import { Icon, SwapIcon } from "@/registry/ui/icon"
import { Checkbox } from "@/registry/ui/checkbox"
import { IconButton } from "@/registry/ui/button"
import { Skeleton } from "@/registry/ui/loading"
import { AnimatedNumber, AnimatedText } from "@/registry/ui/animated"
import { morph, useMorphId } from "@/registry/hooks/use-morph"

/**
 * DataTable, view, compare, sort, select and act on MANY records with the same attributes.
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
/** True while a sticky element is pinned (its in-flow sentinel has scrolled above it), i.e. content runs beneath it. */
function useStuck() {
  const sentinel = React.useRef<HTMLDivElement>(null)
  const sticky = React.useRef<HTMLDivElement>(null)
  const [stuck, setStuck] = React.useState(false)
  React.useEffect(() => {
    // Two rect reads per scroll event; React skips the render when the answer hasn't changed.
    const check = () => {
      const a = sentinel.current?.getBoundingClientRect(), b = sticky.current?.getBoundingClientRect()
      if (a && b) setStuck(a.top < b.top - 0.5)
    }
    check()
    window.addEventListener("scroll", check, { capture: true, passive: true })
    window.addEventListener("resize", check)
    return () => { window.removeEventListener("scroll", check, { capture: true }); window.removeEventListener("resize", check) }
  }, [])
  return { sentinel, sticky, stuck }
}

const rowH = { xs: "h-control-xs", sm: "h-control-sm", md: "h-control-md", lg: "h-10", xl: "h-11" } as const

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
  title, description, columns, rows, size = "xl", zebra, stickyHeader, selectable, selected: selectedProp, onSelectedChange,
  batchActions, toolbar, rowActions, renderExpanded, loading, emptyState, footer, className, label,
}: DataTableProps<T>) {
  const [sort, setSort] = React.useState<SortState>(null)
  const mid = useMorphId()
  const { sentinel: stripSentinel, sticky: stripRef, stuck } = useStuck()
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

  const selecting = selected.length > 0
  const allSel = rows.length > 0 && selected.length === rows.length
  const someSel = selected.length > 0 && !allSel
  // Re-sorting MORPHS: each row glides to its new position.
  const cycleSort = (key: string) =>
    morph(() => setSort((s) => (s?.key !== key ? { key, dir: "asc" } : s.dir === "asc" ? { key, dir: "desc" } : null)))

  const colCount = columns.length + (selectable ? 1 : 0) + (renderExpanded ? 1 : 0) + (rowActions ? 1 : 0)
  const cellPad = "px-3"

  return (
    <section className={cn("flex w-full flex-col overflow-clip scope-xl bg-layer-1 [--vita-inset-r:max(0px,calc(var(--vita-scope-r)-var(--spacing)*2.5))]", className)} aria-label={typeof title === "string" ? title : label}>
      {(title || description) && (
        <header className={cn("flex flex-col gap-1 px-3 pt-3", toolbar || batchActions ? "pb-0" : "pb-3")}>
          {title && <h3 className="text-title-3">{title}</h3>}
          {description && <p className="text-body text-muted-foreground">{description}</p>}
        </header>
      )}
      {(toolbar || batchActions) && (
        // ONE strip that MORPHS: toolbar ⇄ selection bar in the same place, with space before the table.
        // Same inset in both states (toolbar and selection bar), a notch tighter than the header.
        // STICKY: it stays in reach while the rows scroll (overflow-clip on the section keeps sticky working).
        // The wrapper is transparent; once pinned, the bar itself frosts over the rows running beneath it.
        <>
        <div ref={stripSentinel} aria-hidden className="h-0" />
        {/* Sticks just below the shell's floating header (--vita-shell-top), not behind it. */}
        <div ref={stripRef} className="sticky top-[var(--vita-shell-top,0px)] z-20 p-2.5">
          <div
            className={cn(
              "grid min-h-control-lg items-center rounded-outer-1 p-1 motion-expressive [grid-template-areas:'bar']",
              selecting ? "border border-transparent bg-primary text-primary-foreground shadow-raised" : stuck ? "glass glass-4" : "border border-transparent bg-layer-2",
            )}
          >
            {toolbar && (
              <div
                inert={selecting || undefined}
                className={cn("flex items-center justify-end gap-2 motion-expressive [grid-area:bar] [&>[role=search]]:min-w-0 [&>[role=search]]:flex-1 max-sm:flex-wrap max-sm:[&>[role=search]]:basis-full", selecting ? "pointer-events-none scale-98 opacity-0 blur-xs" : "opacity-100")}
              >
                {toolbar}
              </div>
            )}
            {batchActions && (
              <div
                inert={!selecting || undefined}
                className={cn("flex items-center gap-2 motion-expressive [grid-area:bar]", selecting ? "opacity-100" : "pointer-events-none scale-98 opacity-0 blur-xs")}
              >
                <span className="inline-flex items-baseline gap-1 pl-2 text-body" aria-live="polite">
                  <AnimatedNumber value={selected.length} /> <AnimatedText>{selected.length === 1 ? "item selected" : "items selected"}</AnimatedText>
                </span>
                <div className="ml-auto flex items-center gap-1 [&_button]:bg-transparent [&_button]:text-primary-foreground [&_button:hover]:bg-primary-hover">
                  {batchActions(selected)}
                  <IconButton icon={Close} label="Clear selection" shortcut="escape" variant="primary" onClick={() => setSelected([])} />
                </div>
              </div>
            )}
          </div>
        </div>
        </>
      )}
      {/* Inset like the toolbar strip above; the header row is a rounded band (separate borders allow cell radius). */}
      <div className={cn("w-full overflow-x-auto px-2.5", stickyHeader && "max-h-120 overflow-y-auto")}>
        <table className="w-full border-separate border-spacing-0 text-body" aria-label={typeof title === "string" ? title : label}>
          <thead className={cn(stickyHeader && "sticky top-0 z-10")}>
            <tr className={cn(rowH[size === "xl" ? "lg" : size], "[&>th]:bg-layer-3 [&>th:first-child]:rounded-l-(--vita-inset-r) [&>th:last-child]:rounded-r-(--vita-inset-r)")}>
              {renderExpanded && <th className="w-control-md"><span className="sr-only">Expand</span></th>}
              {selectable && (
                <th className="w-control-md pl-3">
                  <Checkbox aria-label="Select all rows" checked={allSel ? true : someSel ? "indeterminate" : false} onCheckedChange={() => setSelected(allSel ? [] : rows.map((r) => r.id))} />
                </th>
              )}
              {columns.map((c) => {
                const active = sort?.key === c.key
                const aria = active ? (sort!.dir === "asc" ? "ascending" : "descending") : c.sortable ? "none" : undefined
                return (
                  <th key={c.key} scope="col" aria-sort={aria} className={cn("text-footnote font-semibold text-foreground", c.align === "end" ? "text-right" : "text-left", !c.sortable && cellPad)}>
                    {c.sortable ? (
                      <button type="button" onClick={() => cycleSort(c.key)} className={cn("group flex h-full w-full items-center gap-2 rounded-(--vita-inset-r) px-3 py-1.5 duration-fast-02 hover:bg-layer-2 focus-ring-inset", c.align === "end" && "flex-row-reverse")}>
                        {c.header}
                        <SwapIcon as={active ? (sort!.dir === "asc" ? ArrowUp : ArrowDown) : ArrowsVertical} className={cn(!active && "opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100 pointer-coarse:opacity-60")} />
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
                <tr key={i} className={cn(rowH[size], "[&>td]:divider-b")}>
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
                      style={{ viewTransitionName: `${mid}-${row.id.replace(/[^a-zA-Z0-9_-]/g, "")}` }}
                      aria-selected={selectable ? isSel : undefined}
                      className={cn(
                        rowH[size],
                        // Rows are rounded bands like the header: the fill lives on the cells so the end cells can carry the inset radius.
                        "animate-enter-fade [&>td]:divider-b [&>td]:duration-fast-02 hover:[&>td]:bg-hover [&>td:first-child]:rounded-l-(--vita-inset-r) [&>td:last-child]:rounded-r-(--vita-inset-r)",
                        zebra && idx % 2 === 1 && "[&>td]:bg-layer-2",
                        isSel && "[&>td]:bg-selected hover:[&>td]:bg-selected",
                      )}
                    >
                      {renderExpanded && (
                        <td className="pl-2">
                          <button type="button" aria-expanded={isOpen} aria-label={isOpen ? "Collapse row" : "Expand row"} onClick={() => setOpen((s) => { const n = new Set(s); if (n.has(row.id)) n.delete(row.id); else n.add(row.id); return n })} className="flex size-control-sm items-center justify-center rounded-sm hover:bg-hover focus-ring">
                            <Icon as={ChevronDown} className={cn(" duration-moderate-01 ease-productive", isOpen && "rotate-180")} />
                          </button>
                        </td>
                      )}
                      {selectable && (
                        <td className="pl-3">
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
                      <tr className="[&>td]:divider-b">
                        <td colSpan={colCount} className="animate-enter-fade rounded-(--vita-inset-r) bg-layer-2 px-3 py-3 pl-12">{renderExpanded(row)}</td>
                      </tr>
                    )}
                  </React.Fragment>
                )
              })}
          </tbody>
        </table>
      </div>
      {/* Footer (pagination) sits in the same 10px inset as the toolbar strip and the table. */}
      {footer && <div className="p-2.5">{footer}</div>}
    </section>
  )
}
