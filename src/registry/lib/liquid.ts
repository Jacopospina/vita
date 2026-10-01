/**
 * Liquid — a real particle fluid for ProgressBar's tip, not a look-alike.
 *
 * Viscoelastic SPH by double-density relaxation (pressure + near-pressure, which gives surface tension), with
 * pairwise viscosity, wall friction and wetting walls (ghost particles), weightless so it always fills the tube.
 *
 *   fill   The bar's body is solid: a piston that springs toward the value. In front of it rides a small, fixed
 *          volume of liquid — the tip. The piston pushes it; when the piston slows, the liquid's own inertia makes
 *          it surge, slosh and fall back against the body, which it wets so the two never separate.
 *   flow   (indeterminate) a slug of liquid is pushed round a looping tube by a pulsing pump, stretching, tearing
 *          into drops and fusing again.
 */

export type LiquidMode = "fill" | "flow"

// Units: tube height = 1, time in seconds.
const H = 1
const SPACING = 1 / 3 // particle spacing: three rows of liquid across the tube
const LIN = H / (SPACING * SPACING) // particles per unit of tube length, at rest
const RADIUS = 0.6 // interaction radius
const REST = 1.0 // rest density — what a SPACING lattice measures with this kernel
const STIFF = 0.08 // pressure displacement per substep (tube heights)
const NEAR = 0.12 // near-pressure: surface tension, and no clumping
const VISC_L = 0.6 // linear viscosity
const VISC_Q = 0.08 // quadratic viscosity
const FRICTION = 0.04 // wall drag
const DRAG = 3.5 // capillary drag: liquid sliding along the tube loses speed relative to it (1/s)
const SUCTION = 260 // a sealed tube: a gap behind the liquid is a vacuum that draws it back to the body
const SUBSTEPS = 4
const MAX_V = 1.1 * RADIUS * SUBSTEPS * 60 // CFL-ish clamp
const TIP = 2.4 // length of the liquid tip, in tube heights
const SPRING = 7 // piston: natural frequency (rad/s)…
const DAMP = 0.85 // …and damping ratio — it arrives with a whisper of overshoot, the liquid adds the rest

export class LiquidSim {
  L: number
  mode: LiquidMode
  /** 0..1 — fill mode. */
  target = 0
  /** The solid body's leading edge (piston), in tube heights. Fill mode. */
  p = 0
  private pv = 0
  n = 0
  x = new Float32Array(64)
  y = new Float32Array(64)
  vx = new Float32Array(64)
  vy = new Float32Array(64)
  private px = new Float32Array(64)
  private py = new Float32Array(64)
  private rho = new Float32Array(64)
  private rhoN = new Float32Array(64)
  private time = 0
  private reach = TIP // measured length of the tip at rest (self-calibrating)
  private rand: () => number
  /** Seconds the system has been at rest; the host can stop ticking once this is > ~0.4. */
  calm = 0

  constructor(L: number, mode: LiquidMode = "fill", seed = 1) {
    this.L = L
    this.mode = mode
    let s = seed >>> 0 || 1
    this.rand = () => (s = (s * 1664525 + 1013904223) >>> 0) / 4294967296
  }

  /** How much liquid the tip holds (less when the value itself is shorter than a tip). */
  private tipLength() {
    return Math.min(TIP, this.target * this.L)
  }

  /** Where the piston should rest so that body + tip end exactly on the value. */
  private pistonGoal() {
    const end = Math.min(this.target * this.L, this.L)
    return Math.max(0, end - Math.min(this.reach, end))
  }

  /** Jump straight to rest (reduced motion, or the flow-mode slug). */
  pour(fraction: number) {
    this.n = 0
    if (this.mode === "flow") {
      const len = fraction * this.L
      for (let x = SPACING / 2; x < len; x += SPACING)
        for (let y = SPACING / 2; y < H; y += SPACING) this.add(x, y, 0, 0)
      return
    }
    this.target = fraction
    this.p = this.pistonGoal(); this.pv = 0
    const tip = this.tipLength()
    for (let x = this.p + SPACING / 2; x < this.p + tip; x += SPACING)
      for (let y = SPACING / 2; y < H; y += SPACING) this.add(x, y, 0, 0)
  }

