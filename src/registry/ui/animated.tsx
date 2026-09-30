import * as React from "react"
import { cn } from "@/registry/lib/utils"

/**
 * Text choreography — values never snap.
 *   AnimatedNumber: digits roll like a slot machine (up when increasing, down when decreasing),
 *                   staggered from the last digit, each digit de-blurring as it lands.
 *   RollingText:    the same reels for ANY value string ("$1,200", "40%", "20 – 80").
 *   AnimatedText:   when text CHANGES, letters reveal in a stagger, sliding up and de-blurring —
 *                   unless the change is a number, which always rolls.
 *                   First render is static, so pages don't shimmer on load.
 * Screen readers get the plain value; the animated glyphs are hidden from them.
 */
const reduced = () => typeof window !== "undefined" && !!window.matchMedia?.("(prefers-reduced-motion: reduce)").matches
const STAGGER = 35 // ms between digits / words

/* ---------------- AnimatedNumber ---------------- */

/** One reel: a strip of 0–9 rolling behind a one-line window. */
function Digit({ value, index }: { value: number; index: number }) {
  const strip = React.useRef<HTMLSpanElement>(null)
  const prev = React.useRef(value)
  React.useEffect(() => {
    const el = strip.current
    if (prev.current === value || !el || reduced() || typeof el.animate !== "function") {
      prev.current = value
      return
    }
    prev.current = value
    el.animate([{ filter: "blur(4px)" }, { filter: "blur(0)" }], {
      duration: 520,
      delay: index * STAGGER,
      easing: "cubic-bezier(0.16, 1, 0.3, 1)",
      fill: "backwards",
    })
  }, [value, index])
  return (
    <span className="relative inline-block h-[1lh] overflow-hidden">
      <span className="invisible">0</span>
      <span
        ref={strip}
        className="absolute inset-x-0 top-0 flex flex-col duration-expressive ease-expressive"
        style={{ transform: `translateY(${-value * 10}%)`, transitionDelay: `${index * STAGGER}ms` }}
      >
        {Array.from({ length: 10 }, (_, d) => (
          <span key={d} className="h-[1lh] text-center">{d}</span>
        ))}
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
 * RollingText — ANY value string rolls like a slot machine: every digit is a reel, everything else
 * ($, %, commas, units, "–") stays put. Reels are keyed from the right, so 99 → 100 adds a reel on the left.
 */
export function RollingText({ text, className }: { text: string; className?: string }) {
  const chars = Array.from(text)
  let digitsFromRight = chars.filter((c) => /\d/.test(c)).length
  return (
    <span className={cn("inline-flex items-baseline tabular-nums", className)}>
      <span className="sr-only">{text}</span>
      <span aria-hidden className="inline-flex items-baseline whitespace-pre">
        {chars.map((c, i) => {
          const fromRight = chars.length - i
          if (/\d/.test(c)) {
            digitsFromRight--
            return <Digit key={`d${fromRight}`} value={Number(c)} index={digitsFromRight} />
          }
          return <span key={`s${fromRight}`}>{c}</span>
        })}
      </span>
    </span>
  )
}

/** Digits masked out: "3 agents" and "12 agents" share the template "# agents". */
const template = (t: string) => t.replace(/\d+([.,]\d+)*/g, "#")
/** A value is numeric when it has digits and no words, e.g. "$1,200", "40%", "20 – 80", "1.2k". */
const isNumericValue = (t: string) => /\d/.test(t) && !/[a-z]{2,}/i.test(t)

/* ---------------- AnimatedText ---------------- */

const LETTER_STAGGER = 18 // ms between letters
const MAX_STAGGER = 600 // long labels still finish quickly

export function AnimatedText({ children, className, enter = "change", direction = "up", leaving = false }: {
  children: string
  className?: string
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
  // Numbers are never letter-revealed: numeric values, or text whose only change is its digits, roll like a slot machine.
  if (!leaving && enter === "change" && (isNumericValue(children) || (/\d/.test(children) && template(children) === template(first)))) {
    return <RollingText text={children} className={className} />
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
