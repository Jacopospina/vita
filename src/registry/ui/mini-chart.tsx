import * as React from "react"
import type { IconType } from "@/registry/icons"
import { TriangleSolid } from "@/registry/icons"
import { cn } from "@/registry/lib/utils"
import { Icon } from "@/registry/ui/icon"
import { AnimatedText } from "@/registry/ui/animated"

/**
 * Mini charts, one value at a glance in a round tile the size of a thumb: a gauge, a range, a level, a colour, a
 * progress. For dashboards, device controls and widgets where many values sit side by side. For a trend over
 * time or a comparison, use a full chart; for a single number with context, a KPI.
 *
 * Every mini chart is drawn on a 100 × 100 face, scales with `size`, and announces its `label` to screen readers.
 * Values glide: knobs travel along their arc, fills grow and numbers roll.
 */

export type MiniTone = "primary" | "info" | "success" | "warning" | "error" | "neutral"
type Size = "sm" | "md" | "lg"

/** Semantic tones first; the gradients and the hue wheel borrow palette hues, the way the AI spectrum does. */
const toneVar: Record<MiniTone, string> = {
  primary: "var(--vita-primary)",
  info: "var(--vita-info)",
  success: "var(--vita-success)",
  warning: "var(--vita-warning)",
  error: "var(--vita-error)",
  neutral: "var(--vita-muted-foreground)",
}
const toneText: Record<MiniTone, string> = {
  primary: "text-primary",
  info: "text-info",
  success: "text-success",
  warning: "text-warning",
  error: "text-error",
  neutral: "text-muted-foreground",
}

/** Named gradients for arcs that read cold to hot. */
export const miniGradients = {
  /** Green through yellow to red: temperature, load, risk. */
  heat: ["var(--vita-palette-teal-500)", "var(--vita-success)", "var(--vita-palette-yellow-500)", "var(--vita-warning)", "var(--vita-error)"],
  /** Blue through yellow to red: a heating level. */
  warmth: ["var(--vita-info)", "var(--vita-palette-yellow-500)", "var(--vita-error)"],
  /** Teal through yellow to orange: a comfortable range. */
  comfort: ["var(--vita-palette-teal-500)", "var(--vita-palette-yellow-500)", "var(--vita-warning)"],
}

const hues = ["red", "orange", "yellow", "green", "mint", "teal", "cyan", "blue", "indigo", "purple", "pink", "red"].map((h) => `var(--vita-palette-${h}-500)`)

const sizeClass: Record<Size, string> = { sm: "size-16", md: "size-24", lg: "size-32" }
const TRACK = "var(--vita-layer-3)"

/* ---------------- geometry: angles in degrees, clockwise from 12 o'clock, on a 100 × 100 face ---------------- */

const pt = (r: number, a: number) => [50 + r * Math.sin((a * Math.PI) / 180), 50 - r * Math.cos((a * Math.PI) / 180)] as const
const f = (n: number) => Math.round(n * 100) / 100

function arc(r: number, a0: number, a1: number) {
  const [x0, y0] = pt(r, a0)
  const [x1, y1] = pt(r, a1)
  return `M ${f(x0)} ${f(y0)} A ${r} ${r} 0 ${a1 - a0 > 180 ? 1 : 0} 1 ${f(x1)} ${f(y1)}`
}

/** A colour part-way along a list of stops. */
function along(stops: string[], t: number) {
  const x = Math.min(Math.max(t, 0), 1) * (stops.length - 1)
  const i = Math.min(Math.floor(x), stops.length - 2)
  const k = Math.round((x - i) * 100)
  return k === 0 ? stops[i] : `color-mix(in oklch, ${stops[i]} ${100 - k}%, ${stops[i + 1]})`
}

/** SVG has no sweep gradient: the arc is drawn as short overlapping slices, round only at its two ends. */
function GradientArc({ r, a0, a1, stops, width }: { r: number; a0: number; a1: number; stops: string[]; width: number }) {
  const n = Math.max(8, Math.round((a1 - a0) / 5))
  const step = (a1 - a0) / n
  return (
    <g fill="none" strokeWidth={width}>
      {Array.from({ length: n }, (_, i) => (
        <path
          key={i}
          d={arc(r, a0 + i * step, Math.min(a1, a0 + (i + 1) * step + 0.6))}
          style={{ stroke: along(stops, (i + 0.5) / n) }}
          strokeLinecap={i === 0 || i === n - 1 ? "round" : "butt"}
        />
      ))}
    </g>
  )
}

