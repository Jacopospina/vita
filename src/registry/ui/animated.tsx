import * as React from "react"
import { cn } from "@/registry/lib/utils"

/**
 * Text choreography — values never snap.
 *   AnimatedNumber: digits roll like a slot machine (up when increasing, down when decreasing),
 *                   staggered from the last digit, each digit de-blurring as it lands.
 *   AnimatedText:   when text CHANGES, words reveal in a stagger, sliding up and de-blurring.
 *                   First render is static, so pages don't shimmer on load.
 * Screen readers get the plain value; the animated glyphs are hidden from them.
 */
const reduced = () => typeof window !== "undefined" && !!window.matchMedia?.("(prefers-reduced-motion: reduce)").matches
const STAGGER = 35 // ms between digits / words

/* ---------------- AnimatedNumber ---------------- */

function Digit({ value, index }: { value: number; index: number }) {
  const strip = React.useRef<HTMLSpanElement>(null)
  const prev = React.useRef(value)
  React.useEffect(() => {
    if (prev.current === value || !strip.current || reduced()) {
      prev.current = value
      return
    }
    prev.current = value
    strip.current.animate([{ filter: "blur(4px)" }, { filter: "blur(0)" }], {
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
  const chars = Array.from(text)
  let digitsFromRight = chars.filter((c) => /\d/.test(c)).length
  return (
    <span className={cn("inline-flex items-baseline tabular-nums", className)}>
      <span className="sr-only">{text}</span>
      <span aria-hidden className="inline-flex items-baseline">
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

/* ---------------- AnimatedText ---------------- */

const LETTER_STAGGER = 18 // ms between letters
const MAX_STAGGER = 600 // long labels still finish quickly

export function AnimatedText({ children, className }: { children: string; className?: string }) {
  const [first] = React.useState(children)
  const [changed, setChanged] = React.useState(false)
  if (!changed && children !== first) setChanged(true)
  const animate = changed && !reduced()
  const letters = children.replace(/\s+/g, "").length || 1
  const step = Math.min(LETTER_STAGGER, MAX_STAGGER / letters)
  let n = 0
  return (
    <span className={className}>
      <span className="sr-only">{children}</span>
      <span key={children} aria-hidden>
        {children.split(/(\s+)/).map((word, w) =>
          /^\s+$/.test(word) ? (
            <span key={w}>{word}</span>
          ) : (
            // each word stays whole on wrap; each letter reveals in turn
            <span key={w} className="inline-block whitespace-nowrap">
              {Array.from(word).map((ch, c) => (
                <span key={c} className={cn("inline-block", animate && "animate-text-reveal")} style={animate ? { animationDelay: `${Math.round(n++ * step)}ms` } : undefined}>
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
