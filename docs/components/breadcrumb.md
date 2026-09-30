---
title: Breadcrumb
summary: Shows where the user is in a hierarchy of three or more levels and lets them move up.
status: stable
import: "import { Breadcrumb } from \"@/components/corpus/breadcrumb\""
use_when:
  - Pages nested ≥ 3 levels deep (Workspace / Projects / Q3 forecast)
  - Detail pages reached from a list, where "up" is meaningful
avoid_when:
  - Flat products (≤ 2 levels) → the side nav already tells users where they are
  - Showing history ("back") → browser back / explicit Back button in flows
  - Steps in a process → ProgressIndicator
related: [ui-shell-left-panel, tabs]
---

## Corpus opinions

1. **Place it at the top of `PageHeader`,** above the title. Never in the global header.
2. **The last item is the current page,** in plain text with `aria-current`. It's not a link, and it may be omitted when the page title directly follows.
3. **More than 4 levels:** the middle collapses into "…" (a menu). Keep first and last visible.
4. **Labels match the destination page titles exactly** (same taxonomy terms).
5. **Separator is "/"** at `helper` color, `footnote` size.
