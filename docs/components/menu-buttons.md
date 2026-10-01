---
title: Menu buttons
summary: Three buttons that open menus. MenuButton groups actions, ComboButton adds alternatives to a default action, OverflowMenu hides secondary actions.
status: stable
import: "import { MenuButton, ComboButton, OverflowMenu } from \"@/components/vita/menu-button\""
use_when:
  - MenuButton, several equally important related actions under one label ("Export ▾", "Create ▾")
  - ComboButton, one dominant action plus variations ("Save" | "Save as…", "Save as template")
  - OverflowMenu, secondary actions on a row, tile, card or page header (⋮)
avoid_when:
  - Selecting a value → Dropdown
  - A single action → Button
  - Primary page actions hidden in an overflow → keep the primary visible
related: [menu, button, common-actions]
---

## Which one?

| Question | Answer |
|---|---|
| Is there an obvious default the user wants 80% of the time? | **ComboButton** |
| Are the options peers, and does the label describe the category? | **MenuButton** |
| Are the actions secondary and would they clutter the surface? | **OverflowMenu** |

## Rules

1. **MenuButton label = category verb** ("Export", "Add", "Share") + chevron. The chevron rotates on open.
2. **ComboButton main label = the default action.** The menu never repeats it.
3. **OverflowMenu:**
   - Vertical `⋮` on table rows and list items; horizontal `⋯` on cards and toolbars.
   - Up to ~7 items; destructive last.
   - It's always the **last** element in its row, right-aligned.
4. **Row actions:** show at most 1–2 frequent actions inline (ghost icon buttons) and put the rest in the overflow.
5. **Variants:**
   - MenuButton defaults to `tertiary`; ghost in toolbars.
   - ComboButton is `primary` only when it is the page's primary action.
