---
title: List items
summary: The settings row. Icon placeholder on the left, title (and subtitle) in the middle, the control or chevron on the far right. Rows that belong together join into one card.
status: stable
import: "import { ListGroup, ListItem, ListSection } from \"@/components/corpus/list-item\"\n\n<ListGroup>\n  <ListItem icon={Bot} tone=\"brand\" title=\"Support triage\" subtitle=\"Zendesk · Live\" onClick={open} />\n</ListGroup>"
use_when:
  - Settings, preferences and account pages
  - Navigating into an object or sub-page (chevron rows)
  - A short list of objects, each with one control (toggle, button, status)
avoid_when:
  - Comparing many attributes, sorting or bulk actions → DataTable
  - Pure text bullets → List
  - Lists with a titled header and a list-level action → ContainedList
related: [list-item, contained-list, structured-list, data-table, toggle]
---

## Anatomy

| Left | Middle | Far right |
|---|---|---|
| Icon placeholder (`tone`) or `media` (avatar, device) | Title, with an optional subtitle below | `trailing` control, `value` + chevron, or chevron |

## Rules

1. **Belonging has no gaps.** Rows about the same thing share one `ListGroup`: the card owns fill and radius, rows are flat, and separators are inset. A row on its own is a group of one.
2. **Different topics stand apart.** Separate groups sit a clear gap apart, owned by `ListSection`; never space them by hand. Give a run of groups a `ListSection` heading when it helps scanning.
3. **One target per row.**
   - Navigation rows (`onClick` or `href`, no trailing) are fully clickable and end in a chevron.
   - Rows with a `trailing` control are not clickable; the control is the target.
4. **Subtitle only when it adds information,** such as model, owner or state. Never repeat the title.
5. **Tile tone carries category, not status.** Use a `StatusIndicator` in `trailing` for state.
