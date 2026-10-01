---
title: Dropdown
summary: Custom listbox for choosing values. Dropdown (one), Combobox (one, filterable) and MultiSelect (many).
status: stable
import: "import { Dropdown, Combobox, MultiSelect } from \"@/components/corpus/dropdown\""
use_when:
  - Dropdown — one of 7–20 options, options need descriptions/icons, or consistent styling in app chrome
  - Combobox — one of 20+ options where users know what to type (tool, country, team member)
  - MultiSelect — several of more than 6 options (markets, tags, assignees)
  - Inline type — compact "Sort by: Newest ▾" in toolbars
avoid_when:
  - 2–6 options → RadioGroup (or ContentSwitcher for views)
  - Actions → Menu / MenuButton (dropdowns choose values; menus do things)
  - Options written inline as children → Select (same control)
related: [select, radio-button, checkbox, menu, filtering]
---

## Variants

| | Use |
|---|---|
| `Dropdown` default | Field in forms/panels, with label, helper and validation |
| `Dropdown type="inline"` | Borderless, inside toolbars and sentences ("Sort by ▾") |
| `Combobox` | Type-to-filter, keyboard-first, clearable |
| `MultiSelect` | Whole-row options with ticks, chosen ones first; the trigger shows a count tag plus selected labels; clear-all ✕. See [Multiselect](#/components/multiselect). |

## Rules

1. **Values, not actions.** If selecting an item triggers something immediately, it's a Menu.
2. **Descriptions** earn their space only when options are hard to tell apart ("High — Handle today").
3. **Combobox shows "No results"** rather than an empty list, and never auto-selects on blur.
4. **MultiSelect** hides its own label once something is selected (the chips say what it is; the label is still announced). It closes only on outside click or Escape. Each toggle applies immediately inside the popover. Show the selection as removable tags below the field when it matters to see it (filters).
5. **Selected item** is marked with a checkmark on the right, not by color only.

## Label

- **Opening doesn't float the label.** Clicking a dropdown opens its list, not a text cursor, so the label stays full-size inside the field.
- **Choosing does.** Once a value is selected, the label floats up and shrinks, like every other field. This is the one exception to "float on focus", and it applies to Dropdown, Select and MultiSelect.
