import * as React from "react"
import { cn } from "@/registry/lib/utils"

/**
 * Text choreography, values never snap.
 *   AnimatedNumber: each changed digit swaps quickly, the old one lifts and blurs away, the new one rises
 *                   and sharpens (downward when decreasing), staggered from the last digit. Never clipped.
 *                   Numbers are always regular weight.
 *   RollingText:    the same digits for ANY value string ("$1,200", "40%", "20 – 80").
 *   AnimatedText:   when text CHANGES, letters reveal in a stagger, sliding up and de-blurring,
 *                   unless the change is a number, which always rolls.
 *                   First render is static, so pages don't shimmer on load.
 * Screen readers get the plain value; the animated glyphs are hidden from them.
 */
const reduced = () => typeof window !== "undefined" && !!window.matchMedia?.("(prefers-reduced-motion: reduce)").matches
const STAGGER = 35 // ms between digits / words
/** One timing for the leaving and the arriving digit, so they travel together. */
const DIGIT_SWAP = "440ms cubic-bezier(0.22, 1, 0.36, 1)"

/* ---------------- AnimatedNumber ---------------- */

/**
 * One digit. On change the old digit lifts a little and blurs away while the new one rises from just below,
 * blurred, and sharpens (reversed when the value drops). It travels a fraction of a line, so nothing needs
 * clipping, no digit is ever cut off by its box. The invisible "0" holds width and baseline.
 */
function Digit({ value, index }: { value: number; index: number }) {
  const [state, setState] = React.useState({ cur: value, prev: null as number | null, dir: 1, n: 0 })
  if (value !== state.cur) setState({ cur: value, prev: reduced() ? null : state.cur, dir: value > state.cur ? 1 : -1, n: state.n + 1 })
  const delay = `${index * STAGGER}ms`
  // Old and new share ONE timing (duration + easing + delay), so they move as a pair, one line apart.
  const up = state.dir > 0
  return (
    <span data-digit className="relative inline-block">
      <span className="invisible">0</span>
      {state.prev !== null && (
        <span
          key={`p${state.n}`}
          className="absolute inset-0 text-center"
          style={{ animation: `${up ? "vita-digit-out-up" : "vita-digit-out-down"} ${DIGIT_SWAP} ${delay} both` }}
          onAnimationEnd={() => setState((s) => (s.n === state.n ? { ...s, prev: null } : s))}
        >
          {state.prev}
        </span>
      )}
      <span
        key={`c${state.n}`}
        className="absolute inset-0 text-center"
        style={state.n && state.prev !== null ? { animation: `${up ? "vita-digit-in-up" : "vita-digit-in-down"} ${DIGIT_SWAP} ${delay} both` } : undefined}
      >
        {state.cur}
      </span>
    </span>
  )
}

export interface AnimatedNumberProps {
  value: number
  /** Intl.NumberFormat options, e.g. { style: "currency", currency: "USD" } or { style: "percent" }. */
  format?: Intl.NumberFormatOptions
  locale?: string
  className?: string
}

export function AnimatedNumber({ value, format, locale, className }: AnimatedNumberProps) {
  const text = React.useMemo(() => new Intl.NumberFormat(locale, format).format(value), [value, format, locale])
  return <RollingText text={text} className={className} />
}

/**
 * RollingText, ANY value string animates per digit: every digit swaps on its own, everything else
 * ($, %, commas, units, "–") stays put. Reels are keyed from the right, so 99 → 100 adds a reel on the left.
 * A reel that arrives grows from nothing and one that leaves shrinks away, so the others slide to make room
 * (999 → 1,000) instead of jumping.
 */
export function RollingText({ text, className, face = "numeric" }: { text: string; className?: string; face?: "numeric" | "inherit" }) {
  const [state, setState] = React.useState({ text, prev: null as string | null, n: 0 })
  if (text !== state.text) setState({ text, prev: reduced() ? null : state.text, n: state.n + 1 })
  const now = glyphs(text)
  const before = state.prev === null ? null : glyphs(state.prev)
  const had = new Set(before?.map((g) => g.key))
  const has = new Set(now.map((g) => g.key))
  // What left is drawn once more, shrinking out where it stood; ties put the leaving glyph first.
  const leaving = (before ?? []).filter((g) => !has.has(g.key))
  const all = [...now.map((g) => ({ ...g, out: false })), ...leaving.map((g) => ({ ...g, out: true }))].sort((a, b) => b.fromRight - a.fromRight || Number(b.out) - Number(a.out))
  return (
    <span className={cn("inline-flex items-baseline", face === "numeric" ? "font-normal tabular-nums" : "[font-variant-numeric:tabular-nums]", className)}>
      <span className="sr-only">{text}</span>
      <span aria-hidden className="inline-flex items-baseline whitespace-pre">
        {all.map((g) => {
          if (g.out)
            return (
              <span
                key={`${g.key}-out${state.n}`}
                className="inline-block"
                style={{ animation: `vita-reel-out ${DIGIT_SWAP} both` }}
                onAnimationEnd={() => setState((s) => (s.n === state.n ? { ...s, prev: null } : s))}
              >
                {g.char}
              </span>
            )
          const arriving = before !== null && !had.has(g.key)
          const inner = g.digit ? <Digit value={Number(g.char)} index={g.index} /> : g.char
          return (
            <span key={g.key} className="inline-block" style={arriving ? { animation: `vita-reel-in ${DIGIT_SWAP} backwards` } : undefined}>
              {inner}
            </span>
          )
        })}
      </span>
    </span>
  )
}

