---
title: Radio button
summary: Exactly one choice from 2–6 visible options. Showing all options makes decisions faster.
status: stable
import: "import { RadioGroup, RadioButton } from \"@/components/corpus/radio-button\""
use_when:
  - One choice from 2–6 options the user should compare
  - Options need helper text explaining consequences (price, speed)
avoid_when:
  - More than 6 options → Dropdown / Select
  - Rich visual options → SelectableTile (single)
  - Switching a view instantly → ContentSwitcher
  - On/off → Toggle / Checkbox
related: [checkbox, dropdown, tile, content-switcher]
---

## Corpus opinions

1. **Preselect the recommended or most common option** unless choosing is the point, for example when a neutral choice matters legally.
2. **Order logically:** by magnitude (slow → fast, cheap → expensive) or by likelihood.
3. **Helper text per option** for consequences ("Next working day · €12").
4. **Vertical by default.** Horizontal only for 2–3 very short labels (Yes/No, Metric/Imperial).
5. **A disabled option explains itself** in its helper text ("Not available in your area").
