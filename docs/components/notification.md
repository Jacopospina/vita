---
title: Notification
summary: System messages. Inline for problems tied to a place, toast for confirmation of a user action, callout for static guidance.
status: stable
import: "import { InlineNotification, Callout, Toaster, toast } from \"@/components/corpus/notification\""
use_when:
  - Inline — errors/warnings about a section, form summary, account-level issues
  - Toast — brief confirmation of something the user just did (with optional Undo)
  - Callout — permanent, non-dismissible contextual guidance
avoid_when:
  - A decision is required before continuing → Modal
  - Field-level validation → the field's invalidText
  - Errors inside a toast that need action → InlineNotification near the cause
  - Marketing/announcements → not a system notification
related: [notifications, modal, inline-loading, status-indicators]
---

## Kinds

`info` · `success` · `warning` · `error`. Each kind has a fixed icon and a colored left bar. Never recolor them.

## Corpus opinions

1. **Toasts confirm; they don't inform about problems.**
   - Success and info only.
   - 5s default, minimum 4s.
   - Maximum 3 stacked.
   - Bottom-right on desktop, bottom-centre on mobile.
2. **Offer "Undo" in the toast** for reversible actions instead of asking "Are you sure?" beforehand. Keep undo toasts visible for 8s.
3. **Inline errors sit next to what failed** and stay until resolved. They have **one** action (Retry, Reconnect tools).
4. **Title = what happened** (≤ 5 words). **Subtitle = detail or next step.**
5. **Never use `error` for validation that the field already shows.**
6. **Mount `<Toaster />` once** at the app root, and call `toast()` anywhere.
7. **Roles:** errors use `role="alert"`; everything else uses `status`.
