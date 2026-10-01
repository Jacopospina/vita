---
title: Popover
summary: A non-modal layer anchored to a trigger, opened by click, for rich or interactive content. Includes Toggletip.
status: stable
import: "import { Popover, PopoverTrigger, PopoverContent, PopoverFooter, PopoverClose, Toggletip } from \"@/components/vita/popover\""
use_when:
  - Small interactive content next to a control (column picker, quick assign, filter panel)
  - Toggletip, an explanation with a link or more than one sentence, opened by an ⓘ button
avoid_when:
  - Plain text hint on hover → Tooltip
  - Blocking decisions or long forms → Modal
  - Large contextual work areas → RightPanel
  - A list of actions → Menu
related: [tooltip, modal, menu, filtering]
---

## Rules

1. **Opens on click, never on hover.** Hover content can't be interactive (you can't reach it).
2. **Small:** 1–3 controls or ~3 sentences. It grows into a panel beyond that.
3. **Closes** on Escape, on outside click, and after its primary action completes.
4. **The caret** (`caret`) is used for toggletips and callouts attached to small triggers. Otherwise omit it.
5. **Toggletip vs tooltip:** a tooltip is for names and short hints; a toggletip is for explanations that deserve a click and may contain a link.

## Actions

- **Same as dialogs.** Put actions in a `PopoverFooter`: an inset group of joined buttons, 8px from the popover's edges, with the concentric radius.
- **No Cancel.** Escape and click-outside close a popover, exactly like a dialog's ×.
