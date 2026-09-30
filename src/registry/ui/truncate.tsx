import * as React from "react"
import { cn } from "@/registry/lib/utils"
import { Tooltip } from "@/registry/ui/tooltip"
import { AnimatedText } from "@/registry/ui/animated"

/**
 * Truncate — the overflow-content rule in one component.
 *   end (default) → "Very long project na…" + full text in a tooltip
 *   middle        → "invoice-2026-…-final.pdf" (file names, IDs — the ending matters)
 *   lines         → clamp paragraphs to N lines with a "Show more" toggle
 * Never truncate: primary actions, error messages, form labels.
 */
export function Truncate({ children, mode = "end", lines = 3, className }: { children: string; mode?: "end" | "middle" | "lines"; lines?: 2 | 3 | 4 | 5; className?: string }) {
  const [expanded, setExpanded] = React.useState(false)
  if (mode === "lines") {
    const clamp = { 2: "line-clamp-2", 3: "line-clamp-3", 4: "line-clamp-4", 5: "line-clamp-5" }[lines]
    return (
      <div className={cn("flex flex-col items-start gap-1", className)}>
        <p className={cn("text-body", !expanded && clamp)}>{children}</p>
        <button type="button" onClick={() => setExpanded((e) => !e)} className="rounded-sm text-footnote text-link hover:underline focus-ring">
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
