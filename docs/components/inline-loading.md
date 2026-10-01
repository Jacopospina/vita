---
title: Inline loading
summary: The status of one operation, in place — "Saving…" → "Saved" → gone.
status: stable
import: "import { InlineLoading } from \"@/components/corpus/loading\""
use_when:
  - Auto-save and background save feedback next to the thing being saved
  - An action whose result appears in place (toggle persisted, row updated)
avoid_when:
  - Blocking actions → Button loading
  - Page/region loads → Skeleton / Loading
related: [loading, button, notification]
---

## Rules

1. **Lifecycle:** `active` ("Saving…", a small thinking orb — `mode` for agentic work) → `finished` ("Saved", a check that draws in) → `inactive` after about 2s.
2. **Error stays** until the user acts. Pass `onRetry` and a "Retry" action sits beside "Couldn't save."; it blends out as the retry starts.
5. **One indicator, morphing.** The same InlineLoading moves through every state — saving → couldn't save → saving → saved (or back to error). Never show the states side by side. The glyph cross-fades (thinking orb ⇄ drawn check or error), the text morphs and the colour fades.
3. **Place it next to the trigger** or in the header of the region being saved, never in a toast.
4. **Copy:** a present participle with an ellipsis while running ("Saving…"), then a past participle ("Saved").
