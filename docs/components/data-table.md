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
3. **The toolbar morphs into the selection bar.** One inset strip: when rows are selected its surface turns primary and the search/actions blur out as the count, batch actions and × (Esc) blur in — same place, nothing hidden behind anything.
4. **Header row:** sortable columns show an arrow on hover and the direction when active.
5. **Rows:** optional expand chevron · selection checkbox · cells · row overflow menu.
6. **Pagination.**

## Sizes (row height)

- `xs` (24): dense monitoring views.
- `sm` (32): power users.
- `md` (40).
- `lg` (48): the default.
- `xl` (64): rows with two lines of text.

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