/** A value's glyphs, keyed from the right: digits get a reel (and their stagger index), the rest a plain slot. */
function glyphs(text: string) {
  const chars = Array.from(text)
  let digitsFromRight = chars.filter((c) => /\d/.test(c)).length
  return chars.map((c, i) => {
    const fromRight = chars.length - i
    const digit = /\d/.test(c)
    if (digit) digitsFromRight--
    return { key: `${digit ? "d" : "s"}${fromRight}`, char: c, digit, fromRight, index: digitsFromRight }
  })
}

/** Digits masked out: "3 agents" and "12 agents" share the template "# agents". */
const template = (t: string) => t.replace(/\d+([.,]\d+)*/g, "#")
/** A value is numeric when it has digits and no words, e.g. "$1,200", "40%", "20 – 80", "1.2k". */
const isNumericValue = (t: string) => /\d/.test(t) && !/[a-z]{2,}/i.test(t)

/* ---------------- AnimatedText ---------------- */

const LETTER_STAGGER = 18 // ms between letters
const MAX_STAGGER = 600 // long labels still finish quickly

export function AnimatedText({ children, className, enter = "change", direction = "up", leaving = false, face }: {
  children: string
  className?: string
  /**
   * Digits roll in the numeric face (default), or keep the surrounding face and weight with even-width digits
   * ("inherit": readings set like a watch face, e.g. mini charts).
   */
  face?: "numeric" | "inherit"
  /** "change" (default): animate when the text changes. "mount": also animate its first appearance. */
  enter?: "change" | "mount"
  /** Letters come from below (up) or drop in from above (down). */
  direction?: "up" | "down"
  /** Play the exit: letters stagger out downward and blur away. */
  leaving?: boolean
}) {
  const [first] = React.useState(children)
  const [changed, setChanged] = React.useState(false)
  if (!changed && children !== first) setChanged(true)
  // Numbers are never letter-revealed: numeric values, or text whose only change is its digits, swap digit by digit.
  // (Sentences that merely CONTAIN numbers, "order 4821 arrives in 3–5 days", stay normal, wrapping text.)
  if (!leaving && enter === "change" && (isNumericValue(children) || (changed && /\d/.test(children) && template(children) === template(first)))) {
    return <RollingText text={children} className={className} face={face} />
  }
  const motion = !reduced()
  const animate = motion && (changed || enter === "mount")
  const letters = children.replace(/\s+/g, "").length || 1
  const step = Math.min(LETTER_STAGGER, (leaving ? 240 : MAX_STAGGER) / letters)
  const cls = leaving && motion ? "animate-text-leave-down" : animate ? (direction === "down" ? "animate-text-reveal-down" : "animate-text-reveal") : undefined
  let n = 0
  return (
    <span className={className}>
      <span className="sr-only">{children}</span>
      <span key={children} aria-hidden>
        {children.split(/(\s+)/).map((word, w) =>
          /^\s+$/.test(word) ? (
            <span key={w}>{word}</span>
          ) : (
            // each word stays whole on wrap; each letter moves in turn
            <span key={w} className="inline-block whitespace-nowrap">
              {Array.from(word).map((ch, c) => (
                <span key={c} className={cn("inline-block", cls)} style={cls ? { animationDelay: `${Math.round(n++ * step)}ms` } : undefined}>
                  {ch}
                </span>
              ))}
            </span>
          ),
        )}
      </span>
    </span>
  )
}

/** Wrap plain string/number children so they animate when they change. Anything else passes through. */
export function animateChildren(children: React.ReactNode): React.ReactNode {
  if (typeof children === "string" && children.trim()) return <AnimatedText>{children}</AnimatedText>
  if (typeof children === "number") return <AnimatedNumber value={children} />
  return children
}
