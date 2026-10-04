import { describe, it, expect, afterEach } from "vitest"
import { render, cleanup } from "@testing-library/react"
import * as React from "react"
import { FlashFilled, Temperature, Snowflake, Music, Idea, Sprout, Automatic } from "@/registry/icons"
import {
  MiniSegments,
  MiniStat,
  MiniGauge,
  MiniBadge,
  MiniRange,
  MiniArc,
  MiniMedia,
  MiniLevels,
  MiniColor,
  MiniGlow,
  MiniDial,
  miniGradients,
  type MiniTone,
} from "@/registry/ui/mini-chart"

afterEach(cleanup)

const sizes = ["sm", "md", "lg"] as const
const sizeClass = { sm: "size-16", md: "size-24", lg: "size-32" }
const tones: MiniTone[] = ["primary", "info", "success", "warning", "error", "neutral"]
/** Below the scale, its ends, inside it and past it. */
const values = [-0.5, 0, 0.25, 0.5, 0.999, 1, 1.5]
const gradients = Object.entries(miniGradients)
/** The chart's drawing, not the icons inside it. */
const ART = "svg[viewBox='0 0 100 100']"
const clamp = (v: number) => Math.min(Math.max(v, 0), 1)

/** Every chart: one image with its label, a hidden drawing, the right size, and no broken geometry. */
function sound(el: React.ReactElement, label: string, size: keyof typeof sizeClass = "md") {
  const { container } = render(el)
  const imgs = container.querySelectorAll("[role=img]")
  expect(imgs).toHaveLength(1)
  const img = imgs[0] as HTMLElement
  expect(img.getAttribute("aria-label")).toBe(label)
  expect(img.className).toContain(sizeClass[size])
  container.querySelectorAll("svg").forEach((s) => expect(s.getAttribute("aria-hidden")).toBe("true"))
  expect(container.innerHTML).not.toMatch(/NaN|Infinity|undefined/)
  return { container, img }
}

/** The rotation of each knob (and any rotated group), in degrees. */
const rotations = (c: HTMLElement) =>
  [...c.querySelectorAll<SVGGElement>("g[style*='rotate']")].map((g) => Number(/rotate\((-?[\d.]+)deg\)/.exec(g.getAttribute("style") ?? "")?.[1]))

/** How far each fill reaches, 0 to 1: one dash the path's length, slid back by its offset. */
const dashes = (c: HTMLElement) => [...c.querySelectorAll<SVGPathElement>("path[stroke-dasharray]")].map((p) => 1 - Number(p.style.strokeDashoffset))

describe("MiniGauge", () => {
  for (const size of sizes)
    for (const tone of tones)
      for (const v of values)
        it(`tone ${tone}, ${size}, value ${v}`, () => {
          const { container } = sound(<MiniGauge label="Fan" size={size} value={v} fill={tone} display="15%" footer={<MiniBadge icon={Automatic} label="Automatic" />} />, "Fan", size)
          expect(dashes(container)).toEqual([clamp(v)])
          const [knob] = rotations(container)
          expect(knob).toBeCloseTo(-135 + clamp(v) * 270, 5)
          expect(container.querySelector("[aria-label=Automatic]")).toBeTruthy()
        })
  for (const [name, stops] of gradients)
    for (const v of values)
      it(`gradient ${name}, value ${v}`, () => {
        const { container } = sound(<MiniGauge label="Water" icon={Temperature} value={v} fill={stops} display="40°" />, "Water")
        const slices = container.querySelectorAll(ART + " path")
        expect(slices.length).toBeGreaterThanOrEqual(8)
        expect(slices[0].getAttribute("stroke-linecap")).toBe("round")
        expect(slices[slices.length - 1].getAttribute("stroke-linecap")).toBe("round")
        expect(slices[1].getAttribute("stroke-linecap")).toBe("butt")
        expect(dashes(container)).toEqual([])
        expect(rotations(container)[0]).toBeCloseTo(-135 + clamp(v) * 270, 5)
      })
  it("without an icon or a footer", () => {
    const { container } = sound(<MiniGauge label="Load" value={0.3} display="30%" />, "Load")
    expect(container.querySelectorAll("[role=img] > div svg")).toHaveLength(0)
  })
})

describe("MiniRange", () => {
  for (const [name, stops] of [["default", undefined], ...gradients] as const)
    for (const v of values)
      it(`gradient ${name}, value ${v}`, () => {
        const { container } = sound(<MiniRange label="Thermostat" icon={Snowflake} value={v} min="16" max="30" display="23" gradient={stops as string[] | undefined} />, "Thermostat")
        expect(rotations(container)[0]).toBeCloseTo(-135 + clamp(v) * 270, 5)
        expect(container.textContent).toContain("16")
        expect(container.textContent).toContain("30")
        expect(container.querySelector(".text-info")?.textContent).toContain("16")
        expect(container.querySelector(".text-error")?.textContent).toContain("30")
      })
})

