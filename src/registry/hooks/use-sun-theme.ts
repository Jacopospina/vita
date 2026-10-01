import * as React from "react"

/**
 * useSunTheme — Corpus follows the sun: light while the sun is up where the user is, dark once it has set.
 * Location: the device position if the user allows it (remembered on this device), otherwise an estimate from the
 * timezone (longitude from the standard UTC offset, a mid latitude) — never wrong by more than about an hour.
 * Re-checks every few minutes. The user can still flip it; the override lasts until the next sunrise/sunset.
 *
 *   const [dark, setDark] = useSunTheme()   // apply with document.documentElement.classList.toggle("dark", dark)
 */
const STORE = "corpus-sun-coords"
const RECHECK_MS = 5 * 60 * 1000
const rad = Math.PI / 180

/** Solar elevation in degrees for a moment and place (low-precision almanac — plenty for day/night). */
export function sunElevation(date: Date, lat: number, lon: number) {
  const d = date.getTime() / 86400000 + 2440587.5 - 2451545 // days since J2000
  const g = (357.529 + 0.98560028 * d) * rad
  const q = 280.459 + 0.98564736 * d
  const L = (q + 1.915 * Math.sin(g) + 0.02 * Math.sin(2 * g)) * rad
  const e = (23.439 - 0.00000036 * d) * rad
  const ra = Math.atan2(Math.cos(e) * Math.sin(L), Math.cos(L)) / rad
  const dec = Math.asin(Math.sin(e) * Math.sin(L))
  const gmst = (18.697374558 + 24.06570982441908 * d) % 24
  const ha = ((gmst + lon / 15) * 15 - ra) * rad
  const sinAlt = Math.sin(lat * rad) * Math.sin(dec) + Math.cos(lat * rad) * Math.cos(dec) * Math.cos(ha)
  return Math.asin(sinAlt) / rad
}

/** Daylight = the sun's centre above the horizon, refraction included. */
export const isDaylight = (date: Date, lat: number, lon: number) => sunElevation(date, lat, lon) > -0.833

type Coords = { lat: number; lon: number }

/** Without a position: longitude from the STANDARD (non-summer) UTC offset, latitude ±45 by hemisphere guess. */
function estimate(): Coords {
  const y = new Date().getFullYear()
  const standard = Math.max(new Date(y, 0, 1).getTimezoneOffset(), new Date(y, 6, 1).getTimezoneOffset())
  const tz = Intl.DateTimeFormat().resolvedOptions().timeZone ?? ""
  const south = /^(Australia|Antarctica|Pacific\/Auckland|America\/(Argentina|Santiago|Sao_Paulo|Montevideo)|Africa\/Johannesburg)/.test(tz)
  return { lat: south ? -35 : 45, lon: (-standard / 60) * 15 }
}

function stored(): Coords | null {
  try {
    const v = JSON.parse(localStorage.getItem(STORE) ?? "null")
    return v && typeof v.lat === "number" && typeof v.lon === "number" ? v : null
  } catch {
    return null
  }
}

export function useSunTheme() {
  const [coords, setCoords] = React.useState<Coords>(() => stored() ?? estimate())
  const [now, setNow] = React.useState(() => Date.now())
  const [override, setOverride] = React.useState<{ dark: boolean; daylight: boolean } | null>(null)

  // Real position, if the user allows it. Remembered on this device so it's asked at most once.
  React.useEffect(() => {
    if (stored() || !("geolocation" in navigator)) return
    navigator.geolocation.getCurrentPosition(
      (p) => {
        const c = { lat: p.coords.latitude, lon: p.coords.longitude }
        try {
          localStorage.setItem(STORE, JSON.stringify(c))
        } catch {
          /* private mode: just use it for this visit */
        }
        setCoords(c)
      },
      () => {},
      { maximumAge: 24 * 3600 * 1000, timeout: 10000 },
    )
  }, [])

  React.useEffect(() => {
    const t = window.setInterval(() => setNow(Date.now()), RECHECK_MS)
    return () => window.clearInterval(t)
  }, [])

  const daylight = isDaylight(new Date(now), coords.lat, coords.lon)
  // A manual flip holds until the sun itself changes state (next sunrise or sunset).
  const active = override && override.daylight === daylight ? override : null
  const dark = active ? active.dark : !daylight
  const setDark = React.useCallback((next: boolean | ((d: boolean) => boolean)) => {
    setOverride((o) => {
      const current = o && o.daylight === daylight ? o.dark : !daylight
      return { dark: typeof next === "function" ? next(current) : next, daylight }
    })
  }, [daylight])

  return [dark, setDark] as const
}
