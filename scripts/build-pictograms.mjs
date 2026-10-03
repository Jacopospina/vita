/**
 * Rebuild every Carbon pictogram as LINES: its centre lines, drawn later as round-capped, round-joined strokes,
 * so no corner is ever sharp and the theme can set both the corner radius and the line weight.
 *
 *   pnpm pictograms   → src/registry/pictograms.data.ts
 *
 * For each pictogram: fill its outline into a fine grid (12 px per unit), measure how far every filled pixel is
 * from the edge, thin the fill down to its one-pixel skeleton, trace the skeleton into polylines, prune the stubs
 * thinning leaves at corners, and simplify. Each line keeps its own width (from the distance map), so dots and solid
 * marks stay as thick as they were drawn.
 */
import fs from "node:fs"
import path from "node:path"
import React from "react"
import { renderToStaticMarkup } from "react-dom/server"
import * as Carbon from "@carbon/pictograms-react"
import { parsePath, ellipse } from "../src/registry/lib/pictogram-shape.ts"

const S = 12 // px per unit
const ROOT = path.resolve(import.meta.dirname, "..")
const OUT = process.env.OUT ?? path.join(ROOT, "src/registry/pictograms.data.ts")

const quiet = console.warn
console.warn = () => {} // Carbon logs a deprecation line per old pictogram
console.error = () => {}

/* ---------- read ---------- */
function shapesOf(markup) {
  const vb = /viewBox="([^"]+)"/.exec(markup)?.[1].split(/[\s,]+/).map(Number) ?? [0, 0, 32, 32]
  const elements = []
  for (const m of markup.matchAll(/<(path|circle|ellipse|rect|polygon)\b([^>]*)\/?>/g)) {
    const [, tag, attrs] = m
    const a = (k) => new RegExp(`\\b${k}="([^"]*)"`).exec(attrs)?.[1]
    if (a("fill") === "none" || (a("data-name") ?? "").includes("Transparent")) continue
    if (/transform=/.test(attrs)) return null // one pictogram uses a transform: kept as drawn
    let contours = []
    if (tag === "path") contours = parsePath(a("d") ?? "").map((s) => s.pts)
    else if (tag === "circle") contours = [ellipse(+a("cx"), +a("cy"), +a("r"), +a("r"))]
    else if (tag === "ellipse") contours = [ellipse(+a("cx"), +a("cy"), +a("rx"), +a("ry"))]
    else if (tag === "rect") { const x = +(a("x") ?? 0), y = +(a("y") ?? 0), w = +a("width"), h = +a("height"); contours = [[[x, y], [x + w, y], [x + w, y + h], [x, y + h]]] }
    else if (tag === "polygon") { const v = (a("points") ?? "").trim().split(/[\s,]+/).map(Number); const pts = []; for (let k = 0; k + 1 < v.length; k += 2) pts.push([v[k], v[k + 1]]); contours = [pts] }
    elements.push(contours.map((c) => c.map(([x, y]) => [x - vb[0], y - vb[1]])))
  }
  return { w: vb[2], h: vb[3], elements }
}

/* ---------- fill (even-odd per element, elements OR-ed) ---------- */
function rasterize({ w, h, elements }) {
  const W = Math.round(w * S), H = Math.round(h * S)
  const img = new Uint8Array(W * H)
  for (const contours of elements) {
    const edges = []
    for (const c of contours) for (let i = 0; i < c.length; i++) { const p = c[i], q = c[(i + 1) % c.length]; if (p[1] !== q[1]) edges.push([p[0] * S, p[1] * S, q[0] * S, q[1] * S]) }
    for (let y = 0; y < H; y++) {
      const yc = y + 0.5, xs = []
      for (const [x1, y1, x2, y2] of edges) if ((y1 <= yc && y2 > yc) || (y2 <= yc && y1 > yc)) xs.push(x1 + ((yc - y1) / (y2 - y1)) * (x2 - x1))
      xs.sort((a, b) => a - b)
      for (let k = 0; k + 1 < xs.length; k += 2) {
        const a = Math.max(0, Math.ceil(xs[k] - 0.5)), b = Math.min(W - 1, Math.floor(xs[k + 1] - 0.5))
        for (let x = a; x <= b; x++) img[y * W + x] ^= 1
      }
    }
  }
  return { img, W, H }
}

/* ---------- distance to the edge (chamfer 3-4, in px) ---------- */
function distance(img, W, H) {
  const d = new Float32Array(W * H)
  for (let i = 0; i < d.length; i++) d[i] = img[i] ? 1e9 : 0
  const at = (x, y) => (x < 0 || y < 0 || x >= W || y >= H ? 0 : d[y * W + x])
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) { const i = y * W + x; if (!d[i]) continue; d[i] = Math.min(d[i], at(x - 1, y) + 3, at(x, y - 1) + 3, at(x - 1, y - 1) + 4, at(x + 1, y - 1) + 4) }
  for (let y = H - 1; y >= 0; y--) for (let x = W - 1; x >= 0; x--) { const i = y * W + x; if (!d[i]) continue; d[i] = Math.min(d[i], at(x + 1, y) + 3, at(x, y + 1) + 3, at(x + 1, y + 1) + 4, at(x - 1, y + 1) + 4) }
  for (let i = 0; i < d.length; i++) d[i] /= 3
  return d
}

