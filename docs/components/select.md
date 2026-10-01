---
title: Select
summary: Pick one value, written with SelectOption/SelectGroup children. The same Vita listbox as Dropdown, never the operating system's menu.
status: stable
import: "import { Select, SelectOption, SelectGroup } from \"@/components/vita/select\""
use_when:
  - One value from a list you write inline (a handful of known options, grouped options)
  - Forms where the options live in the markup rather than in data
avoid_when:
  - Options come from data → Dropdown (items prop)
  - 2–6 options → RadioGroup (show them)
  - Users need to type to find → Combobox
  - Several values → MultiSelect / CheckboxGroup
related: [dropdown, radio-button, combobox]
---

> [!IMPORTANT] Vita never uses the operating system's dropdown. Every picker is the Vita listbox: floating label, drawn checkmark, choreography, same look on every platform.

## Select or Dropdown?

| | Select | Dropdown |
|---|---|---|
| Options defined as | `<SelectOption>` children | `items` array |
| Descriptions per option |, | ✓ |
| Groups | `<SelectGroup label>` |, |
| Look and behaviour | identical | identical |

## Rules

1. **Preselect a sensible default** when there is one; otherwise the floating label reads the question.
2. **Order options** by frequency, alphabetically or by natural order, never randomly.
3. **Never for navigation** ("Jump to page…").
