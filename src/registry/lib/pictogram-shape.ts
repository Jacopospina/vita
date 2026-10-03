/**
 * Vita pictograms: the line drawings, redrawn with Vita's corners.
 *
 * A pictogram's drawing commands are read once into closed contours (its own corners; curves flattened into short
 * segments) and cached per glyph. Drawing it again is cheap: every corner is replaced by a curve of the theme's radius. Corners on the outside of a line get the full radius, corners on its
 * inside a smaller one, so a line keeps its thickness around a bend. Never sharp, even in a square theme.

 */
import { union } from "polygon-clipping"

type Pt = [number, number]
type Contour = Pt[]
export interface PictogramShape {
  w: number
  h: number
  /** One entry per painted element of the source drawing; each is drawn as its own even-odd path. */
  parts: Contour[][]
  /** Per contour of parts: true when it's an inner edge (it sits inside another contour of its part). */
  holes: boolean[][]
  /** +1 or −1: the winding of the largest outer edge (used to orient the silhouette). */
  side: number
}

const cache = new WeakMap<object, PictogramShape | null>()

function signedArea(c: Contour) {
  let a = 0
  for (let i = 0; i < c.length; i++) {
    const [x1, y1] = c[i], [x2, y2] = c[(i + 1) % c.length]
    a += x1 * y2 - x2 * y1
  }
  return a / 2
}

function inside([x, y]: Pt, poly: Contour) {
  let hit = false
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const [xi, yi] = poly[i], [xj, yj] = poly[j]
    if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) hit = !hit
  }
  return hit
}

/* ---- Reading the drawing: path commands are parsed directly, so corners are the drawing's own points. Curves and
   arcs are flattened into short segments (their many gentle "corners" round away to nothing). ---- */
type Seg = { pts: Pt[]; closed: boolean }

function flattenCubic(out: Pt[], p0: Pt, p1: Pt, p2: Pt, p3: Pt) {
  const n = Math.max(4, Math.min(16, Math.ceil((Math.hypot(p1[0] - p0[0], p1[1] - p0[1]) + Math.hypot(p2[0] - p1[0], p2[1] - p1[1]) + Math.hypot(p3[0] - p2[0], p3[1] - p2[1])) / 0.6)))
  for (let i = 1; i <= n; i++) {
    const t = i / n, u = 1 - t
    out.push([u * u * u * p0[0] + 3 * u * u * t * p1[0] + 3 * u * t * t * p2[0] + t * t * t * p3[0], u * u * u * p0[1] + 3 * u * u * t * p1[1] + 3 * u * t * t * p2[1] + t * t * t * p3[1]])
  }
}

function flattenArc(out: Pt[], p0: Pt, rx: number, ry: number, phiDeg: number, large: number, sweep: number, p1: Pt) {
  if (!rx || !ry) { out.push(p1); return }
  const phi = (phiDeg * Math.PI) / 180, cos = Math.cos(phi), sin = Math.sin(phi)
  const dx = (p0[0] - p1[0]) / 2, dy = (p0[1] - p1[1]) / 2
  const x1 = cos * dx + sin * dy, y1 = -sin * dx + cos * dy
  rx = Math.abs(rx); ry = Math.abs(ry)
  const lam = (x1 * x1) / (rx * rx) + (y1 * y1) / (ry * ry)
  if (lam > 1) { rx *= Math.sqrt(lam); ry *= Math.sqrt(lam) }
  const sign = large === sweep ? -1 : 1
  const num = rx * rx * ry * ry - rx * rx * y1 * y1 - ry * ry * x1 * x1
  const co = sign * Math.sqrt(Math.max(0, num / (rx * rx * y1 * y1 + ry * ry * x1 * x1)))
  const cx1 = (co * rx * y1) / ry, cy1 = (-co * ry * x1) / rx
  const cx = cos * cx1 - sin * cy1 + (p0[0] + p1[0]) / 2, cy = sin * cx1 + cos * cy1 + (p0[1] + p1[1]) / 2
  const ang = (ux: number, uy: number, vx: number, vy: number) => Math.atan2(ux * vy - uy * vx, ux * vx + uy * vy)
  const t1 = ang(1, 0, (x1 - cx1) / rx, (y1 - cy1) / ry)
  let dt = ang((x1 - cx1) / rx, (y1 - cy1) / ry, (-x1 - cx1) / rx, (-y1 - cy1) / ry)
  if (!sweep && dt > 0) dt -= 2 * Math.PI
  else if (sweep && dt < 0) dt += 2 * Math.PI
  const n = Math.max(4, Math.min(48, Math.ceil((Math.abs(dt) * Math.max(rx, ry)) / 0.5)))
  for (let i = 1; i <= n; i++) {
    const t = t1 + (dt * i) / n
    const x = rx * Math.cos(t), y = ry * Math.sin(t)
    out.push([cos * x - sin * y + cx, sin * x + cos * y + cy])
  }
}

