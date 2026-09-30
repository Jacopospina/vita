---
title: Progress bar
summary: Progress of a system process with a measurable end — or indeterminate when the end is unknown. Also quota and usage.
status: stable
import: "import { ProgressBar } from \"@/components/corpus/progress-bar\""
use_when:
  - Uploads, imports, exports, setup jobs longer than ~2 seconds
  - Usage vs limit (seats, storage) with helper text
avoid_when:
  - Steps the user completes → ProgressIndicator
  - Short actions → Button loading / InlineLoading
  - Content loading with known layout → Skeleton
related: [progress-indicator, loading, file-uploader]
---

## Corpus opinions

1. **Label says what's progressing** ("Importing lanes"). Helper text gives the numbers or time left ("812 of 1,240 · about 20 seconds").
2. **Never go backwards.** If an estimate was wrong, slow down; don't rewind.
3. **Indeterminate → determinate** as soon as the total is known.
4. **Finish states:** `finished` turns green with a check. `error` turns red and the helper explains the failure and the fix.
5. **Usage bars** don't turn red until the limit is actually a problem (≥ 90%). Use `warning` wording first.
