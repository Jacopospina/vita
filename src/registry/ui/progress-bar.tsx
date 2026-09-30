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
  const h = size === "sm" ? 4 : 8
  const r = h / 2
  const reduced = typeof window !== "undefined" && !!window.matchMedia?.("(prefers-reduced-motion: reduce)").matches
  const hues = ["blue", "indigo", "purple", "pink", "orange", "blue"]
  // Fill and head move by the SAME eased value, as one body.
  const move = "duration-expressive ease-expressive"
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
        className={cn("relative w-full rounded-full bg-border-subtle", size === "sm" ? "h-1" : "h-2")}
      >
        {/*
          The liquid is ONE svg: fill + droplets share one goo filter AND one gradient spanning the whole track,
          so the head is visibly part of the bar (same colour where they meet) and melts into it. The svg viewport
          clips, so nothing leaks outside the track.
        */}
        <svg aria-hidden width="100%" height={h} className={cn("absolute inset-0 overflow-hidden rounded-full", color)} style={{ filter: `drop-shadow(0 0 ${h * 0.6}px currentColor)` }}>
          <defs>
            <filter id={fid} x="-10%" y="-150%" width="120%" height="400%" colorInterpolationFilters="sRGB">
              <feGaussianBlur in="SourceGraphic" stdDeviation={h * 0.55} result="b" />
              <feColorMatrix in="b" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 18 -8" result="goo" />
              <feComposite in="SourceGraphic" in2="goo" operator="atop" />
            </filter>
            {spectrum && (
              <linearGradient id={`${fid}-g`} gradientUnits="userSpaceOnUse" x1="0%" x2="100%" y1="0" y2="0" spreadMethod="repeat">
                {hues.map((c, i) => <stop key={i} offset={i / (hues.length - 1)} stopColor={`var(--corpus-palette-${c}-500)`} />)}
                {!reduced && <animate attributeName="x1" values="0%;-100%" dur="4s" repeatCount="indefinite" />}
                {!reduced && <animate attributeName="x2" values="100%;0%" dur="4s" repeatCount="indefinite" />}
              </linearGradient>
            )}
            <linearGradient id={`${fid}-gloss`} x1="0" x2="0" y1="0" y2="1">
              <stop offset="0" stopColor="white" stopOpacity="0.5" />
              <stop offset="0.7" stopColor="white" stopOpacity="0" />
            </linearGradient>
          </defs>
          <g filter={`url(#${fid})`} fill={spectrum ? `url(#${fid}-g)` : "currentColor"}>
            {indeterminate ? (
              <>
                <rect x="0" y="0" width="14%" height={h} rx={r} className="motion-safe:animate-flow-1" />
                <circle cx="0" cy={r} r={r} className="motion-safe:animate-flow-2" />
                <rect x="0" y="0" width="7%" height={h} rx={r} className="motion-safe:animate-flow-3" />
                <circle cx="0" cy={r} r={r * 0.8} className="motion-safe:animate-flow-4" />
              </>
            ) : (
              <>
                <rect x="0" y="0" height={h} rx={r} className={move} style={{ width: `${pct}%` }} />
                {status === "active" && pct > 0 && pct < 100 && (
                  // The head rides the fill's end (translateX in % of the track), with the same easing.
                  <g className={move} style={{ transform: `translateX(${pct}%)` }}>
                    <circle cx={-r} cy={r} r={r} className="motion-safe:animate-drip-a" />
                    <circle cx={-r} cy={r} r={r * 0.75} className="motion-safe:animate-drip-b" />
                  </g>
                )}
              </>
            )}
          </g>
          {/* Gloss: the light catching the top of the liquid. */}
          {!indeterminate && <rect x="0" y="0" height={h / 2} rx={r / 2} fill={`url(#${fid}-gloss)`} className={move} style={{ width: `${pct}%` }} />}
        </svg>
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
