---
title: Swatch picker
summary: Choose one colour from a small set of circles. Every option is visible, so people pick the colour they recognise instead of dialling one in.
status: experimental
import: "import { SwatchPicker } from \"@/components/vita/swatch-picker\""
use_when:
  - A colour from a small, curated set (brand colour, a label or tag colour, a theme tint)
  - Settings and theme editors
avoid_when:
  - A precise or continuous colour (any hue, a hex value) → Slider or TextInput
  - More than about 14 colours → Dropdown with a colour icon per option
  - Choosing anything that isn't a colour → RadioGroup / ContentSwitcher
related: [radio-button, content-switcher, theming]
---

## Anatomy

- **Label and name.** The label sits above the circles, followed by the chosen colour's name ("Brand colour · Blue"); the name changes letter by letter.
- **Circles.** One per colour, with a faint hairline so pale colours hold their edge on any surface.
- **Ring.** A ring eases onto the chosen circle while the colour inside steps back a little; hovering shows a softer ring.

## Rules

1. **One row, one diameter.** Every circle is the same size (24px small, 32px medium) and they never wrap; keep a set to what fits its row (about 13 small circles in a 400px panel).
2. **Name every colour.** Each circle's name is its tooltip and its accessible name; colour is never the only signal.
3. **Use tokens for the colours** (`var(--vita-palette-blue-500)`); a raw value needs an approved exception.

## Accessibility

- **A radio group.** Arrows move and choose, Tab enters and leaves the group, and the label names it.
- **Targets.** Every circle carries a 44px touch area (`tap`), whatever its drawn size.