function parsePath(d: string): Seg[] {
  const toks = d.match(/[a-zA-Z]|-?(?:\d+\.?\d*|\.\d+)(?:e[-+]?\d+)?/g) ?? []
  const segs: Seg[] = []
  let cur: Pt[] = [], pos: Pt = [0, 0], start: Pt = [0, 0], cmd = "", prevCtrl: Pt | null = null, prevCmd = ""
  let i = 0
  const num = () => parseFloat(toks[i++])
  const end = (closed: boolean) => { if (cur.length > 1) segs.push({ pts: cur, closed }); cur = [] }
  while (i < toks.length) {
    if (/[a-zA-Z]/.test(toks[i])) cmd = toks[i++]
    const rel = cmd === cmd.toLowerCase(), C = cmd.toUpperCase()
    const ox = rel ? pos[0] : 0, oy = rel ? pos[1] : 0
    if (C === "Z") { end(true); pos = start; prevCtrl = null; prevCmd = C; continue }
    if (C === "M") { end(false); pos = [ox + num(), oy + num()]; start = pos; cur = [pos]; cmd = rel ? "l" : "L"; prevCtrl = null; prevCmd = "M"; continue }
    if (!cur.length) cur = [pos]
    if (C === "L") { pos = [ox + num(), oy + num()]; cur.push(pos); prevCtrl = null }
    else if (C === "H") { pos = [ox + num(), pos[1]]; cur.push(pos); prevCtrl = null }
    else if (C === "V") { pos = [pos[0], oy + num()]; cur.push(pos); prevCtrl = null }
    else if (C === "C" || C === "S") {
      const c1: Pt = C === "C" ? [ox + num(), oy + num()] : prevCtrl && (prevCmd === "C" || prevCmd === "S") ? [2 * pos[0] - prevCtrl[0], 2 * pos[1] - prevCtrl[1]] : pos
      const c2: Pt = [ox + num(), oy + num()], p: Pt = [ox + num(), oy + num()]
      flattenCubic(cur, pos, c1, c2, p); prevCtrl = c2; pos = p
    } else if (C === "Q" || C === "T") {
      const q: Pt = C === "Q" ? [ox + num(), oy + num()] : prevCtrl && (prevCmd === "Q" || prevCmd === "T") ? [2 * pos[0] - prevCtrl[0], 2 * pos[1] - prevCtrl[1]] : pos
      const p: Pt = [ox + num(), oy + num()]
      flattenCubic(cur, pos, [pos[0] + (2 / 3) * (q[0] - pos[0]), pos[1] + (2 / 3) * (q[1] - pos[1])], [p[0] + (2 / 3) * (q[0] - p[0]), p[1] + (2 / 3) * (q[1] - p[1])], p)
      prevCtrl = q; pos = p
    } else if (C === "A") {
      const rx = num(), ry = num(), rot = num(), large = num(), sweep = num(), p: Pt = [ox + num(), oy + num()]
      flattenArc(cur, pos, rx, ry, rot, large, sweep, p); pos = p; prevCtrl = null
    } else { i++; continue }
    prevCmd = C
  }
  end(false)
  return segs
}

function ellipse(cx: number, cy: number, rx: number, ry: number): Pt[] {
  const n = Math.max(12, Math.min(64, Math.ceil(Math.max(rx, ry) * 4)))
  return Array.from({ length: n }, (_, k) => [cx + rx * Math.cos((k / n) * 2 * Math.PI), cy + ry * Math.sin((k / n) * 2 * Math.PI)] as Pt)
}

