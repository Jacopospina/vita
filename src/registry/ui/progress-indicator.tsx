import { CheckmarkOutline, CircleDash, Incomplete, Warning } from "@/registry/icons"
import { cn } from "@/registry/lib/utils"
import { Icon } from "@/registry/ui/icon"

/**
 * ProgressIndicator — the steps of a multi-step task the USER works through (wizard, onboarding, checkout).
 * 3–6 steps. Fewer → one page. More → split the flow. Always allow going back to completed steps.
 */
export interface Step {
  label: string
  secondaryLabel?: string
  invalid?: boolean
  disabled?: boolean
}

export function ProgressIndicator({ steps, current, onStepClick, vertical, className }: { steps: Step[]; current: number; onStepClick?: (i: number) => void; vertical?: boolean; className?: string }) {
  return (
    <ol className={cn("flex w-full", vertical ? "flex-col gap-0" : "flex-row gap-2", className)}>
      {steps.map((s, i) => {
        const state = s.invalid ? "invalid" : i < current ? "complete" : i === current ? "current" : "upcoming"
        const glyph = { complete: CheckmarkOutline, current: Incomplete, upcoming: CircleDash, invalid: Warning }[state]
        const clickable = onStepClick && !s.disabled && i < current
        const Comp = clickable ? "button" : "div"
        return (
          <li key={i} className={cn("min-w-0", vertical ? "" : "flex-1")} aria-current={state === "current" ? "step" : undefined}>
            <Comp
              {...(clickable ? { type: "button" as const, onClick: () => onStepClick?.(i) } : {})}
              className={cn(
                "flex w-full items-start gap-2 text-left",
                vertical ? "min-h-16 border-l-2 pl-3" : "border-t-2 pt-2",
                state === "complete" && "border-primary",
                state === "current" && "border-primary",
                state === "upcoming" && "border-border",
                state === "invalid" && "border-error",
                clickable && "cursor-pointer rounded-sm hover:bg-hover focus-ring",
                s.disabled && "text-disabled-foreground",
              )}
            >
              <Icon as={glyph} className={cn("mt-0.5", state === "invalid" ? "text-error" : state === "upcoming" ? "text-muted-foreground" : "text-primary")} />
              <span className="flex min-w-0 flex-col">
                <span className={cn("truncate text-footnote", state === "current" ? "font-semibold text-foreground" : "text-muted-foreground", clickable && "text-link")}>{s.label}</span>
                {s.secondaryLabel && <span className="text-caption text-helper">{s.secondaryLabel}</span>}
                <span className="sr-only">{state === "complete" ? "Complete" : state === "current" ? "Current step" : state === "invalid" ? "Has errors" : "Not started"}</span>
              </span>
            </Comp>
          </li>
        )
      })}
    </ol>
  )
}
