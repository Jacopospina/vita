---
title: Fluid styles
summary: Fluid inputs — fields tile edge to edge with labels inside. For dense expert data entry.
status: stable
import: "import { FluidForm } from \"@/components/corpus/form\""
use_when:
  - Expert users entering lots of structured data (configurations, admin records, bookings)
  - Forms inside dense tools where vertical space is precious
avoid_when:
  - Consumer/first-time flows → default form style (more whitespace, calmer)
  - Mixing with default fields in the same form
related: [form, forms, text-input]
---

## How it works

Wrap standard Corpus inputs in `FluidForm`. Nothing else changes: same props and same validation.

```tsx
<FluidForm columns={2}>
  <TextInput label="Origin" />
  <TextInput label="Destination" />
</FluidForm>
```

- Labels move inside the box (`caption`, muted).
- 1px gaps form a grid.
- The focus outline wraps the whole cell.
- Invalid cells get an error outline, and the message sits inside the cell.

## Rules

1. **All-or-nothing per form.**
2. **Group logically** with 2–3 columns max. Related fields stay on the same row.
3. **Keep helper text short.** Long guidance belongs in a Toggletip in the label.
