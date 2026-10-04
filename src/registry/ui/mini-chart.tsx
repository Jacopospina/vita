import * as React from "react"
import type { IconType } from "@/registry/icons"
import { TriangleSolid } from "@/registry/icons"
import { cn } from "@/registry/lib/utils"
import { Icon, SwapIcon } from "@/registry/ui/icon"
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
/** What a chart needs to be a control: its role, focus, keys and pointer handlers, and a ref to measure it. */
type Control = React.HTMLAttributes<HTMLDivElement> & Record<`aria-${string}`, unknown>

function Frame({ label, size = "md", face, glow, open, className, art, control, rootRef, children }: {
  label: string
  /**
   * An open arc (gauge, range, segments): its ends stop short of the bottom, so its weight sits high. The drawing
   * moves down by the gap its ends leave (about 6.5% of the tile) to look centred; the tile itself never moves, and
   * everything still fits inside it (the knob's top lands at 8%, the arc's ends at 92%).
   */
  open?: boolean
  size?: Size
  face?: boolean
  glow?: MiniTone
  className?: string
  art?: React.ReactNode
  /** Makes the tile a control (a slider, a button); it then answers hover, press and focus. */
  control?: Control
  /** The tile, for a control that measures where the pointer is. */
  rootRef?: React.Ref<HTMLDivElement>
  children?: React.ReactNode
}) {
  return (
    <div
      ref={rootRef}
      role="img"
      {...control}
      aria-label={label}
      className={cn(
        "@container relative shrink-0 rounded-full text-foreground select-none",
        sizeClass[size],
        face && "bg-layer-2",
        control && "focus-ring duration-fast-02 ease-productive active:scale-97 active:duration-fast-01 motion-reduce:active:scale-100",
        control && face && "hover:bg-layer-3",
        className,
      )}
      style={glow ? { backgroundImage: `radial-gradient(circle at 50% 75%, color-mix(in oklch, ${toneVar[glow]} 45%, transparent), transparent 70%)` } : undefined}
    >
      {/* The optical shift moves the drawing inside the tile, never the tile: a chart stays within its own box. */}
      {art && <svg viewBox="0 0 100 100" aria-hidden="true" className={cn("absolute inset-0 size-full overflow-visible", open && "translate-y-[6.5%]")}>{art}</svg>}
      <div aria-hidden="true" className={cn("absolute inset-0 flex flex-col items-center justify-center leading-none", open && "translate-y-[6.5%]")}>{children}</div>
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
const Glyph = ({ icon, className }: { icon: IconType; className?: string }) => <SwapIcon as={icon} className={cn(FILL, "size-[22cqw]", className)} />

/** A morphing icon fills the box it is sized to, centred (its glyph would otherwise stay 16px in a corner). */
const FILL = "items-center justify-center [&>span]:size-full [&_svg]:size-full"

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
    <Frame open
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
      <SwapIcon as={icon} className={cn(FILL, value ? "mb-[3cqw] size-[18cqw]" : "mb-[5cqw] size-[30cqw]", toneText[tone])} />
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
    <Frame open
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

/**
 * A small mode badge for a gauge's footer, a Vita icon in the gauge's tone (Automatic for automatic). Decorative:
 * say the mode in the chart's `label`.
 */
export function MiniBadge({ icon, tone = "success" }: { icon: IconType; tone?: MiniTone }) {
  return <SwapIcon as={icon} className={cn(FILL, "size-[17cqw]", toneText[tone])} />
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
    <Frame open label={label} size={size} art={<><GradientArc r={GAUGE.r} a0={GAUGE.a0} a1={GAUGE.a1} stops={gradient} width={GAUGE.width} /><Knob r={GAUGE.r} angle={angle} /></>}>
      {icon && <Glyph icon={icon} className="mb-[2cqw] size-[16cqw]" />}
      <span className="text-[26cqw] font-medium [font-variant-numeric:tabular-nums]"><AnimatedText face="inherit">{display}</AnimatedText></span>
      {/* Low and high sit in the arc's opening, between its two ends: never on the arc, never outside the tile. */}
      <span className="absolute inset-x-[28cqw] bottom-[10cqw] flex justify-between text-[13cqw] font-medium [font-variant-numeric:tabular-nums]">
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
      {icon && <SwapIcon as={icon} className={cn(FILL, "absolute bottom-[14cqw] size-[18cqw]", toneText[tone])} />}
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
export function MiniLevels({ label, size, levels = 9, active, tone = "info", icon, display, onChange }: {
  label: string
  size?: Size
  levels?: number
  /** The current step, from 0. */
  active: number
  tone?: MiniTone
  icon?: IconType
  display: string
  /** Makes it a stepper: drag or click across the tile, or use the arrow keys. */
  onChange?: (step: number) => void
}) {
  // A step past either end shows the nearest end: the scale always shows where the value is.
  const step = Math.min(Math.max(Math.round(active), 0), levels - 1)
  const ref = React.useRef<HTMLDivElement>(null)
  const [drag, setDrag] = React.useState(false)
  const set = (s: number) => {
    const next = Math.min(Math.max(s, 0), levels - 1)
    if (next !== step) onChange?.(next)
  }
  // Across the middle 60% of the tile, left to right, like the ticks it shows.
  const at = (clientX: number) => {
    const box = ref.current!.getBoundingClientRect()
    set(Math.round((((clientX - box.left) / box.width - 0.2) / 0.6) * (levels - 1)))
  }
  const control: Control | undefined = onChange && {
    role: "slider",
    tabIndex: 0,
    "aria-valuemin": 0,
    "aria-valuemax": levels - 1,
    "aria-valuenow": step,
    "aria-valuetext": display,
    onKeyDown: (e) => {
      const next = e.key === "ArrowRight" || e.key === "ArrowUp" ? step + 1 : e.key === "ArrowLeft" || e.key === "ArrowDown" ? step - 1 : e.key === "Home" ? 0 : e.key === "End" ? levels - 1 : null
      if (next === null) return
      e.preventDefault()
      set(next)
    },
    onPointerDown: (e) => {
      e.currentTarget.setPointerCapture(e.pointerId)
      setDrag(true)
      at(e.clientX)
    },
    onPointerMove: (e) => { if (drag) at(e.clientX) },
    onPointerUp: () => setDrag(false),
    onPointerCancel: () => setDrag(false),
  }
  return (
    // A thumb can still scroll the page; sideways drags and taps pick a step (decision: touch).
    <Frame label={label} size={size} face control={control} rootRef={ref} className={onChange ? cn("touch-pan-y", drag && "cursor-grabbing") : undefined}>
      {icon && <SwapIcon as={icon} className={cn(FILL, "mb-[5cqw] size-[18cqw]", toneText[tone])} />}
      <span className="mb-[5cqw] flex h-[14cqw] items-center gap-[3.5cqw]">
        {Array.from({ length: levels }, (_, i) => (
          <span
            key={i}
            className="w-[1.8cqw] rounded-full duration-moderate-02 ease-productive"
            style={{ height: i === step ? "14cqw" : "9cqw", backgroundColor: i === step ? toneVar[tone] : "var(--vita-disabled-foreground)" }}
          />
        ))}
      </span>
      {/* Words (a named option) set a little smaller than numbers, so "Dramatic" still fits the face. */}
      <span className={cn("font-medium [font-variant-numeric:tabular-nums]", display.length > 5 ? "text-[13cqw]" : "text-[17cqw]")}><AnimatedText face="inherit">{display}</AnimatedText></span>
    </Frame>
  )
}

/** Hues by their real angle (OKLCH), at the palette's vivid lightness and chroma: a knob's angle is exactly its hue. */
const wheel = Array.from({ length: 13 }, (_, i) => `oklch(from var(--vita-palette-blue-500) l c ${i * 30})`)
/** The default outer arc: a light's brightness, dim to bright. */
const brightnessStops = ["color-mix(in oklch, var(--vita-warning) 25%, transparent)", "var(--vita-palette-yellow-500)", "var(--vita-warning)"]
/** Cool through neutral to warm: a temperature, e.g. the tint of a theme's greys. */
export const temperatureStops = ["var(--vita-palette-cyan-500)", "var(--vita-palette-gray-500)", "var(--vita-warning)"]

const OUTER = { r: 46, a0: -160, a1: 160 }
const INNER = { r: 34 }
const turn = (a: number) => ((a % 360) + 360) % 360

/** A knob as an element: a full-size layer turned to the value, the dot at its top. Focusable when it's a slider. */
function DialKnob({ r, angle, radius, dragging, slider }: {
  r: number
  angle: number
  radius: number
  dragging: boolean
  slider?: { label: string; value: number; text: string; onKey: (e: React.KeyboardEvent) => void }
}) {
  return (
    <span
      aria-hidden={slider ? undefined : true}
      className={cn("pointer-events-none absolute inset-0", dragging ? "transition-none" : "duration-moderate-02 ease-productive")}
      style={{ transform: `rotate(${angle}deg)` }}
    >
      <span
        role={slider ? "slider" : undefined}
        tabIndex={slider ? 0 : undefined}
        aria-label={slider?.label}
        aria-valuemin={slider ? 0 : undefined}
        aria-valuemax={slider ? 100 : undefined}
        aria-valuenow={slider ? Math.round(slider.value * 100) : undefined}
        aria-valuetext={slider?.text}
        onKeyDown={slider?.onKey}
        className={cn(
          "absolute -translate-x-1/2 -translate-y-1/2 rounded-full border-[2.5cqw] border-foreground bg-background",
          slider && "pointer-events-auto focus-ring duration-fast-02 ease-productive hover:scale-125 active:scale-110",
        )}
        style={{ left: "50%", top: `${50 - r}%`, width: `${radius * 2}%`, height: `${radius * 2}%` }}
      />
    </span>
  )
}

/**
 * Colour: a hue on the inner wheel and a level on the outer arc (a light's brightness), the icon in the middle.
 * Give it handlers and it becomes the control: drag or click either ring, use the arrow keys on its knobs, and
 * press the middle (`onPress`). The theme panel uses it: the middle switches light and dark, the wheel sets the
 * brand hue, the outer arc the temperature of the greys.
 */
export function MiniColor({ label, size, hue, brightness, icon, center, outer = brightnessStops, onHueChange, onBrightnessChange, onPress, pressLabel, pressed, hueLabel = "Hue", brightnessLabel = "Brightness", describe }: {
  label: string
  size?: Size
  /** 0 to 1 around the wheel (0 and 1 are the same red). */
  hue: number
  /** 0 to 1 along the outer arc. */
  brightness: number
  icon?: IconType
  /** Instead of an icon: what the middle shows (a SwapIcon that changes with the state). */
  center?: React.ReactNode
  /** The outer arc's colours, start to end. */
  outer?: string[]
  onHueChange?: (hue: number) => void
  onBrightnessChange?: (value: number) => void
  /** The middle is a button. */
  onPress?: () => void
  pressLabel?: string
  pressed?: boolean
  hueLabel?: string
  brightnessLabel?: string
  /** Words for a value, read by screen readers ("Warm", "Blue"). */
  describe?: { hue?: (h: number) => string; brightness?: (v: number) => string }
}) {
  const live = !!(onHueChange || onBrightnessChange || onPress)
  const ref = React.useRef<HTMLDivElement>(null)
  const [drag, setDrag] = React.useState<"hue" | "outer" | null>(null)
  const h = turn(hue * 360) / 360
  const b = clamp01(brightness)

  /** Where the pointer is on the 100 × 100 face: its distance from the centre and its angle from 12 o'clock. */
  const read = (e: React.PointerEvent) => {
    const box = ref.current!.getBoundingClientRect()
    const x = ((e.clientX - box.left) / box.width) * 100 - 50
    const y = ((e.clientY - box.top) / box.height) * 100 - 50
    return { r: Math.hypot(x, y), a: (Math.atan2(x, -y) * 180) / Math.PI }
  }
  const apply = (ring: "hue" | "outer", a: number) => {
    if (ring === "hue") onHueChange?.(turn(a) / 360)
    else onBrightnessChange?.(clamp01((a - OUTER.a0) / (OUTER.a1 - OUTER.a0)))
  }
  const down = (e: React.PointerEvent) => {
    const { r, a } = read(e)
    // The middle is its own button; the rest of the face belongs to the ring under the pointer.
    const ring = r >= 40.5 && onBrightnessChange ? "outer" : r >= 29 && r < 40.5 && onHueChange ? "hue" : null
    if (!ring) return
    e.currentTarget.setPointerCapture(e.pointerId)
    setDrag(ring)
    apply(ring, a)
  }
  const move = (e: React.PointerEvent) => { if (drag) apply(drag, read(e).a) }
  const up = () => setDrag(null)

  const keys = (ring: "hue" | "outer") => (e: React.KeyboardEvent) => {
    const now = ring === "hue" ? h : b
    const step = e.shiftKey || e.key.startsWith("Page") ? 0.1 : 1 / 72
    const next =
      e.key === "ArrowRight" || e.key === "ArrowUp" || e.key === "PageUp" ? now + step
      : e.key === "ArrowLeft" || e.key === "ArrowDown" || e.key === "PageDown" ? now - step
      : e.key === "Home" ? 0 : e.key === "End" ? 1 : null
    if (next === null) return
    e.preventDefault()
    if (ring === "hue") onHueChange?.(((next % 1) + 1) % 1)
    else onBrightnessChange?.(clamp01(next))
  }

  const art = (
    <svg viewBox="0 0 100 100" aria-hidden="true" className="absolute inset-0 size-full overflow-visible">
      <GradientArc r={OUTER.r} a0={OUTER.a0} a1={OUTER.a1} stops={outer} width={5} />
      <GradientArc r={INNER.r} a0={0} a1={360} stops={wheel} width={8} />
      <circle cx={50} cy={50} r={29} fill="var(--vita-layer-2)" />
    </svg>
  )
  const middle = center ?? (icon && <SwapIcon as={icon} className={cn(FILL, "size-[20cqw]")} />)
  const knobs = (
    <>
      <DialKnob r={OUTER.r} angle={OUTER.a0 + b * (OUTER.a1 - OUTER.a0)} radius={3.6} dragging={drag === "outer"}
        slider={onBrightnessChange && { label: brightnessLabel, value: b, text: describe?.brightness?.(b) ?? `${Math.round(b * 100)}%`, onKey: keys("outer") }} />
      <DialKnob r={INNER.r} angle={h * 360} radius={4} dragging={drag === "hue"}
        slider={onHueChange && { label: hueLabel, value: h, text: describe?.hue?.(h) ?? `${Math.round(h * 360)} degrees`, onKey: keys("hue") }} />
    </>
  )

  if (!live) {
    return (
      <Frame label={label} size={size} art={<>
        <GradientArc r={OUTER.r} a0={OUTER.a0} a1={OUTER.a1} stops={outer} width={5} />
        <Knob r={OUTER.r} angle={OUTER.a0 + b * (OUTER.a1 - OUTER.a0)} radius={3.6} />
        <GradientArc r={INNER.r} a0={0} a1={360} stops={wheel} width={8} />
        <circle cx={50} cy={50} r={29} fill="var(--vita-layer-2)" />
        <Knob r={INNER.r} angle={h * 360} radius={4} />
      </>}>
        {middle}
      </Frame>
    )
  }

  return (
    <div
      ref={ref}
      role="group"
      aria-label={label}
      onPointerDown={down}
      onPointerMove={move}
      onPointerUp={up}
      onPointerCancel={up}
      // A thumb can still scroll the page vertically; sideways and taps turn the rings (decision: touch).
      className={cn("@container relative shrink-0 cursor-grab touch-pan-y rounded-full text-foreground select-none", drag && "cursor-grabbing", sizeClass[size ?? "md"])}
    >
      {art}
      {onPress ? (
        <button
          type="button"
          aria-label={pressLabel}
          aria-pressed={pressed}
          onClick={onPress}
          onPointerDown={(e) => e.stopPropagation()}
          className="absolute inset-[22%] flex items-center justify-center rounded-full bg-layer-2 focus-ring duration-fast-02 ease-productive hover:bg-layer-3 active:scale-95 active:duration-fast-01 motion-reduce:active:scale-100 [&>span]:size-[20cqw] [&>span]:items-center [&>span]:justify-center [&>span>span]:size-full [&_svg]:size-full"
        >
          {middle}
        </button>
      ) : (
        <span aria-hidden="true" className="absolute inset-0 flex items-center justify-center">{middle}</span>
      )}
      {knobs}
    </div>
  )
}

/** Glow: a mode with its reading, the disc lit from below in the mode's colour (Cool, Eco, Boost). */
export function MiniGlow({ label, size, icon, tone = "success", display, caption, onPress, pressed }: {
  label: string
  size?: Size
  icon?: IconType
  tone?: MiniTone
  display: string
  caption?: string
  /** Makes it a toggle (a mode on or off). */
  onPress?: () => void
  pressed?: boolean
}) {
  const control: Control | undefined = onPress && {
    role: "button",
    tabIndex: 0,
    "aria-pressed": pressed,
    onClick: onPress,
    onKeyDown: (e) => {
      if (e.key !== "Enter" && e.key !== " ") return
      e.preventDefault()
      onPress()
    },
  }
  return (
    <Frame label={label} size={size} face glow={tone} control={control}>
      {icon && <SwapIcon as={icon} className={cn(FILL, "mb-[3cqw] size-[16cqw]", toneText[tone])} />}
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
  /** Slides the ruler under the pointer, in ticks (it never runs out). */
  offset?: number
}) {
  const id = React.useId()
  // The ruler goes all the way round, so it can slide forever; only a window at the bottom shows, fading at both
  // ends, like a strip turning past a slot.
  const STEP = 8
  const ticks = Array.from({ length: 360 / STEP }, (_, i) => i)
  const WINDOW = 62
  const fade = Array.from({ length: 24 }, (_, i) => i)
  const slice = (2 * WINDOW) / fade.length
  return (
    <Frame
      label={label}
      size={size}
      face
      art={
        <>
          <defs>
            <mask id={id} maskUnits="userSpaceOnUse" x={0} y={0} width={100} height={100}>
              {fade.map((i) => {
                const a = 180 - WINDOW + i * slice
                const t = (i + 0.5) / fade.length
                return <path key={i} d={arc(37.5, a, a + slice + 0.4)} fill="none" stroke="white" strokeWidth={10} strokeOpacity={f(Math.sin(t * Math.PI) ** 1.5)} />
              })}
            </mask>
          </defs>
          <g mask={`url(#${id})`}>
            <g className="duration-moderate-02 ease-productive" style={{ transform: `rotate(${offset * STEP}deg)`, transformOrigin: "50px 50px" }}>
              {ticks.map((t) => {
                const a = t * STEP
                const long = t % 3 === 0
                const [x0, y0] = pt(41, a)
                const [x1, y1] = pt(long ? 34 : 37, a)
                return <line key={t} x1={f(x0)} y1={f(y0)} x2={f(x1)} y2={f(y1)} stroke="var(--vita-muted-foreground)" strokeWidth={1.4} strokeLinecap="round" />
              })}
            </g>
          </g>
        </>
      }
    >
      {/* The pointer marks now: a Vita glyph, set under the middle of the ruler. */}
      <Icon as={TriangleSolid} className={cn("absolute bottom-[10cqw] size-[9cqw]", toneText[tone])} />
      {icon && <SwapIcon as={icon} className={cn(FILL, "mb-[3cqw] size-[18cqw]", toneText[tone])} />}
      <span className="mb-[14cqw] text-[19cqw] font-medium [font-variant-numeric:tabular-nums]"><AnimatedText face="inherit">{display}</AnimatedText></span>
    </Frame>
  )
}
