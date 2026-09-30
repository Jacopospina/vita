---
title: UI shell right panel
summary: A non-modal panel that slides over the content from the right — notifications, help, AI assistant, details, edit-in-context.
status: stable
import: "import { RightPanel } from \"@/components/corpus/ui-shell\""
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

`sm` 320 · `md` 400 (default) · `lg` 560. It goes full width on mobile.

## Corpus opinions

1. **Non-modal:** the page stays interactive. Escape and × close the panel, and focus returns to the trigger.
2. **One right panel at a time.** Opening another replaces it.
3. **Title** in the 48px header aligns with the global header height.
4. **Footer actions** (Save / Cancel) only when the panel edits something. Otherwise, no footer.
5. **Motion:** slides in with an expressive entrance at `moderate-02` and exits faster with a productive exit. Reduced motion fades.
6. **Deep-linkable:** a detail panel reflects its state in the URL (`?panel=run-8812`).
