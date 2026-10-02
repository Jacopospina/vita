---
title: Mic selector
summary: Choose which microphone to talk through, hear that it works, and mute it. One useMicrophone() drives the device list, the live preview and the mute.
status: experimental
import: "import { MicSelector } from \"@/components/vita/blocks/mic-selector\"\nimport { useMicrophone } from \"@/components/vita/use-microphone\""
use_when:
  - Before or during a voice conversation, in settings or the conversation bar's settings
  - Anywhere the person records audio and may have more than one microphone
avoid_when:
  - Choosing any other value → Dropdown
  - The whole voice call → ConversationBar (it opens this from its settings button)
related: [voice-conversation, live-waveform, dropdown]
---

## Anatomy

- **Device list.** A Dropdown of the browser's audio inputs; the first is marked Default.
- **Allow / Mute.** Before permission, "Allow" asks for the microphone; once live, the button mutes and unmutes.
- **Status line.** Says what to do next: allow, blocked, muted.
- **Preview.** A small LiveWaveform of the chosen input, so the person sees it hears them.

## Rules

1. **No permission, no names.** Browsers hide device names until the microphone is allowed; offer "Allow" instead of a list of blanks.
2. **Switching is instant.** Choosing a device while live re-opens the stream on it.
3. **Blocked is explained.** If the browser blocks the microphone, say where to allow it.
4. **Muted shows everywhere.** The button stays pressed, the preview goes quiet, the status says "Muted".

## useMicrophone

- **`start()` / `stop()`.** Ask for and release the microphone. Nothing is requested before `start()`.
- **`level()` and `bands(n)`.** Read the sound each frame (0 to 1): feed them to LiveWaveform and Sofia.
- **`devices`, `deviceId`, `setDeviceId`, `muted`, `setMuted`, `status`.** Everything a selector or bar needs.
