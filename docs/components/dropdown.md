---
title: Dropdown
summary: Choosing values from a list — Dropdown (one), Combobox (one, filterable) and Multiselect (many), all built from the same Option rows.
status: stable
import: "import { Dropdown, Combobox, MultiSelect } from \"@/components/corpus/dropdown\""
use_when:
  - Dropdown — one of 7–20 options, options need descriptions/icons, or consistent styling in app chrome
  - Combobox — one of 20+ options where users know what to type (tool, country, team member)
  - Multiselect — several of more than 6 options (markets, tags, assignees)
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
| `Dropdown` default | Field in forms and panels, with label, helper and validation |
| `Dropdown type="inline"` | Borderless, inside toolbars and sentences ("Sort by ▾") |
| `Combobox` | Type-to-filter, keyboard-first, clearable |
| `MultiSelect` | Several choices; chosen options open first; the field shows a count tag plus the chosen labels, with clear-all × |

## Option — the row inside every list

`[tick slot — Multiselect only] [icon?] Label / description? ········ [meta?] [symbol?]`

- **One choice: a selected row.** Dropdown, Combobox and Select show the chosen option as a selected row (soft selected fill, medium weight) — no tick, since only one can be on.
- **Several choices: ticks.** Multiselect reserves a 16px slot on the left; ticks draw in and out without moving labels.
- **Leading icon** (`icon`). Muted, before the label — only when every option has one.
- **Meta** (`meta`). A small label on the right: "Default", "Recommended", a count.
- **Trailing symbol** (`trailingIcon`). A symbol on the right — alone, or after the meta.
- **Description.** One caption line under the label, only when options are hard to tell apart.
- **States.** Default · highlighted (accent row, everything inverts) · selected (selected row, or a tick in Multiselect) · disabled.
- **Static use.** `Option` and `OptionList` render the same rows outside a dropdown.

## Rules

1. **Values, not actions.** If choosing an item triggers something immediately, it's a Menu.
2. **The whole row is the target.** Click, Enter or Space; never a checkbox or radio inside a row.
3. **Selection never relies on colour alone.** One choice: fill plus medium weight. Several: a tick in the reserved left slot.
4. **Combobox shows "No results"** rather than an empty list, and never auto-selects on blur.
5. **Multiselect opens with what's chosen first**, in list order; the order holds while it's open so rows never jump. It closes on outside click or Escape; each toggle applies immediately.
6. **Multiselect hides its own label** once something is chosen (the names say what it is; the label is still announced).

## Label

- **Opening doesn't float the label.** Clicking a dropdown opens its list, not a text cursor, so the label stays full-size inside the field.
- **Choosing does.** Once a value is selected, the label floats up and shrinks, like every other field. This is the one exception to "float on focus", and it applies to Dropdown, Select and MultiSelect.

## Keyboard

- **Arrows** move the highlight; **Home** and **End** jump; **Enter** or **Space** chooses; **Escape** closes.
- **Roles.** Rows are `option` with `aria-selected`; lists are `listbox` (`aria-multiselectable` for Multiselect).
