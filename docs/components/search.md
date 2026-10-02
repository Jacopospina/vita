---
title: Search
summary: Find items in a collection by query. Always labelled, instantly clearable, and scoped to what it searches.
status: stable
import: "import { Search } from \"@/components/vita/search\""
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

## Sizes

- **`sm` (24):** dense toolbars.
- **`md` (28):** the default, and side panels.
- **`lg` (32):** page-level search.

The shortcut hint sits as far from the right edge as from the top and bottom, at every size.

## Rules

1. **Placeholder states the scope:** "Search agents", not "Search…".
2. **Filter live** for local data (debounce 150–300ms). Search on Enter for expensive server queries, and say so ("Press Enter to search").
3. **Keyboard: ⌘F / Ctrl+F focuses, Escape clears and lets go.** Set `shortcut="mod+f"` on the page's main search. × clears with the mouse.
4. **Nothing found is an empty state, everywhere.** Page search, filters, sidebar filters, Combobox and global search all answer an empty result with `EmptyState` (search pictogram, "No results for “…”", a hint, and "Clear" where it helps), never blank space. Show the result count (`aria-live`) when there are results.
5. **Keep the query visible** in the results ("12 results for “support”").
6. **Search ≠ filter.** Search narrows by free text; filters narrow by attributes. Use both together (see the *Filtering* pattern).