/* ---------- thinning (Zhang–Suen) ---------- */
function thin(src, W, H) {
  const img = src.slice()
  const px = (x, y) => (x < 0 || y < 0 || x >= W || y >= H ? 0 : img[y * W + x])
  let changed = true
  while (changed) {
    changed = false
    for (const pass of [0, 1]) {
      const kill = []
      for (let y = 0; y < H; y++)
        for (let x = 0; x < W; x++) {
          if (!img[y * W + x]) continue
          const p = [px(x, y - 1), px(x + 1, y - 1), px(x + 1, y), px(x + 1, y + 1), px(x, y + 1), px(x - 1, y + 1), px(x - 1, y), px(x - 1, y - 1)]
          const b = p.reduce((s, v) => s + v, 0)
          if (b < 2 || b > 6) continue
          let a = 0
          for (let k = 0; k < 8; k++) if (!p[k] && p[(k + 1) % 8]) a++
          if (a !== 1) continue
          if (pass === 0 ? p[0] * p[2] * p[4] || p[2] * p[4] * p[6] : p[0] * p[2] * p[6] || p[0] * p[4] * p[6]) continue
          kill.push(y * W + x)
        }
      for (const i of kill) img[i] = 0
      if (kill.length) changed = true
    }
  }
  return img
}

/* ---------- trace the skeleton into polylines ---------- */
const N8 = [[0, -1], [1, -1], [1, 0], [1, 1], [0, 1], [-1, 1], [-1, 0], [-1, -1]] // clockwise from north
function trace(sk, W, H) {
  const on = (x, y) => x >= 0 && y >= 0 && x < W && y < H && sk[y * W + x] === 1
  // Crossing number: how many separate branches leave a pixel (1 = an end, 2 = along a line, 3+ = a junction).
  const cn = (x, y) => { let t = 0; for (let k = 0; k < 8; k++) { const [a, b] = N8[k], [c, d] = N8[(k + 1) % 8]; if (!on(x + a, y + b) && on(x + c, y + d)) t++ } return t }
  const isNode = (x, y) => cn(x, y) !== 2
  const seen = new Uint8Array(W * H)
  const lines = []
  const next = (x, y, px, py) => {
    let best = null
    for (const [dx, dy] of N8) {
      const a = x + dx, b = y + dy
      if (!on(a, b) || (a === px && b === py) || seen[b * W + a]) continue
      // Orthogonal steps first: a staircase is followed pixel by pixel, never cut short.
      if (!best || (dx === 0 || dy === 0)) best = [a, b]
      if (dx === 0 || dy === 0) break
    }
    return best
  }
  const walk = (x0, y0, x1, y1) => {
    const line = [[x0, y0], [x1, y1]]
    let [px, py, cx, cy] = [x0, y0, x1, y1]
    if (!isNode(cx, cy)) seen[cy * W + cx] = 1
    while (!isNode(cx, cy)) {
      const n = next(cx, cy, px, py)
      if (!n) break
      ;[px, py, cx, cy] = [cx, cy, n[0], n[1]]
      line.push([cx, cy])
      if (!isNode(cx, cy)) seen[cy * W + cx] = 1
    }
    return line
  }
  for (let y = 0; y < H; y++)
    for (let x = 0; x < W; x++) {
      if (!on(x, y) || !isNode(x, y)) continue
      if (cn(x, y) === 0) { lines.push([[x, y]]); continue }
      for (const [dx, dy] of N8) {
        const a = x + dx, b = y + dy
        if (on(a, b) && !seen[b * W + a] && !(isNode(a, b) && b * W + a < y * W + x)) lines.push(walk(x, y, a, b))
      }
    }
  // Closed loops: lines with no end and no junction.
  for (let y = 0; y < H; y++)
    for (let x = 0; x < W; x++) {
      if (!on(x, y) || seen[y * W + x] || isNode(x, y)) continue
      seen[y * W + x] = 1
      const n = next(x, y, -1, -1)
      if (!n) continue
      const l = walk(x, y, n[0], n[1])
      l.closed = true
      lines.push(l)
    }
  return lines
}

/* ---------- simplify ---------- */
function rdp(pts, eps) {
  if (pts.length < 3) return pts
  const [ax, ay] = pts[0], [bx, by] = pts[pts.length - 1]
  const len = Math.hypot(bx - ax, by - ay)
  let far = 0, idx = 0
  for (let i = 1; i < pts.length - 1; i++) {
    const d = len ? Math.abs((bx - ax) * (ay - pts[i][1]) - (ax - pts[i][0]) * (by - ay)) / len : Math.hypot(pts[i][0] - ax, pts[i][1] - ay)
    if (d > far) { far = d; idx = i }
  }
  if (far <= eps) return [pts[0], pts[pts.length - 1]]
  return rdp(pts.slice(0, idx + 1), eps).slice(0, -1).concat(rdp(pts.slice(idx), eps))
}