/** The knob rides the arc: a rotation about the centre, so a new value travels along the curve. */
function Knob({ r, angle, color = "var(--vita-foreground)", radius = 4.5 }: { r: number; angle: number; color?: string; radius?: number }) {
  return (
    <g className="duration-moderate-02 ease-productive" style={{ transform: `rotate(${angle}deg)`, transformOrigin: "50px 50px" }}>
      <circle cx={50} cy={50 - r} r={radius} fill="var(--vita-background)" stroke={color} strokeWidth={2.5} />
    </g>
  )
}

/** The round tile and its stack of content. `face` paints the disc; open charts draw only their arcs. */
function Frame({ label, size = "md", face, glow, className, art, children }: {
  label: string
  size?: Size
  face?: boolean
  glow?: MiniTone
  className?: string
  art?: React.ReactNode
  children?: React.ReactNode
}) {
  return (
    <div
      role="img"
      aria-label={label}
      className={cn("@container relative shrink-0 rounded-full text-foreground", sizeClass[size], face && "bg-layer-2", className)}
      style={glow ? { backgroundImage: `radial-gradient(circle at 50% 75%, color-mix(in oklch, ${toneVar[glow]} 45%, transparent), transparent 70%)` } : undefined}
    >
      {art && <svg viewBox="0 0 100 100" aria-hidden="true" className="absolute inset-0 size-full overflow-visible">{art}</svg>}
      <div aria-hidden="true" className="absolute inset-0 flex flex-col items-center justify-center leading-none">{children}</div>
    </div>
  )
}

/**
 * Value text sized to the face: big for the reading, small for its unit or caption. Readings keep the interface
 * face (a mini chart is read like a watch face, not a table) with even-width digits, so a changing value doesn't jitter.
 */
const Big = ({ children, className }: { children: string; className?: string }) => (
  <span className={cn("text-[23cqw] font-medium [font-variant-numeric:tabular-nums]", className)}><AnimatedText face="inherit">{children}</AnimatedText></span>
)
const Small = ({ children, className }: { children: string; className?: string }) => (
  <span className={cn("text-[15cqw] font-medium text-muted-foreground", className)}><AnimatedText face="inherit">{children}</AnimatedText></span>
)
const Glyph = ({ icon, className }: { icon: IconType; className?: string }) => <Icon as={icon} className={cn("size-[22cqw]", className)} />

const GAUGE = { r: 44, a0: -135, a1: 135, width: 8 }
const clamp01 = (v: number) => Math.min(Math.max(v, 0), 1)

/* ---------------- the family ---------------- */

/** Segments: a level counted in steps (a tank in thirds), with an icon and a reading in the middle. */
export function MiniSegments({ label, size, segments = 3, filled, tone = "info", icon, value }: {
  label: string
  size?: Size
  segments?: number
  /** How many segments are full. */
  filled: number
  tone?: MiniTone
  icon?: IconType
  value?: string
}) {
  const gap = 14
  const span = (GAUGE.a1 - GAUGE.a0 - gap * (segments - 1)) / segments
  return (
    <Frame
      label={label}
      size={size}
      art={Array.from({ length: segments }, (_, i) => {
        const a0 = GAUGE.a0 + i * (span + gap)
        // Full segments fade a little as they climb, so the count reads at a glance.
        const color = i < filled ? `color-mix(in oklch, ${toneVar[tone]} ${100 - (i * 40) / Math.max(1, filled)}%, white)` : TRACK
        return <path key={i} d={arc(GAUGE.r, a0, a0 + span)} fill="none" strokeWidth={GAUGE.width} strokeLinecap="round" className="duration-moderate-02" style={{ stroke: color }} />
      })}
    >
      {icon && <Glyph icon={icon} className="mb-[4cqw]" />}
      {value && <span className="text-[17cqw] font-medium [font-variant-numeric:tabular-nums]"><AnimatedText face="inherit">{value}</AnimatedText></span>}
    </Frame>
  )
}

