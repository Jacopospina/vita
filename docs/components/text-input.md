---
title: Text input
summary: Single-line free text (plus TextArea and PasswordInput). Label on top, helper below, errors that explain the fix.
status: stable
import: "import { TextInput, TextArea, PasswordInput } from \"@/components/corpus/text-input\""
use_when:
  - Free text the system can't predict (names, titles, references)
  - Numeric identifiers — phone, postcode, card (inputMode="numeric")
  - Long text — TextArea; secrets — PasswordInput
avoid_when:
  - A known set of answers → RadioGroup / Dropdown / Combobox
  - Quantities → NumberInput
  - Dates → DatePicker
  - Searching a collection → Search
related: [form, number-input, search, forms]
---

## States

| State | Prop | Looks like |
|---|---|---|
| Default | — | `border-field` outline |
| Focus | — | 2px `focus` outline |
| Invalid | `invalid` + `invalidText` | red border, error icon + message (replaces helper) |
| Warning | `warn` + `warnText` | amber icon + message; the value is accepted |
| Read-only | `readOnly` | no border fill, still selectable/copyable |
| Disabled | `disabled` | `layer-1` fill, `disabled-foreground` text |

## Rules

1. **Always a visible label.**
   - Placeholders are examples ("e.g. Q3 forecast"), never labels.
   - `hideLabel` only when the context is visually obvious (a search in a toolbar).
2. **Mark optional fields, not required ones:** add "(optional)" via `optional`. A well-designed form asks mostly required things. If a form has many optional fields, question why they're there.
3. **Width signals expected length.**
   - A postcode field is narrow; a description is wide.
   - Never stretch every field to 100% of a wide page. Forms cap at `max-w-xl`.
4. **Validate on blur and on submit,** never on each keystroke. Exception: character counters and password rules.
5. **Error text = how to fix it:** "Enter an email address like name@company.com", not "Invalid email".
6. **Helper text** gives format and constraints *before* the user errs.
7. **Autocomplete attributes** are mandatory for personal data (`email`, `given-name`, `current-password`).
8. **`showCount`** only when there's a real limit the user may hit.

## Sizes

`sm` (dense tables/filters) · `md` default · `lg` (login, mobile).
