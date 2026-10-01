---
title: Form
summary: The structural pieces of every form. Form, FormGroup, FormRow, FormActions, FluidForm and the FieldShell wiring every input uses.
status: stable
import: "import { Form, FormGroup, FormRow, FormActions, FluidForm, Label, FieldShell } from \"@/components/vita/form\""
use_when:
  - Any time the user enters data that is submitted together
avoid_when:
  - Single instant settings → Toggle rows, no form wrapper needed
  - Inline edits of one value → read-only-states pattern (view → edit)
related: [forms, text-input, fluid-styles, read-only-states]
---

## Pieces

- **Form**: a vertical stack with 24px between fields, capped at `max-w-xl`, `noValidate` (Vita validates, not the browser).
- **FormGroup**: a `fieldset` + `legend` for related fields (address, notification preferences).
- **FormRow**: the only way to place fields side by side, and only when they are ONE data point (first + last name, expiry month + year, a range). The pair blends: one container owns border, radius and background; the fields inside are flat, labels inside, a hairline between.
- **FormActions**: the submit row at the end. Joined, zero gap; primary first in page forms (reading order).
- **FluidForm**: dense expert entry, every field blended into one tall container (see *Fluid styles*). One column only, the `columns` prop was removed (breaking change in 0.2).
- **FieldShell**: the label → control → helper/validation wrapper. Use it only to build a new Vita input upstream, never in product code.

## Anatomy of a field

- **Floating label, inside.** The label rests inside the field; on focus or once filled it glides straight up and shrinks, still inside. Never above the field.
- **Required by default.** Fields are announced as required; mark exceptions with `optional`.
- **Placeholder = example or format.** Shown only while focused ("e.g. Support triage", "dd/mm/yyyy").
- **Help below.** Helper text, warnings and errors live under the field and enter/exit with choreography.

## Rules

1. **One column, always.** People scan forms top-left down in an F pattern; a second column gets skipped. The only exception is a blended `FormRow` for fields that are one data point.
2. **Order fields as the user thinks,** not as the database stores them.
3. **Ask less.** Every field must justify itself. Defer what can be asked later.
4. **Validation:**
   - Validate on blur and on submit.
   - On submit with errors, focus the first invalid field.
   - For long forms, also show an `InlineNotification` summary at the top listing the errors.
5. **Don't disable the submit button** to signal invalid state. Let users submit and show what to fix.
6. **Submit label = outcome:** "Create workspace", "Deploy agent", bound to ⌘S. No Cancel: leaving is navigation, × or Esc.
7. **Long forms:**
   - Split them with `FormGroup` headings.
   - Beyond ~12 fields or distinct phases, use a multi-step flow (see the *Forms* pattern).
