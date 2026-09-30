---
title: Forms
summary: How forms are structured end to end — single page vs multi-step, layout, validation, submission and recovery.
status: stable
use_when:
  - Collecting data from the user
avoid_when:
  - Instant settings → Toggle rows
  - Editing one value → inline read-only → edit
related: [form, text-input, fluid-styles, progress-indicator, read-only-states]
---

> [!IMPORTANT] Rule one: forms are one column. People scan top-left down in an F pattern and miss a second column. Only fields that are one data point (first + last name, a range) sit side by side — blended in a `FormRow`.

## Choose the shape

| Fields / phases | Shape |
|---|---|
| 1–5 fields, quick task | Modal (transactional) or inline |
| 6–12 fields | Single page form, grouped with `FormGroup` |
| Distinct phases, > 12 fields, or later answers depend on earlier ones | Multi-step with `ProgressIndicator` + final Review step |
| Editing an existing object | Read-only view → Edit → Save (see *Read-only states*) |
| Expert, dense, repeated | `FluidForm` |

## Layout

- One column, left-aligned, `max-w-xl`.
- Labels above fields.
- `FormRow` only for fields that are one data point — they blend into one container (border and radius on the parent, flat fields inside).
- Section headings (`FormGroup` legend) every 3–6 fields.
- Actions at the end: primary first in page forms, last in modals and panels.

## Validation

1. **Prevent first:** constrain inputs (Select, DatePicker min/max) and explain formats in helper text.
2. **Validate on blur and on submit.** Not on every keystroke.
3. **On submit with errors:**
   - Focus the first invalid field.
   - For forms longer than one screen, show an error summary `InlineNotification` at the top with links to each field.
4. **Error copy tells the fix.**
5. **Keep the user's input.** Never clear a field because it's invalid.

## Submission

- The primary shows `loading`.
- On success, either navigate to the result or show a toast and stay.
- On server error, show an `InlineNotification` at the top, keep all the data, and offer Retry.
- Multi-step: save progress per step; Back never loses data.

## Leaving

Unsaved changes plus navigation away shows ConfirmModal "Discard changes?", with actions "Discard" (danger-ghost) and "Keep editing".
