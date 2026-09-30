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

1. **Lifecycle:** `active` ("Saving…") → `finished` ("Saved", with a check that scales in) → `inactive` after about 2s.
2. **Error stays** until the user acts, with a retry path: "Couldn't save. Retry?"
3. **Place it next to the trigger** or in the header of the region being saved, never in a toast.
4. **Copy:** a present participle with an ellipsis while running ("Saving…"), then a past participle ("Saved").
