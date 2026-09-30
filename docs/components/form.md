---
title: Form
summary: The structural pieces of every form. Form, FormGroup, FormRow, FormActions, FluidForm and the FieldShell wiring every input uses.
status: stable
import: "import { Form, FormGroup, FormRow, FormActions, FluidForm, Label, FieldShell } from \"@/components/corpus/form\""
use_when:
  - Any time the user enters data that is submitted together
avoid_when:
  - Single instant settings → Toggle rows, no form wrapper needed
  - Inline edits of one value → read-only-states pattern (view → edit)
related: [forms, text-input, fluid-styles, read-only-states]
---

## Pieces

- **Form**: a vertical stack with 24px between fields, capped at `max-w-xl`, `noValidate` (Corpus validates, not the browser).
- **FormGroup**: a `fieldset` + `legend` for related fields (address, notification preferences).
- **FormRow**: fields that belong on one line (first/last name, city/postcode). It collapses on mobile.
- **FormActions**: the submit row at the end. The primary comes first visually in left-aligned page forms (reading order) and last in modals (`align="end"`).
- **FluidForm**: The fluid style for dense expert entry (see the *Fluid styles* pattern).
- **FieldShell**: the label → control → helper/validation wrapper. Use it only to build a new Corpus input upstream, never in product code.

## Rules

1. **One column.**
   - Multi-column forms slow people down: eyes zig-zag and fields get skipped.
   - The only exception is `FormRow` for fields that are semantically one unit.
2. **Order fields as the user thinks,** not as the database stores them.
3. **Ask less.** Every field must justify itself. Defer what can be asked later.
4. **Validation:**
   - Validate on blur and on submit.
   - On submit with errors, focus the first invalid field.
   - For long forms, also show an `InlineNotification` summary at the top listing the errors.
5. **Don't disable the submit button** to signal invalid state. Let users submit and show what to fix.
6. **Submit label = outcome:** "Create workspace", "Deploy agent". The secondary is "Cancel" (ghost or secondary).
7. **Long forms:**
   - Split them with `FormGroup` headings.
   - Beyond ~12 fields or distinct phases, use a multi-step flow (see the *Forms* pattern).
