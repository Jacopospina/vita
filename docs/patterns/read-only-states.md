---
title: Read-only states
summary: Showing values the user can see but not change, and switching between viewing and editing.
status: stable
use_when:
  - Detail pages where viewing is more common than editing
  - Values set by the system or by someone with more permissions
avoid_when:
  - Using disabled fields to display data (low contrast, not selectable)
related: [disabled-states, structured-list, forms]
---

## Three situations

| Situation | Show |
|---|---|
| Viewing an object the user *can* edit | Read view (`StructuredList` flush/condensed or label/value text) + **Edit** (⌘E) → form → **Save** (⌘S); × or Esc discards |
| A field inside an editable form that the system controls | `TextInput readOnly` + helper "Set by the system" |
| Content the user has no permission to change | Read view + an `InlineNotification` info explaining who can edit |

## Rules

1. **Read-only ≠ disabled.** Read-only values are full-contrast, selectable and copyable. Disabled means "temporarily unavailable".
2. **Default to view mode** for existing objects. Editing is a deliberate mode.
3. **Edit scope:** page-level Edit for small objects; per-section Edit for large ones (each section saves independently).
4. **Lock icon + tooltip** for system-controlled values in view mode.
