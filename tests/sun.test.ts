import { describe, it, expect } from "vitest"
import { isDaylight, sunElevation } from "@/registry/hooks/use-sun-theme"

describe("sun theme", () => {
  const london = { lat: 51.5, lon: -0.13 }
  const sydney = { lat: -33.9, lon: 151.2 }
  it("is daylight in London at midday in June and night at midnight", () => {
    expect(isDaylight(new Date("2026-06-21T12:00:00Z"), london.lat, london.lon)).toBe(true)
    expect(isDaylight(new Date("2026-06-21T00:00:00Z"), london.lat, london.lon)).toBe(false)
  })
  it("flips around sunrise (London, 1 Oct ≈ 06:00 UTC)", () => {
    expect(isDaylight(new Date("2026-10-01T05:30:00Z"), london.lat, london.lon)).toBe(false)
    expect(isDaylight(new Date("2026-10-01T06:30:00Z"), london.lat, london.lon)).toBe(true)
  })
  it("knows it's night in Sydney when it's London's midday", () => {
    expect(sunElevation(new Date("2026-06-21T12:00:00Z"), sydney.lat, sydney.lon)).toBeLessThan(0)
  })
})
