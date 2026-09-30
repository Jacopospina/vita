import * as React from "react"
import { CheckmarkFilled, ErrorFilled } from "@/registry/icons"
import { cn } from "@/registry/lib/utils"
import { Icon } from "@/registry/ui/icon"
import { AnimatedText } from "@/registry/ui/animated"

/**
 * Loading family. Choose by SCOPE and DURATION:
 *   < 1s              → show nothing (avoid flashes). Delay indicators by ~300ms.
 *   known layout      → Skeleton (preferred: preserves layout, feels faster)
 *   a single action   → InlineLoading (next to the button that triggered it) or Button `loading`
 *   whole region/page → Loading (spinner), with an overlay only if interaction must be blocked
 *   known progress    → ProgressBar
 */
export function Loading({ size = "md", label = "Loading", overlay, className }: { size?: "sm" | "md" | "lg"; label?: string; overlay?: boolean; className?: string }) {
  const s = { sm: "size-4 border-2", md: "size-8 border-[3px]", lg: "size-12 border-4" }[size]
  const spinner = (
    <span role="status" aria-live="polite" className={cn("inline-flex", !overlay && className)}>
      <span className={cn("animate-spin rounded-full border-primary border-r-transparent", s)} />
      <span className="sr-only">{label}</span>
    </span>
  )
  if (!overlay) return spinner
  return <div className={cn("absolute inset-0 z-40 flex items-center justify-center bg-overlay animate-enter-fade", className)}>{spinner}</div>
}

/**
 * InlineLoading — status of a single operation, in place: "Saving…" → "Saved" → (fades). Also covers error.
 */
export function InlineLoading({ status = "active", description, className }: { status?: "active" | "finished" | "error" | "inactive"; description?: React.ReactNode; className?: string }) {
  if (status === "inactive") return null
  return (
    <div role="status" aria-live="polite" className={cn("inline-flex items-center gap-2 text-footnote text-muted-foreground", className)}>
      {status === "active" && <span className="size-4 animate-spin rounded-full border-2 border-primary border-r-transparent" />}
      {status === "finished" && <Icon as={CheckmarkFilled} className="animate-enter-scale text-success" />}
      {status === "error" && <Icon as={ErrorFilled} className="animate-enter-scale text-error" />}
      {description && <span className={status === "error" ? "text-error-foreground" : undefined}>{typeof description === "string" ? <AnimatedText>{description}</AnimatedText> : description}</span>}
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
