---
title: List
summary: Typographic lists inside content, bullets and numbered steps. Not interactive.
status: stable
import: "import { UnorderedList, OrderedList, ListItem } from \"@/components/vita/list\""
use_when:
  - Unordered, sets of related points in content
  - Ordered, sequential instructions where order matters
avoid_when:
  - Interactive rows → ContainedList
  - Records → DataTable / StructuredList
related: [contained-list, structured-list]
---

## Rules

1. **Parallel grammar:** every item starts the same way (all verbs, or all nouns).
2. **One nesting level max.** Deeper structure belongs in headings.
3. **Ordered lists** only when order matters (steps). Otherwise use bullets.
4. **No punctuation** at the end of fragment items; full sentences get periods.
