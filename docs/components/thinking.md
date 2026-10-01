---
title: Thinking
summary: Corpus never spins — it thinks. Tiny particles that blend like liquid show what kind of work is happening. Skeletons whenever the layout is known.
status: stable
import: "import { Loading, Skeleton, SkeletonText } from \"@/components/corpus/loading\"\nimport { Thinking } from \"@/components/corpus/thinking\""
use_when:
  - Skeleton — content with a known shape is on its way (cards, tables, profiles)
  - Loading / Thinking — a region is working and its layout is unknown
  - Loading overlay — interaction must be blocked while a region recomputes
avoid_when:
  - A single action → Button loading / InlineLoading
  - Measurable progress → ProgressBar
  - Anything under 300ms → show nothing
  - Spinners → they belong to the old world (the audit rejects them)
related: [inline-loading, progress-bar, loading-pattern]
---

> [!IMPORTANT] The mode tells the user what the system is doing. Pick it by the work, not by taste.

## Thinking modes

1. **Basic.** Plain logic with no agent involved: three droplets orbit and merge, calm and steady. Follows the brand or text color.
2. **Retrieving.** An agent recalling from memory: particles stream in from the edges and are absorbed by the core.
3. **Generating.** An agent creating: the orb of tiny dots keeps shape-shifting — circle, star, infinity, squircle, blob — thinking in forms.
4. **Searching.** An agent looking things up: a comet with a fading trail scans a wobbling orbit.

## Rules

1. **Agentic modes wear the AI spectrum** (they are AI provenance); basic uses `tone="brand"` or `current`.
2. **Skeletons first** when the layout is known — no orb over a blank card.
3. **Delay 300ms** so fast responses never flash a loader.
4. **Name the work.** `label="Searching the help center"` is announced to screen readers.
5. **Sizes:** `sm` 16 inline and in buttons · `md` 24 · `lg` 48 regions · `xl` 96 empty regions · `2xl` 160 hero moments · `3xl` 280 the epicenter of a landing page (one per page).
6. **Reduced motion** shows a still frame with a gentle pulse.