function contoursOf(el: SVGGraphicsElement): Contour[] {
  const n = (a: string) => parseFloat(el.getAttribute(a) ?? "0") || 0
  switch (el.tagName.toLowerCase()) {
    case "path": return parsePath(el.getAttribute("d") ?? "").map((s) => s.pts)
    case "circle": return [ellipse(n("cx"), n("cy"), n("r"), n("r"))]
    case "ellipse": return [ellipse(n("cx"), n("cy"), n("rx"), n("ry"))]
    case "rect": { const x = n("x"), y = n("y"), w = n("width"), h = n("height"); return [[[x, y], [x + w, y], [x + w, y + h], [x, y + h]]] }
    case "polygon": { const v = (el.getAttribute("points") ?? "").trim().split(/[\s,]+/).map(Number); const pts: Pt[] = []; for (let k = 0; k + 1 < v.length; k += 2) pts.push([v[k], v[k + 1]]); return [pts] }
    default: return []
  }
}

/** Read a rendered pictogram into its shape (parsed, never sampled: fast and exact). Null if it can't be read. */
export function measurePictogram(svg: SVGSVGElement): PictogramShape | null {
  const vb = svg.viewBox?.baseVal
  const w = vb?.width || 32, h = vb?.height || 32
  const ox = vb?.x ?? 0, oy = vb?.y ?? 0
  const parts: Contour[][] = []
  for (const el of svg.querySelectorAll<SVGGraphicsElement>("path, circle, rect, polygon, ellipse")) {
    if (el.getAttribute("fill") === "none" || el.getAttribute("data-name")?.includes("Transparent")) continue
    // Any transform on the element or its groups, relative to the drawing.
    let m: DOMMatrix | null = null
    try {
      const own = el.getCTM?.(), root = svg.getCTM?.()
      if (own && root) m = root.inverse().multiply(own)
    } catch { m = null }
    const map = (p: Pt): Pt => {
      if (!m || m.isIdentity) return [p[0] - ox, p[1] - oy]
      return [m.a * p[0] + m.c * p[1] + m.e - ox, m.b * p[0] + m.d * p[1] + m.f - oy]
    }
    const cs = contoursOf(el)
      .map((c) => {
        const pts = c.map(map)
        // Drop a closing point that repeats the first, and points that sit on top of their neighbour.
        const clean: Pt[] = []
        for (const p of pts) if (!clean.length || Math.hypot(p[0] - clean[clean.length - 1][0], p[1] - clean[clean.length - 1][1]) > 1e-3) clean.push(p)
        if (clean.length > 2 && Math.hypot(clean[0][0] - clean[clean.length - 1][0], clean[0][1] - clean[clean.length - 1][1]) < 1e-3) clean.pop()
        return clean
      })
      .filter((c) => c.length > 2 && Math.abs(signedArea(c)) > 0.01)
    if (cs.length) parts.push(cs)
  }
  if (!parts.length) return null
  // One outline: pieces that touch or overlap (a frame drawn as separate bars, a line crossing a shape) are merged,
  // so the corners where they meet round like any other. Falls back to the pieces as drawn if the union fails.
  const merged = unite(parts)
  if (merged) return finish(w, h, merged.parts, merged.holes)
  const holesAsDrawn = parts.map((part) => part.map((c) => part.filter((o) => o !== c && Math.abs(signedArea(o)) > Math.abs(signedArea(c)) && inside(c[0], o)).length % 2 === 1))
  return finish(w, h, parts, holesAsDrawn)
}

/** Each element's contours as polygons with holes (by nesting), all unioned. Rings come back outer first. */
function unite(parts: Contour[][]): { parts: Contour[][]; holes: boolean[][] } | null {
  try {
    const polys: [number, number][][][] = []
    for (const part of parts) {
      const sorted = [...part].sort((p, q) => Math.abs(signedArea(q)) - Math.abs(signedArea(p)))
      const owners: { ring: Contour; poly: [number, number][][] }[] = []
      for (const c of sorted) {
        const containers = sorted.filter((o) => o !== c && Math.abs(signedArea(o)) > Math.abs(signedArea(c)) && inside(c[0], o))
        const ring = c.concat([c[0]]) as [number, number][]
        if (containers.length % 2 === 0) { const poly = [ring]; owners.push({ ring: c, poly }); polys.push(poly) }
        else {
          // A hole belongs to the smallest outer edge around it.
          const owner = owners.filter((o) => inside(c[0], o.ring)).sort((p, q) => Math.abs(signedArea(p.ring)) - Math.abs(signedArea(q.ring)))[0]
          owner?.poly.push(ring)
        }
      }
    }
    if (!polys.length) return null
    const out = union(polys[0], ...polys.slice(1))
    const newParts: Contour[][] = [], holes: boolean[][] = []
    for (const poly of out) {
      const rings = poly.map((ring) => ring.slice(0, -1) as Contour).filter((r) => r.length > 2 && Math.abs(signedArea(r)) > 0.01)
      if (!rings.length) continue
      newParts.push(rings)
      holes.push(rings.map((_, k) => k > 0))
    }
    return newParts.length ? { parts: newParts, holes } : null
  } catch {
    return null
  }
}

