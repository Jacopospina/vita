import * as React from "react"
import { CheckmarkFilled, ErrorFilled, WarningAltFilled, InformationFilled, CircleDash, InProgress, WarningFilled, Pending } from "@/registry/icons"
import { cn } from "@/registry/lib/utils"
import { SwapIcon, ProgressGlyph } from "@/registry/ui/icon"
import { AnimatedText } from "@/registry/ui/animated"

/**
 * StatusIndicator — the ONE way to show the state of an object (a job, a server, an invoice).
 * Shape + color + text, always all three (WCAG 1.4.1). Pick the kind by MEANING, never by color preference.
 *
 *   success     done / healthy / paid        · error    failed / down / rejected
 *   warning     needs attention soon         · caution  degraded, non-blocking
 *   info        neutral fact                 · pending  waiting on someone else
 *   in-progress running now                  · draft    not started / inactive
 */
const kinds = {
  success: { icon: CheckmarkFilled, color: "text-success" },
  error: { icon: ErrorFilled, color: "text-error" },
  warning: { icon: WarningAltFilled, color: "text-warning-foreground" },
  caution: { icon: WarningFilled, color: "text-warning" },
  info: { icon: InformationFilled, color: "text-info" },
  pending: { icon: Pending, color: "text-muted-foreground" },
  "in-progress": { icon: InProgress, color: "text-primary" },
  draft: { icon: CircleDash, color: "text-muted-foreground" },
} as const

export type StatusKind = keyof typeof kinds

export function StatusIndicator({ kind, children, size = "md", variant = "icon", className }: {
  kind: StatusKind
  children: React.ReactNode
  size?: "sm" | "md"
  /** icon = glyph + text (default, tables & lists) · dot = compact 8px dot + text (dense dashboards) */
  variant?: "icon" | "dot"
  className?: string
}) {
  const k = kinds[kind]
  return (
    <span className={cn("inline-flex items-center gap-1.5 text-foreground", size === "sm" ? "text-footnote" : "text-body", className)}>
      {variant === "icon" ? (
        kind === "in-progress" ? <ProgressGlyph className={k.color} /> : <SwapIcon as={k.icon} size="sm" className={k.color} />
      ) : (
        <span aria-hidden className={cn("size-2 rounded-full bg-current", k.color)} />
      )}
      {typeof children === "string" ? <AnimatedText>{children}</AnimatedText> : children}
    </span>
  )
}
