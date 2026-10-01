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
 *   ChatTyping   the agent is thinking — Sofia, inside a bubble. Never three bouncing dots.
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
  className?: string
}

export function ChatBubble({ role, children, author, time, position = "single", status, onRetry, className }: ChatBubbleProps) {
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
          className={cn(
            "px-3.5 py-2 text-body",
            corners,
            agent ? "origin-bottom-left bg-layer-2 text-foreground" : "origin-bottom-right bg-primary text-primary-foreground",
            status === "sending" && "opacity-70",
            status === "failed" && "bg-error-subtle text-foreground",
            "animate-chip-in",
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

/** ChatTyping — the agent is thinking: Sofia in an agent bubble. */
export function ChatTyping({ label = "Thinking" }: { label?: string }) {
  return (
    <div className="flex items-end gap-2" role="status">
      <div className="flex origin-bottom-left animate-chip-in items-center gap-2 rounded-xl rounded-bl-sm bg-layer-2 px-3.5 py-2 text-body text-muted-foreground">
        <Thinking mode="generating" size="sm" label={label} />
        <span>{label}…</span>
      </div>
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
export function ChatThread({ messages, typing, className }: { messages: ChatMessage[]; typing?: boolean | string; className?: string }) {
  const ref = React.useRef<HTMLDivElement>(null)
  useFlip(ref)
  return (
    <div ref={ref} role="log" aria-live="polite" className={cn("flex flex-col", className)}>
      {messages.map((m, i) => {
        const prev = messages[i - 1]?.role === m.role
        const next = messages[i + 1]?.role === m.role
        const position = prev && next ? "middle" : prev ? "last" : next ? "first" : "single"
        return (
          <div key={m.id} className={prev ? "pt-0.5" : i === 0 ? "" : "pt-3"}>
            <ChatBubble role={m.role} author={m.author} time={m.time} status={m.status} position={position}>{m.text}</ChatBubble>
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
  const end = React.useRef<HTMLDivElement>(null)
  React.useEffect(() => {
    end.current?.scrollIntoView({ block: "end", behavior: "smooth" })
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
      <div className="min-h-0 flex-1 overflow-y-auto p-3">
        <ChatThread messages={messages} typing={typing} />
        <div ref={end} />
      </div>
      <div className="border-t border-divider p-2">
        <Composer size="md" voice={false} attachments={false} placeholder={`Message ${agent}`} suggestions={messages.length ? undefined : suggestions} onSubmit={(v) => onSend(v)} />
      </div>
    </section>
  )
}
