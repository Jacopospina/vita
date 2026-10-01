---
title: Progress bar
summary: Progress of a system process with a measurable end, or indeterminate when the end is unknown. Also quota and usage.
status: stable
import: "import { ProgressBar } from \"@/components/vita/progress-bar\""
use_when:
  - Uploads, imports, exports, setup jobs longer than ~2 seconds
  - Usage vs limit (seats, storage) with helper text
avoid_when:
  - Steps the user completes → ProgressIndicator
  - Short actions → Button loading / InlineLoading
  - Content loading with known layout → Skeleton
related: [progress-indicator, thinking, file-uploader]
---

## Rules

1. **Label says what's progressing** ("Indexing help center"). Helper text gives the numbers or time left ("812 of 1,240 articles · about 20 seconds").
2. **Never go backwards.** If an estimate was wrong, slow down; don't rewind.
3. **Indeterminate → determinate** as soon as the total is known.
4. **Finish states:** `finished` turns green with a check. `error` turns red and the helper explains the failure and the fix.
5. **Usage bars** don't turn red until the limit is actually a problem (≥ 90%). Use `warning` wording first.

## Look

- **Sofia's liquid.** The bar is drawn with the same liquid as the thinking orb: a run of drops melted into one body, lit on its rim, with a soft glow.
- **Determinate:** the body springs to the value. When it moves fast, its tip stretches ahead through a neck and a drop pulls away, then surface tension draws it back in.
- **Indeterminate:** a slug of liquid is pumped slowly along the track (about 3.6 seconds a crossing), stretching on each push, with a droplet trailing that parts and fuses again. There is no sliding bar.
- **Fallback:** without WebGL2, a CPU liquid draws the same states.
- **Reduced motion:** the liquid is shown at rest, with no flow.
- **Tone:** `brand` by default. Use `spectrum` for agent work. Finished and error switch to success and error.
