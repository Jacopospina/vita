import * as React from "react"
import { WarningFilled, Misuse, UndefinedFilled, UnknownFilled } from "@/registry/icons"
import { cn } from "@/registry/lib/utils"
import { status } from "@/registry/lib/status"
import { SwapIcon, ProgressGlyph } from "@/registry/ui/icon"
import { AnimatedText } from "@/registry/ui/animated"

/**
 * StatusIndicator, the ONE way to show the state of an object (a job, a server, an invoice).
 * Shape + color + text, always all three (WCAG 1.4.1). Pick the kind by MEANING, never by color preference.
 *
 * FINAL states hold still:
 *   success     done / healthy / paid            · error      failed / down / degraded / rejected
 *   critical    severe, act now                  · warning    needs attention soon
 *   caution     minor, non-blocking              · info       neutral fact
 *   undefined   no state defined for this object · unknown    state can't be determined
 *   draft       being written (a written stroke, still)
 *
 * NON-FINAL states are alive, an inner path animates, the frame never moves:
 *   in-progress running now (pie steps by slices) · pending     awaiting someone (dots take turns)
 *   queued      waiting its turn (clock hand turns) · not-started will run, hasn't (core breathes)
 *   incomplete  partly done (half fill breathes)   · paused      stopped, destructive colour (bars breathe)
 */
const kinds = {
  success: { icon: status.success.icon, color: status.success.iconColor, live: false },
  error: { icon: status.error.icon, color: status.error.iconColor, live: false },
  critical: { icon: Misuse, color: "text-error", live: false },
  warning: { icon: status.warning.icon, color: status.warning.iconColor, live: false },
  caution: { icon: WarningFilled, color: "text-warning", live: false },
  info: { icon: status.info.icon, color: status.info.iconColor, live: false },
  undefined: { icon: UndefinedFilled, color: "text-muted-foreground", live: false },
  unknown: { icon: UnknownFilled, color: "text-muted-foreground", live: false },
  "in-progress": { icon: null, color: status.info.iconColor, live: true }, // a status, so info, never brand
  pending: { icon: null, color: "text-muted-foreground", live: true },
  draft: { icon: null, color: "text-muted-foreground", live: false },
  queued: { icon: null, color: "text-info", live: true },
  "not-started": { icon: null, color: "text-muted-foreground", live: true },
  incomplete: { icon: null, color: "text-info", live: true },
  paused: { icon: null, color: "text-error", live: true },
} as const

export type StatusKind = keyof typeof kinds
export const statusKinds = Object.keys(kinds) as StatusKind[]
/** Final states hold still; every other state keeps an inner path moving. */
export const isFinalStatus = (k: StatusKind) => !kinds[k].live

/** Rotate/scale an inner path around its own centre (in SVG user units). */
const origin = (v: string) => ({ style: { transformOrigin: v } })

/** StatusGlyph, the animated glyphs for non-final states. 16-unit grid; ring still, inside alive. */
export function StatusGlyph({ kind, className }: { kind: Exclude<StatusKind, "success" | "error" | "critical" | "warning" | "caution" | "info" | "undefined" | "unknown">; className?: string }) {
  if (kind === "in-progress") return <ProgressGlyph className={className} />
  const ring = <circle cx="8" cy="8" r="6.5" stroke="currentColor" strokeWidth="1.5" />
  return (
    <svg viewBox="0 0 16 16" width={16} height={16} fill="none" aria-hidden className={cn("shrink-0", className)}>
      {kind === "draft" && (
        <>
          <circle cx="8" cy="8" r="6.5" stroke="currentColor" strokeWidth="1.5" strokeDasharray="2.6 2.5" />
          <path d="M5 9.2c1-1.6 1.8-1.6 2.3-.4.5 1.2 1.3 1.2 2.2-.3.4-.6.8-.9 1.5-.7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </>
      )}
      {kind === "pending" && (
        <>
          {ring}
          <circle cx="5.25" cy="8" r="1.1" fill="currentColor" className="motion-safe:animate-status-dot-1" />
          <circle cx="8" cy="8" r="1.1" fill="currentColor" className="motion-safe:animate-status-dot-2" />
          <circle cx="10.75" cy="8" r="1.1" fill="currentColor" className="motion-safe:animate-status-dot-3" />
        </>
      )}
      {kind === "queued" && (
        <>
          {ring}
          <path d="M8 8V4.75" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" {...origin("8px 8px")} className="motion-safe:animate-status-turn" />
          <path d="M8 8h2.25" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </>
      )}
      {kind === "not-started" && (
        <>
          {ring}
          <circle cx="8" cy="8" r="2" fill="currentColor" {...origin("8px 8px")} className="motion-safe:animate-status-breathe" />
        </>
      )}
      {kind === "incomplete" && (
        <>
          {ring}
          <path d="M8 3.25a4.75 4.75 0 0 1 0 9.5z" fill="currentColor" className="motion-safe:animate-status-fill" />
        </>
      )}
      {kind === "paused" && (
        <>
          {ring}
          <rect x="5.6" y="5" width="1.6" height="6" rx="0.6" fill="currentColor" {...origin("6.4px 8px")} className="motion-safe:animate-status-breathe" />
          <rect x="8.8" y="5" width="1.6" height="6" rx="0.6" fill="currentColor" {...origin("9.6px 8px")} className="motion-safe:animate-status-breathe-late" />
        </>
      )}
    </svg>
  )
}

export function StatusIndicator({ kind, children, size = "md", variant = "icon", className }: {
  kind: StatusKind
  children: React.ReactNode
  size?: "sm" | "md"
  /** icon = glyph + text (default, tables & lists) · dot = compact 8px dot + text (dense dashboards; live states pulse) */
  variant?: "icon" | "dot"
  className?: string
}) {
  const k = kinds[kind]
  return (
    <span className={cn("inline-flex items-center gap-1.5 text-foreground", size === "sm" ? "text-footnote" : "text-body", className)}>
      {variant === "icon" ? (
        k.icon ? <SwapIcon as={k.icon} size="sm" className={k.color} /> : <StatusGlyph key={kind} kind={kind as Parameters<typeof StatusGlyph>[0]["kind"]} className={cn(k.color, "animate-enter-fade")} />
      ) : (
        <span aria-hidden className={cn("size-2 rounded-full bg-current", k.color, k.live && "motion-safe:animate-status-fill")} />
      )}
      {typeof children === "string" ? <AnimatedText>{children}</AnimatedText> : children}
    </span>
  )
}