/** Stat: an icon with a reading (800 rpm) or a short state (a mode, a code) on a filled disc. */
export function MiniStat({ label, size, icon, tone = "primary", value, caption }: {
  label: string
  size?: Size
  icon: IconType
  tone?: MiniTone
  value?: string
  caption?: string
}) {
  return (
    <Frame label={label} size={size} face>
      <Icon as={icon} className={cn(value ? "mb-[3cqw] size-[18cqw]" : "mb-[5cqw] size-[30cqw]", toneText[tone])} />
      {value && <Big>{value}</Big>}
      {caption && <Small className="mt-[3cqw]">{caption}</Small>}
    </Frame>
  )
}

/** Gauge: a value on an open arc. `fill` is a tone (filled up to the value) or a gradient (the whole scale). */
export function MiniGauge({ label, size, value, fill = "success", icon, display, footer }: {
  label: string
  size?: Size
  /** 0 to 1 along the arc. */
  value: number
  fill?: MiniTone | string[]
  icon?: IconType
  display: string
  /** Under the reading: a mode badge, a unit. */
  footer?: React.ReactNode
}) {
  const v = clamp01(value)
  const angle = GAUGE.a0 + v * (GAUGE.a1 - GAUGE.a0)
  const gradient = Array.isArray(fill)
  const color = gradient ? "var(--vita-foreground)" : toneVar[fill]
  return (
    <Frame
      label={label}
      size={size}
      art={
        <>
          {gradient ? (
            <GradientArc r={GAUGE.r} a0={GAUGE.a0} a1={GAUGE.a1} stops={fill} width={GAUGE.width} />
          ) : (
            <>
              <path d={arc(GAUGE.r, GAUGE.a0, GAUGE.a1)} fill="none" stroke={TRACK} strokeWidth={GAUGE.width} strokeLinecap="round" />
              {/* The fill grows along the arc: one dash the length of the path, slid by its offset (which transitions). */}
              <path d={arc(GAUGE.r, GAUGE.a0, GAUGE.a1)} pathLength={1} fill="none" stroke={color} strokeWidth={GAUGE.width} strokeLinecap="round" strokeDasharray="1 1" style={{ strokeDashoffset: 1 - v }} className="duration-moderate-02 ease-productive" />
            </>
          )}
          <Knob r={GAUGE.r} angle={angle} color={color} />
        </>
      }
    >
      {icon && <Glyph icon={icon} className="mb-[3cqw]" />}
      <Big>{display}</Big>
      {footer && <span className="mt-[4cqw] flex">{footer}</span>}
    </Frame>
  )
}

/** A small mode badge for a gauge's footer, a Vita icon in the gauge's tone (Automatic for automatic). */
export function MiniBadge({ icon, label, tone = "success" }: { icon: IconType; label: string; tone?: MiniTone }) {
  return <Icon as={icon} label={label} className={cn("size-[17cqw]", toneText[tone])} />
}

/** Range: a setpoint between a low and a high (a thermostat), on a gradient arc. */
export function MiniRange({ label, size, value, min, max, icon, display, gradient = miniGradients.comfort }: {
  label: string
  size?: Size
  /** 0 to 1 between min and max. */
  value: number
  min: string
  max: string
  icon?: IconType
  display: string
  gradient?: string[]
}) {
  const angle = GAUGE.a0 + clamp01(value) * (GAUGE.a1 - GAUGE.a0)
  return (
    <Frame label={label} size={size} art={<><GradientArc r={GAUGE.r} a0={GAUGE.a0} a1={GAUGE.a1} stops={gradient} width={GAUGE.width} /><Knob r={GAUGE.r} angle={angle} /></>}>
      {icon && <Glyph icon={icon} className="mb-[2cqw] size-[16cqw]" />}
      <span className="text-[30cqw] font-medium [font-variant-numeric:tabular-nums]"><AnimatedText face="inherit">{display}</AnimatedText></span>
      <span className="absolute -bottom-[5cqw] flex w-[70cqw] justify-between text-[15cqw] font-medium [font-variant-numeric:tabular-nums]">
        <span className="text-info"><AnimatedText face="inherit">{min}</AnimatedText></span>
        <span className="text-error"><AnimatedText face="inherit">{max}</AnimatedText></span>
      </span>
    </Frame>
  )
}

