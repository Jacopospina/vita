import * as React from "react"
import { cn } from "@/registry/lib/utils"
import { Tooltip } from "@/registry/ui/tooltip"
import { AnimatedText } from "@/registry/ui/animated"

/**
 * Truncate, the overflow-content rule in one component.
 *   end (default) → "Very long project na…" + full text in a tooltip
 *   middle        → "invoice-2026-…-final.pdf" (file names, IDs, the ending matters)
 *   lines         → clamp paragraphs to N lines with a "Show more" toggle
 *   ticker        → "Content, personae & tax…" that glides to its end while its row is hovered or focused
 *                   (nav rows and list rows, where a tooltip would sit on top of the next row)
 * Never truncate: primary actions, error messages, form labels.
 */
export function Truncate({ children, mode = "end", lines = 3, className }: { children: string; mode?: "end" | "middle" | "lines" | "ticker"; lines?: 2 | 3 | 4 | 5; className?: string }) {
  const [expanded, setExpanded] = React.useState(false)
  if (mode === "ticker") return <Ticker className={className}>{children}</Ticker>

  if (mode === "lines") {
    const clamp = { 2: "line-clamp-2", 3: "line-clamp-3", 4: "line-clamp-4", 5: "line-clamp-5" }[lines]
    return (
      <div className={cn("flex flex-col items-start gap-1", className)}>
        <p className={cn("text-body", !expanded && clamp)}>{children}</p>
        <button type="button" onClick={() => setExpanded((e) => !e)} className="rounded-sm text-footnote text-link underline decoration-transparent hover:decoration-current focus-ring">
          <AnimatedText>{expanded ? "Show less" : "Show more"}</AnimatedText>
        </button>
      </div>
    )
  }
  if (mode === "middle" && children.length > 28) {
    const head = children.slice(0, Math.ceil(children.length * 0.45))
    const tail = children.slice(-Math.floor(children.length * 0.3))
    return (
      <Tooltip content={children}>
        <span tabIndex={0} className={cn("inline-flex min-w-0 max-w-full rounded-sm focus-ring", className)} aria-label={children}>
          <span className="truncate">{head}</span>
          <span className="shrink-0">…{tail}</span>
        </span>
      </Tooltip>
    )
  }
  return (
    <Tooltip content={children}>
      <span tabIndex={0} className={cn("block min-w-0 truncate rounded-sm focus-ring", className)}>{children}</span>
    </Tooltip>
  )
}

/** Pixels per second: slow enough to read the words as they pass, like a news ticker. */
const TICKER_SPEED = 40

/**
 * The line measures how far it overflows; the glide itself is CSS (`.vita-ticker` in motion.css), so it starts
 * after a short pause, travels at reading speed and eases back when the pointer leaves. Under reduced motion it
 * stays put and the native title carries the full text.
 */
function Ticker({ children, className }: { children: string; className?: string }) {
  const box = React.useRef<HTMLSpanElement>(null)
  const line = React.useRef<HTMLSpanElement>(null)
  const [shift, setShift] = React.useState(0)
  React.useLayoutEffect(() => {
    const b = box.current
    const l = line.current
    if (!b || !l) return
    const measure = () => setShift(Math.max(0, Math.ceil(l.scrollWidth - b.clientWidth)))
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(b)
    return () => ro.disconnect()
  }, [children])
  return (
    <span
      ref={box}
      className={cn("vita-ticker", className)}
      data-overflow={shift > 0 || undefined}
      title={shift > 0 ? children : undefined}
      style={{ "--vita-ticker-shift": `${shift}px`, "--vita-ticker-time": `${(shift / TICKER_SPEED).toFixed(2)}s` } as React.CSSProperties}
    >
      <span ref={line}>{children}</span>
    </span>
  )
}
