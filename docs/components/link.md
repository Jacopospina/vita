---
title: Link
summary: Navigation to another page, section or resource. If it changes data, it's a Button.
status: stable
import: "import { Link } from \"@/components/vita/link\""
use_when:
  - Navigating to another page or anchor
  - Referencing a resource inside running text
  - Opening external documentation (external)
avoid_when:
  - Performing an action (save, delete, open modal) → Button (ghost if it must look light)
  - A whole card is the destination → ClickableTile
  - Going up a hierarchy → Breadcrumb
related: [button, breadcrumb, tile]
---

## Variants

- **Standalone** (default): underline on hover. Use it for "View all", "Learn more" and for navigation lists.
- **Inline** (`inline`): always underlined, because it sits inside a sentence and must be distinguishable without color (WCAG 1.4.1).
- **External** (`external`): opens a new tab. Adds a Launch icon and a screen-reader hint. Use it only for off-product destinations.
- **Sizes:** `sm` / `md` / `lg` follow the text they sit next to.

## Rules

1. **Link text says where it goes:** "View run 8812", not "click here" or a bare URL.
2. **Don't open internal pages in new tabs.** Users decide that.
3. **Links don't carry icons** except the external indicator.
4. **Visited color** applies to content links only; navigation chrome ignores it.
5. **In a router,** use `asChild` with your router's link component so styling stays consistent.

## Accessibility

- Disabled links are exposed as `aria-disabled` and removed from the pointer. Prefer removing the link entirely when it has no destination.
- External links announce "(opens in a new tab)".
