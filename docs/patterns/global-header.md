---
title: Global header
summary: What goes in the product-wide header, in which order, and what each global action opens.
status: stable
import: "import { Header, HeaderGlobalAction } from \"@/components/vita/ui-shell\""
use_when:
  - Every authenticated product
avoid_when:
  - Page-specific actions in the global header → PageHeader
related: [ui-shell-header, ui-shell-right-panel, search]
---

## Order (left → right)

1. Menu toggle (mobile only)
2. **Prefix + product name** → home
3. Header nav (only without a side nav)
4. (spacer)
5. **Search** → the [GlobalSearch](#/components/global-search) capsule, ⌘K from anywhere
6. **Notifications** → `RightPanel` "Notifications", with a badge dot for unread items
7. **Help** → `RightPanel` with docs, shortcuts and contact
8. **App switcher** (multi-product platforms only)
9. **User** → menu: profile · settings · theme · log out (log out goes last)

## Rules

1. **Max 5 global actions.** Every action is global, meaning relevant on every page.
2. **Badges are dots,** not counts, unless the count drives a decision.
3. **Panels are mutually exclusive.** Opening one closes the other, and the pressed state shows which is open.
4. **Never put CTAs** ("Upgrade", "Create") in the global header. They belong to pages.
