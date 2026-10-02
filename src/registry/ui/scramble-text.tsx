import * as React from "react"
import { cn } from "@/registry/lib/utils"

/**
 * ScrambleText, text that is on its way. Instead of a grey bar, the line is already set in its real typeface, size
 * and weight, sharp. Each glyph keeps its own random clock: when it changes, the old one blurs out as the new one
 * unblurs in, in the same place (a lock-screen clock), so the reader sees "words are coming, about this long, in this
 * style". When the text arrives, the real letters land in random order, the same way.
 *
 *   <ScrambleText text={agent?.name} length={14} className="text-title-2" />   → shuffles while text is undefined
 *   <ScrambleText text={total} length={6} charset="digits" />                  → numbers shuffle as digits
 *
 * Use for text whose style is known: titles, names, values, a sentence. Shapes (avatars, images, cards) → Skeleton.
 * A whole region thinking → Loading. A known duration → ProgressBar.
 */
const CHARSETS = {
  letters: "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ",
  digits: "0123456789",
  mixed: "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789",
} as const

/** Each glyph changes after a random wait between these (its own clock), checked every tick; the real letters lock in
    at LOCK_MS each, capped overall. */
const SHUFFLE_MIN_MS = 260
const SHUFFLE_MAX_MS = 1100
const SHUFFLE_TICK_MS = 40
const LOCK_MS = 28
const LOCK_MAX_MS = 520

const pick = (set: string) => set[Math.floor(Math.random() * set.length)]
const scramble = (n: number, set: string) => Array.from({ length: n }, () => pick(set)).join("")

export interface ScrambleTextProps {
  /** The real text. While it's undefined (or `loading`), the line scrambles. */
  text?: string
  /** Force the loading state even when text is present (e.g. refreshing). */
  loading?: boolean
  /** Glyphs to show while loading: about the expected length of the text. */
  length?: number
  /** letters (default) for words, digits for numbers, mixed for IDs and codes. */
  charset?: keyof typeof CHARSETS
  /** Announced while loading. */
  label?: string
  className?: string
}

