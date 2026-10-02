import * as React from "react"
import { cn } from "@/registry/lib/utils"
import { simulatedBands, simulatedVoice } from "@/registry/hooks/use-microphone"

/**
 * LiveWaveform: sound, as it happens. Rounded bars that follow a voice in real time: the person's microphone while
 * they talk, or the agent's voice while it answers.
 *
 *   active      bars follow the sound (getBands / getLevel, or a believable simulated voice when neither is given)
 *   processing  no sound, work in progress: a soft wave travels across the bars
 *   idle        neither: the bars rest as a quiet line of dots
 *
 *   variant  bars       the spectrum, mirrored from the centre (a voice's shape)
 *            scrolling  the loudness over time, scrolling left (a voice's rhythm)
 *   tone     brand (default: the primary colour, for any voice, the person's or the agent's) · current (inherits text colour)
 *            A waveform is never the AI spectrum: Sofia beside it already says who is speaking.
 *
 * Not for: a recording's static shape or playback position → a progress control; "the AI is working" → Thinking.
 * Every change between states eases (bars travel to their new height), and both edges fade out.
 */
const heights = { sm: 24, md: 40, lg: 64 } as const

export interface LiveWaveformProps {
  active?: boolean
  processing?: boolean
  variant?: "bars" | "scrolling"
  size?: keyof typeof heights
  tone?: "brand" | "current"
  /** Frequency bands now, each 0 to 1 (e.g. useMicrophone().bands). */
  getBands?: (n: number) => ArrayLike<number>
  /** Loudness now, 0 to 1 (e.g. useMicrophone().level). Used by `scrolling`, and by `bars` when there are no bands. */
  getLevel?: () => number
  /** Bar width and gap in px. */
  barWidth?: number
  gap?: number
  /** Announced to screen readers, e.g. "Your microphone". */
  label?: string
  className?: string
}

export function LiveWaveform({
  active = false,
  processing = false,
  variant = "bars",
  size = "md",
  tone = "brand",
  getBands,
  getLevel,
  barWidth = 3,
  gap = 2,
  label = "Live audio",
  className,
}: LiveWaveformProps) {
  const ref = React.useRef<HTMLCanvasElement>(null)
  const h = heights[size]
  // The latest props, read by the animation frame without restarting it.
  const props = React.useRef({ active, processing, getBands, getLevel })
  React.useLayoutEffect(() => {
    props.current = { active, processing, getBands, getLevel }
  })

  React.useEffect(() => {
    const canvas = ref.current
    const ctx = canvas?.getContext("2d")
    if (!canvas || !ctx) return
    const reduced = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches
    const dpr = Math.min(2, window.devicePixelRatio || 1)
    let w = 0, n = 0
    let cur = new Float32Array(0)
    let history = new Float32Array(0)
    const resize = () => {
      w = canvas.clientWidth
      canvas.width = Math.round(w * dpr)
      canvas.height = Math.round(h * dpr)
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      n = Math.max(3, Math.floor((w + gap) / (barWidth + gap)))
      cur = new Float32Array(n)
      history = new Float32Array(n)
    }
    resize()
    const ro = new ResizeObserver(resize)
    ro.observe(canvas)
    const start = performance.now()
    let lastShift = 0
    let raf = 0
    const draw = (now: number) => {
      const t = (now - start) / 1000
      const { active: on, processing: busy, getBands: gb, getLevel: gl } = props.current
      // Targets: what each bar wants to be this frame (0 to 1).
      const target = new Float32Array(n)
      if (on && variant === "scrolling") {
        if (now - lastShift > 45) {
          history.copyWithin(0, 1)
          history[n - 1] = gl ? gl() : simulatedVoice(t)
          lastShift = now
        }
        target.set(history)
      } else if (on) {
        const half = Math.ceil(n / 2)
        const src = gb ? gb(half) : gl ? null : simulatedBands(t, half)
        const lvl = gl && !gb ? gl() : 0
        for (let i = 0; i < n; i++) {
          // Mirrored from the centre: low frequencies in the middle, highs at both edges.
          const k = Math.abs(i - (n - 1) / 2) / ((n - 1) / 2)
          const b = Math.min(half - 1, Math.floor(k * half))
          target[i] = src ? src[b] : lvl * (1 - k * 0.7) * (0.8 + 0.2 * Math.sin(t * 13 + i))
        }
      } else if (busy) {
        for (let i = 0; i < n; i++) target[i] = 0.12 + 0.28 * Math.max(0, Math.sin(i * 0.45 - t * 5)) ** 2
      }
      // Ease toward the targets: bars rise quickly and fall gently, so nothing jumps between states.
      for (let i = 0; i < n; i++) {
        const k = target[i] > cur[i] ? 0.45 : 0.14
        cur[i] += (target[i] - cur[i]) * (reduced ? 1 : k)
      }
      ctx.clearRect(0, 0, w, h)
      const total = n * barWidth + (n - 1) * gap
      const x0 = (w - total) / 2
      ctx.fillStyle = getComputedStyle(canvas).color
      for (let i = 0; i < n; i++) {
        const bh = Math.max(barWidth, cur[i] * (h - 2))
        const x = x0 + i * (barWidth + gap)
        const y = (h - bh) / 2
        ctx.globalAlpha = 0.35 + 0.65 * Math.min(1, cur[i] * 3 + (on ? 0.3 : 0))
        ctx.beginPath()
        ctx.roundRect(x, y, barWidth, bh, barWidth / 2)
        ctx.fill()
      }
      ctx.globalAlpha = 1
      raf = requestAnimationFrame(draw)
    }
    // Only animate while on screen.
    const io = new IntersectionObserver(([e]) => {
      cancelAnimationFrame(raf)
      if (e.isIntersecting) raf = requestAnimationFrame(draw)
    })
    io.observe(canvas)
    return () => {
      cancelAnimationFrame(raf)
      io.disconnect()
      ro.disconnect()
    }
  }, [h, barWidth, gap, variant, tone])

  return (
    <canvas
      ref={ref}
      role="img"
      aria-label={`${label}${active ? ", live" : processing ? ", working" : ""}`}
      className={cn(
        "block w-full [mask-image:linear-gradient(to_right,transparent,black_12%,black_88%,transparent)]",
        tone === "brand" && "text-primary",
        tone === "current" && "text-current",
        className,
      )}
      style={{ height: h }}
    />
  )
}