/**
 * Simplify a closed ring (Douglas–Peucker): a corner the source drew as a tiny curve (Carbon rounds by 0.36 units)
 * becomes one corner again, so it can take the theme's radius instead of keeping its own sliver of a curve.
 */
function simplifyRing(c: Contour, eps: number): Contour {
  if (c.length < 5) return c
  const dp = (pts: Pt[]): Pt[] => {
    if (pts.length < 3) return pts
    const [ax, ay] = pts[0], [bx, by] = pts[pts.length - 1]
    const len = Math.hypot(bx - ax, by - ay) || 1
    let far = 0, idx = 0
    for (let i = 1; i < pts.length - 1; i++) {
      const d = Math.abs((bx - ax) * (ay - pts[i][1]) - (ax - pts[i][0]) * (by - ay)) / len
      if (d > far) { far = d; idx = i }
    }
    if (far <= eps) return [pts[0], pts[pts.length - 1]]
    return dp(pts.slice(0, idx + 1)).slice(0, -1).concat(dp(pts.slice(idx)))
  }
  let far = 0, idx = 0
  for (let i = 1; i < c.length; i++) {
    const d = Math.hypot(c[i][0] - c[0][0], c[i][1] - c[0][1])
    if (d > far) { far = d; idx = i }
  }
  const out = dp(c.slice(0, idx + 1)).slice(0, -1).concat(dp(c.slice(idx).concat([c[0]])).slice(0, -1))
  return out.length > 2 ? out : c
}

function finish(w: number, h: number, rawParts: Contour[][], holes: boolean[][]): PictogramShape {
  const parts = rawParts.map((part) => part.map((c) => simplifyRing(c, 0.16)))
  // The largest contour is an outside edge: its winding tells which side the material is on, for every contour.
  const all = parts.flat()
  const biggest = all.reduce((a, b) => (Math.abs(signedArea(b)) > Math.abs(signedArea(a)) ? b : a))
  const side = Math.sign(signedArea(biggest)) || 1
  return { w, h, parts, holes, side }
}

export function cachedShape(key: object) { return cache.get(key) }
export function rememberShape(key: object, shape: PictogramShape | null) { cache.set(key, shape) }

/**
 * A closed contour as path data, every corner rounded. Corners on the outside of the material take r, corners on its
 * inside a third of it, so a line keeps its thickness around a bend. `hole`: the contour is an inner edge (the
 * material is outside it), which flips which of its corners are outside ones.
 */
export function roundedPath(c: Contour, r: number, hole: boolean): string {
  const n = c.length
  const orient = Math.sign(signedArea(c)) || 1
  let d = ""
  for (let i = 0; i < n; i++) {
    const p = c[(i - 1 + n) % n], v = c[i], q = c[(i + 1) % n]
    const l1 = Math.hypot(v[0] - p[0], v[1] - p[1]) || 1, l2 = Math.hypot(q[0] - v[0], q[1] - v[1]) || 1
    const u1: Pt = [(v[0] - p[0]) / l1, (v[1] - p[1]) / l1], u2: Pt = [(q[0] - v[0]) / l2, (q[1] - v[1]) / l2]
    const turn = u1[0] * u2[1] - u1[1] * u2[0]
    const convex = turn * orient > 0
    const want = convex !== hole ? r : r / 3
    const k = Math.min(want, l1 / 2, l2 / 2)
    const a: Pt = [v[0] - u1[0] * k, v[1] - u1[1] * k], b: Pt = [v[0] + u2[0] * k, v[1] + u2[1] * k]
    d += `${i ? "L" : "M"}${a[0].toFixed(3)} ${a[1].toFixed(3)}Q${v[0].toFixed(3)} ${v[1].toFixed(3)} ${b[0].toFixed(3)} ${b[1].toFixed(3)}`
  }
  return d + "Z"
}