  private add(x: number, y: number, vx: number, vy: number) {
    if (this.n === this.x.length) this.grow()
    const i = this.n++
    this.x[i] = x; this.y[i] = y; this.vx[i] = vx; this.vy[i] = vy
  }

  private remove(i: number) {
    const last = --this.n
    this.x[i] = this.x[last]; this.y[i] = this.y[last]; this.vx[i] = this.vx[last]; this.vy[i] = this.vy[last]
  }

  private grow() {
    const g = (a: Float32Array) => { const b = new Float32Array(a.length * 2); b.set(a); return b }
    this.x = g(this.x); this.y = g(this.y); this.vx = g(this.vx); this.vy = g(this.vy)
    this.px = g(this.px); this.py = g(this.py); this.rho = g(this.rho); this.rhoN = g(this.rhoN)
  }

  /** The leading edge of the liquid: the furthest point with real mass behind it, so a stray drop doesn't count. */
  front(): number {
    if (this.n === 0) return this.p
    const xs = this.x.slice(0, this.n).sort()
    const need = Math.min(this.n, Math.ceil((0.5 * H) / (SPACING * SPACING)))
    for (let k = xs.length - 1, j = k; k >= need - 1; k--) {
      while (j > 0 && xs[j - 1] >= xs[k] - H) j--
      if (k - j + 1 >= need) return xs[k] + SPACING / 2
    }
    return this.p
  }

  /** Advance one frame (dt seconds, clamped). */
  step(dt: number) {
    dt = Math.min(dt, 1 / 30)
    this.time += dt
    if (this.mode === "fill") this.drive(dt)
    const h = dt / SUBSTEPS
    let energy = 0
    for (let s = 0; s < SUBSTEPS; s++) energy = this.substep(h)
    if (this.mode === "flow") { this.calm = 0; return }
    const still = Math.abs(this.p - this.pistonGoal()) < 0.02 && Math.abs(this.pv) < 0.05 && energy < 0.02
    if (still) {
      // Self-calibrate the tip's resting length, so body + tip land exactly on the value.
      const tip = this.tipLength()
      if (tip > SPACING && this.n === Math.round(tip * LIN)) {
        const reach = this.front() - this.p
        if (Math.abs(reach - this.reach) > 0.05) { this.reach += (reach - this.reach) * 0.7; return void (this.calm = 0) }
      }
      this.calm += dt
    } else this.calm = 0
  }

  /** Spring the piston toward its goal and keep the tip's volume; liquid enters/leaves at the piston face. */
  private drive(dt: number) {
    const goal = this.pistonGoal()
    this.pv += (SPRING * SPRING * (goal - this.p) - 2 * DAMP * SPRING * this.pv) * dt
    this.p = Math.max(0, Math.min(this.L, this.p + this.pv * dt))
    const want = Math.round(this.tipLength() * LIN)
    for (let k = 0; this.n < want && k < 4; k++) this.add(this.p + 0.05 + this.rand() * SPACING, 0.06 + this.rand() * 0.88, this.pv, 0)
    while (this.n > want) {
      let best = 0
      for (let i = 1; i < this.n; i++) if (this.x[i] < this.x[best]) best = i
      this.remove(best)
    }
  }

