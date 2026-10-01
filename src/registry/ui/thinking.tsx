import * as React from "react"
import { cn } from "@/registry/lib/utils"

/**
 * Thinking — how Corpus shows that something is working. The spinner belongs to the old world.
 * Tiny particles blend like liquid when they overlap (metaballs) and keep changing form:
 *
 *   basic       plain logic, no agent involved — three droplets orbit and merge, calm and steady
 *   retrieving  agent recalling from memory — particles stream in from the edges into the core
 *   generating  agent creating — the orb of tiny dots shape-shifts: circle, star, infinity, squircle, blob
 *   searching   agent looking things up — a comet with a fading trail scans a wobbling orbit
 *
 * Agentic modes wear the AI spectrum; basic follows the current text color.
 */
export type ThinkingMode = "basic" | "retrieving" | "generating" | "searching"
const sizes = { sm: 16, md: 24, lg: 48, xl: 96, "2xl": 160 } as const
type P = { x: number; y: number; r: number }

const TAU = Math.PI * 2
const smooth = (x: number) => x * x * (3 - 2 * x)

/* Shapes for the generating orb: u ∈ [0,1) along the contour → point (unit radius ~0.7). */
const shapes: ((u: number, t: number) => [number, number])[] = [
  (u) => [Math.cos(u * TAU) * 0.62, Math.sin(u * TAU) * 0.62],
  (u) => { const a = u * TAU; const r = 0.54 + 0.1 * Math.cos(5 * a); return [Math.cos(a) * r, Math.sin(a) * r] }, // a soft flower, never a star
  (u) => { const a = u * TAU; return [Math.cos(a) * 0.72, Math.sin(2 * a) * 0.4] },
  (u) => { const a = u * TAU; const c = Math.cos(a), s = Math.sin(a); return [Math.sign(c) * Math.abs(c) ** 0.75 * 0.58, Math.sign(s) * Math.abs(s) ** 0.75 * 0.58] }, // rounded, no corners
  (u, t) => { const a = u * TAU; const r = 0.52 + 0.12 * Math.sin(2 * a + t) + 0.09 * Math.sin(3 * a - t * 1.3); return [Math.cos(a) * r, Math.sin(a) * r] },
  (u) => { const a = u * TAU; const r = 0.5 + 0.16 * Math.cos(3 * a); return [Math.cos(a) * r, Math.sin(a) * r] },
]

/**
 * Small orbs (≤ 24px) drop the detail and keep one bold, readable silhouette per mode:
 *   basic → three drops orbit and merge · retrieving → a few drops fall into the core
 *   generating → four drops split apart and fuse again · searching → a comet circles with a short tail
 */
function simpleParticles(mode: ThinkingMode, t: number): P[] {
  const out: P[] = []
  if (mode === "retrieving") {
    out.push({ x: 0, y: 0, r: 0.3 + 0.05 * Math.sin(t * 3) })
    for (let i = 0; i < 3; i++) {
      const p = (t * 0.7 + i / 3) % 1
      const a = (i * TAU) / 3 + 0.6
      const rad = 0.95 * (1 - p) ** 1.3
      out.push({ x: Math.cos(a) * rad, y: Math.sin(a) * rad, r: 0.12 + 0.08 * p })
    }
    return out
  }
  if (mode === "generating") {
    // Plump drops that stretch into thick bridges before they part — gooey, never pinched.
    const rad = 0.1 + 0.36 * smooth((Math.sin(t * 2.4) + 1) / 2)
    for (let k = 0; k < 4; k++) {
      const a = t * 1.1 + (k * TAU) / 4
      out.push({ x: Math.cos(a) * rad, y: Math.sin(a) * rad, r: 0.3 })
    }
    return out
  }
  if (mode === "searching") {
    for (let j = 0; j < 4; j++) {
      const a = t * 3 - j * 0.38
      out.push({ x: Math.cos(a) * 0.52, y: Math.sin(a) * 0.52, r: 0.26 - j * 0.055 })
    }
    return out
  }
  return particles("basic", 3, t, [])
}

