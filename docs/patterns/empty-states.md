---
title: Empty states
summary: Every region that can be empty has a designed empty state — first use, no results, or error — each with a next step.
status: stable
import: "import { EmptyState } from \"@/components/corpus/empty-state\""
use_when:
  - A table, list, dashboard widget or page has nothing to show
avoid_when:
  - Showing a blank area or a lonely "No data"
related: [data-table, search, filtering, loading]
---

## Three kinds

| Kind | Title | Description | Action | Pictogram tone |
|---|---|---|---|---|
| **First use** | What to create ("Create your first agent") | The value + effort ("Describe what it should do, connect your tools and deploy. It takes about five minutes.") | Primary: create. Optional secondary: import, learn more | brand |
| **No results** | "No results for “{query}”" / "No agents match these filters" | How to broaden ("Check the spelling or search by agent ID") | Tertiary: "Clear search" / "Clear all filters" | neutral |
| **Error** | What failed ("We couldn't load agents") | Reassure + cause if known ("The connection timed out. Your data is safe.") | Tertiary: "Try again" | neutral |

Sometimes empty is a success ("All caught up"). Say so positively and offer no action.

## Sizes

- `sm`: inside tables and panels.
- `md`: a page region.
- `lg`: a whole page, first-use.

## Rules

1. **Never blame the user** and never show raw error codes as the title.
2. **One action,** plus an optional secondary. No action for success-empty states.
3. **Keep the chrome.** Show the table header and toolbar even when empty, so the user understands the space.
4. **Permissions empty** ("You don't have access") says who to ask.
