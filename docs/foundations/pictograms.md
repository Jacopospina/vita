---
title: Pictograms
summary: Large pictograms for empty states, onboarding and feature tiles. Never as controls.
status: stable
import: "import { Pictogram } from \"@/components/corpus/pictogram\"\nimport { Rocket } from \"@/components/corpus/pictograms\""
use_when:
  - Empty states (first use, no results, error)
  - Onboarding and feature explanations
  - Large clickable tiles that introduce a product area
avoid_when:
  - Buttons, navigation, table cells, anything under 48px → Icon
  - Decorating every section of a page → one pictogram per view at most
---

## Sizes

- `md`: 48px, inside tables and panels (`EmptyState size="sm"`).
- `lg`: 64px, the default.
- `xl`: 80px, full-page first-use.

## Rules

1. **One pictogram per view.** Pictograms are punctuation, not wallpaper.
2. **Tone:**
   - `brand` for positive moments: onboarding, first use.
   - `neutral` for no-results and errors. Don't make an error feel celebratory.
3. **Meaning over decoration.** The pictogram illustrates the concept of the empty region (`Report` for an empty report list, `Magnify` for no results).
4. **Decorative by default.** Pass `label` only if the pictogram conveys information not present in the text.
5. **Don't mix illustration styles.** Only pictograms exported from `@/components/corpus/pictograms` are allowed.
