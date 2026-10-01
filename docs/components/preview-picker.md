---
title: Preview picker
summary: Choose one option by seeing what it does. Each option is a small tile that shows its effect, so nobody has to translate a number into a feeling.
status: experimental
import: "import { PreviewPicker } from \"@/components/vita/preview-picker\""
use_when:
  - Settings whose result is visual (a corner radius, a density, a text size, a speed)
  - Theme and appearance editors
avoid_when:
  - Colours → SwatchPicker
  - Options that are words, not effects → ContentSwitcher / RadioGroup
  - A precise value nobody needs to see first → NumberInput
related: [swatch-picker, content-switcher, radio-button]
---

## Anatomy

- **Label and name.** The label sits above the tiles, followed by the chosen option's name; the name changes letter by letter.
- **Tiles.** One row, equal widths. Each tile draws its own effect: a corner at that radius, lines at that spacing, "Aa" at that size, a dot moving at that speed.
- **Selection.** A ring eases onto the chosen tile's preview and its name turns to the foreground colour.

## Rules

1. **Form follows function.** The preview must BE the effect, drawn at that value, not an icon that stands for it.
2. **Name every option.** Short names under the tiles ("Compact", "Default", "Roomy"); the default option is called Default.
3. **Two to five options.** More than five stop fitting one row and stop being comparable at a glance.

## Accessibility

- **A radio group.** Arrows move and choose, Tab enters and leaves; each tile is named by its label.
