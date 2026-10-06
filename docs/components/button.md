---
title: Button
summary: Triggers an action. Clear hierarchy, strict restraint. One primary per view, and every other button steps down.
status: stable
import: "import { Button, IconButton, ButtonSet } from \"@/components/vita/button\""
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
| `primary` | The single most important action | **Exactly 1 per page, dialog or side panel** (0 in read-only views) |
| `secondary` | The primary's partner (Back, Save as draft), never a dismissal. A faint primary wash with primary-coloured text | ≤ 2 |
| `tertiary` | Independent actions that need visibility but not emphasis (Export, Add filter) | Few |
| `ghost` | Low-emphasis, repeated or in-context actions (toolbar, table rows, "Clear") | Unlimited |
| `danger` | Confirming a destructive action, usually inside a `ConfirmModal` | 1 |
| `danger-tertiary` / `danger-ghost` | A destructive action on a settings page that opens a confirmation | 1 |

## Shape & padding

- **Squircle corners.** Buttons (and button groups) use continuous-curvature squircle corners, not simple rounded corners. `xl` is rounder, in proportion to its height.
- **The shape is the button's own.** A corner class passed to a Button or IconButton (`rounded-*`, `corner-shape`) is ignored, with a warning in development, and a test fails on one in the source. Size it with `size-*` or `h-*`; a group reshapes its buttons from outside (`ButtonSet`).
- **Symmetric padding.** Left and right padding are always equal. With an icon, the icon sits on the far right.

## Rules

1. **One primary per surface.** A page, a dialog and a side panel each get exactly one primary button. When the choice needs an alternative, pair the primary with a secondary, never a second primary.
2. **Label = verb + object.**
   - Good: "Create agent", "Delete 3 runs", "Send invite".
   - Never: "OK", "Yes", "Submit", "Click here".
   - Max 3 words.
3. **Belonging has no gaps.** A `ButtonSet` joins its buttons edge to edge, primary last (rightmost). No Cancel buttons: surfaces close with × or Esc.
4. **Icons sit on the far right, always.** Label left, icon pushed to the right edge. One icon at most, and only when it adds clarity. (`iconPosition` is deprecated and ignored.)
5. **The consequence lives IN the button.** The button is the last thing the user looks at, so they never look elsewhere to learn what their click did.
   - Pass `onAction` (async; throw to fail) and the button runs the lifecycle itself:
     - **Loading:** the label can change (`feedback.loading`) and a Thinking orb sits in the far-right slot.
     - **Success:** the button turns green and draws a check.
     - **Failure:** the button turns red with an error mark, then settles back.
   - Re-submission is blocked while it works.
   - Controlled alternative: `status` plus `feedback`.
6. **Disabled buttons need a reason.** If the reason isn't obvious, keep the button enabled and validate on click, or wrap it in a Tooltip (see *Disabled states*).
7. **Full width only inside a panel, dialog or popover** (their `ActionBar`), surfaces above the page. In page content, a login form included, a button is as wide as its label: `lg` or `xl`, never `fullWidth`.
8. **Icon-only = `IconButton`** with a required `label`, which becomes the tooltip and the accessible name. Use icon-only only for universally understood glyphs or dense toolbars.

## On touch

- **A button with an icon shows only its icon.** Under a finger, the label steps aside (screen readers still get it), so a row of actions fits a phone. Give an icon to every button a phone has to fit.
- **The primary keeps its words.** It is the one action the person must read; so do buttons that fill a bar (`ActionBar`, a stacked `ButtonSet`), they have the room.
- **The consequence still plays.** Loading, success and failure show in the slot (orb, check, error mark), label or not.
- **Colour arrives at once.** A button turning red, green or primary takes its label and icon with it in the same frame; nothing lags a shade behind.

## States

- **Hover.** The colour steps to `-hover`, the surface lifts and tilts toward the pointer with a glare, and it sways once as the pointer lands: a touch on water (240ms, expressive).
- **Pressed.** The button gives (98%, 97% on the primary) and a ring of water spreads from the point of touch, in the surface's own colour.
- **Released.** It wobbles back the way a drop settles (700ms, expressive), then rests. From the keyboard the ring spreads from the centre.
- **Focus.** The focus ring, never the hover lift.
- **Working.** Sofia thinks in the icon slot in the button's own colour; re-submit is blocked.
- **Disabled.** Layer-2 fill with disabled text; nothing answers.
- **Reduced motion.** No sway, ring or wobble; the colour change alone marks the state.

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

Heights follow `--vita-density`. Buttons in a `ButtonSet` share one size.
