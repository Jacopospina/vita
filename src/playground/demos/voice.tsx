import * as React from "react"
import type { DemoMap } from "./types"
import { Stack, Inline } from "@/registry/ui/layout"
import { Text } from "@/registry/ui/text"
import { Button } from "@/registry/ui/button"
import { ContentSwitcher } from "@/registry/ui/content-switcher"
import { LiveWaveform } from "@/registry/ui/live-waveform"
import { MicSelector } from "@/registry/ui/mic-selector"
import { ConversationBar, type ConversationState } from "@/registry/ui/conversation-bar"
import { useMicrophone, simulatedVoice } from "@/registry/hooks/use-microphone"
import { toast } from "@/registry/ui/notification"

/** Waveform with the real microphone: off until the person starts it. */
function MicWaveformDemo() {
  const mic = useMicrophone()
  const live = mic.status === "live"
  return (
    <Stack gap="sm" className="max-w-md">
      <LiveWaveform active={live && !mic.muted} getBands={mic.bands} tone="brand" size="lg" label="Your microphone" />
      <Inline gap="sm">
        <Button variant={live ? "secondary" : "primary"} onClick={() => (live ? mic.stop() : void mic.start())}>{live ? "Stop microphone" : "Use my microphone"}</Button>
        <Text variant="caption" tone="muted">{mic.status === "denied" ? "Microphone blocked in this browser." : live ? "Talk: the bars follow your voice." : "Nothing is recorded or sent."}</Text>
      </Inline>
    </Stack>
  )
}

/** The three states side by side, on a simulated voice. */
function WaveformStatesDemo() {
  const [state, setState] = React.useState("active")
  return (
    <Stack gap="md" className="max-w-md">
      <ContentSwitcher label="State" items={[{ value: "idle", label: "Idle" }, { value: "processing", label: "Processing" }, { value: "active", label: "Active" }]} value={state} onValueChange={setState} />
      <LiveWaveform active={state === "active"} processing={state === "processing"} tone="spectrum" size="lg" label="Agent voice" />
      <LiveWaveform active={state === "active"} processing={state === "processing"} variant="scrolling" tone="brand" size="md" label="Your voice, over time" />
    </Stack>
  )
}

function MicSelectorDemo() {
  const mic = useMicrophone()
  return <MicSelector mic={mic} className="max-w-sm" />
}

/** A whole conversation: the agent listens to the real microphone, thinks, then answers (simulated voice). */
function ConversationDemo({ typing = true }: { typing?: boolean }) {
  const mic = useMicrophone()
  const [state, setState] = React.useState<ConversationState>("disconnected")
  const timers = React.useRef<number[]>([])
  const clear = () => { timers.current.forEach((t) => window.clearTimeout(t)); timers.current = [] }
  React.useEffect(() => clear, [])
  // listening (6s) → thinking (1.6s) → talking (5s) → listening … on a fixed schedule from Start.
  const cycle = () => {
    const at = (ms: number, s: ConversationState) => timers.current.push(window.setTimeout(() => setState(s), ms))
    for (let k = 0; k < 20; k++) {
      const o = k * 12600
      at(o + 6000, "thinking"); at(o + 7600, "talking"); at(o + 12600, "listening")
    }
  }
  const start = async () => {
    setState("connecting")
    await mic.start()
    timers.current.push(window.setTimeout(() => { setState("listening"); cycle() }, 900))
  }
  const end = () => { clear(); mic.stop(); setState("disconnected") }
  const t0 = React.useRef(0)
  React.useEffect(() => { t0.current = performance.now() }, [])
  return (
    <div className="w-full max-w-xl">
      <ConversationBar
        agent="Support triage"
        state={state}
        mic={mic}
        agentLevel={() => simulatedVoice((performance.now() - t0.current) / 1000, 3)}
        onStart={() => void start()}
        onEnd={end}
        onSendText={typing ? (text) => { toast({ kind: "info", title: "Sent to Support triage", subtitle: text }); setState("thinking") } : undefined}
      />
    </div>
  )
}

export const voiceDemos: DemoMap = {
  "components/conversation-bar": [
    { title: "A voice conversation", description: "Start, then talk: the bar listens to your microphone, the agent thinks, then answers. Mute, type instead or change microphone from the bar.", render: () => <ConversationDemo /> },
    {
      title: "Every state",
      render: () => (
        <Stack gap="sm" className="w-full max-w-xl">
          {(["disconnected", "connecting", "listening", "thinking", "talking"] as const).map((s) => (
            <ConversationBar key={s} agent="Support triage" state={s} onStart={() => {}} onEnd={() => {}} onSendText={() => {}} />
          ))}
        </Stack>
      ),
    },
    { title: "Voice only (no typing)", render: () => <ConversationDemo typing={false} /> },
  ],
  "components/live-waveform": [
    { title: "Your microphone, live", description: "Bars mirrored from the centre follow the voice's spectrum.", render: () => <MicWaveformDemo /> },
    { title: "Idle, processing, active", description: "Bars travel between states; nothing jumps.", render: () => <WaveformStatesDemo /> },
    {
      title: "Sizes and tones",
      render: () => (
        <Stack gap="md" className="max-w-md">
          <LiveWaveform active size="sm" tone="current" label="Current colour" />
          <LiveWaveform active size="md" tone="brand" label="Brand" />
          <LiveWaveform active size="lg" tone="spectrum" label="AI spectrum" />
        </Stack>
      ),
    },
  ],
  "components/mic-selector": [
    { title: "Choose, test, mute", description: "Allow the microphone, pick a device, watch its level, mute it.", render: () => <MicSelectorDemo /> },
  ],
  "patterns/voice-conversation": [
    { title: "Talking to an agent", render: () => <ConversationDemo /> },
  ],
}
