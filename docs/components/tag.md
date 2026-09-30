---
title: Tag
summary: Short labels that categorise, show status in dense rows, or represent applied filters.
status: stable
import: "import { Tag, SelectableTag, OperationalTag } from \"@/components/corpus/tag\""
use_when:
  - Read-only — categories/metadata on items (region, type)
  - Status in dense table rows (with icon)
  - Dismissible — applied filters / chosen values the user can remove
  - Selectable — quick filter chips (toggle on/off)
  - Operational — "+3" that reveals more in a popover
avoid_when:
  - Actions → Button
  - Status on detail pages or with more nuance → StatusIndicator
  - Long text (> 3 words) → it's not a tag
related: [status-indicators, filtering, dropdown]
---

## Tones

- `neutral`: categories.
- `brand`: highlighted category.
- `success`, `warning`, `error`, `info`: status only.
- `outline`: filters.
- `inverse`: counts and selected chips.

## Corpus opinions

1. **Status tags include an icon.** Color is never the only signal.
2. **One tone per meaning, product-wide.** The status → tone map belongs in the taxonomy.
3. **Don't make read-only tags look clickable.** No hover state, no pointer.
4. **Dismissible tags** name what's removed in their accessible label ("Remove Road").
5. **Max ~3 tags per row;** the rest collapse into an `OperationalTag` "+N".
