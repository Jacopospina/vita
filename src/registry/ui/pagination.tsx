import { ChevronLeft, ChevronRight } from "@/registry/icons"
import { cn } from "@/registry/lib/utils"
import { IconButton } from "@/registry/ui/button"
import { AnimatedNumber } from "@/registry/ui/animated"
import { Dropdown } from "@/registry/ui/dropdown"

/**
 * Pagination, split LARGE datasets (tables, lists) into pages the user can jump between, with page-size control.
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
  // A band like the table toolbar: rounded (concentric with the table card via --vita-inset-r, else the field
  // radius), small inset; pills inside follow the formula (band radius − 4px inset); dividers are inset too.
  const pill = "rounded-[max(0px,calc(var(--vita-inset-r,var(--vita-radius-md))-var(--spacing)))] [corner-shape:round]"
  const divider = <span aria-hidden className="my-1.5 w-px self-stretch bg-divider" />
  return (
    <div className={cn("flex w-full items-center justify-between gap-2 rounded-(--vita-inset-r,var(--vita-radius-md)) bg-layer-2 p-1 text-body text-muted-foreground", className)}>
      <div className={cn("flex items-center gap-2 pl-3", h)}>
        {onPageSizeChange && (
          <>
            {/* Phones keep the range and the page controls; the page size waits for a wider screen. */}
            <div className="flex items-center gap-1 max-sm:hidden">
              <span className="hidden sm:inline">{`${itemLabel[0].toUpperCase()}${itemLabel.slice(1)} per page`}</span>
              <Dropdown type="inline" hideLabel label={`${itemLabel} per page`} value={String(pageSize)} onValueChange={(v) => onPageSizeChange(Number(v))} items={pageSizes.map((s) => ({ value: String(s), label: String(s) }))} />
            </div>
            <span className="contents max-sm:hidden">{divider}</span>
          </>
        )}
        <span className="inline-flex items-baseline gap-1" aria-live="polite"><AnimatedNumber value={start} />–<AnimatedNumber value={end} /> of <AnimatedNumber value={total} /> {itemLabel}</span>
      </div>
      <div className={cn("flex items-center gap-1", h)}>
        <div className="flex items-center gap-1 px-1">
          <Dropdown type="inline" hideLabel label="Page number" value={String(page)} onValueChange={(v) => onPageChange(Number(v))} items={Array.from({ length: pages }, (_, i) => ({ value: String(i + 1), label: String(i + 1) }))} />
          <span className="hidden sm:inline">of <AnimatedNumber value={pages} /> pages</span>
        </div>
        {divider}
        <IconButton icon={ChevronLeft} label="Previous page" size={size} disabled={page <= 1} onClick={() => onPageChange(page - 1)} className={pill} />
        <IconButton icon={ChevronRight} label="Next page" size={size} disabled={page >= pages} onClick={() => onPageChange(page + 1)} className={pill} />
      </div>
    </div>
  )
}
