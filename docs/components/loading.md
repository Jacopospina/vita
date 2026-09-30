---
title: Loading
summary: Spinner, overlay and skeletons. Pick by scope and duration; prefer skeletons whenever the layout is known.
status: stable
import: "import { Loading, Skeleton, SkeletonText } from \"@/components/corpus/loading\""
use_when:
  - Skeleton — content with a known shape is on its way (cards, tables, profile)
  - Loading — a region/page with unknown layout is loading
  - Loading overlay — interaction must be blocked while a region recomputes
avoid_when:
  - A single action → Button loading / InlineLoading
  - Measurable progress → ProgressBar
  - Anything under 300ms → show nothing
related: [inline-loading, progress-bar, loading-pattern]
---

## Corpus opinions

1. **Skeletons first.** They preserve layout, prevent shift and feel faster. Match the real dimensions.
2. **Delay indicators by about 300ms** so fast responses never flash a spinner.
3. **Never a full-page spinner** for partial data. Load regions independently.
4. **Overlays** only when the user must not interact (re-indexing a knowledge source). They dim with `overlay`.
5. **Always label spinners** (`label="Loading agents"`) for screen readers.
6. **Reduced motion:** the shimmer becomes a gentle pulse.