  private substep(dt: number): number {
    const { n, x, y, vx, vy, px, py, rho, rhoN } = this
    const fill = this.mode === "fill"
    // Flow mode: a pulsing push along the loop, so the slug stretches, tears into drops and fuses again.
    if (!fill) {
      const push = 9 + 7 * Math.sin(this.time * 2.3) + 3 * Math.sin(this.time * 5.1)
      for (let i = 0; i < n; i++) vx[i] += push * dt
    }

    // neighbour grid (cells of RADIUS along x; the tube is only ~3 cells tall)
    const cols = Math.max(1, Math.ceil(this.L / RADIUS) + 1)
    const rows = Math.ceil(H / RADIUS) + 1
    const head = new Int32Array(cols * rows).fill(-1)
    const next = new Int32Array(n)
    const cell = (i: number) => {
      const c = Math.min(cols - 1, Math.max(0, Math.floor(x[i] / RADIUS)))
      const r = Math.min(rows - 1, Math.max(0, Math.floor(y[i] / RADIUS)))
      return [c, r] as const
    }
    for (let i = 0; i < n; i++) {
      const [c, r] = cell(i)
      next[i] = head[r * cols + c]; head[r * cols + c] = i
    }
    const pairs = (fn: (i: number, j: number, dx: number, dy: number, q: number, d: number) => void) => {
      for (let i = 0; i < n; i++) {
        const [c, r] = cell(i)
        for (let rr = Math.max(0, r - 1); rr <= Math.min(rows - 1, r + 1); rr++)
          for (let cc = Math.max(0, c - 1); cc <= Math.min(cols - 1, c + 1); cc++)
            for (let j = head[rr * cols + cc]; j !== -1; j = next[j]) {
              if (j <= i) continue
              const dx = x[j] - x[i], dy = y[j] - y[i]
              const d2 = dx * dx + dy * dy
              if (d2 >= RADIUS * RADIUS || d2 < 1e-12) continue
              const d = Math.sqrt(d2)
              fn(i, j, dx, dy, 1 - d / RADIUS, d)
            }
      }
    }

    // 1 · viscosity (pairwise impulses on approaching neighbours)
    pairs((i, j, dx, dy, q, d) => {
      const ux = dx / d, uy = dy / d
      const u = (vx[i] - vx[j]) * ux + (vy[i] - vy[j]) * uy
      if (u <= 0) return
      const I = dt * q * (VISC_L * u + VISC_Q * u * u) * 0.5
      vx[i] -= I * ux; vy[i] -= I * uy; vx[j] += I * ux; vy[j] += I * uy
    })

    // Capillary drag, and a sealed tube: every vacuum gap (behind the liquid, or between a drop and the body) pulls
    // what lies beyond it back, so the liquid follows the body and broken-off drops rejoin it.
    if (fill && n) {
      const order = Array.from({ length: n }, (_, i) => i).sort((a, b) => x[a] - x[b])
      const k = Math.exp(-DRAG * dt)
      let gap = 0, prev = this.p + SPACING / 2 - SPACING
      for (const i of order) {
        gap += Math.max(0, x[i] - prev - SPACING)
        prev = Math.max(prev, x[i])
        vx[i] = this.pv + (vx[i] - this.pv) * k - SUCTION * gap * dt
      }
    }

    // 2 · predict
    for (let i = 0; i < n; i++) {
      const sp = Math.hypot(vx[i], vy[i])
      if (sp > MAX_V) { vx[i] *= MAX_V / sp; vy[i] *= MAX_V / sp }
      px[i] = x[i]; py[i] = y[i]
      x[i] += vx[i] * dt; y[i] += vy[i] * dt
    }

    // 3 · double density relaxation, with wetting walls: a particle near a wall (top, bottom, and the piston
    //     face in fill mode) also feels its mirror image, so the liquid adheres instead of beading into drops.
    rho.fill(0, 0, n); rhoN.fill(0, 0, n)
    pairs((i, j, _dx, _dy, q) => {
      const q2 = q * q, q3 = q2 * q
      rho[i] += q2; rho[j] += q2; rhoN[i] += q3; rhoN[j] += q3
    })
    const g = (dist: number) => (dist > 0 && dist < RADIUS ? 1 - dist / RADIUS : 0)
    const walls = (i: number) => [g(2 * y[i]), g(2 * (H - y[i])), fill ? g(2 * (x[i] - this.p)) : 0]
    for (let i = 0; i < n; i++) for (const q of walls(i)) if (q > 0) { rho[i] += q * q; rhoN[i] += q * q * q }
    pairs((i, j, dx, dy, q, d) => {
      const P = STIFF * ((rho[i] + rho[j]) / 2 - REST)
      const Pn = NEAR * ((rhoN[i] + rhoN[j]) / 2)
      const D = (P * q + Pn * q * q) / 2
      const ox = (D * dx) / d, oy = (D * dy) / d
      x[i] -= ox; y[i] -= oy; x[j] += ox; y[j] += oy
    })
    for (let i = 0; i < n; i++) {
      // Over-pressure pushes off a wall; under-pressure draws the liquid onto it (adhesion).
      const P = STIFF * (rho[i] - REST), Pn = NEAR * rhoN[i]
      const [qb, qt, qp] = walls(i)
      if (qb > 0) y[i] += (P * qb + Pn * qb * qb) / 2
      if (qt > 0) y[i] -= (P * qt + Pn * qt * qt) / 2
      if (qp > 0) x[i] += (P * qp + Pn * qp * qp) / 2
    }

    // 4 · hard walls with friction; the piston face in fill mode, or the loop in flow mode
    const m = 0.04
    for (let i = 0; i < n; i++) {
      if (y[i] < m) { y[i] = m; x[i] -= (x[i] - px[i]) * FRICTION }
      else if (y[i] > H - m) { y[i] = H - m; x[i] -= (x[i] - px[i]) * FRICTION }
      if (fill) {
        if (x[i] < this.p + m) x[i] = this.p + m
        else if (x[i] > this.L - m) x[i] = this.L - m
      } else if (x[i] > this.L) { x[i] -= this.L; px[i] -= this.L }
      else if (x[i] < 0) { x[i] += this.L; px[i] += this.L }
    }

    // 5 · velocities from the corrected positions
    let e = 0
    const inv = 1 / dt
    for (let i = 0; i < n; i++) {
      vx[i] = (x[i] - px[i]) * inv; vy[i] = (y[i] - py[i]) * inv
      e += (vx[i] - (fill ? this.pv : 0)) ** 2 + vy[i] * vy[i]
    }
    return n ? e / n : 0
  }
}

