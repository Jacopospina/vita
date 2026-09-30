---
title: Notifications
summary: Matching the message to the right channel — toast, inline, modal, callout, or the notification panel.
status: stable
use_when:
  - The system needs to tell the user something
avoid_when:
  - Messages the user doesn't need to act on or know about → don't send them
related: [notification, dialogs, status-indicators, global-header]
---

## Channels by urgency

| Urgency | Channel | Example |
|---|---|---|
| Blocking | `ConfirmModal` | "Your session expired. Log in again." |
| High, contextual | `InlineNotification` error/warning near the cause | "Couldn't sync with the TMS · Retry" |
| High, global | `InlineNotification` at the page top (below the header) | "Payment failed · Update card" |
| Low, confirmation | `toast` | "Quote sent" (+ Undo) |
| Informational, persistent | `Callout` | "Prices exclude VAT" |
| Async, later | Notification panel (`RightPanel`) + header badge dot | "Acme accepted Q-2041" |

## Rules

1. **One message per event,** in one channel. Don't toast *and* inline the same thing.
2. **Proximity:** show the message where the user's attention is, or where the problem is.
3. **Everything actionable has exactly one action,** and it's a verb ("Retry", "Assign carriers").
4. **Toasts never contain errors that need fixing.** Those go inline and stay.
5. **Async results** (long exports, imports) land in the notification panel with a link to the result.
6. **Frequency:** batch similar events ("5 quotes accepted") rather than stacking toasts.
