---
title: Search
summary: Global and scoped search, where it lives, how results appear, and how to handle nothing found.
status: stable
use_when:
  - Users know what they're looking for by name/ID
avoid_when:
  - Browsing by attributes → Filtering
related: [search-component, filtering, empty-states, global-header]
---

## Scopes

| Scope | Where | Behavior |
|---|---|---|
| Collection (a table, a list) | Toolbar `Search variant="toolbar"` | Live filter as you type |
| Page | Top of the page, `size="lg"` | Live or on Enter |
| Global (whole product) | Header action → expands or opens a ⌘K command palette | Grouped results by object type + recent searches |

## Results

- Echo the query: "12 results for “support”".
- Scope chips (SelectableTag): All · Agents · Runs · Knowledge.
- Highlight matched text. Show the object type and one line of context.
- Keyboard: ↑↓ through results, Enter opens, Esc clears and closes.

## Rules

1. **Search tolerates the user:** case-insensitive, accent-insensitive, typo-tolerant when possible, and matching IDs with or without prefixes.
2. **No results** follows the *Empty states* pattern: suggest spelling, a broader scope, and "Clear search".
3. **Remember recent searches** for global search (up to 5).
4. **Search is not filtering.** Combine them, don't merge them.
