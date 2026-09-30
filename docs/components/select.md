---
title: Select
summary: The native select. Fast, familiar, excellent on mobile, and the right choice for long plain-text lists in forms.
status: stable
import: "import { Select, SelectOption, SelectGroup } from \"@/components/corpus/select\""
use_when:
  - Picking one plain-text option from 7+ in a form (country, currency, timezone)
  - Mobile-heavy flows (native pickers are best-in-class)
  - Grouped options (optgroup)
avoid_when:
  - 2–6 options → RadioGroup (show them)
  - Options need icons, descriptions or custom rendering → Dropdown
  - Very long lists where users type → Combobox
  - Multiple selection → MultiSelect / CheckboxGroup
related: [dropdown, radio-button]
---

## Select vs Dropdown

| | Select (native) | Dropdown (custom) |
|---|---|---|
| Rich options (icon, description) | ✗ | ✓ |
| Mobile experience | Best | Good |
| Long lists | Good (OS typeahead) | OK (use Combobox beyond 20) |
| Works without JS | ✓ | ✗ |
| Visual consistency across OS | ✗ | ✓ |

**Corpus default:** Select in forms, Dropdown in app chrome and toolbars.

## Rules

1. **Placeholder "Choose a …"** only when there's no sensible default. If there is one (the user's country, the most common option), preselect it.
2. **Order options** by frequency (top 3 first, then a separator group), alphabetically, or by natural order (sizes, dates). Never randomly.
3. **Never use Select for navigation** ("Jump to page…").
