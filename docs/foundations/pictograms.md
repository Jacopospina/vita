---
title: Pictograms
summary: Large pictograms for empty states, onboarding and feature tiles. Never as controls.
status: stable
import: "import { Pictogram } from \"@/components/vita/pictogram\"\nimport { Rocket } from \"@/components/vita/pictograms\""
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
3. **It shows what's happening, without words.** Pick the pictogram that depicts BOTH the title and the subtitle: someone who glances at it, before reading, already knows the situation. "No agents match these filters, try fewer" is a magnifier over an empty result, not a generic robot; "Connect a source to start" is a plug, not a folder.
4. **Test it with the text covered.** Hide the title and subtitle and ask what the pictogram says. If the answer isn't the message, choose another one.
5. **Decorative by default.** Pass `label` only if the pictogram conveys information not present in the text.
6. **Don't mix illustration styles.** Only pictograms exported from `@/components/vita/pictograms` are allowed.
