---
title: Button
summary: Triggers an action. Clear hierarchy, strict restraint. One primary per view, and every other button steps down.
status: stable
import: "import { Button, IconButton, ButtonSet } from \"@/components/corpus/button\""
use_when:
  - The user performs an action (save, create, send, delete, open a modal)
  - Grouping the actions that end a form, modal or flow (ButtonSet)
avoid_when:
  - Navigating to another page → Link (or ClickableTile)
  - Choosing a value → Dropdown / RadioGroup / ContentSwitcher
  - Several related actions under one label → MenuButton
  - Toggling a setting → Toggle
related: [menu-buttons, link, modal, common-actions]
---

## Variants

| Variant | Use for | Per view |
|---|---|---|
| `primary` | The single most important action | **Exactly 1** (0 in read-only views) |
| `secondary` | Alternatives to the primary (Cancel, Back, Save draft) | ≤ 2 |
| `tertiary` | Independent actions that need visibility but not emphasis (Export, Add filter) | Few |
| `ghost` | Low-emphasis, repeated or in-context actions (toolbar, table rows, "Clear") | Unlimited |
| `danger` | Confirming a destructive action, usually inside a `ConfirmModal` | 1 |
| `danger-tertiary` / `danger-ghost` | A destructive action on a settings page that opens a confirmation | 1 |

## Sizes

- `sm` (32): dense toolbars and tables.
- `md` (40): the default everywhere.
- `lg` (48): page-level CTAs, login, mobile.

Heights follow `--corpus-density`. Buttons in a `ButtonSet` share one size.

## Rules

1. **Label = verb + object.**
   - Good: "Create agent", "Delete 3 runs", "Send invite".
   - Never: "OK", "Yes", "Submit", "Click here".
   - Max 3 words.
2. **The primary is always last (rightmost) in a `ButtonSet`.** Cancel goes to its left as `secondary`. In stacked sets (mobile), the primary is on top.
3. **Icons:** trailing for forward and primary actions (`Add`, `ArrowRight`), leading for toolbar-style tertiary and ghost. Never both. Never an icon that repeats the label's meaning without adding clarity.
4. **Loading, not double-clicking:** on async actions pass `loading`. It keeps the width and blocks re-submission.
5. **Disabled buttons need a reason.** If the reason isn't obvious, keep the button enabled and validate on click, or wrap it in a Tooltip (see *Disabled states*).
6. **Full-width only** on mobile, in narrow panels and on login forms.
7. **Icon-only = `IconButton`** with a required `label`, which becomes the tooltip and the accessible name. Use icon-only only for universally understood glyphs or dense toolbars.

## Accessibility

- A native `<button>` with a visible focus ring. `asChild` lets a router `Link` look like a button. Do that only when the action really is navigation styled as a CTA (for example, a landing page).
- The `loading` state sets `aria-busy`.
- `IconButton` sets `aria-label` and `aria-pressed` (for toggle buttons).

## Example

```tsx
<ButtonSet>
  <Button variant="secondary">Cancel</Button>
  <Button icon={Add}>Create agent</Button>
</ButtonSet>
```
