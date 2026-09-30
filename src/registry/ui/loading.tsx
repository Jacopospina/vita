import * as React from "react"
import { CheckmarkFilled, ErrorFilled } from "@/registry/icons"
import { cn } from "@/registry/lib/utils"
import { Icon } from "@/registry/ui/icon"
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
 */
export function InlineLoading({ status = "active", description, mode = "basic", className }: { status?: "active" | "finished" | "error" | "inactive"; description?: React.ReactNode; mode?: ThinkingMode; className?: string }) {
  // Never pops: while inactive it keeps a zero-width slot; appearing/leaving fades, blurs and grows/collapses its width.
  const [last, setLast] = React.useState({ status, description })
  if (status !== "inactive" && (status !== last.status || description !== last.description)) setLast({ status, description })
  const shown = status === "inactive" ? last : { status, description }
  const visible = status !== "inactive"
  return (
    <div
      role="status"
      aria-live="polite"
      aria-hidden={!visible || undefined}
      className={cn("inline-grid items-center self-center motion-productive", visible ? "grid-cols-[1fr] opacity-100 blur-none" : "grid-cols-[0fr] opacity-0 blur-xs", className)}
    >
      <div className="flex min-w-0 items-center overflow-hidden">
        <div className="flex items-center gap-2 text-footnote leading-none whitespace-nowrap text-muted-foreground">
          {shown.status === "active" && <Thinking mode={mode} size="sm" tone={mode === "basic" ? "brand" : undefined} label={typeof shown.description === "string" ? shown.description : "Working"} />}
          {shown.status === "finished" && <Icon as={CheckmarkFilled} draw="in" className="text-success" />}
          {shown.status === "error" && <Icon as={ErrorFilled} draw="in" className="text-error" />}
          {shown.description && <span className={shown.status === "error" ? "text-error-foreground" : undefined}>{typeof shown.description === "string" ? <AnimatedText>{shown.description}</AnimatedText> : shown.description}</span>}
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
