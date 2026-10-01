---
title: Data table
summary: View, compare, sort, select and act on many uniform records. The workhorse of product UI.
status: stable
import: "import { DataTable, type DataTableColumn } from \"@/components/corpus/data-table\""
use_when:
  - Many records with the same attributes (> ~5 rows or any sorting/selecting need)
  - Users compare values across rows or act on several rows at once
avoid_when:
  - Few rows of key/value details → StructuredList
  - Heterogeneous items with one action each → ContainedList
  - Visual browsing → Tile grid
  - One column → it's a list
related: [pagination, structured-list, contained-list, filtering, search, empty-states, loading]
---

## Anatomy (top → bottom)

1. **Title + description** (optional when `PageHeader` already names it).
2. **Toolbar:** Search (toolbar variant) · filter · settings · **primary action** (right).
   - **Search fills the remaining width,** so it is always a short move from wherever the pointer is. Never a narrow box pinned far left. Pass `Search` directly; the toolbar stretches it.
3. **One inset.** The toolbar strip and the table sit 10px in from the card's edge in every state, and the header row is a rounded band.
4. **The strip is sticky.** Toolbar and selection bar stay pinned at the top of the scroll area, so search and batch actions are always in reach.
5. **The toolbar morphs into the selection bar.** One inset strip: when rows are selected its surface turns primary and the search/actions blur out as the count, batch actions and × (Esc) blur in — same place, nothing hidden behind anything.
6. **Header row:** sortable columns show an arrow on hover and the direction when active.
7. **Rows:** optional expand chevron · selection checkbox · cells · row overflow menu.
8. **Pagination.**

## Sizes (row height)

- `xs` (24): dense monitoring views.
- `sm` (28): power users.
- `md` (32).
- `lg` (40).
- `xl` (44): the default.

Rows are rounded bands with the same inset radius as the header row; dividers run between them.

All follow density.

## Rules

1. **The first column identifies the row** (name, reference) in `foreground`. Other cells use `muted-foreground`.
2. **Alignment:**
   - Text left.
   - Numbers and currency right, with `tabular-nums`.
   - Status uses `StatusIndicator` or `Tag`, never color-only text.
3. **Sort cycles** asc → desc → none. Sort by what users compare (date, value, status), not by every column.
4. **Selection is for batch actions only.** If there are no batch actions, don't make rows selectable.
5. **Row click** opens the detail page only if every row has one. Otherwise put actions in the overflow menu.
6. **Loading = skeleton rows**, never a loader over a blank table.
7. **Empty = EmptyState** inside the table body, with the right message: first-use vs no-results.
8. **Up to 2 inline row actions;** the rest go in the `OverflowMenu`.
9. **Horizontal scroll** is acceptable for wide data. Wrapping cells is not (cells don't wrap by default).
10. **Zebra striping** only for very wide tables where the eye loses the row.
