---
title: Overflow content
summary: What to do when content doesn't fit, truncate, wrap, clamp, scroll, or collapse, and what must never be cut.
status: stable
import: "import { Truncate } from \"@/components/vita/truncate\""
use_when:
  - Long names in tables, cards, nav, breadcrumbs
  - Long descriptions in constrained layouts
  - Too many tags/actions/items for the space
avoid_when:
  - Truncating labels, errors, buttons, or anything the user must read to act
related: [tooltip, tag, breadcrumb, data-table, disclosures]
---

## Techniques

| Content | Technique |
|---|---|
| Single-line names (tables, nav, cards) | `Truncate` end + tooltip with the full text |
| File names, IDs, emails where the ending matters | `Truncate mode="middle"` |
| Labels in nav and list rows | `Truncate mode="ticker"`: glides to its end at reading speed while the row is hovered |
| Descriptions, comments | `Truncate mode="lines"` (2–3 lines) + "Show more" |
| Many tags | Show 3 + `OperationalTag` "+N" → popover |
| Many actions | 1–2 visible + `OverflowMenu` |
| Deep breadcrumbs | Collapse the middle into "…" |
| Wide tables | Horizontal scroll inside the table; keep the first column readable |
| Long lists | Pagination or "Load more" |

## Never truncate

Buttons · form labels · error and validation messages · notification titles · prices and amounts · legal text.

If these don't fit, **wrap** them or redesign the space.
