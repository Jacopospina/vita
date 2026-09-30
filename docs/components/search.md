---
title: Search
summary: Find items in a collection by query. Always labelled, instantly clearable, and scoped to what it searches.
status: stable
import: "import { Search } from \"@/components/corpus/search\""
use_when:
  - Filtering a table/list by text (toolbar variant)
  - Global or page-level search (field variant, lg)
  - Space-constrained headers/toolbars (expandable)
avoid_when:
  - Picking one value from a known list → Combobox
  - Entering a value that will be saved → TextInput
related: [filtering, search-pattern, data-table]
---

## Variants

- **field**: a bordered field, for pages and forms.
- **toolbar**: transparent until hover or focus. Use it inside `DataTable` toolbars and headers.
- **expandable**: an icon button that grows into a field. Use it where space is scarce. It collapses when empty and blurred.

## Corpus opinions

1. **Placeholder states the scope:** "Search shipments", not "Search…".
2. **Filter live** for local data (debounce 150–300ms). Search on Enter for expensive server queries, and say so ("Press Enter to search").
3. **Escape clears; × clears** and returns focus to the field.
4. **Always show the result count** (`aria-live`) and a helpful empty state with a "Clear search" action (see *Empty states*).
5. **Keep the query visible** in the results ("12 results for “acme”").
6. **Search ≠ filter.** Search narrows by free text; filters narrow by attributes. Use both together (see the *Filtering* pattern).
