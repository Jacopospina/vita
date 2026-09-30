---
title: Contained list
summary: A titled list of similar items, each a row with an optional action.
status: stable
import: "import { ContainedList, ContainedListItem } from \"@/components/corpus/contained-list\""
use_when:
  - Members, connected apps, recent files, settings groups
  - Rows that each open something or have one trailing action
  - Lists inside panels and popovers (kind="disclosed")
avoid_when:
  - Multi-attribute records to sort/compare → DataTable
  - Plain bullet points → List
  - Hierarchies → TreeView
related: [data-table, list, structured-list]
---

## Rules

1. **The label is a heading** (`headline`), with the list-level action on the right ("Add member", Search).
2. **Rows are either clickable** (`onClick`, the whole row) **or carry a trailing action** (`action`). Never both, because two hit targets per row confuse.
3. **Leading icon or avatar** only when it helps recognition. It's all rows or none.
4. **Long lists** get a Search in the header action slot.
