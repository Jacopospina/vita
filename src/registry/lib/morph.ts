/**
 * Shape morphing for glyphs (smart animate): one icon's outline becomes the next one's, point by point.
 *
 * No library: the browser already knows every shape's geometry (SVGGeometryElement), so each glyph is sampled into
 * closed contours of evenly spaced points, normalised to its viewBox (0 to 1). Contours are paired largest to
 * largest; a glyph with fewer pieces grows the missing ones out of a point (and collapses extra ones into one), so
 * any two icons morph. Each pair starts at its nearest points, so the outline doesn't twist on the way.
 * Rendered with an even-odd fill, so rings (outlined squares, circles) keep their holes.
 */
export type Contour = [number, number][]

/** Points per contour: smooth at 16 to 32px, cheap to interpolate every frame. */
const N = 72

function signedArea(c: Contour) {
  let a = 0
  for (let i = 0; i < c.length; i++) {
    const [x1, y1] = c[i], [x2, y2] = c[(i + 1) % c.length]
    a += x1 * y2 - x2 * y1
  }
  return a / 2
}
const area = (c: Contour) => Math.abs(signedArea(c))

function centroid(c: Contour): [number, number] {
  let x = 0, y = 0
  for (const p of c) { x += p[0]; y += p[1] }
  return [x / c.length, y / c.length]
}

/** Resample a closed polyline to exactly N points, evenly spaced along its length. */
function resample(pts: Contour): Contour {
  const segs: number[] = []
  let total = 0
  for (let i = 0; i < pts.length; i++) {
    const [x1, y1] = pts[i], [x2, y2] = pts[(i + 1) % pts.length]
    const d = Math.hypot(x2 - x1, y2 - y1)
    segs.push(d)
    total += d
  }
  const out: Contour = []
  let i = 0, acc = 0
  for (let k = 0; k < N; k++) {
    const target = (k / N) * total
    while (i < segs.length - 1 && acc + segs[i] < target) acc += segs[i++]
    const f = segs[i] ? (target - acc) / segs[i] : 0
    const [x1, y1] = pts[i], [x2, y2] = pts[(i + 1) % pts.length]
    out.push([x1 + (x2 - x1) * f, y1 + (y2 - y1) * f])
  }
  return out
}

/**
 * Every closed contour of a rendered glyph, in viewBox units scaled to 0 to 1. Null when the browser can't measure
 * geometry (the caller falls back to drawing the glyph in).
 */
export function contoursOf(svg: SVGSVGElement): Contour[] | null {
  const vb = svg.viewBox?.baseVal
  const w = vb?.width || 32, h = vb?.height || 32
  const out: Contour[] = []
  const shapes = svg.querySelectorAll<SVGGeometryElement>("path, circle, rect, polygon, ellipse, line, polyline")
  for (const el of shapes) {
    if (typeof el.getTotalLength !== "function") return null
    // Skip what doesn't paint: Carbon's transparent bounding rectangles. (Visibility is not checked: the glyphs are
    // measured while hidden, on purpose.)
    if (getComputedStyle(el).fill === "none") continue
    let len: number
    try { len = el.getTotalLength() } catch { return null }
    if (!len) continue
    // Dense samples; a jump far longer than one step is a new sub-path (a "move to"), so a new contour starts there.
    const step = Math.max(0.05, len / 1200)
    let cur: Contour = []
    let prev: DOMPoint | null = null
    for (let s = 0; s <= len; s += step) {
      const p = el.getPointAtLength(s)
      if (prev && Math.hypot(p.x - prev.x, p.y - prev.y) > step * 4) {
        if (cur.length > 2) out.push(cur)
        cur = []
      }
      cur.push([(p.x - (vb?.x ?? 0)) / w, (p.y - (vb?.y ?? 0)) / h])
      prev = p
    }
    if (cur.length > 2) out.push(cur)
  }
  // One winding for every contour: a pair wound in opposite directions would turn inside out mid-way (slivers).
  return out.length ? out.map(resample).map((c) => (signedArea(c) < 0 ? c.reverse() : c)) : null
}

/** Rotate b so its start lines up with a's (the least total travel), so a pair morphs without twisting. */
function align(a: Contour, b: Contour): Contour {
  let best = 0, bestD = Infinity
  for (let off = 0; off < N; off += 2) {
    let d = 0
    for (let i = 0; i < N; i += 6) {
      const [ax, ay] = a[i], [bx, by] = b[(i + off) % N]
      d += (ax - bx) ** 2 + (ay - by) ** 2
    }
    if (d < bestD) { bestD = d; best = off }
  }
  return b.map((_, i) => b[(i + best) % N])
}

/** A degenerate contour: every point at one spot (a piece that grows out of, or shrinks into, nothing). */
const point = (p: [number, number]): Contour => Array.from({ length: N }, () => [p[0], p[1]])

/** How a paired contour moves: "both" morphs across the whole time, "out" folds away early, "in" grows in late. */
export type Role = "both" | "out" | "in"

/** Pair two glyphs' contours for a morph: [from, to, roles] with equal counts, aligned. */
export function pairContours(from: Contour[], to: Contour[]): [Contour[], Contour[], Role[]] {
  const A = [...from].sort((p, q) => area(q) - area(p))
  const B = [...to].sort((p, q) => area(q) - area(p))
  const n = Math.max(A.length, B.length)
  const a: Contour[] = [], b: Contour[] = [], roles: Role[] = []
  for (let i = 0; i < n; i++) {
    // A piece with no partner folds into its own centre (or grows out of its own), so nothing travels across.
    const ai = A[i] ?? point(centroid(B[i]))
    const bi = B[i] ?? point(centroid(A[i]))
    a.push(ai)
    b.push(A[i] && B[i] ? align(ai, bi) : bi)
    roles.push(!B[i] ? "out" : !A[i] ? "in" : "both")
  }
  return [a, b, roles]
}

/** Each role's own progress: leftovers clear out in the first half, newcomers arrive in the second. */
const local = (role: Role, t: number) => (role === "out" ? Math.min(1, t * 2) : role === "in" ? Math.max(0, t * 2 - 1) : t)

/** The morph's outline at t (0 to 1), as path data in a 0 to 1 viewBox. */
export function frame(a: Contour[], b: Contour[], t: number, roles?: Role[]): string {
  let d = ""
  for (let c = 0; c < a.length; c++) {
    const tc = roles ? local(roles[c], t) : t
    for (let i = 0; i < N; i++) {
      const x = a[c][i][0] + (b[c][i][0] - a[c][i][0]) * tc
      const y = a[c][i][1] + (b[c][i][1] - a[c][i][1]) * tc
      d += `${i ? "L" : "M"}${x.toFixed(4)} ${y.toFixed(4)}`
    }
    d += "Z"
  }
  return d
}
