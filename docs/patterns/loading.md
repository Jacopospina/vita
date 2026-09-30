---
title: Loading
summary: Orchestrating loading across a page — progressive, region by region, without layout shift and without loaders everywhere.
status: stable
use_when:
  - Any view that fetches data
avoid_when:
  - Blocking the whole page for partial data
related: [loading, inline-loading, progress-bar, empty-states]
---

## The timeline

| Elapsed | Show |
|---|---|
| 0–300ms | Nothing (keep the previous content if navigating) |
| 300ms–2s | Skeletons in the regions that are loading; `Thinking` for regions without a known layout |
| 2–10s | Skeleton + a short status line if it's unusual ("Crunching 12 months of data…") |
| > 10s or measurable | `ProgressBar` with time remaining; let the user leave and notify on completion |

## Rules

1. **Shell first:** header, nav and page header render immediately. Only data regions skeleton.
2. **Regions load independently.** One slow widget doesn't block the page.
3. **Skeletons match the final layout exactly.** No layout shift when content arrives.
4. **Actions:** `Button loading` for submits, `InlineLoading` for background saves, optimistic UI for toggles (revert on error).
5. **Errors replace the skeleton** with an error `EmptyState` ("Try again") in that region only.
6. **Refreshing existing content** keeps the content visible with a subtle `InlineLoading` in the header, not skeletons.
