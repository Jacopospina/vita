import { CheckmarkFilled, ErrorFilled, InformationFilled, WarningAltFilled, type IconType } from "@/registry/icons"

/**
 * Status semantics — the ONE map from a status meaning to its colour and glyph (docs/foundations/color.md →
 * Status semantics). Every status surface (StatusIndicator, Tag statuses, notifications, IconPlaceholder kinds,
 * inline errors) reads from here, so "error" looks the same everywhere.
 *   success  done, healthy, live            green  · CheckmarkFilled
 *   warning  needs attention soon           orange · WarningAltFilled
 *   error    failed, down, degraded, paused,
 *            destructive                    red    · ErrorFilled
 *   info     neutral fact, in progress      blue   · InformationFilled
 * Brand colour never means a status; support colours never decorate.
 */
export type StatusTone = "success" | "warning" | "error" | "info"

export const status: Record<StatusTone, { icon: IconType; iconColor: string; text: string; tint: string }> = {
  success: { icon: CheckmarkFilled, iconColor: "text-success", text: "text-success-foreground", tint: "bg-success-subtle" },
  warning: { icon: WarningAltFilled, iconColor: "text-warning", text: "text-warning-foreground", tint: "bg-warning-subtle" },
  error: { icon: ErrorFilled, iconColor: "text-error", text: "text-error-foreground", tint: "bg-error-subtle" },
  info: { icon: InformationFilled, iconColor: "text-info", text: "text-info-foreground", tint: "bg-info-subtle" },
}
