import * as React from "react"
import { CheckmarkFilled, ErrorFilled } from "@/registry/icons"
import { cn } from "@/registry/lib/utils"
import { Icon } from "@/registry/ui/icon"
import { AnimatedNumber } from "@/registry/ui/animated"
import { animateChildren } from "@/registry/ui/animated"

/**
 * ProgressBar — progress of a process with a measurable end (upload, import, setup). Omit `value` for indeterminate.
 * Steps a USER completes → ProgressIndicator. Quota/usage ("7 of 10 seats") → ProgressBar with status.
 *
 * Styled like Thinking — it's liquid: the fill runs through the same goo filter, with gloss and glow.
 *   determinate    the fill's head is a living droplet; small drops wobble off it and merge back
 *   indeterminate  droplets flow along the track at different speeds, catching up and fusing
 *   tone           brand (default) · spectrum (agent work) — finished/error switch to success/error
 */
export function ProgressBar({
  label,
  value,
  max = 100,
  helperText,
  status = "active",
  size = "md",
  tone = "brand",
  hideLabel,
  className,
}: {
  label: string
  value?: number
  max?: number
  helperText?: React.ReactNode
  status?: "active" | "finished" | "error"
  size?: "sm" | "md"
  tone?: "brand" | "spectrum"
  hideLabel?: boolean
  className?: string
}) {
  const id = React.useId()
  const fid = "corpus-liquid-" + id.replace(/[^a-zA-Z0-9]/g, "")
  const indeterminate = value === undefined && status === "active"
  const pct = status === "finished" ? 100 : Math.min(100, Math.max(0, ((value ?? 0) / max) * 100))
  const color = status === "error" ? "text-error" : status === "finished" ? "text-success" : "text-primary"
  const spectrum = tone === "spectrum" && status === "active"
  // The fill's colour drifts; droplets keep a still paint so their own motion (drip / flow) isn't overridden.
  const paint = spectrum ? "liquid-spectrum motion-safe:animate-spectrum" : "bg-current"
  const dropPaint = spectrum ? "liquid-spectrum" : "bg-current"
  const h = size === "sm" ? 4 : 8
  // Droplets are exactly track-height: the liquid never bulges or leaks outside its container.
  const drop = size === "sm" ? "size-1" : "size-2"
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
        <svg aria-hidden width="0" height="0" className="absolute">
          <defs>
            <filter id={fid} x="-20%" y="-150%" width="140%" height="400%" colorInterpolationFilters="sRGB">
              <feGaussianBlur in="SourceGraphic" stdDeviation={h * 0.35} result="b" />
              <feColorMatrix in="b" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 16 -7" result="goo" />
              <feComposite in="SourceGraphic" in2="goo" operator="atop" />
            </filter>
          </defs>
        </svg>
        {/* The liquid: fill + droplets share one goo filter, so they fuse like the Thinking orbs. */}
        <div className={cn("absolute inset-0", color)} style={{ filter: `url(#${fid}) drop-shadow(0 0 ${h * 0.6}px currentColor)` }}>
          {indeterminate ? (
            <>
              {["motion-safe:animate-flow-1", "motion-safe:animate-flow-2", "motion-safe:animate-flow-3"].map((a, i) => (
                <span key={i} className={cn("absolute top-1/2 -translate-y-1/2 rounded-full", i === 1 ? "h-full w-1/6" : drop, dropPaint, a)} />
              ))}
            </>
          ) : (
            <>
              {/* ONE body: the head droplets live inside the fill at its right edge, so they ride the same eased
                  width — the head never jumps ahead and the bar never lags behind. */}
              <div className="absolute inset-y-0 left-0 duration-expressive ease-expressive" style={{ width: `${pct}%` }}>
                <div className={cn("absolute inset-0 rounded-full", paint)} />
                {status === "active" && pct > 0 && pct < 100 && (
                  <span className="absolute top-0 right-0">
                    <span className={cn("absolute top-0 -left-1 rounded-full motion-safe:animate-drip-a", drop, dropPaint)} />
                    <span className={cn("absolute top-0 -left-1 rounded-full motion-safe:animate-drip-b", drop, dropPaint)} />
                  </span>
                )}
              </div>
            </>
          )}
        </div>
        {/* Gloss: the light catching the top of the liquid. */}
        {!indeterminate && <div aria-hidden className="pointer-events-none absolute top-0 left-0 h-1/2 rounded-full liquid-shine duration-expressive ease-expressive" style={{ width: `${pct}%` }} />}
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
