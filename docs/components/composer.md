---
title: Composer
summary: The intent-first input. Users type, dictate or attach what they want; the AI does the work and hands back something to review.
status: experimental
import: "import { Composer } from \"@/components/corpus/composer\""
use_when:
  - Starting any task an agent can do (create, find, change, summarise)
  - Replacing a long form with "describe it, then review it"
  - Chat, assistant panels, command entry
avoid_when:
  - A single known value (a name, a date) → TextInput / DatePicker
  - Searching a list → Search
  - Instant settings → Toggle
related: [intent-first, ai-label, text-input, search]
---

## Anatomy

- **Field.** Grows with the text, up to about 10 lines, then scrolls.
- **Attach.** Files become removable chips above the text.
- **Dictate.** The microphone streams speech into the field; press it again to stop.
- **Send.** A round primary icon button, disabled while the field is empty.
- **Suggestions.** Chips below that fill the field in one click.

## Rules

1. **Offer suggestions.** They make the mouse-only path complete and teach what's possible.
2. **Placeholder shows an example**, not an instruction: "e.g. Answer refund questions…".
3. **Enter sends, Shift+Enter adds a line.** Never send on blur.
4. **Always answer with something reviewable.** A prefilled `AISurface` with an `AILabel`, never a silent change.
5. **One composer per view.** It is the primary input; everything else supports it.

> [!TIP] Voice uses the browser's speech recognition. When it isn't available the microphone simply doesn't appear.
