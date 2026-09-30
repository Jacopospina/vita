---
title: Filtering
summary: Narrowing a collection by attributes. Search + filters + visible applied state + an instant result count.
status: stable
use_when:
  - Collections large enough that users look for subsets (tables, catalogs, logs)
avoid_when:
  - < ~20 items → sorting and scanning are enough
related: [search, data-table, tag, dropdown, ui-shell-right-panel]
---

## Choose the filter surface

| Number of facets | Surface |
|---|---|
| 1–3 frequently used | Inline dropdowns / SelectableTags in the toolbar |
| 4–8 | **Filter popover** from a "Filter (n)" button (Corpus default) |
| 9+ or complex (ranges, dates) | `RightPanel` (lg) with Accordion sections and Apply/Reset |
| Always visible, exploratory (catalogs) | Left filter column (Grid 4 + 12) |

## Anatomy

`[Search] [Filter (2) ▾]` → applied filters as **dismissible outline Tags** + "Clear filters" → result count (`aria-live`) → results.

## Rules

1. **Instant apply** for popovers and inline filters. **Apply button** only in panels where each change is expensive.
2. **Show applied filters** as removable tags, always. The count sits in the trigger label ("Filter (2)").
3. **Result count updates live** ("24 results"). Zero results show the *No results* empty state with "Clear all filters".
4. **Reset pagination** to page 1 on any change.
5. **Persist filters in the URL** so they're shareable and survive a reload.
6. **Facet order:** most used first. Checkbox lists > 6 options get a Search or become a MultiSelect.
