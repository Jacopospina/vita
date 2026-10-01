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
| `secondary` | Alternatives to the primary (Back, Save as draft) — never a dismissal | ≤ 2 |
| `tertiary` | Independent actions that need visibility but not emphasis (Export, Add filter) | Few |
| `ghost` | Low-emphasis, repeated or in-context actions (toolbar, table rows, "Clear") | Unlimited |
| `danger` | Confirming a destructive action, usually inside a `ConfirmModal` | 1 |
| `danger-tertiary` / `danger-ghost` | A destructive action on a settings page that opens a confirmation | 1 |

## Shape & padding

- **Squircle corners.** Buttons (and button groups) use continuous-curvature squircle corners, not simple rounded corners.
- **Symmetric padding.** Left and right padding are always equal. With an icon, the icon sits on the far right.

## Rules

1. **Label = verb + object.**
   - Good: "Create agent", "Delete 3 runs", "Send invite".
   - Never: "OK", "Yes", "Submit", "Click here".
   - Max 3 words.
2. **Belonging has no gaps.** A `ButtonSet` joins its buttons edge to edge, primary last (rightmost). No Cancel buttons: surfaces close with × or Esc.
3. **Icons sit on the far right, always.** Label left, icon pushed to the right edge. One icon at most, and only when it adds clarity. (`iconPosition` is deprecated and ignored.)
4. **The consequence lives IN the button.** The button is the last thing the user looks at, so they never look elsewhere to learn what their click did.
   - Pass `onAction` (async; throw to fail) and the button runs the lifecycle itself:
     - **Loading:** the label can change (`feedback.loading`) and a Thinking orb sits in the far-right slot.
     - **Success:** the button turns green and draws a check.
     - **Failure:** the button turns red with an error mark, then settles back.
   - Re-submission is blocked while it works.
   - Controlled alternative: `status` plus `feedback`.
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
  <Button variant="secondary">Save as draft</Button>
  <Button icon={Add}>Create agent</Button>
</ButtonSet>
```

## Sizes

| Size | Height | Use for |
|---|---|---|
| `sm` | 24px | Dense toolbars, table rows |
| `md` | 28px | Default |
| `lg` | 32px | Prominent page actions |
| `xl` | 48px | Hero calls to action, and dialog and panel actions (the action bar) |

Heights follow `--corpus-density`. Buttons in a `ButtonSet` share one size.
