import * as React from "react"

/**
 * The Corpus mark — Corpus's own brand, not a product component (products use their own logo in Header's `logo`).
 * A thick ring, half a violet→blue arc and half soft grey, with three navy points on it.
 * Drawn on a 48-unit grid; the whole mark is turned 180°. Colours are Corpus palette tokens.
 * public/favicon.svg is the same drawing with the palette resolved to hex.
 */
export function CorpusMark({ size = 20, className, title }: { size?: number; className?: string; title?: string }) {
  const id = React.useId().replace(/[^a-zA-Z0-9]/g, "")
  return (
    <svg viewBox="0 0 48 48" width={size} height={size} role={title ? "img" : undefined} aria-label={title} aria-hidden={title ? undefined : true} className={className}>
      <defs>
        <linearGradient id={`${id}-arc`} gradientUnits="userSpaceOnUse" x1="10" y1="8" x2="40" y2="38">
          <stop offset="0" stopColor="var(--corpus-palette-purple-400)" />
          <stop offset="1" stopColor="var(--corpus-palette-blue-500)" />
        </linearGradient>
        <linearGradient id={`${id}-rest`} gradientUnits="userSpaceOnUse" x1="38" y1="40" x2="8" y2="22">
          {/* Grey half: light greys on a light page, deep greys in dark mode (light greys would glare). */}
          <stop offset="0" className="[stop-color:var(--corpus-palette-gray-100)] dark:[stop-color:var(--corpus-palette-gray-700)]" />
          <stop offset="1" className="[stop-color:var(--corpus-palette-gray-300)] dark:[stop-color:var(--corpus-palette-gray-500)]" />
        </linearGradient>
      </defs>
      <g transform="rotate(180 24 24)">
        {/* Ring: centreline r16, 9 thick. The coloured arc runs from the upper-left point clockwise to the lower-right one. */}
        <path d="M35.12 35.51A16 16 0 0 1 12.3 13.09" fill="none" stroke={`url(#${id}-rest)`} strokeWidth="9" />
        <path d="M12.3 13.09A16 16 0 1 1 35.12 35.51" fill="none" stroke={`url(#${id}-arc)`} strokeWidth="9" />
        {/* Three points on the ring. */}
        {/* Navy points; in dark mode they turn pale blue so they don't vanish into the background. */}
        <g className="fill-[var(--corpus-palette-blue-900)] dark:fill-[var(--corpus-palette-blue-200)]">
          <circle cx="12.3" cy="13.09" r="4.4" />
          <circle cx="11.74" cy="34.28" r="4.4" />
          <circle cx="35.12" cy="35.51" r="4.4" />
        </g>
      </g>
    </svg>
  )
}
