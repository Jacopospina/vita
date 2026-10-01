---
title: Right panel
summary: A floating panel on the right for global tools and editing in context, built with the same rules as the left navigation.
status: stable
import: "import { RightPanel } from \"@/components/corpus/ui-shell\""
use_when:
  - Global tools opened from the header (notifications, help, assistant, theme)
  - Viewing or editing an item while keeping the page in view
  - Filters for a large table
avoid_when:
  - A decision that must block the page → Modal
  - A few options next to a control → Popover
  - Long multi-step flows → a page
related: [ui-shell-right-panel, ui-shell-left-panel, global-header, dialogs, filtering]
---

## Anatomy

1. **Panel.** Floats 8px in from the window, with the same top and radius (16px) as the left navigation. It sits on the top shell layer, so its glass is stronger (tier 3).
2. **Header row.** 32px tall: the title on the left, × on the right. The × is a 32px button rounded concentrically (16 − 8 = 8px).
3. **Content.** Scrolls on its own; starts 10px in, aligned with the title.
4. **Footer (optional).** One primary action in an inset, rounded action bar, like a dialog's.

## Rules

- **Mirror the left panel.** Same inset, radius and padding on both sides, so the shell reads as one system.
- **Highest layer.** The right panel floats above the side nav and the header, with the frost that matches its height (glass tier 3).
- **Concentric inside.** Everything inside follows inner radius = 16 − 8: the × and the footer are both 8px.
- **One panel at a time.** Opening another replaces it, and the header action that opened it shows as pressed.
- **Non-modal.** The page stays usable; no scrim. Use a Modal when the page must wait.
- **Productive motion.** It slides in from fully off-screen and out faster, with no bounce. Reduced motion fades.
- **Focus goes in and comes back.** Opening moves focus into the panel; closing returns it to what opened it.
- **× and Escape close it.** The × tooltip shows the Esc shortcut.

## Never

- **A Cancel button in the footer.** × and Escape already close the panel.
- **A full-bleed panel glued to the window edge.** It always floats with the 8px inset.
- **Square corners or a different radius from the left panel.**
- **More than one primary action.** A secondary alternative is fine; a dismissal is not.

> [!TIP] Size by content: `sm` (320) for lists like notifications, `md` (400) for forms, `lg` (560) for filters and wide details. On phones it spans the width, inset 8px.
