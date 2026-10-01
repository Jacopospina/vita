---
title: Disabled states
summary: When to disable, hide, or keep enabled and explain. Disabled without a reason is a dead end.
status: stable
use_when:
  - A control exists but is temporarily not actionable
avoid_when:
  - Signalling form validity (keep submit enabled, validate on click)
  - Permanently unavailable features (hide them)
related: [read-only-states, button, tooltip]
---

## Decision

| Situation | Do |
|---|---|
| The user will **never** be able to use it (permissions, plan) | **Hide** it. If awareness matters (upsell), show it enabled and explain on click. |
| The user can make it available by doing something **on this screen** | **Disable** it and explain how (helper text or tooltip): "Connect at least one knowledge source to deploy" |
| The form is incomplete or invalid | **Keep submit enabled**, validate on click, focus the first error |
| An action is in progress | Button `loading` (not disabled) |
| The value can be seen but not changed | **Read-only**, not disabled (see *Read-only states*) |

## Rules

1. **Disabled elements are hard to perceive,** by design (reduced contrast), so never put important information in them.
2. **Tooltips on disabled buttons** need a focusable wrapper, because disabled buttons don't receive focus. The Vita demo shows the pattern.
3. **Disable a group, not every child:** set `disabled` on the `fieldset` (FormGroup) when a whole section is unavailable, and explain once.
4. **Admin-locked settings** say who controls them: "Your admin has turned this off".
