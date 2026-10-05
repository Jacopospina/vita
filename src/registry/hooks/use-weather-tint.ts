import * as React from "react"
import { readCoords, type Coords } from "@/registry/hooks/use-sun-theme"
import { swapAppearance, syncWarmth } from "@/registry/lib/appearance"

/**
 * useWeatherTint, the screen's warmth takes one of THREE states from the weather where the user is:
 *   cold   (below 15 °C)   the white point leans cool
 *   none   (15–18 °C)      neutral
 *   warm   (18 °C and up)  the white point leans warm
 * It adds to the theme's own warmth (--vita-warmth): a white point over everything, never a change of hue.
 * Mode: "dynamic" (default, changes with the reading) or a fixed "none" (neutral only) / "cold" (cold only) /
 * "warm" (warm only). Remembered on this device.
 *
 * Temperature: the current reading for the user's area from Open-Meteo (no key; the position is rounded to
 * ~10 km before it leaves the device), cached for 30 minutes. Offline or blocked → a seasonal estimate.
 *
 *   const { mode, setMode, celsius, tint } = useWeatherTint()
 */
const PREF = "vita-weather-tint"
const CACHE = "vita-weather"
const TTL = 30 * 60 * 1000
const COLD_BELOW = 15
const WARM_FROM = 18
const LEAN = 0.25 // about 5600 K warm or 7100 K cool: noticeable, never peach

export type WeatherTint = "none" | "cold" | "warm"
export type WeatherTintMode = "dynamic" | WeatherTint

/** Which of the three states a temperature puts the screen in. */
export function weatherTint(celsius: number): WeatherTint {
  return celsius < COLD_BELOW ? "cold" : celsius >= WARM_FROM ? "warm" : "none"
}

const leanOf: Record<WeatherTint, number> = { none: 0, cold: -LEAN, warm: LEAN }

/** Without a reading: the season where the user is (mid-latitude yearly cycle, warmest late July / late January). */
export function seasonalEstimate(date: Date, lat: number) {
  const day = (date.getTime() - Date.UTC(date.getUTCFullYear(), 0, 1)) / 86400000
  const phase = Math.cos((2 * Math.PI * (day - 205)) / 365)
  return 13 + 10 * (lat >= 0 ? phase : -phase)
}

function read<T>(key: string): T | null {
  try {
    return JSON.parse(localStorage.getItem(key) ?? "null") as T | null
  } catch {
    return null
  }
}
function write(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    /* private mode: just for this visit */
  }
}

async function currentTemperature({ lat, lon }: Coords, signal: AbortSignal): Promise<number> {
  const cached = read<{ t: number; at: number; lat: number; lon: number }>(CACHE)
  const la = Math.round(lat * 10) / 10, lo = Math.round(lon * 10) / 10
  if (cached && Date.now() - cached.at < TTL && cached.lat === la && cached.lon === lo) return cached.t
  try {
    const r = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${la}&longitude=${lo}&current=temperature_2m`, { signal })
    const t = (await r.json())?.current?.temperature_2m
    if (typeof t !== "number") throw new Error("no reading")
    write(CACHE, { t, at: Date.now(), lat: la, lon: lo })
    return t
  } catch (e) {
    if (signal.aborted) throw e
    return seasonalEstimate(new Date(), lat)
  }
}

export function useWeatherTint() {
  const [mode, setModeState] = React.useState<WeatherTintMode>(() => {
    const v = read<string>(PREF)
    return v === "none" || v === "cold" || v === "warm" ? v : v === "off" ? "none" : "dynamic"
  })
  const [celsius, setCelsius] = React.useState<number | null>(null)

  const setMode = React.useCallback((next: WeatherTintMode) => {
    setModeState(next)
    write(PREF, next)
  }, [])

  React.useEffect(() => {
    if (mode !== "dynamic") return
    const ctl = new AbortController()
    const update = () => currentTemperature(readCoords(), ctl.signal).then(setCelsius, () => {})
    update()
    const t = window.setInterval(update, TTL)
    return () => { ctl.abort(); window.clearInterval(t) }
  }, [mode])

  const tint: WeatherTint | null = mode === "dynamic" ? (celsius === null ? null : weatherTint(celsius)) : mode

  React.useEffect(() => {
    const root = document.documentElement.style
    // One cross-fade for the whole page, not a transition on every element that uses a grey.
    swapAppearance(() => {
      root.setProperty("--vita-weather-warmth", String(tint === null ? 0 : leanOf[tint]))
      syncWarmth()
    })
  }, [tint])

  return { mode, setMode, celsius, tint }
}