/** Arc: a reading above a short shallow arc, the icon below (a seat or a hob's heat level). Open, no disc. */
export function MiniArc({ label, size, value, icon, display, gradient = miniGradients.warmth, tone = "warning" }: {
  label: string
  size?: Size
  value: number
  icon?: IconType
  display: string
  gradient?: string[]
  /** The icon's colour. */
  tone?: MiniTone
}) {
  // The top 70° of a wide circle centred below the face: a shallow bow across the middle.
  const R = 60
  const C = 110
  const a0 = -35
  const a1 = 35
  const n = 14
  const at = (a: number) => [50 + R * Math.sin((a * Math.PI) / 180), C - R * Math.cos((a * Math.PI) / 180)] as const
  const seg = (s: number, e: number) => {
    const [x0, y0] = at(s)
    const [x1, y1] = at(e)
    return `M ${f(x0)} ${f(y0)} A ${R} ${R} 0 0 1 ${f(x1)} ${f(y1)}`
  }
  const step = (a1 - a0) / n
  const angle = a0 + clamp01(value) * (a1 - a0)
  return (
    <Frame
      label={label}
      size={size}
      art={
        <>
          <g fill="none" strokeWidth={7}>
            {Array.from({ length: n }, (_, i) => (
              <path key={i} d={seg(a0 + i * step, Math.min(a1, a0 + (i + 1) * step + 0.6))} style={{ stroke: along(gradient, (i + 0.5) / n) }} strokeLinecap={i === 0 || i === n - 1 ? "round" : "butt"} />
            ))}
          </g>
          <g className="duration-moderate-02 ease-productive" style={{ transform: `rotate(${angle}deg)`, transformOrigin: `50px ${C}px` }}>
            <circle cx={50} cy={C - R} r={4} fill="var(--vita-background)" stroke="var(--vita-foreground)" strokeWidth={2.5} />
          </g>
        </>
      }
    >
      <Big className="absolute top-[14cqw]">{display}</Big>
      {icon && <Icon as={icon} className={cn("absolute bottom-[14cqw] size-[18cqw]", toneText[tone])} />}
    </Frame>
  )
}

/** Media: what's playing, its cover in the middle and its progress around it, with the source as a badge. */
export function MiniMedia({ label, size, cover, progress, badge, badgeTone = "success" }: {
  label: string
  size?: Size
  /** The artwork: an image or any element; it is cropped to a circle. */
  cover: React.ReactNode
  /** 0 to 1 through the track. */
  progress: number
  badge?: IconType
  badgeTone?: MiniTone
}) {
  return (
    <Frame
      label={label}
      size={size}
      face
      art={
        <>
          <circle cx={50} cy={50} r={45} fill="none" stroke={TRACK} strokeWidth={4} />
          <path d={arc(45, 0, 359.9)} pathLength={1} fill="none" stroke={toneVar[badgeTone]} strokeWidth={4} strokeLinecap="round" strokeDasharray="1 1" style={{ strokeDashoffset: 1 - clamp01(progress) }} className="duration-moderate-02 ease-productive" />
        </>
      }
    >
      <span className="absolute inset-[12cqw] overflow-hidden rounded-full [&>*]:size-full [&>*]:object-cover">{cover}</span>
      {badge && (
        <span className={cn("absolute bottom-[14cqw] flex size-[24cqw] items-center justify-center rounded-full border-[2cqw] border-layer-2 text-primary-foreground")} style={{ backgroundColor: toneVar[badgeTone] }}>
          <Icon as={badge} className="size-[13cqw]" />
        </span>
      )}
    </Frame>
  )
}

/** Levels: a step on a short scale of ticks (an energy tariff, a fan speed), with an icon and a reading. */
export function MiniLevels({ label, size, levels = 9, active, tone = "info", icon, display }: {
  label: string
  size?: Size
  levels?: number
  /** The current step, from 0. */
  active: number
  tone?: MiniTone
  icon?: IconType
  display: string
}) {
  // A step past either end shows the nearest end: the scale always shows where the value is.
  const step = Math.min(Math.max(Math.round(active), 0), levels - 1)
  return (
    <Frame label={label} size={size} face>
      {icon && <Icon as={icon} className={cn("mb-[5cqw] size-[18cqw]", toneText[tone])} />}
      <span className="mb-[5cqw] flex h-[14cqw] items-center gap-[3.5cqw]">
        {Array.from({ length: levels }, (_, i) => (
          <span
            key={i}
            className="w-[1.8cqw] rounded-full duration-moderate-02 ease-productive"
            style={{ height: i === step ? "14cqw" : "9cqw", backgroundColor: i === step ? toneVar[tone] : "var(--vita-disabled-foreground)" }}
          />
        ))}
      </span>
      <span className="text-[17cqw] font-medium [font-variant-numeric:tabular-nums]"><AnimatedText face="inherit">{display}</AnimatedText></span>
    </Frame>
  )
}

