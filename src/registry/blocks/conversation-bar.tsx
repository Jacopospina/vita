import * as React from "react"
import { Phone, PhoneOff, Microphone as MicIcon, MicrophoneOff, Keyboard, Settings, Send } from "@/registry/icons"
import { cn } from "@/registry/lib/utils"
import type { Microphone } from "@/registry/hooks/use-microphone"
import { Thinking, type ThinkingMode } from "@/registry/ui/thinking"
import { LiveWaveform } from "@/registry/ui/live-waveform"
import { Button, IconButton } from "@/registry/ui/button"
import { TextInput } from "@/registry/ui/text-input"
import { AnimatedText } from "@/registry/ui/animated"
import { Popover, PopoverTrigger, PopoverContent } from "@/registry/ui/popover"
import { MicSelector } from "@/registry/blocks/mic-selector"
import { useMakingWord } from "@/registry/ui/chat"

/**
 * ConversationBar: a voice conversation with an agent, in one bar. Sofia shows who has the floor (idle, listening,
 * thinking, talking), the waveform shows the sound, and the controls stay where the thumb expects them: mute, type
 * instead, microphone settings, end.
 *
 *   disconnected  Sofia rests; one primary action starts the conversation
 *   connecting    Sofia generates while the line opens
 *   listening     the person has the floor: Sofia gathers their voice, the bar shows their microphone
 *   thinking      the agent works: Sofia generates, a making word names it, the waveform waits
 *   talking       the agent speaks: Sofia and the waveform follow its voice in the AI spectrum
 *
 * The app owns the conversation (connection, turns, audio); the bar only shows it and reports what the person does.
 * Not for: text-only chat → MiniChat / Composer; a recording control → Button + LiveWaveform.
 */
export type ConversationState = "disconnected" | "connecting" | "listening" | "thinking" | "talking"

export interface ConversationBarProps {
  agent: string
  state: ConversationState
  onStart: () => void
  onEnd: () => void
  /** The person's microphone (mute, level, device). Simulated sound when omitted. */
  mic?: Microphone
  /** The agent's voice loudness now, 0 to 1. Simulated when omitted. */
  agentLevel?: () => number
  /** Lets the person type instead of talking. Omit to hide the keyboard control. */
  onSendText?: (text: string) => void
  className?: string
}

const orb: Record<ConversationState, ThinkingMode> = { disconnected: "idle", connecting: "generating", listening: "listening", thinking: "generating", talking: "talking" }

export function ConversationBar({ agent, state, onStart, onEnd, mic, agentLevel, onSendText, className }: ConversationBarProps) {
  const [typing, setTyping] = React.useState(false)
  const [draft, setDraft] = React.useState("")
  const word = useMakingWord(state === "thinking")
  const live = state !== "disconnected"
  const muted = mic?.muted ?? false
  const status =
    state === "disconnected" ? "Start a voice conversation"
    : state === "connecting" ? "Connecting"
    : state === "listening" ? (muted ? "Muted" : "Listening")
    : state === "thinking" ? word
    : "Speaking"
  const send = () => {
    if (!draft.trim() || !onSendText) return
    onSendText(draft.trim())
    setDraft("")
  }

  return (
    <section aria-label={`Voice conversation with ${agent}`} className={cn("flex w-full items-center gap-2 glass glass-2 scope-xl p-2", className)}>
      <Thinking
        mode={orb[state]}
        size="lg"
        level={state === "listening" ? (mic && mic.status === "live" ? mic.level : undefined) : state === "talking" ? agentLevel : undefined}
        label={`${agent}: ${status}`}
        className="shrink-0"
      />

      {/* Middle: who and what, or the text field while typing. Swaps cross-fade in place. */}
      <div className="grid min-w-0 flex-1 items-center">
        <div className={cn("col-start-1 row-start-1 flex min-w-0 items-center gap-3 motion-productive", typing && live ? "pointer-events-none opacity-0 blur-xs" : "opacity-100")}>
          <div className="flex min-w-0 shrink flex-col">
            <span className="truncate text-body font-semibold">{agent}</span>
            <span className="truncate text-caption text-muted-foreground" aria-live="polite"><AnimatedText>{status}</AnimatedText></span>
          </div>
          {/* On a phone the bar keeps the name, status and controls; the waveform needs the room of a wider screen. */}
          <div className={cn("min-w-0 flex-1 motion-productive max-sm:hidden", live ? "opacity-100" : "opacity-0")}>
            <LiveWaveform
              size="sm"
              tone={state === "talking" ? "spectrum" : "brand"}
              active={(state === "listening" && !muted) || state === "talking"}
              processing={state === "thinking" || state === "connecting"}
              getBands={state === "listening" && mic?.status === "live" ? mic.bands : undefined}
              getLevel={state === "talking" ? agentLevel : undefined}
              label={state === "talking" ? `${agent}'s voice` : "Your microphone"}
            />
          </div>
        </div>
        {onSendText && (
          <form
            className={cn("col-start-1 row-start-1 flex items-center gap-2 motion-productive [&_[data-message]]:hidden", typing && live ? "opacity-100" : "pointer-events-none opacity-0 blur-xs")}
            onSubmit={(e) => { e.preventDefault(); send() }}
            aria-hidden={!(typing && live)}
          >
            <TextInput label={`Message ${agent}`} hideLabel size="md" className="min-w-0 flex-1" value={draft} onChange={(e) => setDraft(e.target.value)} placeholder={`Type to ${agent}`} tabIndex={typing && live ? 0 : -1} />
            <IconButton icon={Send} label="Send" type="submit" variant="primary" disabled={!draft.trim()} tabIndex={typing && live ? 0 : -1} />
          </form>
        )}
      </div>

      {/* Controls: they slide open once the conversation is live. */}
      <div className={cn("reveal-x motion-expressive", live && "reveal-x-open")} aria-hidden={!live}>
        <div className="flex items-center gap-1">
          <IconButton icon={muted ? MicrophoneOff : MicIcon} label={muted ? "Unmute" : "Mute"} pressed={muted} disabled={!mic || mic.status !== "live"} onClick={() => mic?.setMuted(!muted)} tabIndex={live ? 0 : -1} />
          {onSendText && <IconButton icon={Keyboard} label={typing ? "Talk instead" : "Type instead"} pressed={typing} onClick={() => setTyping((v) => !v)} tabIndex={live ? 0 : -1} />}
          {mic && (
            <Popover>
              <PopoverTrigger asChild><IconButton icon={Settings} label="Microphone settings" tabIndex={live ? 0 : -1} /></PopoverTrigger>
              <PopoverContent className="w-80"><MicSelector mic={mic} /></PopoverContent>
            </Popover>
          )}
          <IconButton icon={PhoneOff} label="End conversation" variant="danger" onClick={() => { setTyping(false); onEnd() }} tabIndex={live ? 0 : -1} />
        </div>
      </div>
      <div className={cn("reveal-x motion-expressive", !live && "reveal-x-open")} aria-hidden={live}>
        <div><Button icon={Phone} onClick={onStart} className="whitespace-nowrap" tabIndex={live ? -1 : 0}>Start</Button></div>
      </div>
    </section>
  )
}
