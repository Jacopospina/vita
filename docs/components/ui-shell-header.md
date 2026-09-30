---
title: UI shell header
summary: The product's persistent top bar — name, global navigation and global actions. 48px, on every screen.
status: stable
import: "import { Shell, ShellBody, ShellMain, Header, HeaderNavItem, HeaderGlobalAction } from \"@/components/corpus/ui-shell\""
use_when:
  - Every authenticated product screen (inside Shell)
avoid_when:
  - Building a custom top bar → forbidden
  - Page-level titles and actions → PageHeader (inside the main area)
  - Marketing sites → a marketing header block
related: [ui-shell-left-panel, ui-shell-right-panel, global-header]
---

## Anatomy

`[☰ on mobile] [Prefix Product name] [Header nav (optional)] ········ [Global actions]`

## Rules

1. **Product name, left:** "Prefix **Name**" (platform in regular weight, product in semibold). It links home.
2. **Header nav** only for 2–5 top-level areas when there's no side nav. With a side nav, leave the header nav empty.
3. **Global actions, right, in this order:** search · notifications · help · app switcher · user. Max 5. Each is an icon with a label (tooltip).
4. **Active global action** (its panel is open) shows the pressed state. Panels open as `RightPanel`.
5. **Translucent material** (backdrop blur over `background`) keeps the header light. Don't make the header brand-colored.
6. **Skip link** ("Skip to main content") is built in. Keep `ShellMain` as the main landmark.
