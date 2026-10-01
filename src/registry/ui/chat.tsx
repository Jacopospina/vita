import * as React from "react"
import { Bot, Close, WarningFilled } from "@/registry/icons"
import { cn } from "@/registry/lib/utils"
import { Icon } from "@/registry/ui/icon"
import { IconButton } from "@/registry/ui/button"
import { IconPlaceholder } from "@/registry/ui/icon-placeholder"
import { Thinking } from "@/registry/ui/thinking"
import { Composer } from "@/registry/ui/composer"
import { StatusIndicator } from "@/registry/ui/status-indicator"
import { useFlip } from "@/registry/hooks/use-flip"

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
                <Icon as={WarningFilled} size="sm" className="text-error" draw="in" />
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

/** ChatTyping — the agent is thinking: Sofia and what it's doing, as a plain line on the agent's side (not a bubble). */
export function ChatTyping({ label = "Thinking" }: { label?: string }) {
  return (
    <div role="status" className="flex animate-enter-fade items-center gap-2 py-1 text-body text-muted-foreground">
      <Thinking mode="generating" size="sm" label={label} />
      <span>{label}…</span>
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
    const dx = l.rect.left + l.padL - (end.left + parseFloat(bs.paddingLeft))
    const dy = l.rect.top + l.padT - (end.top + parseFloat(bs.paddingTop))
    const from = `translate(${dx}px, ${dy}px)`
    // Fly a detached copy in a fixed layer ABOVE everything (never clipped by the thread, never behind the composer):
    // it lifts straight off the composer's text and lands on the real bubble, which stays hidden until it arrives.
    const ghost = bubble.cloneNode(true) as HTMLElement
    Object.assign(ghost.style, {
      position: "fixed", left: `${end.left}px`, top: `${end.top}px`, width: `${bubble.offsetWidth}px`, height: `${bubble.offsetHeight}px`,
      margin: "0", zIndex: "2147483000", pointerEvents: "none", animation: "none", transition: "none", boxSizing: "border-box",
    })
    document.body.appendChild(ghost)
    bubble.style.opacity = "0"
    const flight = ghost.animate(
      [
        { transform: from, backgroundColor: "transparent", color: "var(--corpus-foreground)", offset: 0 },
        { transform: from, backgroundColor: bs.backgroundColor, color: bs.color, offset: 0.3 }, // 1) the bubble forms in place
        { transform: "translate(0, 0)", backgroundColor: bs.backgroundColor, color: bs.color, offset: 1 }, // 2) it travels
      ],
      { duration: 520, easing: "cubic-bezier(0.2, 0, 0.38, 0.9)" },
    )
    const land = () => {
      bubble.style.opacity = ""
      ghost.remove()
    }
    flight.onfinish = land
    flight.oncancel = land
  }, [messages])
  // The conversation stays pinned to the latest message: anything that grows the thread (new message, thinking,
  // a reply landing) keeps it at the bottom — unless the person scrolled up to read history.
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
          <StatusIndicator kind={typing ? "in-progress" : "success"} size="sm">{typing ? "Thinking" : status}</StatusIndicator>
        </div>
        {onClose && <IconButton icon={Close} label="Close chat" size="sm" shortcut="escape" onClick={onClose} />}
      </header>
      <div ref={scroller} className="flex min-h-0 flex-1 flex-col overflow-y-auto p-3">
        {/* short threads sit at the bottom, like a messaging app */}
        <div ref={threadRef} className="mt-auto">
          <ChatThread messages={messages} typing={typing} launchedId={launchedId} />
        </div>
      </div>
      <div ref={composerBox} className="border-t border-divider p-2">
        <Composer size="md" voice={false} attachments={false} placeholder={`Message ${agent}`} suggestions={messages.length ? undefined : suggestions} onSubmit={(v) => send(v)} />
      </div>
    </section>
  )
}
