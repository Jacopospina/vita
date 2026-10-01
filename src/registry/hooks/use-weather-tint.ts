import * as React from "react"
import { readCoords, type Coords } from "@/registry/hooks/use-sun-theme"
import { swapAppearance } from "@/registry/lib/appearance"

/**
 * useWeatherTint — Corpus's greys lean a hair warm when it's warm outside and a hair cool when it's cold.
 * On by default; the user can switch it off (remembered on this device).
 *
 * Temperature: the current reading for the user's area from Open-Meteo (no key; the position is rounded to
 * ~10 km before it leaves the device), cached for 30 minutes. Offline or blocked → a seasonal estimate.
 * Neutral around 17 °C; at 30 °C and above / 0 °C and below the tint is at its strongest — still barely there.
 *
 *   const [on, setOn, celsius] = useWeatherTint()
 */
const PREF = "corpus-weather-tint"
const CACHE = "corpus-weather"
const TTL = 30 * 60 * 1000
const NEUTRAL = 17
const SPAN = 13 // °C from neutral to full strength
const MAX_CHROMA = 0.006
const WARM_HUE = 70
const COOL_HUE = 250

/** The tint for a temperature: hue (warm amber or cool blue) and a very small chroma. */
export function weatherTint(celsius: number) {
  const d = celsius - NEUTRAL
  return { hue: d >= 0 ? WARM_HUE : COOL_HUE, chroma: MAX_CHROMA * Math.min(1, Math.abs(d) / SPAN) }
}

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
  const [on, setOnState] = React.useState(() => read<string>(PREF) !== "off")
  const [celsius, setCelsius] = React.useState<number | null>(null)

  const setOn = React.useCallback((next: boolean) => {
    setOnState(next)
    write(PREF, next ? "on" : "off")
  }, [])

  React.useEffect(() => {
    if (!on) return
    const ctl = new AbortController()
    const update = () => currentTemperature(readCoords(), ctl.signal).then(setCelsius, () => {})
    update()
    const t = window.setInterval(update, TTL)
    return () => { ctl.abort(); window.clearInterval(t) }
  }, [on])

  React.useEffect(() => {
    const root = document.documentElement.style
    // One cross-fade for the whole page, not a transition on every element that uses a grey.
    swapAppearance(() => {
      if (!on || celsius === null) return void root.setProperty("--corpus-weather", "0")
      const { hue, chroma } = weatherTint(celsius)
      root.setProperty("--corpus-weather-hue", String(hue))
      root.setProperty("--corpus-weather-chroma", String(chroma))
      root.setProperty("--corpus-weather", "1")
    })
  }, [on, celsius])

  return [on, setOn, celsius] as const
}
