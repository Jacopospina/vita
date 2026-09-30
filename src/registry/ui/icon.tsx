import * as React from "react"
import type { IconType } from "@/registry/icons"
import { cn } from "@/registry/lib/utils"

/**
 * Icon — the only way to render an icon. Renders glyphs from @/registry/icons at Corpus sizes.
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
 * SwapIcon — use whenever the glyph depends on state (status, sort direction, step, menu/close).
 * The first glyph renders still. On every change the old glyph un-draws while the new one draws in.
 */
export function SwapIcon({ as, className, ...props }: IconProps) {
  const [current, setCurrent] = React.useState(() => as)
  const [previous, setPrevious] = React.useState<IconType | null>(null)
  if (as !== current) {
    setPrevious(() => current)
    setCurrent(() => as)
  }
  React.useEffect(() => {
    if (!previous) return
    const t = window.setTimeout(() => setPrevious(null), 260)
    return () => window.clearTimeout(t)
  }, [previous])
  return (
    <span className={cn("relative inline-flex shrink-0", className)}>
      {previous && <Icon key={`p${glyphId(previous)}`} as={previous} {...props} draw="out" className="absolute inset-0" />}
      <Icon key={glyphId(current)} as={current} {...props} draw={previous ? "in" : undefined} />
    </span>
  )
}

/**
 * DrawnMark — the check / dash used by selection controls. It is a stroke, so it DRAWS in when
 * selected and un-draws when cleared (checkbox, menu and list checkmarks).
 */
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
        strokeDasharray={1}
        strokeDashoffset={on ? 0 : 1}
        className={cn("motion-expressive", on ? "duration-expressive" : "duration-moderate-01")}
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
