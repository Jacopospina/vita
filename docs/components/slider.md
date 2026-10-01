---
title: Slider
summary: Choose a value or range where relative position matters more than precision. The value is always visible.
status: stable
import: "import { Slider } from \"@/components/corpus/slider\""
use_when:
  - Adjusting a continuous value with immediate feedback (volume, opacity, zoom)
  - Filtering by a numeric range (price, weight) with two thumbs
avoid_when:
  - Exact values matter → NumberInput
  - Few discrete options → RadioGroup / ContentSwitcher
  - The range is huge (0–1,000,000) → NumberInput(s)
related: [number-input, filtering]
---

## Rules

1. **Always show the current value** (top right, `tabular-nums`, formatted with its unit via `formatValue`).
2. **Show the bounds** under the track unless space forbids it.
3. **Live preview:** whatever the slider controls updates while dragging.
4. **Step** matches meaning: €50 steps for prices, 1% for opacity.
5. **Keyboard:** arrows step, PageUp/PageDown step ×10, Home/End jump to the bounds.

## Value

- **Single value lives in the knob.** The eye is already on the knob, so the value never sits elsewhere. Ranges show both values beside the label.
- **Dragging pops it out.** While you drag, the value springs up into a bubble 4px above the knob, and the knob becomes a small circle so your pointer never hides the number. On release it drops back into the knob.
- **Values roll.** Every numeric value, formatted or not (`40%`, `$1,200`), swaps digit by digit with a quick blur, never clipped.
