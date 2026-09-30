---
title: Menu
summary: A temporary list of actions, opened from a trigger or right-click. Menus hold verbs, not values and not destinations.
status: stable
import: "import { Menu, MenuTrigger, MenuContent, MenuItem, MenuSeparator, MenuLabel, MenuCheckboxItem, MenuRadioGroup, MenuRadioItem, MenuSub, MenuSubTrigger, MenuSubContent, ContextMenu, ContextMenuTrigger, ContextMenuContent, ContextMenuItem } from \"@/components/corpus/menu\""
use_when:
  - Offering 3–10 actions without taking permanent space
  - View options that toggle (show grid, compact rows) via MenuCheckboxItem
  - Power-user shortcuts via right-click (ContextMenu), always duplicated elsewhere
avoid_when:
  - Choosing a form value → Dropdown / Select
  - Navigation → Side nav, Tabs, Links
  - 1–2 actions → show them as buttons
  - More than ~10 items or deep nesting → rethink the IA
related: [menu-buttons, dropdown, common-actions]
---

## Anatomy

Trigger → content (surface `raised`, `shadow-floating`) → items (icon? · label · shortcut?) → separators → optional sub-menus.

## Corpus opinions

1. **Order by frequency, group by meaning.** Put separators between groups. Destructive items always go last, styled `danger`.
2. **Item labels are verbs,** ≤ 2 words: "Rename", "Duplicate", "Move to…". The ellipsis means the item opens more UI before acting.
3. **Icons are all-or-nothing** within a group. Don't mix icon and icon-less items.
4. **One level of sub-menu, max.** If you need two, the menu is a page.
5. **Context menus are accelerators, never the only path.** Every context action must exist in visible UI too.
6. **Show shortcuts** when they exist; this is how users learn them.

## Behavior

- Opens with `animate-enter-scale` from the trigger's origin (`duration-moderate-01`) and closes faster.
- Full keyboard support: arrows, typeahead, Enter, Escape, and Right/Left for sub-menus.
