import * as React from "react"
import { cn } from "@/registry/lib/utils"

/**
 * Pictogram — large illustrative symbols (from @/registry/pictograms) for empty states, onboarding and tiles.
 * Never use a pictogram as a button or at less than 48px; use Icon instead.
 */
/** md 48 · lg 64 · xl 80 */
const sizeClass = { md: "size-12", lg: "size-16", xl: "size-20" } as const

type PictogramComponent = React.ComponentType<{ className?: string; "aria-hidden"?: boolean; "aria-label"?: string; role?: string }>

export interface PictogramProps {
  as: PictogramComponent
  size?: keyof typeof sizeClass
  tone?: "neutral" | "brand"
  label?: string
  className?: string
}

export function Pictogram({ as: Glyph, size = "lg", tone = "brand", label, className }: PictogramProps) {
  return (
    <Glyph
      aria-hidden={label ? undefined : true}
      aria-label={label}
      role={label ? "img" : undefined}
      className={cn("shrink-0 fill-current", sizeClass[size], tone === "brand" ? "text-primary" : "text-muted-foreground", className)}
    />
  )
}
