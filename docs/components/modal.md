---
title: Modal
summary: Interrupts to focus on one task or decision. Modality is a last resort.
status: stable
import: "import { Modal, ModalTrigger, ModalContent, ModalHeader, ModalBody, ModalFooter, ModalClose, ConfirmModal } from \"@/components/vita/modal\""
use_when:
  - Confirming a destructive or irreversible action (ConfirmModal danger)
  - A short, self-contained task (≤ 5 fields) that shouldn't leave the page
  - Critical information that must be acknowledged
avoid_when:
  - The user needs to see the page while working → RightPanel
  - A couple of options next to a control → Popover
  - Long forms or multi-step flows → a page
  - Success messages → toast
  - Opening a modal from a modal → never
related: [dialogs, ui-shell-right-panel, popover, notification]
---

## Types

| Type | Footer | Example |
|---|---|---|
| Passive | none (× only) | Keyboard shortcuts, info |
| Transactional | primary (+ optional secondary alternative) | "Deploy agent" with a release note |
| Danger | danger | "Delete 3 agents?" |
| Acknowledgement | primary only | Terms update |

## Exit choreography

- **Enter is expressive, exits are productive.** The modal arrives with presence and leaves quickly, the user has already moved on.
- **Dismissed → falls.** ×, Escape or click-outside: it drops with gravity and tilts away.
- **Sent → flies up.** When its data is submitted successfully (`ModalAction`, `ConfirmModal`), it dips for a beat, then shoots out through the top, solid all the way, it never fades.
- **Failed → stays.** If the action throws, the modal stays open so the user can fix it.

```tsx
<ModalFooter>
  <ModalAction onAction={deployAgent}>Deploy agent</ModalAction>
</ModalFooter>
```

## Sizes

- `xs`: confirmations.
- `sm`: short forms.
- `md`: the default.
- `lg`: tables and complex content, with `ModalBody scroll`.

## Rules

1. **The title asks or states:** "Delete 3 agents?" / "Deploy to production". The primary button repeats the verb ("Delete agents").
2. **Danger modals:**
   - They can't be dismissed by clicking the scrim.
   - Focus lands on ×, not on the destructive button.
   - The description states the consequence ("can't be undone").
3. **Prefer Undo over Confirm** for reversible actions (toast with Undo).
4. **Never a Cancel, Close or Dismiss button.** ×, Escape and click-outside already close it. The footer is a full-bleed, joined `ActionBar`: one primary, at most one secondary *alternative* (Save as draft, Back).
5. **Motion:**
   - Enter: the scrim fades in while the dialog scales from 96%.
   - Exit: faster than enter.
   - Reduced motion: fades only.
6. **Esc and × always close** transactional and passive modals without losing typed data silently. Warn first if the user has edited something.

## Actions

- **Inset action group.** The blended buttons sit in one rounded group 8px from the dialog's edges. The group's radius follows the formula: the dialog's radius minus the 8px margin.
- **Extra large.** Dialog actions use the `xl` button size.
