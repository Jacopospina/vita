import * as React from "react"
import type { IconType } from "@/registry/icons"
import { cn, motionMs } from "@/registry/lib/utils"
import { contoursOf, pairContours, frame } from "@/registry/lib/morph"

/**
 * Icon, the only way to render an icon. Renders glyphs from @/registry/icons at Vita sizes.
 * sm 16 (inline with body text, inside controls) · md 20 (standalone, toolbars, header) · lg 24 (empty states in dense UI) · xl 32 (tiles)
 */
const sizes = { sm: 16, md: 20, lg: 24, xl: 32 } as const

export interface IconProps extends Omit<React.SVGProps<SVGSVGElement>, "ref"> {
  as: IconType
  size?: keyof typeof sizes
  /** Provide a label only when the icon carries meaning on its own. Decorative icons stay silent. */
  label?: string
  /** Entrance/exit by drawing the glyph's path: "in" traces then fills, "out" fades the fill then un-traces. */
  draw?: "in" | "out"
}

const glyphIds = new WeakMap<object, number>()
let glyphSeq = 0
const glyphId = (icon: object) => {
  if (!glyphIds.has(icon)) glyphIds.set(icon, ++glyphSeq)
  return glyphIds.get(icon)!
}

/**
 * SwapIcon, use whenever the glyph depends on state (copy → copied, status, sort direction, step, menu/close).
 * The first glyph renders still. On every change the old glyph MORPHS into the new one: its outline flows, point by
 * point, into the next shape (pieces grow out of or fold into each other), like a design tool's smart animate.
 * Where geometry can't be measured (tests, very old browsers) the old glyph un-draws while the new one draws in.
 * Reduced motion: the new glyph simply appears.
 */
