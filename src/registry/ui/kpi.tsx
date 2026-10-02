import * as React from "react"
import { ArrowDown, ArrowUp, Subtract } from "@/registry/icons"
import { cn } from "@/registry/lib/utils"
import { Icon } from "@/registry/ui/icon"
import { AnimatedNumber } from "@/registry/ui/animated"
import { ScrambleText } from "@/registry/ui/scramble-text"

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
  /** The value is on its way: digits change one by one in the value's own type (each blurs out as the next blurs in), then the real number lands in random order. */
  loading?: boolean
  /** Digits to scramble while loading, about as many as the value will have. Default: the current value's length. */
  loadingLength?: number
  className?: string
}

/** How long the arriving value locks in before the live number (which rolls on later changes) takes over. */
const ARRIVE_MS = 700

const valueSize = { sm: "text-title-3", md: "text-title-1", lg: "text-large-title" } as const

export function Kpi({ label, value, format, delta, deltaFormat = { style: "percent", maximumFractionDigits: 1 }, better = "up", period, helperText, size = "md", loading, loadingLength, className }: KpiProps) {
  const flat = delta === undefined || Math.abs(delta) < 1e-9
  const good = !flat && (delta! > 0) === (better === "up")
  const tone = flat ? "text-muted-foreground" : good ? "text-success-foreground" : "text-error-foreground"
  const text = React.useMemo(() => new Intl.NumberFormat(undefined, format).format(value), [value, format])
  // Loading → loaded: the scramble locks into the number, then hands over to the live, rolling number.
  const [wasLoading, setWasLoading] = React.useState(!!loading)
  const [arriving, setArriving] = React.useState(false)
  if (!!loading !== wasLoading) {
    setWasLoading(!!loading)
    setArriving(!loading)
  }
  React.useEffect(() => {
    if (!arriving) return
    const t = window.setTimeout(() => setArriving(false), ARRIVE_MS)
    return () => window.clearTimeout(t)
  }, [arriving])
  return (
    <div className={cn("flex min-w-0 flex-col gap-0.5", className)}>
      <span className="truncate text-footnote text-muted-foreground">{label}</span>
      {loading || arriving ? (
        // Loading: the value scrambles in its own size; arriving: it locks digit by digit into the number.
        <ScrambleText text={loading ? undefined : text} length={loadingLength ?? Math.max(3, text.length)} charset="digits" label={`Loading ${typeof label === "string" ? label : "value"}`} className={cn(valueSize[size], "tabular-nums")} />
      ) : (
        <span className={valueSize[size]}><AnimatedNumber value={value} format={format} /></span>
      )}
      {(delta !== undefined || period) && (loading ? (
        // The trend line keeps its place while loading (no jump when it arrives), as a quieter scramble.
        <ScrambleText length={period ? 14 : 5} label="" className="text-footnote" />
      ) : (
        <span className={cn("inline-flex items-center gap-1 text-footnote", arriving && "animate-enter-fade", tone)}>
          <Icon as={flat ? Subtract : delta! > 0 ? ArrowUp : ArrowDown} size="sm" className="size-3" label={flat ? "No change" : delta! > 0 ? "Up" : "Down"} />
          {delta !== undefined && <AnimatedNumber value={Math.abs(delta)} format={deltaFormat} />}
          {period && <span className="text-muted-foreground">{period}</span>}
        </span>
      ))}
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
