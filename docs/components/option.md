---
title: Option
summary: The list item inside every dropdown list — one row anatomy for Dropdown, Select, Combobox and MultiSelect.
status: stable
import: "import { Option, OptionList } from \"@/components/corpus/option\""
use_when:
  - Rows of choices inside a dropdown list (one or several)
  - A static, in-page list of choices that should look like a dropdown list
avoid_when:
  - Actions (verbs) → Menu items
  - Navigation rows → ListItem
  - A few always-visible choices → RadioGroup or CheckboxGroup
related: [dropdown, select, list-item, menu]
---

## Anatomy

`[tick slot] [icon?] Label / description?`

- **Tick slot.** A reserved 16px slot on the left. The tick draws in when the option is chosen and out when it isn't; the label never moves.
- **Icon (optional).** Muted, before the label. Use it only when every option has one.
- **Label and description.** One line of label; an optional caption below in `helper`.

## States

| State | Look |
|---|---|
| Default | Plain row |
| Highlighted | Primary accent row; text, tick and caption invert |
| Selected | Tick drawn in the left slot |
| Selected + highlighted | Accent row with a white tick |
| Disabled | `disabled-foreground` text, not interactive |

## Rules

1. **The whole row is the target.** Clicking anywhere on it, or Enter or Space, chooses it. Never put a checkbox or radio inside an option.
2. **Multiple selection uses ticks too.** Several ticks can show at once; the list says `aria-multiselectable`.
3. **Keyboard.** Arrow keys move the highlight, Home and End jump, Enter or Space chooses. The highlight follows the pointer too.
4. **Short labels.** One line; put detail in the description, not the label.

## Accessibility

- **Roles.** Each row is `role="option"` with `aria-selected`; the list is `role="listbox"`.
- **Disabled options** stay in the list with `aria-disabled`, so the set is predictable.