export function SwapIcon({ as, className, size = "sm", ...props }: IconProps) {
  const [current, setCurrent] = React.useState(() => as)
  const [previous, setPrevious] = React.useState<IconType | null>(null)
  // "morph" while the outline flows; "draw" when it can't be measured (the fallback); null when still.
  const [mode, setMode] = React.useState<"morph" | "draw" | null>(null)
  if (as !== current) {
    setPrevious(() => current)
    setCurrent(() => as)
    setMode("morph")
  }
  const from = React.useRef<HTMLSpanElement>(null)
  const to = React.useRef<HTMLSpanElement>(null)
  const shape = React.useRef<SVGPathElement>(null)
  React.useLayoutEffect(() => {
    if (!previous || mode !== "morph") return
    const a = from.current?.querySelector("svg"), b = to.current?.querySelector("svg")
    const ca = a && contoursOf(a), cb = b && contoursOf(b)
    const duration = motionMs(320)
    // Can't measure → the draw fallback; no motion → the new glyph simply appears. Decided next frame, not mid-effect.
    if (!ca || !cb || !duration) {
      const r = requestAnimationFrame(() => { if (!ca || !cb) setMode("draw"); else { setPrevious(null); setMode(null) } })
      return () => cancelAnimationFrame(r)
    }
    const [pa, pb, roles] = pairContours(ca, cb)
    const start = performance.now()
    let raf = 0
    const tick = (now: number) => {
      const x = Math.min(1, (now - start) / duration)
      // Productive ease (in-out): the outline sets off gently and lands softly.
      const t = x < 0.5 ? 4 * x * x * x : 1 - (-2 * x + 2) ** 3 / 2
      shape.current?.setAttribute("d", frame(pa, pb, t, roles))
      if (x < 1) raf = requestAnimationFrame(tick)
      else { setPrevious(null); setMode(null) }
    }
    shape.current?.setAttribute("d", frame(pa, pb, 0, roles))
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [previous, mode])
  React.useEffect(() => {
    if (!previous || mode !== "draw") return
    const t = window.setTimeout(() => { setPrevious(null); setMode(null) }, 260)
    return () => window.clearTimeout(t)
  }, [previous, mode])
  const px = sizes[size]
  return (
    <span className={cn("relative inline-flex shrink-0", className)}>
      {previous && mode === "draw" && <Icon key={`p${glyphId(previous)}`} as={previous} size={size} {...props} draw="out" className="absolute inset-0" />}
      {previous && mode === "morph" && (
        <>
          {/* The two glyphs are measured, never seen; the morph draws in their place, in the text colour. */}
          <span ref={from} aria-hidden className="pointer-events-none invisible absolute inset-0"><Icon as={previous} size={size} {...props} /></span>
          <svg aria-hidden viewBox="0 0 1 1" width={px} height={px} className="pointer-events-none absolute inset-0 shrink-0 fill-current">
            <path ref={shape} fillRule="evenodd" />
          </svg>
        </>
      )}
      <span ref={to} className={cn("inline-flex transition-none", previous && mode === "morph" && "opacity-0")}>
        <Icon key={glyphId(current)} as={current} size={size} {...props} draw={previous && mode === "draw" ? "in" : undefined} />
      </span>
    </span>
  )
}

/**
 * DrawnMark, the check / dash used by selection controls. It is a stroke, so it DRAWS in when
 * selected and un-draws when cleared (checkbox, menu and list checkmarks).
 */
/** The un-drawn offset: a hair PAST the path's end. At exactly 1 the dash's edge sits on the path's end point and its
    round cap still paints there, a dot on an unchecked box. Past the end, no edge lies on the path, so nothing shows. */
export const DRAWN_OFF = 1.02

export function DrawnMark({ kind = "check", on, className }: { kind?: "check" | "dash"; on: boolean; className?: string }) {
  return (
    <svg viewBox="0 0 16 16" width={16} height={16} aria-hidden fill="none" className={cn("shrink-0", className)}>
      <path
        d={kind === "check" ? "M3.5 8.5 6.5 11.5 12.5 4.5" : "M4 8h8"}
        pathLength={1}
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        // One dash the path's length, then a gap longer than the path, so no second dash edge can land on it.
        strokeDasharray="1 2"
        strokeDashoffset={on ? 0 : DRAWN_OFF}
        // Only the drawing transitions. The stroke colour follows its owner at once (a mark turning white with its
        // box must not glide from black while it draws).
        className={cn("transition-[stroke-dashoffset] motion-expressive", on ? "duration-expressive" : "duration-moderate-01")}
      />
    </svg>
  )
}

export function Icon({ as: Glyph, size = "sm", label, className, draw, ...props }: IconProps) {
  const ref = React.useRef<SVGSVGElement>(null)
  React.useLayoutEffect(() => {
    if (!draw || !ref.current) return
    ref.current.querySelectorAll("path, circle, rect, polygon, ellipse").forEach((el) => el.setAttribute("pathLength", "1"))
  }, [draw])
  return (
    <Glyph
      ref={ref}
      size={sizes[size]}
      aria-hidden={label ? undefined : true}
      aria-label={label}
      role={label ? "img" : undefined}
      className={cn("shrink-0 fill-current", draw === "in" && "icon-draw", draw === "out" && "icon-undraw", className)}
      {...(props as object)}
    />
  )
}

/**
 * ProgressGlyph, "in progress", alive: the ring holds still while the pie inside advances slice by slice.
 * Use instead of spinning an icon. Reduced motion shows a still quarter.
 */
export function ProgressGlyph({ size = "sm", className, label }: { size?: keyof typeof sizes; className?: string; label?: string }) {
  const px = sizes[size]
  return (
    <svg viewBox="0 0 16 16" width={px} height={px} fill="none" role={label ? "img" : undefined} aria-label={label} aria-hidden={label ? undefined : true} className={cn("shrink-0", className)}>
      <circle cx="8" cy="8" r="6.5" stroke="currentColor" strokeWidth="1.5" />
      <circle
        cx="8"
        cy="8"
        r="2.75"
        pathLength={100}
        stroke="currentColor"
        strokeWidth="5.5"
        transform="rotate(-90 8 8)"
        strokeDasharray="25 100"
        className="motion-safe:animate-[vita-pie_4.8s_var(--vita-ease-productive)_infinite]"
      />
    </svg>
  )
}
