---
title: Dialogs
summary: Choosing between Modal, RightPanel, Popover, Toggletip and toast, and writing dialogs people understand in one glance.
status: stable
use_when:
  - Any time UI needs to appear on top of the current page
avoid_when:
  - Content that could simply live on the page
related: [modal, ui-shell-right-panel, popover, notification]
---

## Decision

```
Must the user decide/act before anything else?
├─ yes → Modal (ConfirmModal for yes/no)
└─ no
   ├─ do they need to see the page while working? → RightPanel
   ├─ is it small and about one control?           → Popover
   ├─ is it an explanation?                        → Toggletip (click) / Tooltip (hover, text only)
   └─ is it a confirmation that something happened? → toast
```

## Writing dialogs

- **Title:** the question or the task ("Delete 3 agents?", "Invite teammates").
- **Body:** the consequence in one or two sentences. No "Are you sure?"
- **Buttons:** one action whose verb matches the title ("Delete agents"). No Cancel, no Yes/No, no OK: ×, Escape and click-outside already dismiss.

## Rules

1. **No dialog on page load,** except critical legal or blocking states.
2. **No stacked modals.** If a modal needs a sub-decision, use inline disclosure inside it, or rethink the flow as a page.
3. **Protect typed data:** closing a dialog with edits asks "Discard changes?" first.
4. **Focus management:**
   - On open, focus goes to the first field (transactional) or to × (danger), so a stray Enter never destroys anything.
   - On close, focus returns to the trigger.
