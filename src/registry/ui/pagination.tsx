import { ChevronLeft, ChevronRight } from "@/registry/icons"
import { cn } from "@/registry/lib/utils"
import { IconButton } from "@/registry/ui/button"

/**
 * Pagination — split LARGE datasets (tables, lists) into pages the user can jump between, with page-size control.
 * Feeds/streams users scroll through → infinite loading ("Load more"). < 1 page → no pagination.
 */
export function Pagination({ page, pageSize, total, onPageChange, onPageSizeChange, pageSizes = [10, 25, 50, 100], itemLabel = "items", size = "md", className }: {
  page: number
  pageSize: number
  total: number
  onPageChange: (p: number) => void
  onPageSizeChange?: (s: number) => void
  pageSizes?: number[]
  itemLabel?: string
  size?: "sm" | "md" | "lg"
  className?: string
}) {
  const pages = Math.max(1, Math.ceil(total / pageSize))
  const start = total === 0 ? 0 : (page - 1) * pageSize + 1
  const end = Math.min(total, page * pageSize)
  const h = size === "sm" ? "h-control-sm" : size === "lg" ? "h-control-lg" : "h-control-md"
  const selectCls = "h-full appearance-none rounded-sm bg-transparent px-2 text-body text-foreground hover:bg-hover focus-ring cursor-pointer"
  return (
    <div className={cn("flex w-full items-center justify-between gap-2 border-t border-border-subtle bg-layer-1 text-body text-muted-foreground", h, className)}>
      <div className="flex h-full items-center gap-2 pl-4">
        {onPageSizeChange && (
          <label className="flex h-full items-center gap-2 border-r border-border-subtle pr-2">
            <span className="hidden sm:inline">{`${itemLabel[0].toUpperCase()}${itemLabel.slice(1)} per page:`}</span>
            <select aria-label={`${itemLabel} per page`} value={pageSize} onChange={(e) => onPageSizeChange(Number(e.target.value))} className={selectCls}>
              {pageSizes.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </label>
        )}
        <span className="tabular-nums" aria-live="polite">{start}–{end} of {total} {itemLabel}</span>
      </div>
      <div className="flex h-full items-center">
        <label className="flex h-full items-center gap-1 border-l border-border-subtle px-2">
          <select aria-label="Page number" value={page} onChange={(e) => onPageChange(Number(e.target.value))} className={cn(selectCls, "tabular-nums")}>
            {Array.from({ length: pages }, (_, i) => <option key={i} value={i + 1}>{i + 1}</option>)}
          </select>
          <span className="hidden tabular-nums sm:inline">of {pages} pages</span>
        </label>
        <div className="flex h-full border-l border-border-subtle">
          <IconButton icon={ChevronLeft} label="Previous page" size={size} disabled={page <= 1} onClick={() => onPageChange(page - 1)} className="h-full rounded-none" />
          <IconButton icon={ChevronRight} label="Next page" size={size} disabled={page >= pages} onClick={() => onPageChange(page + 1)} className="h-full rounded-none border-l border-border-subtle" />
        </div>
      </div>
    </div>
  )
}
