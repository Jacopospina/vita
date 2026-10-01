---
title: Voice conversation
summary: Talking to an agent with your voice. The turn is always visible, the microphone is always yours to control, and typing is always an option.
status: experimental
use_when:
  - A product offers a voice agent (support, booking, hands-free help)
avoid_when:
  - Text conversations → Agent conversation
related: [conversation-bar, live-waveform, mic-selector, thinking, agent-conversation]
---

## The flow

1. **Invite.** Sofia idles in the bar with one action: Start. Nothing is recorded yet.
2. **Ask.** Start requests the microphone; while the line opens, Sofia generates and the bar reads "Connecting".
3. **Listen.** The person has the floor: Sofia gathers their voice, the waveform shows their microphone.
4. **Think.** The agent works: Sofia generates and a making word names the work.
5. **Talk.** The agent answers: Sofia and the waveform follow its voice in the AI spectrum.
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