function particles(mode: ThinkingMode, n: number, t: number, seeds: number[]): P[] {
  const out: P[] = []
  if (mode === "basic") {
    for (let k = 0; k < 3; k++) {
      const a = t * 2.2 + (k * TAU) / 3
      const rad = 0.36 + 0.16 * Math.sin(t * 2.6 + k * 1.3)
      out.push({ x: Math.cos(a) * rad, y: Math.sin(a) * rad, r: 0.2 })
    }
    return out
  }
  if (mode === "retrieving") {
    out.push({ x: 0, y: 0, r: 0.24 + 0.04 * Math.sin(t * 3) })
    for (let i = 0; i < n; i++) {
      const p = (t * 0.45 + seeds[i]) % 1
      const rad = 0.95 * (1 - p) ** 1.6
      const a = seeds[i] * TAU + p * 2.2
      out.push({ x: Math.cos(a) * rad, y: Math.sin(a) * rad, r: 0.045 + 0.08 * p })
    }
    return out
  }
  if (mode === "searching") {
    const head = t * 2.6
    const orbit = 0.55 + 0.1 * Math.sin(t * 1.3)
    out.push({ x: 0, y: 0, r: 0.09 + 0.02 * Math.sin(t * 4) })
    for (let j = 0; j < n; j++) {
      const a = head - j * 0.14
      const k = 1 - j / n
      out.push({ x: Math.cos(a) * orbit, y: Math.sin(a) * orbit * 0.82, r: 0.03 + 0.15 * k * k })
    }
    return out
  }
  // generating: tiny dots continuously re-forming the orb into shapes, with displacement
  const period = 1.7
  const idx = Math.floor(t / period)
  const local = (t % period) / period
  const k = smooth(Math.min(1, Math.max(0, (local - 0.55) / 0.45)))
  const A = shapes[idx % shapes.length]
  const B = shapes[(idx + 1) % shapes.length]
  const breathe = 1 + 0.05 * Math.sin(t * 2.4)
  for (let i = 0; i < n; i++) {
    const u = (i / n + t * 0.04) % 1
    const [ax, ay] = A(u, t)
    const [bx, by] = B(u, t)
    const dx = 0.05 * Math.sin(t * 3.1 + i * 1.7) + 0.03 * Math.sin(t * 5.3 + seeds[i] * 9)
    const dy = 0.05 * Math.cos(t * 2.3 + i * 1.3) + 0.03 * Math.cos(t * 4.7 + seeds[i] * 7)
    out.push({ x: (ax + (bx - ax) * k) * breathe + dx, y: (ay + (by - ay) * k) * breathe + dy, r: 0.07 + 0.02 * Math.sin(t * 4 + i) })
  }
  out.push({ x: 0.04 * Math.sin(t * 1.7), y: 0.04 * Math.cos(t * 1.3), r: 0.16 + 0.05 * Math.sin(t * 2.1) })
  return out
}

/**
 * Performance budget — loading must never cost the user's machine:
 *   · ONE shared animation loop for every orb on the page (not one per instance)
 *   · orbs off-screen or in a hidden tab don't draw at all
 *   · frame-capped: the liquid reads as smooth at 30fps (small) / 40fps (large); the goo filter only
 *     re-runs when a frame is actually drawn
 *   · canvases at device resolution (max 2×), the lighting chain + glints only on big orbs (≥ 48px)
 *   · reduced motion / Save-Data → one still frame
 */
type Tick = (now: number) => void
const ticks = new Set<Tick>()
let loop = 0
function frame(now: number) {
  ticks.forEach((t) => t(now))
  loop = ticks.size ? requestAnimationFrame(frame) : 0
}
function onTick(t: Tick) {
  ticks.add(t)
  if (!loop) loop = requestAnimationFrame(frame)
  return () => void ticks.delete(t)
}

export interface ThinkingProps {
  mode?: ThinkingMode
  size?: keyof typeof sizes
  /** spectrum = AI (default for agentic modes) · current = inherit text color (default for basic) · brand */
  tone?: "spectrum" | "current" | "brand"
  /** Announced to screen readers, e.g. "Searching the help center". */
  label?: string
  className?: string
}

