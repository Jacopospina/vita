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

- **A solid bar with a liquid tip.** The body is solid and springs to the value. A small volume of real simulated liquid rides its tip, with pressure, surface tension, viscosity and walls it wets.
- **Soft liquid.** The liquid's edges are slightly blurred, so the tip feels soft rather than cut out; the body and the track stay crisp.
- **Determinate:** when the body slows, the liquid's own inertia surges past, sloshes and settles back against it. Lowering the value draws it back, like a sealed tube.
- **Indeterminate:** a slug of liquid is pushed round the track by a pulsing pump. It stretches, tears into drops and fuses again; there is no sliding bar.
- **Glow:** only in dark mode. Light mode keeps a faint halo.
- **Reduced motion:** the liquid is shown at rest, with no flow.
- **Tone:** `brand` by default. Use `spectrum` for agent work. Finished and error switch to success and error.
