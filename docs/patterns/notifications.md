---
title: Notifications
summary: Matching the message to the right channel, toast, inline, modal, callout, or the notification panel.
status: stable
use_when:
  - The system needs to tell the user something
avoid_when:
  - Messages the user doesn't need to act on or know about → don't send them
related: [notification, capsule, dialogs, status-indicators, global-header]
---

## Channels by urgency

| Urgency | Channel | Example |
|---|---|---|
| Blocking | `ConfirmModal` | "Your session expired. Log in again." |
| High, contextual | `InlineNotification` error/warning near the cause | "Couldn't sync the help center · Retry" |
| High, global | `InlineNotification` at the page top (below the header) | "Payment failed · Update card" |
| Low, confirmation | `toast` | "Agent paused" (+ Undo) |
| Low, glanceable state | `capsule` (live story: progress, status) | "Syncing knowledge · Help center · 40%" |
| Informational, persistent | `Callout` | "Prices exclude VAT" |
| Async, later | Notification panel (`RightPanel`) + header badge dot | "Evaluation finished for Support triage" |

## Capsule or notification?

Decide by what the message asks of the person, in this order:

1. **Needs fixing?** `InlineNotification` next to the cause. It stays until the problem is gone.
2. **Something to read or undo, and the person caused it?** A `toast`: success or info, Undo when the action is reversible.
3. **A state to glance at, and the system reports it?** A `capsule`: icon, title and a live story (progress, status), nothing to read and no action.

| Message | Channel | Why |
|---|---|---|
| "Agent deployed · View" | `toast` | The person's action, with a follow-up |
| "Agent paused · Undo" | `toast` | Reversible, so it offers Undo |
| "Voice agent connected" | `capsule` | A system state, a glance is enough |
| "Syncing help center · 40%" | `capsule` | Live progress, updated in place |
| "Couldn't sync the help center · Retry" | `InlineNotification` | Needs fixing, so it stays by the cause |

## Rules

1. **One message per event,** in one channel. Don't toast *and* inline the same thing, or capsule *and* toast it.
2. **A capsule never carries an error.** When the work it tracks fails, the capsule leaves and an `InlineNotification` takes over by the cause.
3. **Proximity:** show the message where the user's attention is, or where the problem is.
4. **Everything actionable has exactly one action,** and it's a verb ("Retry", "Reconnect tools").
5. **Toasts never contain errors that need fixing.** Those go inline and stay.
6. **Async results** (long exports, imports) land in the notification panel with a link to the result.
7. **Frequency:** batch similar events ("5 runs failed") rather than stacking toasts.
