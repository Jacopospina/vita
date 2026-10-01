---
title: Checkbox
summary: Independent choices that take effect on submit, and multi-selection from a short list.
status: stable
import: "import { Checkbox, CheckboxGroup } from \"@/components/vita/checkbox\""
use_when:
  - Selecting any number of options from ≤ 6 (CheckboxGroup)
  - A single opt-in inside a form (agree to terms, subscribe)
  - Selecting rows in a table (handled by DataTable)
avoid_when:
  - The change applies immediately → Toggle
  - Exactly one choice → RadioGroup
  - More than ~6 options → MultiSelect
related: [toggle, radio-button, form]
---

## States

Unchecked · checked · indeterminate (a parent of a partially selected group) · invalid · disabled.

## Rules

1. **Labels are positive statements:** "Email me updates", not "Don't email me".
2. **Group with a legend** (`CheckboxGroup legend`) that asks the question. Vertical by default; horizontal only for 2–3 short options.
3. **The label is clickable** (it's a `<label>`), and so is the whole hit area.
4. **Indeterminate** only for "select all" parents.
5. **Required single checkbox** (terms): validate on submit with a group-level error. Don't disable the submit button.
