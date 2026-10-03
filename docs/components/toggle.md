---
title: Toggle
summary: A switch for binary settings that take effect immediately. The rule: no Save button after a toggle.
status: stable
import: "import { Toggle } from \"@/components/vita/toggle\""
use_when:
  - Turning a feature or preference on/off with immediate effect (settings pages, panels)
avoid_when:
  - The change applies on form submit → Checkbox
  - More than two states → RadioGroup / ContentSwitcher
  - Selecting items in a list → Checkbox
related: [checkbox, content-switcher, forms]
---

## Rules

1. **Immediate effect.** Persist on change, and show `InlineLoading` if saving takes more than 300ms. Revert with an error if it fails.
2. **Label names the setting** as a noun or noun phrase ("Email notifications"). The switch shows the state. Add `stateText` (On/Off) when the label alone is ambiguous.
3. **Label on the left, switch on the right** in settings lists. `labelPosition="end"` for inline use.
4. **"On" is green** (`success`) in Vita. Don't recolor it with the brand.
5. **Dangerous toggles** (disable security, delete data on schedule) need a confirmation. Consider a Button instead.

## Choreography

- **Shape.** A slim rectangular squircle knob (12 × 20) inside a squircle track. The radii are concentric: the knob's radius is the track's radius minus the padding.
- **Press.** The knob stretches toward the side it will travel to.
- **Release.** It springs across and back to its resting width, and the track colour follows.
- **Hold and drag.** Keep the finger (or mouse) down and move: the knob follows across the track, and on release it lands on the side it was left nearest to, like a phone's switch. A short move springs it back. Tap and keyboard flip it as before.
