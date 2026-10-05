---
title: Selection highlight
summary: How selected text looks in Vita, rounded rows in the primary's tint that melt into each other where lines meet, drawn from the first frame of the drag.
status: experimental
import: "import { SelectionHighlight } from \"@/components/vita/selection-highlight\""
use_when:
  - Once, at the app root, so every selection in the product looks the same
avoid_when:
  - Marking text that isn't selected (search matches, mentions) → a Tag or a styled span
related: [selection-toolbar, text]
---

> [!IMPORTANT] Mount it once at the app root. It draws every selection on the page; nothing else needs to change.

## How it looks

- **Rows, not boxes.** One rounded row per line, cut exactly to the selected text, no side padding.
- **Rows that blend.** Where one line's row meets the next, they melt into a soft inner curve instead of a step.
- **A tint over the words.** The primary at low opacity, so the text stays crisp and readable through it.

## Rules

1. **It is the selection.** No transition and no animation: it appears, follows the drag and clears exactly with it.
2. **Only what people see.** Hidden copies (a screen reader's text) and clipped text never add a row.
3. **Fields keep the browser's.** Text selected inside an input or a text area shows the browser's highlight: its boxes can't be measured.
4. **One per app.** Mounted twice, it would draw twice; the Selection toolbar draws only the words asked about while its Ask AI panel has focus.

## Accessibility

- **Nothing changes for assistive tech.** The drawing is hidden from screen readers; the real selection, copy and paste work as always.
- **Contrast holds.** The tint sits under text-colour words at low opacity in light and dark.
