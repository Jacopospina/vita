---
title: Disclosures
summary: Progressive disclosure — show what most people need, reveal the rest on demand.
status: stable
import: "import { Disclosure } from \"@/components/corpus/accordion\""
use_when:
  - Advanced options most users don't touch
  - Secondary details that would clutter a summary
avoid_when:
  - Hiding required fields
  - Hiding errors or critical information
related: [accordion, tile, overflow-content]
---

## Options by scope

| Scope | Component |
|---|---|
| One optional section in a form | `Disclosure` with a ghost "Show advanced options" button |
| A list of sections scanned by title | `Accordion` |
| A card with a summary and details | `ExpandableTile` |
| A table row's details | `DataTable renderExpanded` |
| Long text | `Truncate mode="lines"` |
| More actions | `OverflowMenu` |

## Rules

1. **80/20:** visible = what 80% of users need 80% of the time.
2. **The trigger label says what's inside** and flips when open ("Show advanced options" ↔ "Hide advanced options").
3. **Remember open state** within a session for power users.
4. **Validation errors inside a collapsed section** auto-expand it.
