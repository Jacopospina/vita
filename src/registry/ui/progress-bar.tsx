import * as React from "react"
import { CheckmarkFilled, ErrorFilled } from "@/registry/icons"
import { cn } from "@/registry/lib/utils"
import { Icon } from "@/registry/ui/icon"
import { AnimatedNumber } from "@/registry/ui/animated"
import { animateChildren } from "@/registry/ui/animated"
import { LiquidSim, liquidCoverage, type LiquidMode } from "@/registry/lib/liquid"

/**
 * ProgressBar — progress of a process with a measurable end (upload, import, setup). Omit `value` for indeterminate.
 * Steps a USER completes → ProgressIndicator. Quota/usage ("7 of 10 seats") → ProgressBar with status.
 *
 * The tip is REAL liquid (lib/liquid: a particle fluid with pressure, surface tension, viscosity, wetting walls):
 *   determinate    the body is solid and springs to the value; a small volume of liquid rides its tip — when the
 *                  body slows, the liquid's own inertia surges, sloshes and settles back against it
 *   indeterminate  a slug of liquid is pushed round the tube by a pulsing pump, stretching, tearing and fusing
 *   tone           brand (default) · spectrum (agent work) — finished/error switch to success/error
 * Glow only in dark mode; light mode keeps a faint halo.
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
  const indeterminate = value === undefined && status === "active"
  const pct = status === "finished" ? 100 : Math.min(100, Math.max(0, ((value ?? 0) / max) * 100))
  const color = status === "error" ? "text-error" : status === "finished" ? "text-success" : "text-primary"
  const canvas = React.useRef<HTMLCanvasElement>(null)
  useLiquid(canvas, { mode: indeterminate ? "flow" : "fill", target: pct / 100, spectrum: tone === "spectrum" && status === "active", color })
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
        {/* The canvas clips the liquid to the track (rounded); the glow is a filter outside it. */}
        <canvas
          ref={canvas}
          aria-hidden
          className={cn(
            "absolute inset-0 size-full rounded-full",
            color,
            "[filter:drop-shadow(0_0_1.5px_color-mix(in_oklab,currentColor_30%,transparent))] dark:[filter:drop-shadow(0_0_4px_currentColor)]",
          )}
        />
      </div>
      {helperText && <p className={cn("text-caption", status === "error" ? "text-error-foreground" : "text-helper")}>{animateChildren(helperText)}</p>}
    </div>
  )
}

const HUES = ["blue", "indigo", "purple", "pink", "orange", "blue"]

/** Resolve any CSS colour (oklch, var-resolved…) to sRGB bytes. */
function toRGB(css: string, probe: CanvasRenderingContext2D): [number, number, number] {
  probe.clearRect(0, 0, 1, 1)
  probe.fillStyle = "#000"
  probe.fillStyle = css
  probe.fillRect(0, 0, 1, 1)
  const d = probe.getImageData(0, 0, 1, 1).data
  return [d[0], d[1], d[2]]
}

