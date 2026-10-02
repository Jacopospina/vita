import * as React from "react"
import { ArrowDown, ArrowUp, Subtract } from "@/registry/icons"
import { cn } from "@/registry/lib/utils"
import { Icon } from "@/registry/ui/icon"
import { AnimatedNumber } from "@/registry/ui/animated"
import { Skeleton } from "@/registry/ui/loading"

/**
 * Kpi, one key number: label → value → trend. For dashboards, page headers and summary strips.
 * The value is a number (it swaps digit by digit, always regular weight). The trend's colour says whether the change
 * is GOOD for this metric (`better`), its arrow says which way it went, never colour alone.
 * Many numbers in a table → DataTable. A single status, not a number → StatusIndicator.
 */
export interface KpiProps {
  label: React.ReactNode
  value: number
  /** Intl.NumberFormat options: currency, percent, compact… */
  format?: Intl.NumberFormatOptions
  /** Change since the comparison period, as a fraction (0.12 = +12%) unless `deltaFormat` says otherwise. */
  delta?: number
  deltaFormat?: Intl.NumberFormatOptions
  /** Which direction is good for this metric. "up" (default): revenue, runs. "down": errors, cost, response time. */
  better?: "up" | "down"
  /** What the change compares against: "vs last week". */
  period?: string
  helperText?: React.ReactNode
  /** sm: in page headers and strips · md: cards (default) · lg: a hero number. */
  size?: "sm" | "md" | "lg"
  loading?: boolean
  className?: string
}

const valueSize = { sm: "text-title-3", md: "text-title-1", lg: "text-large-title" } as const

export function Kpi({ label, value, format, delta, deltaFormat = { style: "percent", maximumFractionDigits: 1 }, better = "up", period, helperText, size = "md", loading, className }: KpiProps) {
  const flat = delta === undefined || Math.abs(delta) < 1e-9
  const good = !flat && (delta! > 0) === (better === "up")
  const tone = flat ? "text-muted-foreground" : good ? "text-success-foreground" : "text-error-foreground"
  return (
    <div className={cn("flex min-w-0 flex-col gap-0.5", className)}>
      <span className="truncate text-footnote text-muted-foreground">{label}</span>
      {loading ? (
        <Skeleton className={cn("w-24 max-w-full", size === "lg" ? "h-10" : size === "md" ? "h-8" : "h-6")} />
      ) : (
        <span className={valueSize[size]}><AnimatedNumber value={value} format={format} /></span>
      )}
      {(delta !== undefined || period) && !loading && (
        <span className={cn("inline-flex items-center gap-1 text-footnote", tone)}>
          <Icon as={flat ? Subtract : delta! > 0 ? ArrowUp : ArrowDown} size="sm" className="size-3" label={flat ? "No change" : delta! > 0 ? "Up" : "Down"} />
          {delta !== undefined && <AnimatedNumber value={Math.abs(delta)} format={deltaFormat} />}
          {period && <span className="text-muted-foreground">{period}</span>}
        </span>
      )}
      {helperText && <span className="text-caption text-helper">{helperText}</span>}
    </div>
  )
}

/**
 * KpiGroup, related KPIs that belong together: one surface, no gaps, hairline dividers between them.
 * `bare` drops the surface (in page headers, where the header is the container).
 */
export function KpiGroup({ children, bare, className }: { children: React.ReactNode; bare?: boolean; className?: string }) {
  return (
    <div
      role="group"
      className={cn(
        // A row of equals; on a phone, two per row with a gap instead of dividers.
        "grid auto-cols-fr grid-flow-col divide-x divide-divider max-sm:grid-flow-row max-sm:grid-cols-2 max-sm:gap-y-3 max-sm:divide-x-0",
        bare ? "*:px-4 *:first:pl-0 *:last:pr-0" : "scope-lg bg-layer-1 py-3 *:px-4",
        className,
      )}
    >
      {children}
    </div>
  )
}
