import * as React from "react"
import { cn } from "@/registry/lib/utils"
import { createOrbGL, MAX_DROPS, type OrbGL } from "@/registry/lib/orb-gl"
import { simulatedVoice } from "@/registry/hooks/use-microphone"

/**
 * Thinking, how Vita shows that something is working. The spinner belongs to the old world.
 * Tiny particles blend like liquid when they overlap (metaballs) and keep changing form:
 *
 *   basic       plain logic, no agent involved, three droplets orbit and merge, calm and steady
 *   retrieving  agent recalling from memory, particles stream in from the edges into the core
 *   generating  agent creating, the orb of tiny dots shape-shifts: circle, star, infinity, squircle, blob
 *   searching   agent looking things up, a comet with a fading trail scans a wobbling orbit
 *
 * Voice (pass `level` to follow real sound; without it Sofia follows a believable simulated voice):
 *   idle        the agent is present and waiting: a calm core, two drops drifting round it
 *   listening   the person is talking: a ring of drops gathers inward with their voice, the core fills
 *   talking     the agent is speaking: its body swells and ripples with its voice, waves travel out
 *
 * Agentic modes are water (docs/decisions/sofia-is-water.md): one lagoon read by depth, turquoise where the body is
 * thin and lagoon blue at its heart, a patch of sun drifting over it, caustic nets of light inside, white glints on
 * the rim. Basic follows the current text color. On a primary surface (a primary button, a brand banner) pass
 * tone="on-primary": the same water washed toward white, so Sofia stays visible and still reads as the AI.
 */
export type ThinkingMode = "basic" | "retrieving" | "generating" | "searching" | "idle" | "listening" | "talking"
const VOICE = new Set<ThinkingMode>(["idle", "listening", "talking"])

/** The voice states: the same liquid, driven by sound (lvl 0 to 1). `k` is how many drops trace a ring. */
function voiceParticles(mode: ThinkingMode, t: number, lvl: number, k: number, small = false): P[] {
  const out: P[] = []
  if (mode === "idle") {
    // Small orbs (16 to 24px) idle as the Vita mark: a thin liquid ring with one drop at its heart, breathing. A blob
    // reads as a dot at that size; the ring reads as Sofia.
    if (small) {
      const n = 12
      for (let i = 0; i < n; i++) {
        const a = (i / n) * TAU + t * 0.35
        const rr = 0.74 + 0.04 * Math.sin(3 * a + t * 1.4)
        out.push({ x: Math.cos(a) * rr, y: Math.sin(a) * rr, r: 0.2 })
      }
      out.push({ x: 0.03 * Math.sin(t * 0.9), y: 0.03 * Math.cos(t * 0.8), r: 0.21 + 0.015 * Math.sin(t * 1.2) })
      return out
    }
    out.push({ x: 0, y: 0, r: 0.3 + 0.025 * Math.sin(t * 1.2) })
    for (let j = 0; j < 2; j++) {
      const a = t * 0.55 + j * Math.PI + 0.4 * Math.sin(t * 0.7 + j)
      const rad = 0.42 + 0.07 * Math.sin(t * 0.9 + j * 2)
      out.push({ x: Math.cos(a) * rad, y: Math.sin(a) * rad, r: 0.13 })
    }
    return out
  }
  if (mode === "listening") {
    // An ear: the ring draws in as the voice gets louder, rippling where the sound arrives; the core fills.
    const rho = 0.6 - 0.2 * lvl
    for (let i = 0; i < k; i++) {
      const a = (i / k) * TAU + t * 0.4
      const rr = rho + 0.06 * lvl * Math.sin(4 * a - t * 6) + 0.02 * Math.sin(3 * a + t * 2)
      out.push({ x: Math.cos(a) * rr, y: Math.sin(a) * rr, r: 0.1 + 0.03 * lvl })
    }
    out.push({ x: 0, y: 0, r: 0.12 + 0.14 * lvl })
    return out
  }
  // talking: the body swells with the voice, its edge ripples in lobes, and each loud moment sends a wave out.
  const body = 0.32 + 0.2 * lvl
  for (let i = 0; i < k; i++) {
    const a = (i / k) * TAU
    // Wobbly: three wandering lobes, a counter-turning five, and a slow sway of the whole body.
    const rr = body + 0.11 * (0.35 + lvl) * Math.sin(3 * a + t * 5 + 0.8 * Math.sin(t * 1.3)) + 0.07 * (0.5 + lvl) * Math.sin(5 * a - t * 3.4) + 0.05 * Math.sin(2 * a + t * 2.1)
    out.push({ x: Math.cos(a) * rr, y: Math.sin(a) * rr, r: 0.12 })
  }
  out.push({ x: 0, y: 0, r: body * 0.9 })
  const phase = (t * 0.9) % 1
  const wave = 0.5 + 0.45 * phase
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * TAU + t * 0.3
    out.push({ x: Math.cos(a) * wave, y: Math.sin(a) * wave, r: 0.07 * (1 - phase) * (0.4 + lvl) })
  }
  return out
}
const sizes = { sm: 16, md: 24, lg: 48, xl: 96, "2xl": 160, "3xl": 280 } as const
/** Sofia's canvases bleed this far past her box on every side (a share of her size), so the glow, the sparkles and
    a drop flung to the rim are never cut square by the canvas itself. Her layout box stays exactly `size`. */
const BLEED = 0.3
type P = { x: number; y: number; r: number }

const TAU = Math.PI * 2
/** Generating's morph: smootherstep, starting and landing at rest. No overshoot, so one shape pours into the next. */
const pour = (x: number) => x * x * x * (x * (6 * x - 15) + 10)
/** Generating's rhythm (seconds of liquid time): each shape holds most of the cycle, then pours over a long window. */
const GEN_PERIOD = 2.4
const GEN_MORPH = 0.45 // share of the period spent changing shape
/** Twist + squash for a figure: the whole orb sways and pulses as it changes shape. */
const sway = (x: number, y: number, t: number, kick: number): [number, number] => {
  const a = 0.22 * Math.sin(t * 1.1) + 0.35 * kick
  const c = Math.cos(a), si = Math.sin(a)
  const sq = 1 + 0.12 * kick // stretch on arrival, then relax
  return [(x * c - y * si) * sq, (x * si + y * c) / sq]
}