function useLiquid(ref: React.RefObject<HTMLCanvasElement | null>, opts: { mode: LiquidMode; target: number; spectrum: boolean; color: string }) {
  const sim = React.useRef<LiquidSim | null>(null)
  const kick = React.useRef<() => void>(() => {})
  const { mode, target, spectrum, color } = opts

  React.useEffect(() => {
    const el = ref.current
    const ctx = el?.getContext?.("2d", { willReadFrequently: false })
    if (!el || !ctx) return
    const probe = document.createElement("canvas").getContext("2d", { willReadFrequently: true })
    if (!probe) return
    const reduced = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false

    let w = 0, h = 0, field: Float32Array | undefined, img: ImageData | undefined
    let palette: [number, number, number][] = []
    const readColors = () => {
      const cs = getComputedStyle(el)
      palette = spectrum ? HUES.map((c) => toRGB(cs.getPropertyValue(`--corpus-palette-${c}-500`).trim(), probe)) : [toRGB(cs.color, probe)]
    }

    const s = (sim.current = new LiquidSim(1, mode, 7))
    const resize = () => {
      const r = el.getBoundingClientRect()
      const dpr = Math.min(2, window.devicePixelRatio || 1)
      w = Math.max(1, Math.round(r.width * dpr)); h = Math.max(1, Math.round(r.height * dpr))
      el.width = w; el.height = h
      img = ctx.createImageData(w, h)
      s.L = Math.max(1, r.width / Math.max(1, r.height))
    }
    resize()
    readColors()
    s.target = target
    if (mode === "flow") s.pour(0.25)
    else if (reduced) s.pour(target)

    let t = 0
    const draw = () => {
      if (!img) return
      field = liquidCoverage(s, w, h, field)
      const px = img.data
      const shift = mode === "flow" || spectrum ? t / 4 : 0
      for (let x = 0; x < w; x++) {
        // colour at this column (spectrum flows along the bar)
        let c = palette[0]
        if (palette.length > 1) {
          const u = (((x / w - shift) % 1) + 1) % 1 * (palette.length - 1)
          const a = palette[Math.floor(u)], b = palette[Math.min(palette.length - 1, Math.floor(u) + 1)], f = u - Math.floor(u)
          c = [a[0] + (b[0] - a[0]) * f, a[1] + (b[1] - a[1]) * f, a[2] + (b[2] - a[2]) * f]
        }
        // the liquid's own surface in this column, so the highlight follows the real meniscus
        let top = -1
        for (let y = 0; y < h; y++) if (field[y * w + x] > 0.5) { top = y; break }
        for (let y = 0; y < h; y++) {
          const k = y * w + x, o = k * 4, cov = field[k]
          if (cov <= 0) { px[o + 3] = 0; continue }
          const depth = top < 0 ? 1 : (y - top) / h
          const gloss = depth < 0.35 ? 0.4 * (1 - depth / 0.35) : 0
          const shade = 1 - 0.12 * Math.max(0, depth - 0.5)
          px[o] = (c[0] + (255 - c[0]) * gloss) * shade
          px[o + 1] = (c[1] + (255 - c[1]) * gloss) * shade
          px[o + 2] = (c[2] + (255 - c[2]) * gloss) * shade
          px[o + 3] = cov * 255
        }
      }
      ctx.putImageData(img, 0, 0)
    }

    let raf = 0, last = 0, visible = true
    const tick = (now: number) => {
      // Fixed 60 Hz physics that catches up on slow frames (up to half a second), so the liquid keeps real time.
      let dt = last ? Math.min(0.5, (now - last) / 1000) : 1 / 60
      last = now
      t += dt
      for (; dt > 1e-4; dt -= 1 / 60) s.step(Math.min(dt, 1 / 60))
      draw()
      if (mode === "fill" && s.calm > 0.4) { raf = 0; return }
      raf = requestAnimationFrame(tick)
    }
    const start = () => {
      if (reduced) { if (mode === "fill") s.pour(s.target); draw(); return }
      if (!raf && visible) { last = 0; raf = requestAnimationFrame(tick) }
    }
    kick.current = start
    start()
    draw()

    const ro = new ResizeObserver(() => { resize(); start(); draw() })
    ro.observe(el)
    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting
      if (!visible && raf) { cancelAnimationFrame(raf); raf = 0 } else start()
    })
    io.observe(el)
    // Theme changes (dark, palette, brand) recolour the liquid.
    const mo = new MutationObserver(() => { readColors(); draw() })
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ["class", "style", "data-theme"] })
    return () => { cancelAnimationFrame(raf); ro.disconnect(); io.disconnect(); mo.disconnect(); kick.current = () => {} }
    // The target is fed in below without rebuilding the fluid.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, spectrum, color])

  React.useEffect(() => {
    if (!sim.current) return
    sim.current.target = target
    sim.current.calm = 0
    kick.current()
  }, [target])
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
      {showValue && <span className="absolute text-[0.6rem]"><AnimatedNumber value={Math.round(value)} /></span>}
    </span>
  )
}
