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
related: [voice-conversation, mic-selector, thinking]
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
| `tone="brand"` | Default: the primary colour, for every voice |
| `tone="current"` | Inherits the text colour (muted mic, neutral surfaces) |
| `size` | `sm` 24 · `md` 40 · `lg` 64 px tall |

## Rules

1. **Only real sound.** A waveform says "audio is flowing"; never animate one for decoration.
2. **Always primary, never Sofia's water.** Sofia beside the waveform says who is speaking; the bars only say that sound flows.
3. **Nothing jumps.** Bars rise quickly and fall gently, and they travel between states.
4. **Both edges fade out**, so the bars sit in any container without a hard border.
5. **No background of its own.** The edge fade would fade a fill too, leaving a smudge behind the bars.

> [!IMPORTANT] Breaking (2026-10-02): `tone="spectrum"` is removed and the default is now `brand` (it was `current`). Pass `tone="current"` where the bars should follow the text colour.

## Accessibility

- **An image with a name.** `label` becomes the accessible name, with ", live" or ", working" added for the state.
- **Reduced motion** shows the target heights without easing.
