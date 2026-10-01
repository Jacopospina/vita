---
title: Conversation bar
summary: A voice conversation with an agent, in one bar. Sofia shows who has the floor, the waveform shows the sound, and the controls stay where the thumb expects them.
status: experimental
import: "import { ConversationBar } from \"@/components/vita/conversation-bar\"\nimport { useMicrophone } from \"@/components/vita/use-microphone\""
use_when:
  - Talking to a voice agent (support, booking, a hands-free assistant)
  - A call-like moment inside a product, docked at the bottom of a panel or page
avoid_when:
  - Text-only chat → MiniChat / Composer
  - Dictating into a field → Composer (its microphone streams speech into the text)
  - Showing sound without a conversation → LiveWaveform
related: [live-waveform, mic-selector, thinking, composer, voice-conversation]
---

## States

| State | Sofia | Waveform | Controls |
|---|---|---|---|
| `disconnected` | Idle | Hidden | One primary action: Start |
| `connecting` | Generating | Processing | Mute, type, settings, end |
| `listening` | Listening, follows the person's voice | Their microphone (brand) | Same |
| `thinking` | Generating, a making word names it | Processing | Same |
| `talking` | Talking, follows the agent's voice | The agent's voice (AI spectrum) | Same |

## Rules

1. **The app owns the conversation.** Connection, turns and audio live in the app; the bar shows `state` and reports Start, End, mute and typed messages.
2. **Ask for the microphone on Start.** Never before the person chooses to talk; `useMicrophone().start()` triggers the browser prompt.
3. **One floor at a time.** Exactly one of listening, thinking or talking is shown; Sofia's state is the turn.
4. **Muted is visible.** The mute button stays pressed and the status reads "Muted" while the person can't be heard.
5. **Typing is a peer, not a fallback.** "Type instead" swaps the middle of the bar for a field; sending hands the turn to the agent.
6. **End is always one tap away.** The danger button ends the conversation and releases the microphone.

## Motion

- **Controls slide open on Start** and fold away on End; the Start button folds the other way.
- **Status words change letter by letter**; the waveform's bars travel between states, never jump.
- **Sofia's liquid follows the sound**, easing up fast and settling slowly.

## Accessibility

- **A named region.** `aria-label="Voice conversation with {agent}"`; the status is a polite live region.
- **Every control has a name and a tooltip:** Mute / Unmute, Type instead / Talk instead, Microphone settings, End conversation.
- **The waveform is an image** with a label ("Your microphone, live"), so screen readers know sound is flowing.

## Example

```tsx
const mic = useMicrophone()
<ConversationBar
  agent="Support triage"
  state={state}
  mic={mic}
  agentLevel={() => agentAudio.level()}
  onStart={async () => { await mic.start(); connect() }}
  onEnd={() => { mic.stop(); hangUp() }}
  onSendText={(text) => sendToAgent(text)}
/>
```
