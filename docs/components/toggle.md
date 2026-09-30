---
title: Toggle
summary: A switch for binary settings that take effect immediately. The rule: no Save button after a toggle.
status: stable
import: "import { Toggle } from \"@/components/corpus/toggle\""
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
4. **"On" is green** (`success`) in Corpus. Don't recolor it with the brand.
5. **Dangerous toggles** (disable security, delete data on schedule) need a confirmation. Consider a Button instead.
