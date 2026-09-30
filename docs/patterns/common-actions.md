---
title: Common actions
summary: Where actions live, how many are visible, and how create, edit, delete, save and export behave everywhere — with left-hand shortcuts.
status: stable
import: "import { PageHeader } from \"@/components/corpus/page-header\""
use_when:
  - Any page, table, card or panel that exposes actions
avoid_when:
  - Inventing a new placement or verb for an action that already has one here
related: [button, menu-buttons, dialogs, notifications]
---

## Placement hierarchy

| Scope | Where | Max visible |
|---|---|---|
| Whole product | Header global actions | 5 icons |
| Page / object | `PageHeader` actions, right | 1 primary + 2 secondary, rest in `OverflowMenu` |
| Collection | DataTable toolbar, right | 1 primary ("Create agent") + search/filter |
| Selection | Batch action bar | ≤ 4 actions + × (Esc) to clear |
| Row / card | Trailing `OverflowMenu` (+ ≤ 2 inline ghost icons) | 2 |
| Form / modal / panel | Footer `ButtonSet`, primary last | 2–3 |

## Canonical actions

| Action | Verb | Button | Confirmation | Feedback |
|---|---|---|---|---|
| Create | "Create {object}" | primary + `Add` icon | none | Navigate to the new object, or toast "Agent created" |
| Edit (⌘E) | "Edit" | ghost/secondary + `Edit` | none | Read-only → edit (see *Read-only states*) |
| Save (⌘S) | "Save" / "Save changes" | primary | none | Inline "Saved" or toast; stay on the page |
| Leave / discard | none — ×, Esc or navigation | — | Only with unsaved changes: "Discard changes?" | Return to the previous state |
| Delete (reversible) | "Delete" | menu item, danger | **none**; toast with **Undo** (8s) | Item removed, toast |
| Delete (irreversible) | "Delete {object}" | danger in `ConfirmModal` | Yes, stating the consequence | Toast "3 agents deleted" |
| Duplicate (⌘D) | "Duplicate" | menu item | none | New item opens as "Copy of …" |
| Export / download | "Export" / "Download {format}" | tertiary or MenuButton | none | Inline loading, then the browser download |
| Share | "Share" | secondary + `Share` | none | Popover with link + copy |

## Rules

1. **Same action, same verb, same icon, same place,** product-wide. Record them in `taxonomy.json → actions`.
2. **Destructive actions come last** in menus and never sit next to the primary without separation.
3. **Prefer undo over confirmation** whenever the action can be reversed.
4. **Never hide the primary action** in an overflow menu.
5. **Keyboard shortcuts** for frequent actions, shown in menus and tooltips.
