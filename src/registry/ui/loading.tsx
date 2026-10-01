import * as React from "react"
import { CheckmarkFilled, ErrorFilled, type IconType } from "@/registry/icons"
import { cn } from "@/registry/lib/utils"
import { SwapIcon } from "@/registry/ui/icon"
import { AnimatedText } from "@/registry/ui/animated"
import { Thinking, type ThinkingMode } from "@/registry/ui/thinking"

/**
 * Loading family. Corpus never spins — it THINKS (see Thinking). Choose by SCOPE and DURATION:
 *   < 300ms           → show nothing (avoid flashes)
 *   known layout      → Skeleton (preferred: preserves layout, feels faster)
 *   a single action   → InlineLoading next to its trigger, or Button `loading`
 *   whole region/page → Loading (thinking orb), with an overlay only if interaction must be blocked
 *   known progress    → ProgressBar
 * Pick the thinking MODE by what is happening: basic (plain logic) · retrieving · generating · searching (agentic).
 */
export function Loading({ size = "md", mode = "basic", label = "Loading", overlay, className }: { size?: "sm" | "md" | "lg"; mode?: ThinkingMode; label?: string; overlay?: boolean; className?: string }) {
  const orb = <Thinking mode={mode} size={size === "sm" ? "md" : size === "md" ? "lg" : "xl"} label={label} tone={mode === "basic" ? "brand" : undefined} className={!overlay ? className : undefined} />
  if (!overlay) return orb
  return <div className={cn("absolute inset-0 z-40 flex items-center justify-center bg-overlay animate-enter-fade", className)}>{orb}</div>
}

/**
 * InlineLoading — status of a single operation, in place: "Saving…" → "Saved" → (fades). Also covers error.
 * ONE indicator that morphs between states — never several side by side: error → (Retry) → saving → saved,
 * or back to error. The glyph cross-fades (thinking ⇄ drawn check/error), the text morphs, the colour fades.
 *   onRetry  shown with an error: a "Retry" action that blends out as the retry starts.
 */
export function InlineLoading({ status = "active", description, mode = "basic", onRetry, className }: {
  status?: "active" | "finished" | "error" | "inactive"
  description?: React.ReactNode
  mode?: ThinkingMode
  onRetry?: () => void
  className?: string
}) {
  // Never pops: while inactive it keeps a zero-width slot; appearing/leaving fades, blurs and grows/collapses its width.
  const [last, setLast] = React.useState({ status, description })
  if (status !== "inactive" && (status !== last.status || description !== last.description)) setLast({ status, description })
  const shown = status === "inactive" ? last : { status, description }
  const visible = status !== "inactive"
  const active = shown.status === "active"
  const error = shown.status === "error"
  // The last drawn glyph stays mounted under the thinking orb, so leaving "active" draws/fades it back in.
  const [glyph, setGlyph] = React.useState<IconType>(() => (error ? ErrorFilled : CheckmarkFilled))
  const nextGlyph = error ? ErrorFilled : shown.status === "finished" ? CheckmarkFilled : glyph
  if (nextGlyph !== glyph) setGlyph(() => nextGlyph)
  const layer = (on: boolean) => cn("motion-productive [grid-area:1/1]", on ? "scale-100 opacity-100 blur-none" : "scale-50 opacity-0 blur-xs")
  return (
    <div
      role="status"
      aria-live="polite"
      aria-hidden={!visible || undefined}
      className={cn("inline-grid items-center self-center motion-productive", visible ? "grid-cols-[1fr] opacity-100 blur-none" : "grid-cols-[0fr] opacity-0 blur-xs", className)}
    >
      <div className="flex min-w-0 items-center overflow-hidden">
        <div className={cn("flex items-center gap-2 text-footnote leading-none whitespace-nowrap motion-productive", error ? "text-error-foreground" : "text-muted-foreground")}>
          <span aria-hidden className="grid size-4 shrink-0 place-items-center">
            <span className={layer(active)}>
              <Thinking mode={mode} size="sm" tone={mode === "basic" ? "brand" : undefined} label={typeof shown.description === "string" ? shown.description : "Working"} />
            </span>
            <span className={layer(!active)}>
              <SwapIcon as={glyph} className={error ? "text-error" : "text-success"} />
            </span>
          </span>
          <span className="inline-flex items-center">
            {shown.description && (typeof shown.description === "string" ? <AnimatedText>{shown.description}</AnimatedText> : shown.description)}
            {onRetry && (
              // Its spacing lives inside the collapsing column, so nothing is left behind when it blends out.
              <span className={cn("reveal-x motion-productive", error && "reveal-x-open")}>
                <span>
                  <span className="block pl-1.5">
                    <button
                      type="button"
                      tabIndex={error ? undefined : -1}
                      aria-hidden={!error || undefined}
                      onClick={onRetry}
                      className={cn("rounded-sm font-medium text-link underline-offset-2 hover:underline focus-ring motion-productive", error ? "opacity-100 blur-none" : "opacity-0 blur-xs")}
                    >
                      Retry
                    </button>
                  </span>
                </span>
              </span>
            )}
          </span>
        </div>
      </div>
    </div>
  )
}

/** Skeleton — placeholder shaped like the content that's coming. Match real dimensions. */
export function Skeleton({ className, shape = "rect", ...props }: React.HTMLAttributes<HTMLDivElement> & { shape?: "rect" | "text" | "circle" }) {
  return (
    <div
      aria-hidden
      className={cn(
        "animate-shimmer bg-skeleton bg-linear-to-r from-transparent via-hover to-transparent bg-size-[200%_100%]",
        shape === "text" && "h-3 rounded-sm",
        shape === "rect" && "rounded-md",
        shape === "circle" && "rounded-full",
        className,
      )}
      {...props}
    />
  )
}

/** SkeletonText — n lines, last one shorter. */
export function SkeletonText({ lines = 3, className }: { lines?: number; className?: string }) {
  return (
    <div className={cn("flex flex-col gap-2", className)} aria-hidden>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton key={i} shape="text" className={i === lines - 1 ? "w-3/5" : "w-full"} />
      ))}
    </div>
  )
}
