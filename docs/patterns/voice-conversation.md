---
title: Voice conversation
summary: Talking to an agent with your voice. The turn is always visible, the microphone is always yours to control, and typing is always an option.
status: experimental
import: "import { ConversationBar } from \"@/components/vita/blocks/conversation-bar\"\nimport { useMicrophone } from \"@/components/vita/use-microphone\""
use_when:
  - A product offers a voice agent (support, booking, hands-free help)
avoid_when:
  - Text conversations → Agent conversation
related: [live-waveform, mic-selector, thinking, agent-conversation, composer]
---

## The flow

1. **Invite.** Sofia idles in the bar with one action: Start. Nothing is recorded yet.
2. **Ask.** Start requests the microphone; while the line opens, Sofia generates and the bar reads "Connecting".
3. **Listen.** The person has the floor: Sofia gathers their voice, the waveform shows their microphone.
4. **Think.** The agent works: Sofia generates and a making word names the work.
5. **Talk.** The agent answers: Sofia follows its voice in the AI spectrum; the waveform stays primary.
6. **End.** One tap ends the conversation and releases the microphone; offer the transcript if there is one.

## Rules

- **The turn is always visible.** One state at a time: listening, thinking or talking, shown by Sofia and the status word.
- **The person controls the microphone.** Ask only on Start, show mute everywhere, release it on End.
- **Typing is always possible.** Some moments are not for speaking: "Type instead" hands the same turn over in text.
- **Interruptions are welcome.** When the person speaks while the agent talks, switch to listening at once.
- **Never a spinner.** Waiting is thinking; Sofia shows it.

## Don't

- **Don't record before Start.** No pre-warming the microphone, ever.
- **Don't hide that sound is flowing.** If the microphone is live, the waveform shows it.
- **Don't animate a fake waveform** outside previews.

## States of the bar

| State | Sofia | Waveform | Controls |
|---|---|---|---|
| `disconnected` | Idle | Hidden | One primary action: Start |
| `connecting` | Generating | Processing | Mute, type, settings, end |
| `listening` | Listening, follows the person's voice | Their microphone (brand) | Same |
| `thinking` | Generating, a making word names it | Processing | Same |
| `talking` | Talking, follows the agent's voice | The agent's voice (primary) | Same |

## The bar

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
