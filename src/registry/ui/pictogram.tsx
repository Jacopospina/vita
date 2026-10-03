import * as React from "react"
import { cn } from "@/registry/lib/utils"
import { cachedShape, measurePictogram, rememberShape, roundedPath, type PictogramShape } from "@/registry/lib/pictogram-shape"

/**
 * Pictogram, large illustrative symbols (from @/registry/pictograms) for empty states, onboarding and tiles.
 * Drawn in Vita's hand: every corner is rounded (never sharp) to the theme's radius, lines take the theme's weight.
 *
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

/* The theme's radius, live: the theme editor (or a product) can change --vita-radius at any time. One observer for
   every pictogram on the page. */
const listeners = new Set<() => void>()
let observer: MutationObserver | null = null
function subscribe(fn: () => void) {
  listeners.add(fn)
  if (!observer && typeof MutationObserver !== "undefined") {
    observer = new MutationObserver(() => listeners.forEach((l) => l()))
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["style", "class", "data-theme"] })
  }
  return () => {
    listeners.delete(fn)
    if (!listeners.size) { observer?.disconnect(); observer = null }
  }
}
function radiusPx() {
  if (typeof window === "undefined") return 8
  const v = getComputedStyle(document.documentElement).getPropertyValue("--vita-radius").trim()
  const n = parseFloat(v)
  if (!Number.isFinite(n)) return 8
  return v.endsWith("rem") ? n * parseFloat(getComputedStyle(document.documentElement).fontSize) : n
}
/** Corner radius in pictogram units (a 32-unit drawing): never sharp (0.35 at a square theme), softer as the theme is. */
const cornerUnits = (px: number) => 0.35 + px * 0.11

export function Pictogram({ as: Glyph, size = "lg", tone = "brand", label, className }: PictogramProps) {
  const [shape, setShape] = React.useState<PictogramShape | null | undefined>(() => cachedShape(Glyph))
  const probe = React.useRef<HTMLSpanElement>(null)
  // Measured once per pictogram (cached for every later one), before the first paint: no flash of the source drawing.
  React.useLayoutEffect(() => {
    if (shape !== undefined) return
    const svg = probe.current?.querySelector("svg")
    const s = svg ? measurePictogram(svg) : null
    rememberShape(Glyph, s)
    setShape(s)
  }, [Glyph, shape])
  const radius = React.useSyncExternalStore(subscribe, radiusPx, () => 8)

  const a11y = { "aria-hidden": label ? undefined : true, "aria-label": label, role: label ? "img" : undefined } as const
  const toneClass = tone === "brand" ? "text-primary" : "text-muted-foreground"

  // Not measured yet (the probe below) or can't be (no geometry): the source drawing, with Vita's line weight.
  if (!shape) {
    return (
      <span ref={probe} className={cn("relative inline-flex shrink-0", sizeClass[size], toneClass, className)}>
        <Glyph {...a11y} className="glyph size-full fill-current" />
      </span>
    )
  }

  const r = cornerUnits(radius)
  return (
    <span {...a11y} className={cn("relative inline-flex shrink-0", sizeClass[size], toneClass, className)}>
      <svg aria-hidden viewBox={`0 0 ${shape.w} ${shape.h}`} className="glyph size-full fill-current">
        {shape.parts.map((part, i) => <path key={i} fillRule="evenodd" d={part.map((c, j) => roundedPath(c, r, shape.holes[i][j])).join("")} />)}
      </svg>
    </span>
  )
}