describe("MiniSegments", () => {
  for (let segments = 1; segments <= 6; segments++)
    for (let filled = -1; filled <= segments + 1; filled++)
      it(`${filled} of ${segments}`, () => {
        const { container } = sound(<MiniSegments label="Tank" segments={segments} filled={filled} value="15:07" />, "Tank")
        const paths = [...container.querySelectorAll<SVGPathElement>(ART + " path")]
        expect(paths).toHaveLength(segments)
        const lit = paths.filter((p) => !p.style.stroke.includes("layer-3"))
        expect(lit).toHaveLength(Math.min(Math.max(filled, 0), segments))
      })
  for (const tone of tones)
    it(`tone ${tone}`, () => {
      const { container } = sound(<MiniSegments label="Tank" filled={2} tone={tone} />, "Tank")
      expect(container.querySelector(ART + " path")!.getAttribute("style")).toContain(tone === "neutral" ? "muted-foreground" : tone)
    })
})

describe("MiniStat", () => {
  for (const size of sizes)
    for (const tone of tones)
      it(`${tone}, ${size}, every combination of value and caption`, () => {
        for (const [value, caption] of [["800", "rpm"], ["800", undefined], [undefined, "QW"], [undefined, undefined]] as const) {
          const { container } = sound(<MiniStat label="Spin" size={size} icon={FlashFilled} tone={tone} value={value} caption={caption} />, "Spin", size)
          const icon = container.querySelector("svg.shrink-0")!
          // Alone, the icon is the reading and grows.
          expect(icon.getAttribute("class")).toContain(value ? "size-[18cqw]" : "size-[30cqw]")
          if (value) expect(container.textContent).toContain(value)
          if (caption) expect(container.textContent).toContain(caption)
          cleanup()
        }
      })
})

describe("MiniArc", () => {
  for (const [name, stops] of [["default", undefined], ...gradients] as const)
    for (const v of values)
      it(`gradient ${name}, value ${v}`, () => {
        const { container } = sound(<MiniArc label="Seat" icon={Temperature} value={v} display="47°" gradient={stops as string[] | undefined} />, "Seat")
        const [knob] = rotations(container)
        expect(knob).toBeCloseTo(-35 + clamp(v) * 70, 5)
      })
  it("without an icon", () => {
    sound(<MiniArc label="Seat" value={0.5} display="47°" />, "Seat")
  })
})

describe("MiniMedia", () => {
  for (const v of values)
    for (const badge of [Music, undefined])
      for (const tone of tones)
        it(`progress ${v}, ${badge ? "badge" : "no badge"}, ${tone}`, () => {
          const { container } = sound(<MiniMedia label="Playing" cover={<span />} progress={v} badge={badge} badgeTone={tone} />, "Playing")
          expect(dashes(container)).toEqual([clamp(v)])
          expect(container.querySelectorAll("[role=img] > div > span")).toHaveLength(badge ? 2 : 1)
        })
})

describe("MiniLevels", () => {
  for (const levels of [1, 5, 9, 12])
    for (let active = -1; active <= levels; active++)
      it(`step ${active} of ${levels}`, () => {
        const { container } = sound(<MiniLevels label="Tariff" icon={FlashFilled} levels={levels} active={active} display="8kwh" />, "Tariff")
        const ticks = [...container.querySelectorAll<HTMLElement>("[style*='height']")]
        expect(ticks).toHaveLength(levels)
        const on = ticks.filter((t) => t.style.height === "14cqw")
        expect(on).toHaveLength(1)
        // A step past either end shows the nearest end, never no step at all.
        expect(ticks.indexOf(on[0])).toBe(Math.min(Math.max(active, 0), levels - 1))
      })
})

describe("MiniColor", () => {
  for (const hue of values)
    for (const brightness of values)
      it(`hue ${hue}, brightness ${brightness}`, () => {
        const { container } = sound(<MiniColor label="Light" icon={Idea} hue={hue} brightness={brightness} />, "Light")
        const [bright, h] = rotations(container)
        expect(bright).toBeCloseTo(-160 + clamp(brightness) * 320, 5)
        expect(h).toBeCloseTo(clamp(hue) * 360, 5)
      })
})

describe("MiniGlow", () => {
  for (const tone of tones)
    for (const caption of ["Cool", undefined])
      it(`${tone}, ${caption ?? "no caption"}`, () => {
        const { img, container } = sound(<MiniGlow label="Eco" icon={Sprout} tone={tone} display="17°" caption={caption} />, "Eco")
        expect(img.getAttribute("style")).toContain("radial-gradient")
        if (caption) expect(container.textContent).toContain(caption)
      })
})

describe("MiniDial", () => {
  for (const offset of [-2, -1, -0.5, 0, 0.5, 1, 2])
    for (const tone of tones)
      it(`offset ${offset}, ${tone}`, () => {
        const { container } = sound(<MiniDial label="Charging" icon={FlashFilled} tone={tone} display="15:07" offset={offset} />, "Charging")
        expect(container.querySelectorAll(ART + " line")).toHaveLength(13)
        // The ruler turns at most a third of its sweep either way.
        expect(rotations(container)[0]).toBeCloseTo(Math.min(Math.max(offset, -1), 1) * 30, 5)
      })
})

describe("MiniBadge", () => {
  for (const tone of tones)
    it(tone, () => {
      const { container } = render(<MiniBadge icon={Automatic} label="Automatic" tone={tone} />)
      expect(container.querySelector("svg")?.getAttribute("class")).toContain(tone === "neutral" ? "text-muted-foreground" : `text-${tone}`)
    })
})
