---
title: Multiselect
summary: Choose several options from a list too long for checkboxes. Chosen options open at the top; the field shows a count and their names.
status: stable
import: "import { MultiSelect } from \"@/components/corpus/dropdown\""
use_when:
  - Several choices from more than ~6 options (markets, tags, assignees)
avoid_when:
  - Up to ~6 options → CheckboxGroup (all visible, one click each)
  - Exactly one choice → Dropdown or Combobox
  - Free-form values → TextInput with tags
related: [dropdown, option, checkbox]
---

## Anatomy

- **Field.** A count tag (with clear-all ×) and the chosen labels, then the chevron.
- **List.** [Options](#/components/option): whole-row targets with a tick in the reserved left slot.

## Rules

1. **Chosen first.** When the list opens, chosen options sit at the top in list order and the rest follow. The order holds while the list is open, so rows never jump as you toggle.
2. **The whole row toggles.** Click, Enter or Space. Never a checkbox inside a row.
3. **Clear all from the field.** The × on the count tag empties the selection without opening the list.
4. **The label steps aside** once something is chosen — the names say what it is; it stays the accessible name.

## Keyboard

- **Arrows** move the highlight; **Home** and **End** jump; **Enter** or **Space** toggles; **Escape** closes.