/* Shapes for the generating orb: u ∈ [0,1) along the contour → point (unit radius ~0.7). Every one is smooth,
   lobes and curves, never points, so the liquid can pour from one into the next. */
const polar = (r: (a: number, t: number) => number) => (u: number, t: number): [number, number] => {
  const a = u * TAU
  const k = r(a, t)
  return [Math.cos(a) * k, Math.sin(a) * k]
}
/* A shape may also be SEGMENTED: the third value is how present the line is at that point (0 = a gap). */
type Shape = (u: number, t: number) => [number, number] | [number, number, number]
/** Soft dash: 1 inside the first `on` part of each period, fading at both ends, gaps open and close, never blink. */
const dash = (x: number, on: number, edge = 0.07) => {
  const f = ((x % 1) + 1) % 1
  const v = Math.min(1, Math.max(0, Math.min(f, on - f) / edge))
  return v * v * (3 - 2 * v)
}
/** Open figures (strokes, a wave, a C, dots): their drops stay put along the path, drifting would wrap a drop from one
    end to the other in a single frame (a visible jump). They move through their own animation instead. */
const open = new Set<Shape>()
const fixed = (s: Shape) => (open.add(s), s)
/** Walk several straight strokes as one path: u picks the stroke, then the point along it. The strokes never stand
    still, each sways on its own phase, sliding along itself and drifting sideways, so the figure stays alive. */
const strokes = (lines: [number, number, number, number][]) => fixed((u: number, t: number): [number, number] => {
  const f = u * lines.length
  const i = Math.min(lines.length - 1, Math.floor(f))
  const p = f - i
  const [x1, y1, x2, y2] = lines[i]
  const len = Math.hypot(x2 - x1, y2 - y1) || 1
  const tx = (x2 - x1) / len, ty = (y2 - y1) / len
  const slide = 0.1 * Math.sin(t * 2.2 + i * 2.1)
  const drift = 0.05 * Math.sin(t * 1.7 + i * 1.3 + p * 2)
  return [x1 + (x2 - x1) * p + tx * slide - ty * drift, y1 + (y2 - y1) * p + ty * slide + tx * drift]
})
/** Turn a whole figure slowly, so segmented shapes are always in motion. */
const spin = (shape: Shape, speed: number): Shape => {
  const turned: Shape = (u, t) => {
    const [x, y, v] = shape(u, t)
    const c = Math.cos(t * speed), si = Math.sin(t * speed)
    return v === undefined ? [x * c - y * si, x * si + y * c] : [x * c - y * si, x * si + y * c, v]
  }
  if (open.has(shape)) open.add(turned)
  return turned
}
const shapes: Shape[] = [
  polar(() => 0.62), // circle
  polar((a) => 0.54 + 0.1 * Math.cos(5 * a)), // soft flower
  (u) => { const a = u * TAU; return [Math.cos(a) * 0.72, Math.sin(2 * a) * 0.4] }, // infinity
  (u) => { const a = u * TAU; const c = Math.cos(a), s = Math.sin(a); return [Math.sign(c) * Math.abs(c) ** 0.75 * 0.58, Math.sign(s) * Math.abs(s) ** 0.75 * 0.58] }, // rounded square
  polar((a, t) => 0.52 + 0.12 * Math.sin(2 * a + t) + 0.09 * Math.sin(3 * a - t * 1.3)), // wandering blob
  polar((a) => 0.5 + 0.16 * Math.cos(3 * a)), // trefoil
  (u) => { const a = u * TAU; const x = 16 * Math.sin(a) ** 3, y = 13 * Math.cos(a) - 5 * Math.cos(2 * a) - 2 * Math.cos(3 * a) - Math.cos(4 * a); return [x * 0.036, -y * 0.036 + 0.05] }, // heart
  (u) => { const a = u * TAU; return [Math.sin(a) * 0.42 * (1 - Math.cos(a)) ** 0.9 * 0.8, -Math.cos(a) * 0.6] }, // drop
  polar((a) => 0.52 + 0.11 * Math.cos(4 * a)), // clover
  (u) => { const a = u * TAU; return [Math.cos(a) * 0.7, Math.sin(a) * 0.36] }, // wide pill
  (u) => { const a = u * TAU; return [Math.cos(a) * 0.36, Math.sin(a) * 0.7] }, // tall pill
  polar((a) => 0.56 + 0.06 * Math.cos(6 * a)), // soft hexagon
  (u) => { const a = u * TAU; const r = 0.5 + 0.14 * Math.cos(2 * a); return [Math.cos(a) * r * 1.1, Math.sin(a) * r * 0.8] }, // peanut
  (u) => { const a = u * TAU; return [Math.cos(a) * 0.6 * (1 + 0.18 * Math.sin(a)), Math.sin(a) * 0.5 - 0.04] }, // egg
  polar((a, t) => 0.55 + 0.08 * Math.sin(7 * a + t * 2)), // rippling ring
  (u) => { const a = u * TAU; const r = 0.46 + 0.14 * Math.cos(3 * a + Math.PI); return [Math.cos(a) * r, Math.sin(a) * r + 0.04] }, // rounded triangle
  (u) => { const a = u * TAU; return [Math.cos(a) * 0.62 + 0.14 * Math.cos(2 * a), Math.sin(a) * 0.46] }, // bean
  polar((a, t) => 0.5 + 0.13 * Math.sin(a * 2) * Math.sin(t * 0.9) + 0.08 * Math.cos(5 * a - t)), // breathing star-fish (soft)
  // Segmented, minimal figures made of separate strokes.
  (u, t) => { const a = u * TAU + t * 0.6; return [Math.cos(a) * 0.6, Math.sin(a) * 0.6, dash(u * 4, 0.68)] }, // dashed ring, turning
  spin((u) => { const a = u * TAU; const r = 0.5 + 0.12 * Math.cos(3 * a); return [Math.cos(a) * r, Math.sin(a) * r, dash(u * 3 + 0.5, 0.72)] }, -0.9), // three arcs, turning
  (u, t) => { const a = u * TAU; const r = 0.6 + 0.06 * Math.sin(t * 2.4); return [Math.cos(a) * r, Math.sin(a) * r, dash((u + 0.125) * 2, 0.64)] }, // parentheses ( ), breathing
  spin(strokes([[-0.55, -0.3, 0.55, -0.3], [-0.55, 0.3, 0.55, 0.3]]), 0.5), // equals =, turning
  spin(strokes([[-0.6, 0, 0.6, 0], [0, -0.6, 0, 0.6]]), 0.8), // plus +, turning
  spin(strokes([[-0.48, -0.48, 0.48, 0.48], [-0.48, 0.48, 0.48, -0.48]]), -0.7), // cross ×, turning
  spin(strokes([[-0.6, -0.42, 0.6, -0.42], [-0.6, 0, 0.6, 0], [-0.6, 0.42, 0.6, 0.42]]), -0.45), // three lines ≡, turning
  fixed((u, t) => [(u * 2 - 1) * 0.65, Math.sin(u * TAU * 1.5 + t * 3.2) * 0.26]), // wave, travelling
  fixed((u, t) => { const a = u * TAU * 0.78 + 0.35 + t * 1.8; return [Math.cos(a) * 0.58, Math.sin(a) * 0.58] }), // open C, chasing its gap
  fixed((u, t) => { const k = Math.floor(u * 3); const v = u * 3 - k; const a = v * TAU; return [(k - 1) * 0.42 + Math.cos(a) * 0.13, Math.sin(a) * 0.13 + 0.2 * Math.sin(t * 4.5 - k * 1.1)] }), // three dots ···, rippling
]
/* Shuffled order: a fixed permutation that never repeats a shape back to back, so the orb keeps surprising. */
const order = (() => {
  const o = shapes.map((_, i) => i)
  let seed = 7
  for (let i = o.length - 1; i > 0; i--) {
    seed = (seed * 9301 + 49297) % 233280
    const j = Math.floor((seed / 233280) * (i + 1))
    ;[o[i], o[j]] = [o[j], o[i]]
  }
  return o
})()
const shapeAt = (i: number): Shape => shapes[order[((i % order.length) + order.length) % order.length]]

