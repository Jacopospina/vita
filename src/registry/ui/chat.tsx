import * as React from "react"
import { Bot, Close, ErrorFilled } from "@/registry/icons"
import { cn } from "@/registry/lib/utils"
import { Icon } from "@/registry/ui/icon"
import { IconButton } from "@/registry/ui/button"
import { IconPlaceholder } from "@/registry/ui/icon-placeholder"
import { Thinking } from "@/registry/ui/thinking"
import { Composer } from "@/registry/ui/composer"
import { StatusIndicator } from "@/registry/ui/status-indicator"
import { useFlip } from "@/registry/hooks/use-flip"
import { AnimatedText } from "@/registry/ui/animated"
import { nextMakingWord } from "@/registry/lib/making-words"

/**
 * Chat — the conversation pieces for agents and people.
 *   ChatBubble   one message. Agent on the left on a neutral surface; the person on the right in brand colour.
 *                Never an avatar beside a bubble: the side and the author line say who wrote it.
 *                Consecutive messages from the same author JOIN (belonging): inner corners tighten, gap shrinks,
 *                only the last one shows the author mark.
 *   ChatThread   the column of bubbles; new messages enter from their author's side and the rest glide (FLIP).
 *   ChatTyping   the agent is thinking — Sofia and what it's doing, as a plain line (never a bubble, never bouncing dots).
 *   MiniChat     a compact agent panel: header (agent + status), thread, composer.
 * A long-form AI answer inside a page → AISurface. A system notice → InlineNotification.
 */

export type ChatRole = "agent" | "user"

/** A CSS cubic-bezier as a function (x → y), for animations driven frame by frame. */
function cubicBezier(x1: number, y1: number, x2: number, y2: number) {
  const bez = (t: number, a: number, b: number) => 3 * a * t * (1 - t) ** 2 + 3 * b * t * t * (1 - t) + t ** 3
  return (x: number) => {
    let lo = 0
    let hi = 1
    for (let i = 0; i < 24; i++) {
      const mid = (lo + hi) / 2
      if (bez(mid, x1, x2) < x) lo = mid
      else hi = mid
    }
    return bez((lo + hi) / 2, y1, y2)
  }
}

export interface ChatBubbleProps {
  role: ChatRole
  children: React.ReactNode
  /** Author name shown under the last bubble of a group, e.g. "Support triage" or "You". */
  author?: string
  /** Shown next to the author, e.g. "09:41". */
  time?: string
  /** First / middle / last / single bubble in a run from the same author — shapes the joined corners. */
  position?: "single" | "first" | "middle" | "last"
  /** Delivery state for the person's messages. Failed offers a retry. */
  status?: "sending" | "sent" | "failed"
  onRetry?: () => void
  /** Arrives by flight from the composer (MiniChat animates it) instead of springing in. */
  launched?: boolean
  className?: string
}

