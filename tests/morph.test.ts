import { describe, it, expect } from "vitest"
import { pairContours, frame, type Contour } from "@/registry/lib/morph"

const square = (x: number, y: number, s: number): Contour => Array.from({ length: 72 }, (_, i) => {
  const t = (i / 72) * 4, side = Math.floor(t), f = t - side
  const pts: [number, number][] = [[x, y], [x + s, y], [x + s, y + s], [x, y + s]]
  const [a, b] = [pts[side], pts[(side + 1) % 4]]
  return [a[0] + (b[0] - a[0]) * f, a[1] + (b[1] - a[1]) * f]
})

describe("glyph morph", () => {
  it("pairs glyphs with different piece counts: extra pieces fold away, missing ones grow in", () => {
    const [a, b, roles] = pairContours([square(0, 0, 1), square(0.2, 0.2, 0.2)], [square(0.1, 0.1, 0.8)])
    expect(a).toHaveLength(2)
    expect(b).toHaveLength(2)
    expect(roles).toEqual(["both", "out"])
    const [, , grow] = pairContours([square(0, 0, 1)], [square(0, 0, 1), square(0.4, 0.4, 0.2)])
    expect(grow).toEqual(["both", "in"])
  })

  it("starts exactly on the first glyph and lands exactly on the second", () => {
    const [a, b, roles] = pairContours([square(0, 0, 1)], [square(0.25, 0.25, 0.5)])
    const start = frame(a, b, 0, roles), end = frame(a, b, 1, roles)
    expect(start.startsWith(`M${a[0][0][0].toFixed(4)} ${a[0][0][1].toFixed(4)}`)).toBe(true)
    expect(end.startsWith(`M${b[0][0][0].toFixed(4)} ${b[0][0][1].toFixed(4)}`)).toBe(true)
  })
})
