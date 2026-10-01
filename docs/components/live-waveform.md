---
title: Live waveform
summary: Sound, as it happens. Rounded bars that follow a voice in real time, the person's microphone or the agent's voice.
status: experimental
import: "import { LiveWaveform } from \"@/components/vita/live-waveform\""
use_when:
  - Showing that a microphone hears the person (recording, voice input, a call)
  - Showing the agent's voice while it speaks
avoid_when:
  - The AI is working without sound → Thinking
  - A recording's playback position → a progress control
  - Decoration with no real sound behind it
related: [conversation-bar, mic-selector, thinking]
---

## States

- **Active.** Bars follow the sound: pass `getBands` (frequency bands) or `getLevel` (loudness). Without either, a believable simulated voice plays, for previews only.
- **Processing.** No sound, work in progress: a soft wave travels across the bars.
- **Idle.** Neither: the bars rest as a quiet line of dots.

## Variants

| | Use |
|---|---|
| `variant="bars"` | The spectrum, mirrored from the centre: the shape of a voice, now |
| `variant="scrolling"` | Loudness over time, scrolling left: the rhythm of a voice |
| `tone="current"` | Inherits the text colour (neutral surfaces) |
| `tone="brand"` | The person's voice |
| `tone="spectrum"` | The agent's voice, in Sofia's colours |
| `size` | `sm` 24 · `md` 40 · `lg` 64 px tall |

## Rules

1. **Only real sound.** A waveform says "audio is flowing"; never animate one for decoration.
2. **The person is brand, the agent is spectrum.** Same rule as Sofia: AI work wears the AI colours.
3. **Nothing jumps.** Bars rise quickly and fall gently, and they travel between states.
4. **Both edges fade out**, so the bars sit in any container without a hard border.

## Accessibility

- **An image with a name.** `label` becomes the accessible name, with ", live" or ", working" added for the state.
- **Reduced motion** shows the target heights without easing.
