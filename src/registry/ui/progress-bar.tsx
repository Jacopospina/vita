import * as React from "react"
import { CheckmarkFilled, ErrorFilled } from "@/registry/icons"
import { cn } from "@/registry/lib/utils"
import { Icon } from "@/registry/ui/icon"
import { AnimatedNumber } from "@/registry/ui/animated"
import { animateChildren } from "@/registry/ui/animated"

/**
 * ProgressBar — progress of a process with a measurable end (upload, import, setup). Omit `value` for indeterminate.
 * Steps a USER completes → ProgressIndicator. Quota/usage ("7 of 10 seats") → ProgressBar with status.
 */
export function ProgressBar({
  label,
  value,
  max = 100,
  helperText,
  status = "active",
  size = "md",
  hideLabel,
  className,
}: {
  label: string
  value?: number
  max?: number
  helperText?: React.ReactNode
  status?: "active" | "finished" | "error"
  size?: "sm" | "md"
  hideLabel?: boolean
  className?: string
}) {
  const id = React.useId()
  const indeterminate = value === undefined && status === "active"
  const pct = status === "finished" ? 100 : Math.min(100, Math.max(0, ((value ?? 0) / max) * 100))
  return (
    <div className={cn("flex w-full flex-col gap-2", className)}>
      <div className={cn("flex items-center justify-between gap-2", hideLabel && "sr-only")}>
        <span id={id} className="text-footnote text-foreground">{label}</span>
        {status === "finished" && <Icon as={CheckmarkFilled} draw="in" className="text-success" label="Complete" />}
        {status === "error" && <Icon as={ErrorFilled} draw="in" className="text-error" label="Error" />}
      </div>
      <div
        role="progressbar"
        aria-labelledby={id}
        aria-valuemin={0}
        aria-valuemax={max}
        aria-valuenow={indeterminate ? undefined : Math.round(pct)}
        aria-busy={status === "active"}
        className={cn("relative w-full overflow-hidden rounded-full bg-border-subtle", size === "sm" ? "h-1" : "h-2")}
      >
        <div
          className={cn(
            "absolute inset-y-0 left-0 rounded-full duration-moderate-02 ease-productive",
            status === "error" ? "bg-error" : status === "finished" ? "bg-success" : "bg-primary",
            indeterminate ? "w-2/5 animate-indeterminate" : "",
          )}
          style={indeterminate ? undefined : { width: `${pct}%` }}
        />
      </div>
      {helperText && <p className={cn("text-caption", status === "error" ? "text-error-foreground" : "text-helper")}>{animateChildren(helperText)}</p>}
    </div>
  )
}

/**
 * ProgressRing — compact circular progress with its value inside (rolling number). For capsules,
 * device/battery-like readouts and tight spaces. Tone follows meaning: success when complete.
 */
export function ProgressRing({ value, max = 100, size = 32, showValue = true, tone, label, className }: { value: number; max?: number; size?: number; showValue?: boolean; tone?: "primary" | "success" | "warning" | "error"; label?: string; className?: string }) {
  const pct = Math.min(1, Math.max(0, value / max))
  const t = tone ?? (pct >= 1 ? "success" : "primary")
  const stroke = { primary: "stroke-primary", success: "stroke-success", warning: "stroke-warning", error: "stroke-error" }[t]
  return (
    <span role="progressbar" aria-label={label} aria-valuemin={0} aria-valuemax={max} aria-valuenow={Math.round(value)} className={cn("relative inline-flex shrink-0 items-center justify-center", className)} style={{ width: size, height: size }}>
      <svg viewBox="0 0 36 36" width={size} height={size} className="-rotate-90">
        <circle cx="18" cy="18" r="15.5" fill="none" strokeWidth="3.5" className="stroke-current opacity-20" />
        <circle cx="18" cy="18" r="15.5" fill="none" strokeWidth="3.5" strokeLinecap="round" pathLength={100} strokeDasharray="100 100" strokeDashoffset={100 - pct * 100} className={cn(stroke, "duration-expressive ease-expressive")} />
      </svg>
      {showValue && <span className="absolute text-[0.6rem] font-semibold"><AnimatedNumber value={Math.round(value)} /></span>}
    </span>
  )
}