export function Thinking({ mode = "generating", size = "md", tone, label = "Thinking", className }: ThinkingProps) {
  const px = sizes[size]
  const ref = React.useRef<HTMLCanvasElement>(null)
  const glintRef = React.useRef<HTMLCanvasElement>(null)
  const fid = "corpus-goo-" + React.useId().replace(/[^a-zA-Z0-9]/g, "")
  const resolvedTone = tone ?? (mode === "basic" ? "current" : "spectrum")

  React.useEffect(() => {
    const canvas = ref.current
    const ctx = canvas?.getContext("2d")
    if (!canvas || !ctx) return
    // Device resolution, capped: the goo blur already antialiases the edges.
    const dpr = Math.min(2, window.devicePixelRatio || 1)
    canvas.width = px * dpr
    canvas.height = px * dpr
    ctx.scale(dpr, dpr)
    const glintsOn = mode !== "basic" && px >= 48
    const gcanvas = glintsOn ? glintRef.current : null
    const gctx = gcanvas?.getContext("2d") ?? null
    if (gcanvas && gctx) {
      gcanvas.width = px * dpr
      gcanvas.height = px * dpr
      gctx.scale(dpr, dpr)
    }
    const glints = glintsOn
    const simple = px <= 24
    // Small orbs: fewer, proportionally larger particles so they stay solid down to 16px.
    const n = mode === "searching" ? Math.max(6, Math.min(28, Math.round(px / 3))) : Math.max(7, Math.min(90, Math.round(px / 1.1)))
    const grow = Math.min(2.4, Math.max(1, 40 / px))
    const seeds = Array.from({ length: n }, (_, i) => (Math.sin(i * 127.1) * 43758.5453) % 1).map((s) => Math.abs(s))
    const saveData = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData === true
    const reduced = saveData || window.matchMedia?.("(prefers-reduced-motion: reduce)").matches
    const interval = 1000 / (px >= 48 ? 40 : 30)
    const root = getComputedStyle(document.documentElement)
    const spectrum = ["blue", "indigo", "purple", "pink", "orange", "mint", "cyan"].map((h) => root.getPropertyValue(`--corpus-palette-${h}-500`).trim())
    let color = getComputedStyle(canvas).color
    let last = 0
    let drawn = -Infinity
    const start = performance.now()
    const R = px * 0.42
    const draw = (now: number) => {
      const t = reduced ? 0.9 : (now - start) / 1000
      if (now - last > 2000) {
        color = getComputedStyle(canvas).color
        last = now
      }
      ctx.clearRect(0, 0, px, px)
      if (resolvedTone === "spectrum" && "createConicGradient" in ctx) {
        const g = ctx.createConicGradient(t * 1.2, px / 2, px / 2)
        spectrum.forEach((c, i) => g.addColorStop(i / spectrum.length, c))
        g.addColorStop(1, spectrum[0])
        ctx.fillStyle = g
      } else {
        ctx.fillStyle = color
      }
      for (const p of simple ? simpleParticles(mode, t) : particles(mode, n, t, seeds)) {
        ctx.beginPath()
        // ×1.3: the wide goo blur eats into each drop — plumper drops keep the liquid full-bodied and its joins round.
        ctx.arc(px / 2 + p.x * R, px / 2 + p.y * R, simple ? p.r * R : Math.max(0.6, Math.min(0.34, p.r * grow) * R * 1.3), 0, TAU)
        ctx.fill()
      }
      // Glints: tiny twinkling sparkles around agentic orbs (drawn crisp, outside the liquid).
      if (gctx) {
        gctx.clearRect(0, 0, px, px)
        if (glints) {
          for (let i = 0; i < 6; i++) {
            const a = seeds[i % seeds.length] * TAU + t * (0.35 + i * 0.07)
            const rad = R * (0.92 + 0.12 * Math.sin(t * 1.3 + i))
            const tw = Math.max(0, Math.sin(t * 2.2 + i * 1.9))
            gctx.globalAlpha = tw * 0.9
            gctx.fillStyle = "white"
            gctx.beginPath()
            gctx.arc(px / 2 + Math.cos(a) * rad, px / 2 + Math.sin(a) * rad, Math.max(0.6, px * 0.009) * (0.6 + tw), 0, TAU)
            gctx.fill()
          }
          gctx.globalAlpha = 1
        }
      }
    }
    draw(start)
    if (reduced) return
    // Only tick while on screen; the shared loop itself stops when no orb needs it.
    let off: (() => void) | null = null
    const tick = (now: number) => {
      if (now - drawn < interval) return
      drawn = now
      draw(now)
    }
    const setVisible = (v: boolean) => {
      if (v && !off) off = onTick(tick)
      else if (!v && off) {
        off()
        off = null
      }
    }
    if (typeof IntersectionObserver === "undefined") {
      setVisible(true)
      return () => setVisible(false)
    }
    const io = new IntersectionObserver(([e]) => setVisible(e.isIntersecting))
    io.observe(canvas)
    return () => {
      io.disconnect()
      setVisible(false)
    }
  }, [mode, px, resolvedTone])

  // Liquid + light: goo → a second round of melt (rounds every neck and tip) → specular highlight → a pastel glow
  // behind. A WIDE blur with a gentle threshold is what makes it gooey: drops reach for each other through thick,
  // rounded bridges instead of snapping together at a sharp pinch. No drop shadow.
  const blur = px <= 24 ? px * 0.085 : px * 0.065
  const lit = px >= 48
  return (
    <span role="status" aria-live="polite" className={cn("relative inline-flex shrink-0", resolvedTone === "brand" && "text-primary", className)} style={{ width: px, height: px }}>
      <svg aria-hidden width="0" height="0" className="absolute">
        <defs>
          <filter id={fid} x="-40%" y="-40%" width="180%" height="180%" colorInterpolationFilters="sRGB">
            <feGaussianBlur in="SourceGraphic" stdDeviation={blur} result="blur" />
            <feColorMatrix in="blur" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 20 -8" result="melt" />
            {/* Melt again: blur the shape a touch and re-threshold, so any leftover point or kink rounds off. */}
            <feGaussianBlur in="melt" stdDeviation={px * 0.03} result="meltBlur" />
            <feColorMatrix in="meltBlur" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 9 -4" result="goo" />
            {lit ? (
              <>
                <feGaussianBlur in="goo" stdDeviation={px * 0.035} result="soft" />
                <feSpecularLighting in="soft" surfaceScale={px * 0.06} specularConstant="1.1" specularExponent="26" lightingColor="#ffffff" result="spec">
                  <fePointLight x={px * 0.28} y={px * 0.2} z={px * 0.9} />
                </feSpecularLighting>
                <feComposite in="spec" in2="goo" operator="in" result="specIn" />
                <feComposite in="goo" in2="specIn" operator="arithmetic" k1="0" k2="1" k3="0.65" k4="0" result="shaded" />
                {/* Glow behind: emitted, reflected light — wide, washed ~60% toward white (super-light pastel), low alpha. */}
                <feGaussianBlur in="goo" stdDeviation={px * 0.16} result="glowBlur" />
                <feColorMatrix in="glowBlur" values="0.4 0 0 0 0.6  0 0.4 0 0 0.6  0 0 0.4 0 0.6  0 0 0 0.32 0" result="glow" />
                <feMerge>
                  <feMergeNode in="glow" />
                  <feMergeNode in="shaded" />
                </feMerge>
              </>
            ) : null}
          </filter>
        </defs>
      </svg>
      <canvas ref={ref} aria-hidden className="motion-reduce:animate-[corpus-pulse_2s_ease-in-out_infinite]" style={{ width: px, height: px, filter: `url(#${fid})` }} />
      {mode !== "basic" && px >= 48 && <canvas ref={glintRef} aria-hidden className="pointer-events-none absolute inset-0" style={{ width: px, height: px }} />}
      <span className="sr-only">{label}</span>
    </span>
  )
}