/**
 * Coverage (0..1 per pixel) on a w×h grid (tube height = h px): the solid body up to the piston, plus the
 * metaball field of the liquid. Wall mirror images make the liquid read as one clean body against the walls
 * and the piston, so only its free surface shows a meniscus.
 */
export function liquidCoverage(sim: LiquidSim, w: number, h: number, out?: Float32Array): Float32Array {
  const field = out && out.length === w * h ? out.fill(0) : new Float32Array(w * h)
  const scale = h / H
  const R = 0.6 * scale // render kernel radius in px (≈1.8 × spacing)
  const R2 = R * R
  const flow = sim.mode === "flow"
  const body = flow ? 0 : sim.p * scale
  for (let i = 0; i < sim.n; i++) {
    const X = sim.x[i] * scale, Y = sim.y[i] * scale
    const xs = flow ? [X, X - sim.L * scale, X + sim.L * scale] : [X, 2 * body - X]
    for (const cx of xs) for (const cy of [Y, -Y, 2 * h - Y]) {
      const x0 = Math.max(0, Math.floor(cx - R)), x1 = Math.min(w - 1, Math.ceil(cx + R))
      if (x0 > x1) continue
      const y0 = Math.max(0, Math.floor(cy - R)), y1 = Math.min(h - 1, Math.ceil(cy + R))
      for (let py = y0; py <= y1; py++) {
        const dy = py + 0.5 - cy
        for (let px = x0; px <= x1; px++) {
          const dx = px + 0.5 - cx
          const t = 1 - (dx * dx + dy * dy) / R2
          if (t > 0) field[py * w + px] += t * t * t
        }
      }
    }
  }
  // Iso-surface at about half the interior field (≈ 2.5 for a resting body), with a ~1px antialiased edge.
  for (let k = 0; k < field.length; k++) {
    const v = (field[k] - 0.9) / 0.6
    field[k] = v <= 0 ? 0 : v >= 1 ? 1 : v * v * (3 - 2 * v)
  }
  // Soft liquid: blur the liquid's edges sideways (two box passes ≈ a small gaussian, ~0.35 tube height) so the
  // meniscus and drops feel soft rather than cut out. Sideways only — the tube's top and bottom stay crisp.
  const r = Math.max(1, Math.round(h * 0.18))
  const row = new Float32Array(w)
  for (let pass = 0; pass < 2; pass++)
    for (let py = 0; py < h; py++) {
      const o = py * w
      let acc = 0
      for (let i = -r; i <= r; i++) acc += field[o + Math.min(w - 1, Math.max(0, i))]
      for (let px = 0; px < w; px++) {
        row[px] = acc / (2 * r + 1)
        acc += field[o + Math.min(w - 1, px + r + 1)] - field[o + Math.max(0, px - r)]
      }
      field.set(row, o)
    }
  // The solid body stays crisp, composited over the softened liquid.
  for (let py = 0; py < h; py++)
    for (let px = 0; px < w; px++) {
      const k = py * w + px
      field[k] = Math.max(field[k], Math.min(1, Math.max(0, body - px)))
    }
  return field
}
