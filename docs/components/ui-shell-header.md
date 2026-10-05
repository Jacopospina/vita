---
title: UI shell header
summary: The product's persistent top bar, name, global navigation and global actions. 48px, on every screen.
status: stable
import: "import { Shell, ShellBody, ShellMain, Header, HeaderNavItem, HeaderGlobalAction } from \"@/components/vita/ui-shell\""
use_when:
  - Every authenticated product screen (inside Shell)
avoid_when:
  - Building a custom top bar → forbidden
  - Page-level titles and actions → PageHeader (inside the main area)
  - Marketing sites → a marketing header block
related: [ui-shell-left-panel, ui-shell-right-panel, global-header]
---

## Anatomy

`[☰ on mobile] [Logo Prefix Product name] [Header nav (optional)] ········ [Global actions]`

- **Logo.** Pass the product mark as `logo` (about 20px); it sits before the name inside the home link.
- **Badge.** An optional `badge` sits right after the name, for a release stage, using the same words as page statuses: `<Tag size="sm" tone="warning">Experimental</Tag>`.

## Rules

1. **Product name, left:** "Prefix **Name**" (platform in regular weight, product in semibold). It links home.
2. **Header nav** only for 2–5 top-level areas when there's no side nav. With a side nav, leave the header nav empty.
3. **Global actions, right, in this order:** search · notifications · help · app switcher · user. Max 5. Each is an icon with a label (tooltip). A count that belongs to the action (forks, unread) goes in its `value`, inside the same pill, never as a separate button.
4. **Active global action** (its panel is open) shows the pressed state. Panels open as `RightPanel`.
5. **Translucent material** (backdrop blur over `background`) keeps the header light. Don't make the header brand-colored.
6. **Skip link** ("Skip to main content") is built in. Keep `ShellMain` as the main landmark.

## Look

- **Floating glass, like the side panel.** The header floats 12px below the top of the window and 8px from its sides, never wider than 1024px, with frosted `glass` and rounded corners. It's the same material as the LeftPanel, so the two read as one frame.
- **Pills inside.** The product name, nav items and global actions are 32px pills with the concentric radius. The current nav item gets the same soft grey as the current sidebar row.
- **At the bottom on a phone.** Up to 40rem wide the bar sits at the bottom, within the thumb's reach, as a centred pill as wide as its contents: the menu button, the product mark (the name folds into it), the global actions. The menu sheet and the right panel keep clear of it.
