---
title: Content switcher
summary: A segmented control. Switch between alternate presentations of the same content. One segment is always selected.
status: stable
import: "import { ContentSwitcher } from \"@/components/vita/content-switcher\""
use_when:
  - Changing how the same data is shown (List | Grid, Chart | Table)
  - Changing the granularity of one dataset (Day | Week | Month)
  - A mode with 2–5 mutually exclusive, equally weighted options that applies instantly
avoid_when:
  - The panels contain different content → Tabs
  - Picking a size or scale of the same content (48 · 64 · 80) → StepSlider
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

- **Swing to browse.** Press and give a gentle swing left or right: each swing moves exactly one step in that direction and shows its content. To keep going, pause briefly and swing again, or swing the other way. It's a gesture, not a distance, so there's no aiming and no effort.
- **Hold and slide on touch.** Hold a segment for a moment, then slide: the segment under the thumb is the one selected, the pill leaning toward the thumb. Lift to keep it. A tap still selects.
- **Click still works.** A plain click selects one segment, and keyboard arrows move between segments.
