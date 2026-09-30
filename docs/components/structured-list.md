---
title: Structured list
summary: A small, read-mostly set of rows and columns — details, specs and comparisons. Selectable when choosing one row.
status: stable
import: "import { StructuredList } from \"@/components/corpus/structured-list\""
use_when:
  - Key/value details of one object (condensed + flush)
  - Comparing a few options across attributes (plans, carriers)
  - Choosing one of a few rows with multiple attributes (selectable)
avoid_when:
  - Many rows, sorting, pagination, bulk actions → DataTable
  - Items with individual actions → ContainedList
related: [data-table, contained-list, read-only-states, radio-button]
---

## Corpus opinions

1. **≤ ~10 rows.** Beyond that it's a data table.
2. **First column = the label** (`foreground`, medium); the others are values (`muted-foreground`).
3. **Selectable** behaves like a radio group: the whole row is the hit target and a check marks the selected row.
4. **Use `flush`** when the list sits in running content, so its text aligns with the surrounding paragraphs.
