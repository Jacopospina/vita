import * as React from "react"

/**
 * The Vita mark: a frame of Sofia, generating. One liquid ring (a little uneven, as the orb is mid-pour) with a
 * single drop at its heart, coloured by the same spectrum that turns through Sofia. No small particles: just the
 * main shape. A white glint rides the rim facing the light (top left), like Sofia's specular highlight.
 * Light and dark: on a dark page the glint softens and the heart turns paler, so neither glares nor disappears.
 * Vita's own brand, not a product component (products use their own logo in Header's `logo`).
 * public/favicon.svg is the same drawing with the palette resolved to hex (scripts: see the comment in it).
 */
const SECTORS = [
  { d: "M11.26 13.23 L12.02 11.68 L12.95 10.16 L14.10 8.75 L15.48 7.56 L17.07 6.68 L18.81 6.15 L20.63 5.97 L22.44 6.11 L24.19 6.49 L25.85 7.01 L25.27 12.34 L24.13 11.92 L22.92 11.63 L21.67 11.54 L20.44 11.74 L19.30 12.23 L18.31 13.03 L17.55 14.07 L17.01 15.24 L16.67 16.46 L16.45 17.62Z", from: "blue", to: "indigo", x1: 14.04, y1: 14.88, x2: 25.0, y2: 9.47 },
  { d: "M24.49 6.57 L26.14 7.12 L27.70 7.73 L29.21 8.37 L30.67 9.03 L32.11 9.75 L33.50 10.55 L34.82 11.48 L36.03 12.56 L37.10 13.78 L38.02 15.12 L32.88 18.37 L32.44 17.42 L31.86 16.53 L31.15 15.73 L30.33 15.03 L29.44 14.44 L28.50 13.90 L27.53 13.40 L26.53 12.91 L25.47 12.42 L24.34 11.99Z", from: "indigo", to: "purple", x1: 25.0, y1: 9.47, x2: 35.19, y2: 16.27 },
  { d: "M37.28 14.02 L38.17 15.37 L38.94 16.80 L39.61 18.27 L40.23 19.79 L40.83 21.35 L41.39 22.99 L41.89 24.71 L42.24 26.52 L42.36 28.40 L42.16 30.28 L35.45 27.96 L35.46 26.74 L35.25 25.55 L34.90 24.43 L34.51 23.39 L34.14 22.41 L33.82 21.45 L33.54 20.50 L33.27 19.53 L32.95 18.55 L32.53 17.59Z", from: "purple", to: "pink", x1: 35.19, y1: 16.27, x2: 38.89, y2: 28.49 },
  { d: "M42.35 28.74 L42.09 30.61 L41.44 32.39 L40.42 33.98 L39.06 35.31 L37.47 36.34 L35.76 37.10 L34.02 37.64 L32.34 38.04 L30.74 38.39 L29.23 38.76 L27.25 33.19 L28.16 32.88 L29.14 32.65 L30.21 32.45 L31.35 32.19 L32.50 31.78 L33.56 31.18 L34.45 30.35 L35.08 29.33 L35.42 28.18 L35.48 26.96Z", from: "pink", to: "orange", x1: 38.89, y1: 28.49, x2: 28.73, y2: 35.83 },
  { d: "M30.46 38.45 L28.96 38.84 L27.49 39.27 L26.01 39.74 L24.47 40.17 L22.87 40.49 L21.21 40.63 L19.53 40.52 L17.88 40.17 L16.30 39.57 L14.79 38.78 L17.67 34.17 L18.67 34.77 L19.76 35.20 L20.92 35.41 L22.09 35.37 L23.24 35.12 L24.31 34.70 L25.30 34.19 L26.22 33.69 L27.09 33.25 L27.99 32.92Z", from: "orange", to: "mint", x1: 28.73, y1: 35.83, x2: 16.73, y2: 36.78 },
  { d: "M16.02 39.44 L14.53 38.61 L13.13 37.64 L11.80 36.57 L10.54 35.39 L9.35 34.13 L8.26 32.74 L7.33 31.23 L6.62 29.60 L6.19 27.87 L6.08 26.09 L12.85 25.30 L12.72 26.45 L12.84 27.59 L13.17 28.70 L13.67 29.74 L14.30 30.71 L15.00 31.62 L15.77 32.48 L16.59 33.30 L17.49 34.04 L18.48 34.67Z", from: "mint", to: "cyan", x1: 16.73, y1: 36.78, x2: 9.43, y2: 26.29 },
  { d: "M6.14 27.55 L6.09 25.77 L6.34 24.01 L6.85 22.33 L7.53 20.75 L8.30 19.27 L9.06 17.85 L9.78 16.45 L10.45 15.01 L11.13 13.51 L11.87 11.96 L16.62 16.68 L16.42 17.82 L16.24 18.85 L15.98 19.74 L15.61 20.54 L15.09 21.32 L14.48 22.12 L13.85 23.01 L13.30 24.01 L12.90 25.09 L12.73 26.24Z", from: "cyan", to: "blue", x1: 9.43, y1: 26.29, x2: 14.04, y2: 14.88 },
]
const GLINT = "M10.15 18.96 L10.64 18.05 L11.11 17.14 L11.54 16.21 L11.96 15.25 L12.38 14.25 L12.84 13.22 L13.37 12.19 L13.99 11.18 L14.71 10.23 L15.56 9.38 L16.52 8.66 L17.57 8.09 L18.70 7.70 L19.88 7.49 L21.08 7.45"

export function VitaMark({ size = 20, className, title }: { size?: number; className?: string; title?: string }) {
  const id = React.useId().replace(/[^a-zA-Z0-9]/g, "")
  return (
    <svg viewBox="0 0 48 48" width={size} height={size} role={title ? "img" : undefined} aria-label={title} aria-hidden={title ? undefined : true} className={className}>
      <defs>
        {SECTORS.map((s, i) => (
          <linearGradient key={i} id={`${id}-s${i}`} gradientUnits="userSpaceOnUse" x1={s.x1} y1={s.y1} x2={s.x2} y2={s.y2}>
            <stop offset="0" stopColor={`var(--vita-palette-${s.from}-500)`} />
            <stop offset="1" stopColor={`var(--vita-palette-${s.to}-500)`} />
          </linearGradient>
        ))}
        <radialGradient id={`${id}-heart`} cx="0.38" cy="0.35" r="0.75">
          <stop offset="0" className="[stop-color:var(--vita-palette-purple-400)] dark:[stop-color:var(--vita-palette-purple-300)]" />
          <stop offset="1" className="[stop-color:var(--vita-palette-indigo-500)] dark:[stop-color:var(--vita-palette-blue-400)]" />
        </radialGradient>
      </defs>
      {/* The ring: seven sectors, each blending into the next colour of the spectrum. */}
      {SECTORS.map((s, i) => <path key={i} d={s.d} fill={`url(#${id}-s${i})`} />)}
      {/* The glint on the lit rim. */}
      <path d={GLINT} fill="none" stroke="white" strokeWidth="1.4" strokeLinecap="round" className="opacity-60 dark:opacity-40" />
      {/* The heart: the one drop inside. */}
      <circle cx="24.6" cy="24.4" r="3.8" fill={`url(#${id}-heart)`} />
    </svg>
  )
}