/** Colour: a light's hue on the inner wheel and its brightness on the outer arc, the icon in the middle. */
export function MiniColor({ label, size, hue, brightness, icon }: {
  label: string
  size?: Size
  /** 0 to 1 around the wheel. */
  hue: number
  /** 0 to 1 along the outer arc. */
  brightness: number
  icon?: IconType
}) {
  const warm = [`color-mix(in oklch, var(--vita-warning) 25%, transparent)`, "var(--vita-palette-yellow-500)", "var(--vita-warning)"]
  return (
    <Frame
      label={label}
      size={size}
      art={
        <>
          <GradientArc r={46} a0={-160} a1={160} stops={warm} width={5} />
          <Knob r={46} angle={-160 + clamp01(brightness) * 320} radius={3.6} />
          <GradientArc r={34} a0={0} a1={360} stops={hues} width={8} />
          <circle cx={50} cy={50} r={29} fill="var(--vita-layer-2)" />
          <Knob r={34} angle={clamp01(hue) * 360} radius={4} />
        </>
      }
    >
      {icon && <Icon as={icon} className="size-[20cqw]" />}
    </Frame>
  )
}

/** Glow: a mode with its reading, the disc lit from below in the mode's colour (Cool, Eco, Boost). */
export function MiniGlow({ label, size, icon, tone = "success", display, caption }: {
  label: string
  size?: Size
  icon?: IconType
  tone?: MiniTone
  display: string
  caption?: string
}) {
  return (
    <Frame label={label} size={size} face glow={tone}>
      {icon && <Icon as={icon} className={cn("mb-[3cqw] size-[16cqw]", toneText[tone])} />}
      <span className="text-[21cqw] font-medium [font-variant-numeric:tabular-nums]"><AnimatedText face="inherit">{display}</AnimatedText></span>
      {caption && <Small className="mt-[3cqw]">{caption}</Small>}
    </Frame>
  )
}

/** Dial: a reading over a ruler that curves along the bottom, the pointer marking now (a charge timer). */
export function MiniDial({ label, size, icon, tone = "success", display, offset = 0 }: {
  label: string
  size?: Size
  icon?: IconType
  tone?: MiniTone
  display: string
  /** Turns the ruler under the pointer, -1 to 1. */
  offset?: number
}) {
  const ticks = Array.from({ length: 13 }, (_, i) => i - 6)
  return (
    <Frame
      label={label}
      size={size}
      face
      art={
        <>
          <g className="duration-moderate-02 ease-productive" style={{ transform: `rotate(${Math.min(Math.max(offset, -1), 1) * 30}deg)`, transformOrigin: "50px 50px" }}>
            {ticks.map((t) => {
              const a = 180 + t * 9
              const long = t % 3 === 0
              const [x0, y0] = pt(41, a)
              const [x1, y1] = pt(long ? 34 : 37, a)
              return <line key={t} x1={f(x0)} y1={f(y0)} x2={f(x1)} y2={f(y1)} stroke="var(--vita-muted-foreground)" strokeWidth={1.4} strokeLinecap="round" />
            })}
          </g>
        </>
      }
    >
      {/* The pointer marks now: a Vita glyph, set under the middle of the ruler. */}
      <Icon as={TriangleSolid} className={cn("absolute bottom-[10cqw] size-[9cqw]", toneText[tone])} />
      {icon && <Icon as={icon} className={cn("mb-[3cqw] size-[18cqw]", toneText[tone])} />}
      <span className="mb-[14cqw] text-[19cqw] font-medium [font-variant-numeric:tabular-nums]"><AnimatedText face="inherit">{display}</AnimatedText></span>
    </Frame>
  )
}
