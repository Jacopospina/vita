---
title: Content switcher
summary: A segmented control. Switch between alternate presentations of the same content. One segment is always selected.
status: stable
import: "import { ContentSwitcher } from \"@/components/corpus/content-switcher\""
use_when:
  - Changing how the same data is shown (List | Grid, Chart | Table)
  - Changing the granularity of one dataset (Day | Week | Month)
  - A mode with 2–5 mutually exclusive, equally weighted options that applies instantly
avoid_when:
  - The panels contain different content → Tabs
  - It's a form value submitted later → RadioGroup
  - More than 5 options → Dropdown
  - Binary on/off → Toggle
related: [tabs, radio-button, toggle]
---

## Variants

- **Text** (default): short labels, ≤ 2 words each, roughly equal length.
- **Icon-only** (`iconOnly`): only for universally understood glyphs (list/grid). Each item still has a label, which becomes the tooltip and accessible name.
- **Sizes:** `sm` / `md` / `lg`, matching adjacent controls.

## Rules

1. **Changes apply instantly** with a subtle fade. No "Apply" button.
2. **The selected segment is a raised pill** on a `layer-2` track. Don't restyle it as a tab.
3. **Remember the choice** per user where it's a view preference.
4. **Place it above the content it controls,** right-aligned in toolbars and left-aligned under headings.

## Hold and drag

- **Browse without aiming.** Press and just hint a direction. Every 20px or so of sideways movement snaps to the next or previous segment, and the content changes live. The selection leans with your pointer, so movement and position always agree. Release to keep the one you're on.
- **Click still works.** A plain click selects one segment, and keyboard arrows move between segments.
