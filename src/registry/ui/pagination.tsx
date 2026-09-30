import { ChevronLeft, ChevronRight } from "@/registry/icons"
import { cn } from "@/registry/lib/utils"
import { IconButton } from "@/registry/ui/button"
import { AnimatedNumber } from "@/registry/ui/animated"
import { Dropdown } from "@/registry/ui/dropdown"

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
  return (
    <div className={cn("flex w-full items-center justify-between gap-2 border-t border-border-subtle bg-layer-1 text-body text-muted-foreground", h, className)}>
      <div className="flex h-full items-center gap-2 pl-4">
        {onPageSizeChange && (
          <div className="flex h-full items-center gap-1 border-r border-border-subtle pr-2">
            <span className="hidden sm:inline">{`${itemLabel[0].toUpperCase()}${itemLabel.slice(1)} per page`}</span>
            <Dropdown type="inline" hideLabel label={`${itemLabel} per page`} value={String(pageSize)} onValueChange={(v) => onPageSizeChange(Number(v))} items={pageSizes.map((s) => ({ value: String(s), label: String(s) }))} />
          </div>
        )}
        <span className="inline-flex items-baseline gap-1" aria-live="polite"><AnimatedNumber value={start} />–<AnimatedNumber value={end} /> of <AnimatedNumber value={total} /> {itemLabel}</span>
      </div>
      <div className="flex h-full items-center">
        <div className="flex h-full items-center gap-1 border-l border-border-subtle px-2">
          <Dropdown type="inline" hideLabel label="Page number" value={String(page)} onValueChange={(v) => onPageChange(Number(v))} items={Array.from({ length: pages }, (_, i) => ({ value: String(i + 1), label: String(i + 1) }))} />
          <span className="hidden sm:inline">of <AnimatedNumber value={pages} /> pages</span>
        </div>
        <div className="flex h-full border-l border-border-subtle">
          <IconButton icon={ChevronLeft} label="Previous page" size={size} disabled={page <= 1} onClick={() => onPageChange(page - 1)} className="h-full rounded-none" />
          <IconButton icon={ChevronRight} label="Next page" size={size} disabled={page >= pages} onClick={() => onPageChange(page + 1)} className="h-full rounded-none border-l border-border-subtle" />
        </div>
      </div>
    </div>
  )
}