function build(name) {
  const shapes = shapesOf(renderToStaticMarkup(React.createElement(Carbon[name])))
  if (!shapes || !shapes.elements.length) return null
  const { img, W, H } = rasterize(shapes)
  const dist = distance(img, W, H)
  const sk = thin(img, W, H)
  let lines = trace(sk, W, H)
  const widthAt = (x, y) => (2 * dist[y * W + x]) / S
  // Prune the stubs thinning leaves where a thick line turns a corner: short branches with a free end.
  const isEnd = (x, y) => N8.filter(([dx, dy]) => sk[(y + dy) * W + (x + dx)] === 1).length <= 1
  lines = lines.filter((l) => {
    if (l.length === 1 || l.closed) return true
    const len = l.length
    const w = widthAt(...l[0]) * S
    const freeA = isEnd(...l[0]), freeB = isEnd(...l[l.length - 1])
    if (!freeA && !freeB && len <= 3) return false // a speck inside a junction cluster
    return !((freeA !== freeB) && len < w * 1.1)
  })
  // Thinning erases tiny blobs outright (a phone's home dot): any solid piece with no skeleton left becomes a dot
  // at its centre, as wide as it was drawn.
  const label = new Int32Array(W * H).fill(-1)
  let comp = 0
  for (let i = 0; i < img.length; i++) {
    if (!img[i] || label[i] >= 0) continue
    const queue = [i]; label[i] = comp
    let sx = 0, sy = 0, n = 0, maxD = 0, hasSkeleton = false
    while (queue.length) {
      const j = queue.pop(), x = j % W, y = (j / W) | 0
      sx += x; sy += y; n++; maxD = Math.max(maxD, dist[j]); if (sk[j]) hasSkeleton = true
      for (const [dx, dy] of N8) {
        const a = x + dx, b = y + dy, k = b * W + a
        if (a >= 0 && b >= 0 && a < W && b < H && img[k] && label[k] < 0) { label[k] = comp; queue.push(k) }
      }
    }
    if (!hasSkeleton && n > 2) lines.push(Object.assign([[Math.round(sx / n), Math.round(sy / n)]], { dot: (2 * maxD) / S }))
    comp++
  }
  const out = []
  for (const l of lines) {
    const widths = l.map(([x, y]) => widthAt(x, y)).sort((a, b) => a - b)
    const width = l.dot ?? (widths[Math.floor(widths.length / 2)] || 0.72)
    let pts = l.map(([x, y]) => [(x + 0.5) / S, (y + 0.5) / S])
    pts = l.closed ? rdp(pts.concat([pts[0]]), 0.12).slice(0, -1) : rdp(pts, 0.12)
    if (pts.length === 1) pts = [pts[0], pts[0]] // a dot: a zero-length line, its round caps make the disc
    out.push({ w: +width.toFixed(2), c: !!l.closed, p: pts.flat().map((v) => +v.toFixed(2)) })
  }
  return { w: shapes.w, h: shapes.h, l: out }
}

const only = process.env.ONLY?.split(",")
const names = Object.keys(Carbon).filter((k) => /^[A-Z]/.test(k) && k !== "Icon" && (!only || only.includes(k)))
const t0 = Date.now()
const lines = [
  "/* Generated by scripts/build-pictograms.mjs from @carbon/pictograms-react. Do not edit; run `pnpm pictograms`. */",
  "/* Each pictogram is its centre lines: { w, h, l: [{ w: width, c: closed, p: [x, y, x, y…] }] } in its own units. */",
  'import type { PictogramData } from "@/registry/ui/pictogram"',
  "",
]
let done = 0, skipped = []
const catalog = {}
for (const n of names) {
  const d = build(n)
  if (!d) { skipped.push(n); continue }
  lines.push(`export const ${n}: PictogramData = ${JSON.stringify(d)}`)
  catalog[n] = d
  if (++done % 200 === 0) quiet(`${done}/${names.length}…`)
}
// The few that can't be read as lines stay as Carbon draws them (rendered as rounded outlines).
if (skipped.length) lines.splice(3, 0, `export { ${skipped.join(", ")} } from "@carbon/pictograms-react"`)
fs.writeFileSync(OUT, lines.join("\n") + "\n")
// The whole set, for galleries only, as a separate file: components import single pictograms from the module above
// (they tree-shake); a gallery fetching everything from that same module would pull all of it into every page.
if (!process.env.OUT) fs.writeFileSync(path.join(ROOT, "src/registry/pictograms.catalog.json"), JSON.stringify(catalog))
quiet(`✓ ${done} pictograms as lines → ${path.relative(ROOT, OUT)} in ${((Date.now() - t0) / 1000).toFixed(1)}s${skipped.length ? `; kept as drawn: ${skipped.join(", ")}` : ""}`)
