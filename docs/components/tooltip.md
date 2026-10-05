---
title: Tooltip
summary: A short plain-text name or hint on hover/focus. Includes DefinitionTooltip for glossary terms.
status: stable
import: "import { Tooltip, TooltipProvider, DefinitionTooltip } from \"@/components/vita/tooltip\""
use_when:
  - Naming icon-only buttons (automatic with IconButton)
  - Revealing the full text of truncated content
  - Defining a domain term inline (DefinitionTooltip)
  - Explaining why a control is disabled
avoid_when:
  - Interactive content, links, or anything the user must read → Toggletip / Popover
  - Critical information → put it on the page
  - Repeating the visible label → no tooltip
related: [popover, button, overflow-content]
---

## Look

- **A squircle with no pointer.** Inverse surface, squircle corners, 6px from its trigger. Proximity says what it belongs to, no arrow.

## Rules

1. **One short line** (≤ ~80 characters), with no period for fragments.
2. **Instant.** A tooltip appears the moment the pointer or focus arrives, with a quick fade, never after a wait (`TooltipProvider`, mounted once at the root).
3. **Above, unless it can't be.** A tooltip sits above its trigger. With no room there it flips to wherever it fits inside the viewport, never over the words it describes; set `side` only for a demo.
4. **Inverse surface** (dark in light mode), `footnote` size, fade only.
5. **Keyboard focus shows tooltips too.** Never put a tooltip on a non-focusable element.
6. **Shortcuts belong in tooltips:** "Bold (⌘B)".
7. **Name, never instruct.** A tooltip says what something is ("In progress", "Microphone settings"), never what to do with it ("Click to change status"). The pointer, the hover state and the control's shape already say it can be clicked.
