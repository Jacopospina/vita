---
title: UI shell right panel
summary: A non-modal panel that slides over the content from the right, notifications, help, AI assistant, details, edit-in-context.
status: stable
import: "import { RightPanel } from \"@/components/vita/ui-shell\""
use_when:
  - Global panels opened from header actions (notifications, help, assistant)
  - Viewing or editing an item's details while keeping the list visible
  - Filters for large tables (lg)
avoid_when:
  - Blocking decisions → Modal
  - Tiny content near a control → Popover
  - Primary page content → it belongs in the page
related: [modal, ui-shell-header, popover, filtering]
---

## Sizes

`sm` 320 · `md` 400 (default) · `lg` 560. On phones it spans the width, still inset 8px.

## Look

- **Floats like the left panel.** 8px from the window, 16px radius, 8px padding.
- **Highest shell layer.** Above the side nav and header, with stronger glass (tier 3) to match.
- **Concentric inside.** The 32px ×, the body and the footer action bar are rounded 8px (16 − 8).
- **A solid body.** Between header and footer, the content sits on its own page-coloured surface: full height, scrolling on its own, with no blur behind what you read. Only the frame is glass.

## Rules

1. **Non-modal:** the page stays interactive. Escape and × close the panel; focus moves into it on open and returns to the trigger on close.
2. **One right panel at a time.** Opening another replaces it.
3. **Header row** is 32px: title left, × right (its tooltip shows Esc).
4. **Footer = ActionBar,** inset and rounded, only when the panel edits something: the primary action on the right, at most one secondary on its left (Copy code · Reset to defaults). It stays put while the content scrolls. × and Esc close it; never a Cancel.
5. **Motion:** productive. It slides in from fully off-screen at `moderate-02` and exits faster at `moderate-01`, with no bounce. Reduced motion fades.
6. **Deep-linkable:** a detail panel reflects its state in the URL (`?panel=run-8812`).

> [!NOTE] Breaking: the panel no longer sits flush against the window edge, and its header row is 32px (was a 48px bar with a divider). The footer ActionBar is inset and rounded.