export function ScrambleText({ text, loading, length = 12, charset = "letters", label = "Loading", className }: ScrambleTextProps) {
  const busy = loading || text === undefined
  const set = CHARSETS[charset]
  const [glyphs, setGlyphs] = React.useState(() => scramble(length, set))
  // How many letters of the real text have locked in (0 → text.length, Infinity = settled), and the text that last
  // settled. Text present on mount starts settled: static content never animates on load.
  const [locked, setLocked] = React.useState(() => (busy ? 0 : Infinity))
  const [settled, setSettled] = React.useState(() => (busy ? undefined : text))
  // Lock order: order[slot] = when that slot locks (0 first). Empty = left to right.
  const [order, setOrder] = React.useState<number[]>([])
  const isIn = (i: number) => (order[i] ?? i) < locked
  // New text to show (or loading again): start from zero, during render, so the full text never flashes first.
  if ((busy || text !== settled) && locked === Infinity) setLocked(0)
  // Loading again forgets what settled, so the same text arriving after a reload still locks in.
  if (busy && settled !== undefined) setSettled(undefined)
  const ref = React.useRef<HTMLSpanElement>(null)
  const measure = React.useRef<HTMLSpanElement>(null)
  const [width, setWidth] = React.useState<number | null>(null)

  // Shuffle while busy, and keep shuffling the still-unlocked tail while resolving. Only on screen, never with
  // reduced motion (then the blurred line holds still).
  const resolving = !busy && text !== undefined && locked < text.length
  React.useEffect(() => {
    if (!busy && !resolving) return
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return
    const el = ref.current
    let visible = true
    const io = typeof IntersectionObserver !== "undefined" && el ? new IntersectionObserver(([e]) => { visible = e.isIntersecting }) : null
    if (io && el) io.observe(el)
    const n = busy ? length : (text?.length ?? length)
    // Every glyph keeps its own clock: it changes at a random moment, then waits a random while before the next. No
    // shared beat, so the line never pulses as a whole; it churns, one glyph here, two there.
    const start = performance.now()
    const due = Array.from({ length: n }, () => start + Math.random() * SHUFFLE_MAX_MS)
    const t = window.setInterval(() => {
      if (!visible) return
      const now = performance.now()
      const hit = due.map((d, i) => (d <= now ? i : -1)).filter((i) => i >= 0)
      if (!hit.length) return
      hit.forEach((i) => { due[i] = now + SHUFFLE_MIN_MS + Math.random() * (SHUFFLE_MAX_MS - SHUFFLE_MIN_MS) })
      setGlyphs((g) => Array.from({ length: n }, (_, i) => {
        if (!hit.includes(i) && g[i]) return g[i]
        let c = pick(set)
        while (c === g[i] && set.length > 1) c = pick(set) // a change is always a different glyph
        return c
      }).join(""))
    }, SHUFFLE_TICK_MS)
    return () => { window.clearInterval(t); io?.disconnect() }
  }, [busy, resolving, length, set, text])

  // Text arrives: lock the letters in, left to right, and glide the width from the placeholder to the real text.
  React.useEffect(() => {
    if (busy || text === undefined || text === settled) return
    const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches
    const step = reduce ? 0 : Math.min(LOCK_MS, LOCK_MAX_MS / Math.max(1, text.length))
    let i = 0
    const t = window.setInterval(() => {
      if (i === 0) {
        if (measure.current) setWidth(measure.current.getBoundingClientRect().width)
        // The real letters land in a random order, not left to right: the value resolves the way it scrambled.
        const idx = Array.from({ length: text.length }, (_, k) => k)
        for (let k = idx.length - 1; k > 0; k--) { const j = Math.floor(Math.random() * (k + 1)); [idx[k], idx[j]] = [idx[j], idx[k]] }
        const rank: number[] = []
        idx.forEach((slot, r) => { rank[slot] = r })
        setOrder(rank)
      }
      i = reduce ? text.length : i + 1
      setLocked(i)
      if (i >= text.length) { window.clearInterval(t); setLocked(Infinity); setSettled(text) }
    }, step)
    return () => window.clearInterval(t)
  }, [busy, text, settled])

  // The previous frame, so every slot that changed can cross-fade from its old glyph to its new one.
  const [frame, setFrame] = React.useState({ prev: "", cur: "", n: 0 })
  const real0 = text ?? ""
  // What each slot shows now: a scrambled glyph, or (once locked) the real letter.
  const shownNow = busy ? glyphs : Array.from(real0).map((c, i) => (isIn(i) || c === " " ? c : glyphs[i] ?? c)).join("")
  if (frame.cur !== shownNow) setFrame({ prev: frame.cur, cur: shownNow, n: frame.n + 1 })

  if (!busy && locked === Infinity) return <span className={className}>{text}</span>

  const real = real0
  const shown = shownNow
  return (
    <span
      ref={ref}
      aria-busy={busy || undefined}
      // Never clipped: a blur needs room past the glyphs, and a cut edge reads as broken. During the short width glide the
      // letters may reach a hair past the box; that is invisible, a flat-cut blur is not.
      className={cn(
        "relative inline-block max-w-full align-bottom whitespace-nowrap motion-productive",
        className,
      )}
      // While loading the line holds the placeholder's width (in ch, so it scales with the type); once the text
      // arrives it glides to the real width, never snapping.
      style={{ width: busy ? `${length}ch` : width ?? undefined, transitionProperty: "width" }}
    >
      <span className="sr-only">{busy ? label : real}</span>
      {/* The real text, unseen: its width is where the line glides to. */}
      {!busy && <span ref={measure} aria-hidden className="invisible absolute whitespace-nowrap">{real}</span>}
      <span aria-hidden>
        {Array.from(shown).map((c, i) => {
          const isLocked = !busy && isIn(i)
          const was = frame.prev[i]
          const changed = frame.n > 1 && was !== undefined && was !== c
          return (
            // One slot, sharp at rest: when its glyph changes, the old one blurs out while the new one unblurs in, in the
            // same place (a lock-screen clock). A locked letter arrives the same way, in the text colour.
            <span
              key={i}
              className={cn(
                c === " " ? "" : "inline-grid",
                "transition-[filter,opacity,color] duration-moderate-02 ease-productive",
                isLocked ? "text-current" : "text-muted-foreground",
              )}
            >
              {changed && c !== " " && <span key={`o${frame.n}`} className="col-start-1 row-start-1 animate-glyph-out">{was}</span>}
              <span key={`i${changed ? frame.n : 0}`} className={cn("col-start-1 row-start-1", changed && "animate-glyph-in")}>{c}</span>
            </span>
          )
        })}
      </span>
    </span>
  )
}