/**
 * Small orbs (≤ 24px) drop the detail and keep one bold, readable silhouette per mode:
 *   basic → three drops orbit and merge · retrieving → a few drops fall into the core
 *   generating → four drops split apart and fuse again · searching → a comet circles with a short tail
 */
function simpleParticles(mode: ThinkingMode, t: number, lvl = 0): P[] {
  if (VOICE.has(mode)) return voiceParticles(mode, t, lvl, 9, true)
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
    // The same shape cycle as the big orb, drawn by a few plump drops that melt into one silhouette.
    const idx = Math.floor(t / GEN_PERIOD)
    const local = (t % GEN_PERIOD) / GEN_PERIOD
    const m = Math.min(1, Math.max(0, (local - (1 - GEN_MORPH)) / GEN_MORPH))
    const k = pour(m)
    const kick = 0.5 * Math.sin(Math.PI * m) // a gentle sway mid-morph, never a jolt
    const A = shapeAt(idx), B = shapeAt(idx + 1)
    const breathe = 0.92 * (1 + 0.07 * Math.sin(t * 3.2))
    for (let i = 0; i < 16; i++) {
      const u = (i / 16 + t * 0.07) % 1
      const [ax, ay, av = 1] = A(open.has(A) ? i / 16 : u, t), [bx, by, bv = 1] = B(open.has(B) ? i / 16 : u, t)
      const [x, y] = sway((ax + (bx - ax) * k) * breathe, (ay + (by - ay) * k) * breathe, t, kick)
      out.push({ x, y, r: 0.125 * Math.max(0, av + (bv - av) * Math.min(1, k)) })
    }
    // Outline only, like the big orb: a liquid line tracing the shape.
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

function particles(mode: ThinkingMode, n: number, t: number, seeds: number[], lvl = 0): P[] {
  if (VOICE.has(mode)) return voiceParticles(mode, t, lvl, Math.min(36, n))
  const out: P[] = []
  if (mode === "basic") {
    for (let k = 0; k < 3; k++) {
      // Surges and eases (never a constant spin); the drops fling out and snap back together.
      const a = t * 2.2 + 0.7 * Math.sin(t * 1.6) + (k * TAU) / 3
      const rad = 0.34 + 0.24 * Math.sin(t * 2.6 + k * 1.3) ** 2
      out.push({ x: Math.cos(a) * rad, y: Math.sin(a) * rad, r: 0.2 + 0.04 * Math.sin(t * 3.4 + k) })
    }
    return out
  }
  if (mode === "retrieving") {
    // The core gulps: it swells each time recalled particles land.
    out.push({ x: 0, y: 0, r: 0.24 + 0.07 * Math.max(0, Math.sin(t * 4.2)) ** 3 })
    for (let i = 0; i < n; i++) {
      const p = (t * 0.6 + seeds[i]) % 1
      const rad = 0.95 * (1 - p) ** 1.6
      const a = seeds[i] * TAU + p * 2.2
      out.push({ x: Math.cos(a) * rad, y: Math.sin(a) * rad, r: 0.045 + 0.08 * p })
    }
    return out
  }
  if (mode === "searching") {
    // Scans in bursts: dashes ahead, slows to look, dashes again; the orbit swells and tightens.
    const head = t * 2.6 + 0.9 * Math.sin(t * 1.5)
    const orbit = 0.52 + 0.16 * Math.sin(t * 1.3)
    out.push({ x: 0, y: 0, r: 0.09 + 0.02 * Math.sin(t * 4) })
    for (let j = 0; j < n; j++) {
      const a = head - j * 0.14
      const k = 1 - j / n
      out.push({ x: Math.cos(a) * orbit, y: Math.sin(a) * orbit * 0.82, r: 0.03 + 0.15 * k * k })
    }
    return out
  }
  // generating: tiny dots continuously re-forming the orb into shapes, with displacement
  // Each shape HOLDS (so you can see what it is), then pours into the next.
  const idx = Math.floor(t / GEN_PERIOD)
  const local = (t % GEN_PERIOD) / GEN_PERIOD
  const m = Math.min(1, Math.max(0, (local - (1 - GEN_MORPH)) / GEN_MORPH))
  const k = pour(m) // starts and lands at rest: the shape pours into the next, no pop
  const kick = 0.5 * Math.sin(Math.PI * m)
  const A = shapeAt(idx)
  const B = shapeAt(idx + 1)
  const breathe = 1 + 0.08 * Math.sin(t * 3)
  for (let i = 0; i < n; i++) {
    const u = (i / n + t * 0.07) % 1
    const [ax, ay, av = 1] = A(open.has(A) ? i / n : u, t)
    const [bx, by, bv = 1] = B(open.has(B) ? i / n : u, t)
    const dx = 0.025 * Math.sin(t * 3.1 + i * 1.7) + 0.015 * Math.sin(t * 5.3 + seeds[i] * 9)
    const dy = 0.025 * Math.cos(t * 2.3 + i * 1.3) + 0.015 * Math.cos(t * 4.7 + seeds[i] * 7)
    const [x, y] = sway((ax + (bx - ax) * k) * breathe + dx, (ay + (by - ay) * k) * breathe + dy, t, kick)
    // A slimmer line (0.058, was 0.07): the shape reads as a drawn stroke, not a tube.
    out.push({ x, y, r: (0.058 + 0.016 * Math.sin(t * 4 + i)) * Math.max(0, av + (bv - av) * Math.min(1, k)) })
  }
  // Outline only, the shape is drawn as a liquid LINE, so each one reads distinctly (a filled body all looks alike).
  return out
}

/**
 * Performance budget, loading must never cost the user's machine:
 *   · ONE shared animation loop for every orb on the page (not one per instance)
 *   · orbs off-screen or in a hidden tab don't draw at all
 *   · two ways to draw the same liquid (below): the SVG goo chain for machines that can afford it, a filter-free
 *     metaball FIELD for everything else, and the chain hands over to the field as soon as frames arrive late
 *   · the goo chain draws at most 60 times a second (120 Hz displays doubled its cost for nothing the eye can see)
 *     and at 1.5× resolution on big orbs: its blur hides the pixels anyway. Small orbs stay at full 2×.
 *   · reduced motion / Save-Data → one still frame
 *
 * Two renderers, one liquid:
 *   filter  crisp drops on a canvas, melted by an SVG filter chain (blur → threshold, twice → specular light →
 *           glow). The chain re-rasterises every frame, on a phone, on the CPU, at hundreds of pixels a side.
 *   field   the same drops summed into a metaball field on a small grid (≤ 72² cells), thresholded with a soft
 *           edge, coloured and lit per cell, then upscaled by the GPU. No filter anywhere; a frame costs a fraction
 *           of a millisecond. Phones, tablets and low-core devices take it from the start.
 */
type Tick = (now: number) => void
const ticks = new Set<Tick>()
let loop = 0
/** Orbs currently drawing through the filter chain: only then do late frames say anything about it. */
let heavy = 0
let prevFrame = 0
let frames = 0
let late = 0
function frame(now: number) {
  // Adaptive: frames that keep arriving late (< ~36 fps, net of the on-time ones, after a second of warm-up) mean
  // this machine can't afford the filter chain, every orb switches to the field for the rest of the session.
  if (heavy && !document.documentElement.hasAttribute("data-vita-booting")) {
    const dt = now - prevFrame
    if (prevFrame && ++frames > 60) {
      late = dt > 28 ? late + 1 : Math.max(0, late - 1)
      if (late > 20) { late = 0; degrade() }
    }
  }
  prevFrame = now
  ticks.forEach((t) => t(now))
  loop = ticks.size ? requestAnimationFrame(frame) : 0
}
function onTick(t: Tick) {
  ticks.add(t)
  if (!loop) { frames = 0; late = 0; prevFrame = 0; loop = requestAnimationFrame(frame) }
  return () => void ticks.delete(t)
}

/* Which renderer. Decided once per session on the client, upgraded to "field" if the machine can't keep up. */
let lite: boolean | null = null
const liteListeners = new Set<() => void>()
function constrained() {
  if (typeof window === "undefined") return false
  const nav = navigator as Navigator & { connection?: { saveData?: boolean }; deviceMemory?: number }
  return (
    window.matchMedia?.("(pointer: coarse)").matches === true ||
    (navigator.hardwareConcurrency ?? 8) <= 4 ||
    (nav.deviceMemory ?? 8) <= 4 ||
    nav.connection?.saveData === true
  )
}
const isLite = () => (lite ??= constrained())
function degrade() {
  if (lite) return
  lite = true
  liteListeners.forEach((l) => l())
}
const subscribeLite = (l: () => void) => (liteListeners.add(l), () => void liteListeners.delete(l))
/** Test hook: force a renderer (null = decide again from the device). */
export function setThinkingRenderer(r: "filter" | "field" | null) {
  lite = r === null ? null : r === "field"
  liteListeners.forEach((l) => l())
}

/** Resolve any CSS colour to sRGB bytes through a 1×1 canvas. */
function rgbOf(css: string, probe: CanvasRenderingContext2D): [number, number, number] {
  probe.clearRect(0, 0, 1, 1)
  probe.fillStyle = "#000" // reset first, so an unparsable colour never keeps the previous one
  probe.fillStyle = css
  probe.fillRect(0, 0, 1, 1)
  const d = probe.getImageData(0, 0, 1, 1).data
  return [d[0], d[1], d[2]]
}

export interface ThinkingProps {
  mode?: ThinkingMode
  size?: keyof typeof sizes
  /** water = AI (default for agentic modes) · current = inherit text color (default for basic) · brand ·
      on-primary = the water washed toward white, for a primary background. `spectrum` is the old name of `water`. */
  tone?: "water" | "spectrum" | "current" | "brand" | "on-primary"
  /** Voice states: loudness now, 0 to 1 (e.g. useMicrophone().level, or the agent's audio). Simulated when omitted. */
  level?: () => number
  /** Announced to screen readers, e.g. "Searching the help center". */
  label?: string
  className?: string
}

export function Thinking({ mode = "generating", size = "md", tone, level, label = "Thinking", className }: ThinkingProps) {
  const levelRef = React.useRef(level)
  React.useLayoutEffect(() => {
    levelRef.current = level
  })
  const px = sizes[size]
  const bleed = Math.round(px * BLEED)
  const S = px + 2 * bleed // the canvases' size: the box plus the bleed
  const ref = React.useRef<HTMLCanvasElement>(null)
  const glintRef = React.useRef<HTMLCanvasElement>(null)
  const glRef = React.useRef<HTMLCanvasElement>(null)
  const fid = "vita-goo-" + React.useId().replace(/[^a-zA-Z0-9]/g, "")
  const resolvedTone = tone === "spectrum" ? "water" : (tone ?? (mode === "basic" ? "current" : "water"))
  const field = React.useSyncExternalStore(subscribeLite, isLite, () => false)
  // The liquid keeps its time across a renderer switch, so a hand-over mid-session never restarts the shapes.
  const started = React.useRef(0)

  React.useEffect(() => {
    const canvas = ref.current
    const ctx = canvas?.getContext("2d")
    if (!canvas || !ctx) return
    const lit = px >= 48
    // Device resolution, capped: the goo blur already antialiases the edges (big orbs on the filter path need less).
    const dpr = Math.min(field || !lit ? 2 : 1.5, window.devicePixelRatio || 1)
    // Every canvas is the box plus the bleed, drawn in box coordinates (translated by the bleed).
    canvas.width = S * dpr
    canvas.height = S * dpr
    ctx.scale(dpr, dpr)
    ctx.translate(bleed, bleed)
    const wipe = (c: CanvasRenderingContext2D) => c.clearRect(-bleed, -bleed, S, S)
    const glints = mode !== "basic" && lit
    const gcanvas = glints && !field ? glintRef.current : null
    const gctx = gcanvas?.getContext("2d") ?? null
    if (gcanvas && gctx) {
      gcanvas.width = S * dpr
      gcanvas.height = S * dpr
      gctx.scale(dpr, dpr)
      gctx.translate(bleed, bleed)
    }
    const simple = px <= 24
    // Small orbs: fewer, proportionally larger particles so they stay solid down to 16px.
    const n = mode === "searching" ? Math.max(6, Math.min(28, Math.round(px / 3))) : Math.max(7, Math.min(90, Math.round(px / 1.1)))
    const grow = Math.min(2.4, Math.max(1, 40 / px))
    const seeds = Array.from({ length: n }, (_, i) => (Math.sin(i * 127.1) * 43758.5453) % 1).map((s) => Math.abs(s))
    const saveData = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData === true
    const reduced = saveData || window.matchMedia?.("(prefers-reduced-motion: reduce)").matches
    // The filter chain draws at most ~60 times a second; the field is cheap enough for every display frame.
    const interval = field ? 0 : 1000 / 70
    const root = getComputedStyle(document.documentElement)
    const probe = document.createElement("canvas").getContext("2d", { willReadFrequently: true })
    const onPrimary = resolvedTone === "on-primary"
    const isWater = resolvedTone === "water" || onPrimary
    // The water by depth: foam · shallow · water · deep (the tokens), as sRGB bytes and as canvas colours.
    // On a primary surface it is washed half way to white: the deep would sink into the brand colour behind it.
    const waterRGB = (["foam", "shallow", "water", "deep"] as const).map((k) => {
      const [r, g, b] = probe ? rgbOf(root.getPropertyValue(`--vita-ai-${k}`).trim(), probe) : [0, 0, 0]
      return (onPrimary ? [r + (255 - r) * 0.5, g + (255 - g) * 0.5, b + (255 - b) * 0.5] : [r, g, b]) as [number, number, number]
    })
    const water = waterRGB.map(([r, g, b]) => `rgb(${r} ${g} ${b})`)
    const clear = (i: number) => `rgb(${waterRGB[i][0]} ${waterRGB[i][1]} ${waterRGB[i][2]} / 0)`
    // The abyss: the deep, darker and bluer, for the refracted pockets that read deeper than the water around them.
    const abyss = [waterRGB[3][0] * 0.55, waterRGB[3][1] * 0.72, waterRGB[3][2] * 0.95] as [number, number, number]
    const abyssCss = (a: number) => `rgb(${abyss[0]} ${abyss[1]} ${abyss[2]} / ${a})`
    let color = getComputedStyle(canvas).color
    // Light mode = dark text. There the white glints vanish on the page, so they take the deep water's colour instead.
    const isLight = (c: string) => { const m = c.match(/[\d.]+/g); return !!m && (0.2126 * +m[0] + 0.7152 * +m[1] + 0.0722 * +m[2]) / 255 < 0.5 }
    let light = !onPrimary && isLight(color)
    let last = 0
    let drawn = -Infinity
    const start = (started.current ||= performance.now())
    const R = px * 0.42
    let lvlNow = 0
    /** A drop's radius on the canvas: ×1.3 on big orbs, the wide goo eats into each drop, so plumper drops keep the
        liquid full-bodied and its joins round. */
    // Basic keeps the same proportions at every size (drops, orbit, melt): in a button it's the Thinking page's liquid,
    // scaled down, never a different animation.
    const scaled = simple && mode !== "basic"
    const dropRadius = (p: P) => (scaled ? p.r * R : mode === "basic" ? Math.max(0.6, p.r * R * 1.3) : Math.max(0.6, Math.min(0.34, p.r * grow) * R * 1.3))
    const drawGlints = (c: CanvasRenderingContext2D, t: number) => {
      for (let i = 0; i < 6; i++) {
        const a = seeds[i % seeds.length] * TAU + t * (0.35 + i * 0.07)
        const rad = R * (0.92 + 0.12 * Math.sin(t * 1.3 + i))
        const tw = Math.max(0, Math.sin(t * 2.2 + i * 1.9))
        c.globalAlpha = tw * (light ? 1 : 0.9)
        c.fillStyle = light ? water[i % 2 ? 3 : 2] || color : "white"
        c.beginPath()
        c.arc(px / 2 + Math.cos(a) * rad, px / 2 + Math.sin(a) * rad, Math.max(0.6, px * 0.009) * (0.6 + tw), 0, TAU)
        c.fill()
      }
      c.globalAlpha = 1
    }

    /* ---- filter path: crisp drops, the SVG chain melts them ---- */
    const drawFilter = (t: number) => {
      wipe(ctx)
      if (isWater) {
        // Depth by distance from the heart: the body is deepest at its centre and pales toward its edge, the way a
        // lagoon reads from the shore. A small orb is a thin line, so its water starts deeper to stay visible.
        const g = ctx.createRadialGradient(px / 2, px / 2, 0, px / 2, px / 2, R * 1.1)
        if (simple) { g.addColorStop(0, water[3]); g.addColorStop(0.55, water[3]); g.addColorStop(1, water[2]) }
        else { g.addColorStop(0, water[3]); g.addColorStop(0.55, water[2]); g.addColorStop(0.85, water[2]); g.addColorStop(1, water[1]) }
        ctx.fillStyle = g
      } else {
        ctx.fillStyle = color
      }
      for (const p of simple ? simpleParticles(mode, t, lvlNow) : particles(mode, n, t, seeds, lvlNow)) {
        if (p.r < 0.005) continue // a gap in a segmented shape
        ctx.beginPath()
        ctx.arc(px / 2 + p.x * R, px / 2 + p.y * R, dropRadius(p), 0, TAU)
        ctx.fill()
      }
      if (isWater && lit) {
        // The sun: a patch of light drifting over the body, lifting the water toward the shallows where it passes.
        // Painted only where there is water (source-atop), so the filter chain still melts the same silhouette.
        const sx = px / 2 + Math.cos(t * 0.37) * R * 0.5, sy = px / 2 + Math.sin(t * 0.29) * R * 0.5
        const s = ctx.createRadialGradient(sx, sy, 0, sx, sy, R * 0.9)
        s.addColorStop(0, water[1])
        s.addColorStop(1, clear(1))
        ctx.globalCompositeOperation = "source-atop"
        ctx.globalAlpha = 0.45
        ctx.fillStyle = s
        ctx.fillRect(-bleed, -bleed, S, S)
        ctx.globalAlpha = 1
        // Refraction: three slow pockets of deeper blue drifting through the body, bits of depth the eye believes.
        for (let i = 0; i < 3; i++) {
          const a = t * (0.11 + i * 0.04) + i * 2.1
          const qx = px / 2 + Math.cos(a) * R * 0.45, qy = px / 2 + Math.sin(a * 0.8 + i) * R * 0.45
          const rr = R * (0.26 + 0.08 * Math.sin(t * 0.5 + i))
          const q = ctx.createRadialGradient(qx, qy, 0, qx, qy, rr)
          q.addColorStop(0, abyssCss(0.5))
          q.addColorStop(0.6, abyssCss(0.25))
          q.addColorStop(1, abyssCss(0))
          ctx.fillStyle = q
          ctx.fillRect(qx - rr, qy - rr, rr * 2, rr * 2)
        }
        ctx.globalCompositeOperation = "source-over"
      }
      // Glints: tiny twinkling sparkles around agentic orbs (drawn crisp, outside the liquid).
      if (gctx) {
        wipe(gctx)
        if (glints) drawGlints(gctx, t)
      }
    }

    /* ---- field path: the liquid as a metaball field on a small grid, no filter anywhere ---- */
    // Grid: 2 cells per CSS px on small orbs (they must stay crisp), one per px up to 128 on big ones, with a
    // two-cell edge and the GPU's smooth upscale, the rim reads as the goo's own softness, never as pixels.
    const g = simple ? S * 2 : Math.min(128, Math.max(48, S))
    let fieldDraw: ((t: number) => void) | null = null
    /* ---- gpu path: the desktop chain, evaluated per pixel by one shader at full resolution (phones) ---- */
    let orb: OrbGL | null = null
    if (field && glRef.current) {
      const precise = mode === "retrieving", defined = mode === "generating"
      // Small voice orbs (the 16 and 24px idle ring) are a thin line of tiny drops: at the full blur their field
      // never reaches the goo's threshold and the ring faded to nothing. A tighter blur keeps the line whole.
      const blur = precise ? (px <= 24 ? px * 0.06 : px * 0.035) : defined ? (px <= 24 ? px * 0.06 : px * 0.045) : px <= 24 && VOICE.has(mode) ? px * 0.045 : px <= 24 && mode !== "basic" ? px * 0.085 : px * 0.065
      const glDpr = Math.min(2, window.devicePixelRatio || 1)
      orb = probe
        ? createOrbGL(glRef.current, {
            size: S, body: px, dpr: glDpr, lit,
            s1: blur, ss: Math.hypot(blur, px * 0.035), sg: Math.hypot(blur, px * 0.16),
            water: waterRGB,
            // A thin line never fills (a small orb, or the generating outline), so its water reads deep sooner; a small
            // orb reads depth off the goo field itself (thin), from below the threshold, so even its finest line is
            // turquoise, never the pale edge. Caustics need a
            // floor to land on, so only lit orbs (48px and up) carry them, about three nets across.
            depth: simple ? [0.2, 0.8] : defined ? [0.45, 0.68] : [0.45, 0.88], thin: simple, caustic: lit ? px * 0.36 : 0,
            surface: px * 0.06, light: [px * 0.28, px * 0.2, px * 0.9],
          })
        : null
      if (orb && probe) {
        canvas.dataset.renderer = "gpu" // the 2D canvas now only carries the glints, above the liquid
        const drops = new Float32Array(MAX_DROPS * 4)
        let own = rgbOf(color, probe)
        const o = orb
        fieldDraw = (t: number) => {
          if (!isWater) own = rgbOf(color, probe)
          let k = 0
          for (const p of simple ? simpleParticles(mode, t, lvlNow) : particles(mode, n, t, seeds, lvlNow)) {
            if (p.r < 0.005 || k >= MAX_DROPS) continue
            drops[k * 4] = (bleed + px / 2 + p.x * R) * glDpr
            drops[k * 4 + 1] = (bleed + px / 2 + p.y * R) * glDpr
            // The filter path plumps drops ×1.3 because its two-stage melt eats into them; the closed form doesn't.
            drops[k * 4 + 2] = (scaled ? dropRadius(p) : dropRadius(p) / 1.3) * glDpr
            k++
          }
          o.draw(drops, k, { t, rot: t * 1.8, water: isWater, own })
          // Glints stay crisp, on the 2D canvas above the liquid.
          wipe(ctx)
          if (glints) drawGlints(ctx, t)
        }
      }
    }
    if (field && !orb) {
      const off = document.createElement("canvas")
      off.width = off.height = g
      const octx = off.getContext("2d")
      // A tiny copy of the orb, drawn large again, is the glow: the upscale blurs it for free.
      const glow = lit ? document.createElement("canvas") : null
      if (glow) glow.width = glow.height = 12
      const glowCtx = glow?.getContext("2d") ?? null
      if (octx && probe) {
        const img = octx.createImageData(g, g)
        const data = img.data
        const fld = new Float32Array(g * g)
        let own = rgbOf(color, probe)
        const scale = g / S // cells per CSS px
        const centre = g / 2
        // Iso-level and edge: an isolated drop reads at exactly its radius (its field there is (1 − 1/2.1²)³); the
        // edge ramps over about two cells, so the upscale shows a soft rim instead of the grid.
        const ISO = 0.46, EDGE = 0.45
        ctx.imageSmoothingQuality = "high"
        fieldDraw = (t: number) => {
          if (!isWater) own = rgbOf(color, probe)
          fld.fill(0)
          for (const p of simple ? simpleParticles(mode, t, lvlNow) : particles(mode, n, t, seeds, lvlNow)) {
            if (p.r < 0.005) continue
            // The filter path plumps drops ×1.3 because its blur eats into them; a field drop reads at its true size.
            const rr = (scaled ? dropRadius(p) : dropRadius(p) / 1.3) * scale
            const ri = rr * 2.1 // reach: drops feel each other well before they touch, so bridges form (goo)
            const X = centre + p.x * R * scale, Y = centre + p.y * R * scale
            const x0 = Math.max(0, Math.floor(X - ri)), x1 = Math.min(g - 1, Math.ceil(X + ri))
            const y0 = Math.max(0, Math.floor(Y - ri)), y1 = Math.min(g - 1, Math.ceil(Y + ri))
            const inv = 1 / (ri * ri)
            for (let y = y0; y <= y1; y++) {
              const dy = y + 0.5 - Y
              const row = y * g
              for (let x = x0; x <= x1; x++) {
                const dx = x + 0.5 - X
                const q = 1 - (dx * dx + dy * dy) * inv
                if (q > 0) fld[row + x] += q * q * q
              }
            }
          }
          // The sun's patch, in cells: it drifts over the body as on the other renderers.
          const sunX = centre + Math.cos(t * 0.37) * R * scale * 0.5, sunY = centre + Math.sin(t * 0.29) * R * scale * 0.5
          const sunR2 = (R * scale * 0.9) ** 2
          const pocketK = TAU / (px * 0.36 * 1.9 * scale) // the pockets' wavelength, in cells
          for (let y = 0; y < g; y++) {
            for (let x = 0; x < g; x++) {
              const k = y * g + x, o = k * 4
              let a = (fld[k] - ISO) / EDGE + 0.5
              if (a <= 0) { data[o + 3] = 0; continue }
              if (a > 1) a = 1
              a = a * a * (3 - 2 * a)
              let r: number, gr: number, b: number
              if (isWater) {
                // Depth from the field's own density: shallow turquoise at the rim, lagoon blue where drops pile up.
                let d = Math.min(1, Math.max(0, simple ? (fld[k] - ISO + 0.15) / 0.5 : (fld[k] - ISO) / 1.4))
                d = 1 - (1 - d) ** 1.6
                const f = d < 0.25 ? d * 4 : (d - 0.25) / 0.75
                const c0 = waterRGB[d < 0.25 ? 1 : 2], c1 = waterRGB[d < 0.25 ? 2 : 3]
                r = c0[0] + (c1[0] - c0[0]) * f; gr = c0[1] + (c1[1] - c0[1]) * f; b = c0[2] + (c1[2] - c0[2]) * f
                if (lit) {
                  const s = 0.4 * Math.exp(-((x + 0.5 - sunX) ** 2 + (y + 0.5 - sunY) ** 2) / sunR2)
                  r += (waterRGB[1][0] - r) * s; gr += (waterRGB[1][1] - gr) * s; b += (waterRGB[1][2] - b) * s
                  // Refraction: slow pockets of deeper blue, as on the shader.
                  const qx = x * pocketK, qy = y * pocketK
                  const rn = Math.sin(qx * 0.7 + 1.3 * Math.sin(qy * 0.5 + t * 0.21) + t * 0.13) * Math.sin(qy * 0.6 - 1.1 * Math.sin(qx * 0.4 - t * 0.17) + t * 0.1)
                  const pk = 0.6 * Math.min(1, Math.max(0, (rn - 0.3) / 0.55)) * Math.min(1, Math.max(0, (d - 0.1) / 0.4))
                  r += (abyss[0] - r) * pk; gr += (abyss[1] - gr) * pk; b += (abyss[2] - b) * pk
                }
              } else {
                ;[r, gr, b] = own
              }
              if (lit && x > 0 && y > 0 && x < g - 1 && y < g - 1) {
                // Specular light from the top left: the field's slope is the surface normal, so the rim facing the
                // light catches a white highlight, the lit look of the filter path, at a fraction of the cost.
                const gx = fld[k + 1] - fld[k - 1], gy = fld[k + g] - fld[k - g]
                const m = Math.hypot(gx, gy)
                if (m > 0.03) {
                  let h = (0.45 * gx + 0.8 * gy) / m // cosine to the light; a steep slope (the rim) shines, the flat body doesn't
                  if (h > 0) {
                    h = h ** 6 * Math.min(1, m * 3) * 0.75
                    r += (255 - r) * h; gr += (255 - gr) * h; b += (255 - b) * h
                  }
                }
              }
              data[o] = r; data[o + 1] = gr; data[o + 2] = b; data[o + 3] = a * 255
            }
          }
          octx.putImageData(img, 0, 0)
          wipe(ctx)
          if (glow && glowCtx) {
            // Glow behind: a pastel halo, the orb shrunk to 10 cells (inside a clear 1-cell border, so the stretched
            // copy fades to nothing before its own edge) and drawn back large, a third as strong.
            glowCtx.clearRect(0, 0, 12, 12)
            glowCtx.drawImage(off, 1, 1, 10, 10)
            ctx.globalAlpha = 0.3
            ctx.drawImage(glow, -bleed - S * 0.16, -bleed - S * 0.16, S * 1.32, S * 1.32)
            ctx.globalAlpha = 1
          }
          ctx.drawImage(off, -bleed, -bleed, S, S)
          if (glints) drawGlints(ctx, t)
        }
      }
    }

    const draw = (now: number) => {
      // 1.25× tempo: thinking should feel alive and busy, never idle.
      const t = reduced ? 0.9 : ((now - start) / 1000) * 1.25
      // The voice level for this frame, eased so the liquid swells and settles instead of twitching.
      const raw = VOICE.has(mode) ? (levelRef.current ? levelRef.current() : simulatedVoice(t * 0.8)) : 0
      lvlNow += (raw - lvlNow) * (raw > lvlNow ? 0.35 : 0.12)
      // Follow the text colour closely: a button's colour changes the moment it goes busy (its hover ends), and
      // Sofia must change with it, never keep the old colour (white on a now-white button).
      if (now - last > 120) {
        color = getComputedStyle(canvas).color
        light = !onPrimary && isLight(color)
        last = now
      }
      if (fieldDraw) fieldDraw(t)
      else drawFilter(t)
    }
    draw(performance.now())
    if (reduced) return
    // Only tick while on screen; the shared loop itself stops when no orb needs it.
    let off: (() => void) | null = null
    const tick = (now: number) => {
      if (now - drawn < interval) return
      drawn = now
      draw(now)
    }
    const setVisible = (v: boolean) => {
      if (v && !off) {
        off = onTick(tick)
        if (!field) heavy++
      } else if (!v && off) {
        off()
        off = null
        if (!field) heavy--
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
      orb?.dispose()
    }
  }, [mode, px, S, bleed, resolvedTone, field])

  // Liquid + light: goo → a second round of melt (rounds every neck and tip) → specular highlight → a pastel glow
  // behind. A WIDE blur with a gentle threshold is what makes it gooey: drops reach for each other through thick,
  // rounded bridges instead of snapping together at a sharp pinch. No drop shadow.
  // Retrieving is PRECISE: a tighter melt, so each recalled particle stays a distinct drop until it reaches the core.
  // Generating is DEFINED: gooey between shapes, but each shape's silhouette reads clearly while it holds.
  const precise = mode === "retrieving"
  const defined = mode === "generating" || mode === "idle"
  const blur = precise ? (px <= 24 ? px * 0.06 : px * 0.035) : defined ? (px <= 24 ? px * 0.06 : px * 0.045) : px <= 24 && mode !== "basic" ? px * 0.085 : px * 0.065
  const melt = precise ? px * 0.015 : defined ? px * 0.02 : px * 0.03
  // Antialiasing: each threshold re-cuts the silhouette at device-pixel level, so the last one is followed by a blur
  // of about a device pixel, which turns the step into a ramp. Smallest on small orbs (their lines are thin), never
  // wide enough to soften the shape itself.
  const aa = Math.min(0.9, Math.max(0.35, px * 0.012))
  const lit = px >= 48
  return (
    <span role="status" aria-live="polite" className={cn("relative inline-flex shrink-0", resolvedTone === "brand" && "text-primary", className)} style={{ width: px, height: px }}>
      {!field && (
        <svg aria-hidden width="0" height="0" className="absolute">
          <defs>
            <filter id={fid} x="-40%" y="-40%" width="180%" height="180%" colorInterpolationFilters="sRGB">
              <feGaussianBlur in="SourceGraphic" stdDeviation={blur} result="blur" />
              <feColorMatrix in="blur" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 20 -8" result="melt" />
              {/* Melt again: blur the shape a touch and re-threshold, so any leftover point or kink rounds off. */}
              <feGaussianBlur in="melt" stdDeviation={melt} result="meltBlur" />
              <feColorMatrix in="meltBlur" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 9 -4" result="cut" />
              {/* The antialiased edge: the output for small orbs, and the body every lit stage builds on. */}
              <feGaussianBlur in="cut" stdDeviation={aa} result="goo" />
              {lit ? (
                <>
                  <feGaussianBlur in="goo" stdDeviation={px * 0.035} result="soft" />
                  <feSpecularLighting in="soft" surfaceScale={px * 0.06} specularConstant="1.1" specularExponent="26" lightingColor="#ffffff" result="spec">
                    <fePointLight x={px * 0.28} y={px * 0.2} z={px * 0.9} />
                  </feSpecularLighting>
                  <feComposite in="spec" in2="goo" operator="in" result="specIn" />
                  <feComposite in="goo" in2="specIn" operator="arithmetic" k1="0" k2="1" k3="0.65" k4="0" result="shaded" />
                  {/* Glow behind: emitted, reflected light, wide, washed ~60% toward white (super-light pastel), low alpha. */}
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
      )}
      {/* The canvases bleed past the box (negative inset), so nothing of the liquid is cut square; the span stays `size`. */}
      {field && <canvas ref={glRef} aria-hidden className="pointer-events-none absolute" style={{ width: S, height: S, inset: -bleed }} />}
      <canvas ref={ref} aria-hidden data-renderer={field ? "field" : "filter"} className="pointer-events-none absolute motion-reduce:animate-[vita-pulse_2s_ease-in-out_infinite]" style={{ width: S, height: S, inset: -bleed, filter: field ? undefined : `url(#${fid})` }} />
      {!field && mode !== "basic" && lit && <canvas ref={glintRef} aria-hidden className="pointer-events-none absolute" style={{ width: S, height: S, inset: -bleed }} />}
      <span className="sr-only">{label}</span>
    </span>
  )
}
