---
title: Notification
summary: System messages with one anatomy — icon tile, title over subtitle, optional action. Inline for problems tied to a place, toast banner for confirmation, callout for static guidance.
status: stable
import: "import { InlineNotification, Callout, Toaster, toast } from \"@/components/corpus/notification\"\n\ntoast({ icon: Bot, source: \"Vita\", title: \"Agent deployed\", subtitle: \"Support triage is live\" })"
use_when:
  - Inline — errors/warnings about a section, form summary, account-level issues
  - Toast — brief confirmation of something the user just did (with optional Undo)
  - Callout — permanent, non-dismissible contextual guidance
avoid_when:
  - A decision is required before continuing → Modal
  - Field-level validation → the field's invalidText
  - Errors inside a toast that need action → InlineNotification near the cause
  - Marketing/announcements → not a system notification
related: [capsule, notifications, modal, inline-loading, status-indicators]
---

## Anatomy

One structure everywhere:
- **Squircle card on a neutral surface.** Never a colored bar or a tinted fill.
- **[IconTile](#/components/icon-tile) on the left** (soft variant). The icon and its semantic color carry the kind: `info`, `success`, `warning` or `error`.
- **Title over subtitle.**
- **At most one action** on the right.
- **×** appears on hover or focus.

| Surface | Where | Material |
|---|---|---|
| Inline / Callout | In page content | Solid neutral layer |
| Toast banner | Floating, top-right | Frosted `glass`: blur, saturation, hairline |

Toast banners can carry a `source` (who is speaking) and an `eyebrow` ("Time sensitive"). `icon: false` gives the no-icon variant.

## Rules

1. **Toasts confirm; they don't inform about problems.**
   - Success and info only.
   - 5s default, minimum 4s.
   - Maximum 3 stacked.
   - Top-right, sliding in from the edge.
   - Quick "it happened" feedback with a live value → [Capsule](#/components/capsule), not a toast.
2. **Offer "Undo" in the toast** for reversible actions instead of asking "Are you sure?" beforehand. Keep undo toasts visible for 8s.
3. **Inline errors sit next to what failed** and stay until resolved. They have **one** action (Retry, Reconnect tools).
4. **Title = what happened** (≤ 5 words). **Subtitle = detail or next step.**
5. **Never use `error` for validation that the field already shows.**
6. **Mount `<Toaster />` once** at the app root, and call `toast()` anywhere.
7. **Roles:** errors use `role="alert"`; everything else uses `status`.