export function ChatBubble({ role, children, author, time, position = "single", status, onRetry, launched, className }: ChatBubbleProps) {
  const agent = role === "agent"
  const showMeta = position === "single" || position === "last"
  // Joined corners: the side facing the author tightens where bubbles meet.
  const corners = agent
    ? { single: "rounded-xl rounded-bl-sm", first: "rounded-xl rounded-bl-sm", middle: "rounded-xl rounded-l-sm", last: "rounded-xl rounded-tl-sm" }[position]
    : { single: "rounded-xl rounded-br-sm", first: "rounded-xl rounded-br-sm", middle: "rounded-xl rounded-r-sm", last: "rounded-xl rounded-tr-sm" }[position]
  return (
    <div className={cn("flex items-end gap-2", agent ? "justify-start" : "justify-end", className)}>
      <div className={cn("flex max-w-[80%] flex-col gap-1", agent ? "items-start" : "items-end")}>
        <div
          data-bubble=""
          className={cn(
            "px-3.5 py-2 text-body",
            corners,
            agent ? "origin-bottom-left bg-layer-2 text-foreground" : "origin-bottom-right bg-primary text-primary-foreground",
            status === "sending" && "opacity-70",
            status === "failed" && "bg-error-subtle text-foreground",
            !launched && "animate-chip-in",
          )}
        >
          {children}
        </div>
        {showMeta && (author || time || status === "failed") && (
          <div className="flex items-center gap-1.5 px-1 text-caption text-muted-foreground">
            {status === "failed" ? (
              <>
                <Icon as={ErrorFilled} size="sm" className="text-error" draw="in" />
                <span>Not sent.</span>
                {onRetry && <button type="button" onClick={onRetry} className="rounded-sm font-medium text-link focus-ring">Retry</button>}
              </>
            ) : (
              <>
                {author && <span className="font-medium">{author}</span>}
                {time && <span>{time}</span>}
                {status === "sending" && <span>Sending…</span>}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

/**
 * useMakingWord — while an agent works, a different making word every couple of seconds ("Sketching", "Glazing"…),
 * in the Creator's voice. Never "Loading" or "Thinking".
 */
export function useMakingWord(active = true, everyMs = 2400) {
  const [word, setWord] = React.useState(() => nextMakingWord())
  React.useEffect(() => {
    if (!active) return
    const t = window.setInterval(() => setWord((w) => nextMakingWord(w)), everyMs)
    return () => window.clearInterval(t)
  }, [active, everyMs])
  return word
}

/** ChatTyping — the agent is working: Sofia and a rotating making word, as a plain line on the agent's side (not a bubble). */
export function ChatTyping({ label }: { label?: string }) {
  const rotating = useMakingWord(!label)
  const text = label ?? rotating
  return (
    <div role="status" className="flex animate-enter-fade items-center gap-2 py-1 text-body text-muted-foreground">
      <Thinking mode="generating" size="sm" label={text} />
      <AnimatedText>{`${text}…`}</AnimatedText>
    </div>
  )
}

export interface ChatMessage {
  id: string
  role: ChatRole
  text: React.ReactNode
  author?: string
  time?: string
  status?: ChatBubbleProps["status"]
}

/** ChatThread — bubbles in order; runs from the same author join; the column glides when messages arrive. */
export function ChatThread({ messages, typing, launchedId, className }: { messages: ChatMessage[]; typing?: boolean | string; launchedId?: string; className?: string }) {
  const ref = React.useRef<HTMLDivElement>(null)
  useFlip(ref)
  return (
    <div ref={ref} role="log" aria-live="polite" className={cn("flex flex-col", className)}>
      {messages.map((m, i) => {
        const prev = messages[i - 1]?.role === m.role
        const next = messages[i + 1]?.role === m.role
        const position = prev && next ? "middle" : prev ? "last" : next ? "first" : "single"
        return (
          <div key={m.id} data-message-id={m.id} className={prev ? "pt-0.5" : i === 0 ? "" : "pt-3"}>
            <ChatBubble role={m.role} author={m.author} time={m.time} status={m.status} position={position} launched={m.id === launchedId}>{m.text}</ChatBubble>
          </div>
        )
      })}
      {typing && <div className="pt-3"><ChatTyping label={typeof typing === "string" ? typing : undefined} /></div>}
    </div>
  )
}

/** MiniChat — a compact agent conversation panel. Close with ×, Esc or by clicking away; never a Cancel button. */
export function MiniChat({ agent, status = "Online", messages, typing, onSend, onClose, suggestions, className }: {
  agent: string
  status?: string
  messages: ChatMessage[]
  typing?: boolean | string
  onSend: (text: string) => void
  onClose?: () => void
  suggestions?: string[]
  className?: string
}) {
  // SEND FLIGHT: the typed text becomes its bubble. 1) at the moment of sending, the bubble forms around the text right
  // where it was typed (fill fades in, text turns to the bubble's colour); 2) the bubble travels from the composer to its
  // place in the thread (productive). Implemented as FLIP: remember the text's origin, render, animate the difference.
  const scroller = React.useRef<HTMLDivElement>(null)
  const composerBox = React.useRef<HTMLDivElement>(null)
  const launch = React.useRef<{ rect: DOMRect; padL: number; padT: number; count: number } | null>(null)
  const [launchedId, setLaunchedId] = React.useState<string>()
  const flightRef = React.useRef<(() => void) | null>(null)
  React.useEffect(() => () => flightRef.current?.(), [])
  const send = (text: string) => {
    const ta = composerBox.current?.querySelector("textarea")
    if (ta && !window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) {
      const cs = getComputedStyle(ta)
      launch.current = { rect: ta.getBoundingClientRect(), padL: parseFloat(cs.paddingLeft), padT: parseFloat(cs.paddingTop), count: messages.length }
    }
    onSend(text)
  }
  React.useLayoutEffect(() => {
    const l = launch.current
    const last = messages[messages.length - 1]
    if (!l || messages.length <= l.count || last?.role !== "user") return
    launch.current = null
    setLaunchedId(last.id)
    const sc = scroller.current
    if (sc) sc.scrollTop = sc.scrollHeight // land where it will be seen
    const bubble = sc?.querySelector<HTMLElement>(`[data-message-id="${CSS.escape(last.id)}"] [data-bubble]`)
    if (!bubble || typeof bubble.animate !== "function") return
    // It arrives by flight, not by spring: stop the spring-in BEFORE measuring (its first frame is scaled to 60%),
    // so the flying bubble is exactly the real one — same size, same shape.
    bubble.getAnimations().forEach((a) => a.cancel())
    const end = bubble.getBoundingClientRect()
    const bs = getComputedStyle(bubble)
    // Align the bubble's text with where the typed text sat, so the words don't jump.
    // Where the flight starts: the bubble's box positioned so its text sits exactly on the typed text.
    const fromX = l.rect.left + l.padL - parseFloat(bs.paddingLeft)
    const fromY = l.rect.top + l.padT - parseFloat(bs.paddingTop)
    // Fly a detached copy in a fixed layer ABOVE everything (never clipped by the thread, never behind the composer).
    const ghost = bubble.cloneNode(true) as HTMLElement
    Object.assign(ghost.style, {
      // exact fractional size (offsetWidth rounds down and re-wraps the text); a hair of slack keeps the same line breaks
      position: "fixed", left: "0px", top: "0px", width: `${end.width + 0.5}px`, height: `${end.height}px`,
      margin: "0", zIndex: "2147483000", pointerEvents: "none", animation: "none", transition: "none", boxSizing: "border-box",
      transform: `translate(${fromX}px, ${fromY}px)`,
    })
    document.body.appendChild(ghost)
    bubble.style.transition = "none" // the hand-off must be instant: no fade
    bubble.style.opacity = "0"
    // 1) the bubble forms in place: fill fades in, text takes the bubble's colour (first 18% of the flight)
    const FORM = 0.18
    const DURATION = 560
    ghost.animate(
      [
        { backgroundColor: "transparent", color: "var(--corpus-foreground)" },
        { backgroundColor: bs.backgroundColor, color: bs.color },
      ],
      { duration: DURATION * FORM, fill: "forwards" },
    )
    // 2) it shoots off and settles slowly (Corpus's expressive curve), HOMING on the real bubble's live position every
    //    frame — the thread may scroll or reflow mid-flight (thinking appears, pinning), and the copy follows, so the
    //    hand-off happens where the bubble actually is: no jump, no blink.
    const ease = cubicBezier(0.22, 1, 0.36, 1)
    const start = performance.now()
    let raf = 0
    const step = (now: number) => {
      const p = Math.min(1, (now - start) / DURATION)
      const t = p <= FORM ? 0 : ease((p - FORM) / (1 - FORM))
      const to = bubble.getBoundingClientRect()
      ghost.style.transform = `translate(${fromX + (to.left - fromX) * t}px, ${fromY + (to.top - fromY) * t}px)`
      if (p < 1) {
        raf = requestAnimationFrame(step)
        return
      }
      bubble.style.opacity = "" // same frame, same place: the copy disappears exactly onto the bubble
      ghost.remove()
      requestAnimationFrame(() => {
        bubble.style.transition = ""
      })
    }
    raf = requestAnimationFrame(step)
    flightRef.current = () => {
      cancelAnimationFrame(raf)
      bubble.style.opacity = ""
      bubble.style.transition = ""
      ghost.remove()
    }
  }, [messages])
  // The conversation stays pinned to the latest message: anything that grows the thread (new message, thinking,
  // a reply landing) keeps it at the bottom — unless the person scrolled up to read history.
  const word = useMakingWord(!!typing && typeof typing !== "string")
  const working = typing ? (typeof typing === "string" ? typing : word) : false
  const pinned = React.useRef(true)
  const threadRef = React.useRef<HTMLDivElement>(null)
  React.useEffect(() => {
    const sc = scroller.current
    const th = threadRef.current
    if (!sc || !th) return
    const onScroll = () => {
      pinned.current = sc.scrollHeight - sc.scrollTop - sc.clientHeight < 24
    }
    const stick = () => {
      if (pinned.current) sc.scrollTop = sc.scrollHeight
    }
    sc.addEventListener("scroll", onScroll, { passive: true })
    const ro = new ResizeObserver(stick)
    ro.observe(th)
    stick()
    return () => {
      sc.removeEventListener("scroll", onScroll)
      ro.disconnect()
    }
  }, [])
  React.useLayoutEffect(() => {
    const sc = scroller.current
    if (sc && pinned.current) sc.scrollTop = sc.scrollHeight
  }, [messages.length, typing])
  return (
    <section aria-label={`Chat with ${agent}`} className={cn("flex h-120 w-full max-w-sm flex-col overflow-hidden glass scope-xl", className)}>
      <header className="flex items-center gap-3 border-b border-divider px-3 py-2.5">
        <IconPlaceholder icon={Bot} tone="brand" size="md" />
        <div className="flex min-w-0 flex-1 flex-col">
          <span className="truncate text-body font-semibold">{agent}</span>
          <StatusIndicator kind={working ? "in-progress" : "success"} size="sm">{working || status}</StatusIndicator>
        </div>
        {onClose && <IconButton icon={Close} label="Close chat" size="sm" shortcut="escape" onClick={onClose} />}
      </header>
      <div ref={scroller} className="flex min-h-0 flex-1 flex-col overflow-y-auto p-3">
        {/* short threads sit at the bottom, like a messaging app */}
        <div ref={threadRef} className="mt-auto">
          <ChatThread messages={messages} typing={working} launchedId={launchedId} />
        </div>
      </div>
      <div ref={composerBox} className="border-t border-divider p-2">
        <Composer size="md" voice={false} attachments={false} placeholder={`Message ${agent}`} suggestions={messages.length ? undefined : suggestions} onSubmit={(v) => send(v)} />
      </div>
    </section>
  )
}
