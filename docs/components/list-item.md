---
title: List item
summary: The settings row. Icon placeholder on the left, title over an optional subtitle, and the control or chevron on the far right. Group related rows into one card.
status: stable
import: "import { ListGroup, ListItem, ListSection } from \"@/components/corpus/list-item\"\n\n<ListSection title=\"Agents\">\n  <ListGroup>\n    <ListItem icon={Bot} tone=\"brand\" title=\"Support triage\" subtitle=\"Zendesk · Live\" onClick={open} />\n    <ListItem icon={Plug} tone=\"success\" title=\"Slack\" trailing={<Button size=\"sm\" variant=\"secondary\">Manage</Button>} />\n  </ListGroup>\n</ListSection>"
use_when:
  - Settings, preferences and account pages
  - Navigating into an object or a sub-page
  - A short list of objects, each with one control
avoid_when:
  - Sorting, many attributes or bulk actions → DataTable
  - Pure text bullets → List
  - A titled list with a list-level action → ContainedList
related: [icon-placeholder, list-items, contained-list, structured-list, toggle]
---

> [!NOTE] Colours and glyphs follow [Color → Status semantics](#/foundations/color): one meaning, one look, everywhere.


## Parts

| Part | Props |
|---|---|
| `ListItem` | `icon` + `tone` ([IconPlaceholder](#/components/icon-placeholder)) or `media` (avatar, device) · `title` · `subtitle` · `value` · `trailing` · `onClick` / `href` · `selected` · `disabled` |
| `ListGroup` | Rows that belong together, joined into one card. A single row is a group of one. |
| `ListSection` | One or more groups, with an optional `title` and `description`. It owns the gap between groups. |

## Rules

1. **Chevron or control, never both.**
   - A row with `onClick` or `href` and no `trailing` is fully clickable and ends in a chevron.
   - A row with `trailing` is not clickable; the control is the target.
2. **Belonging has no gaps.** Rows in a `ListGroup` share one surface with inset separators. Separate topics use separate groups.
3. **Tile tone is category, not status.** Use `neutral`, `brand`, `info`, `success`, `warning` or `error` to tell rows apart at a glance. Put state in `trailing` with a `StatusIndicator`.

See the [List items pattern](#/patterns/list-items) for when and how to compose settings pages.
