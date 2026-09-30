---
title: Spacing
summary: One scale (2px-based), density-aware control sizes, and a hard ban on off-scale values.
status: stable
use_when:
  - Any padding, margin or gap
avoid_when:
  - Arbitrary values like p-[13px] → forbidden
  - Off-scale steps (p-5, gap-7, m-9, p-11) → the audit rejects them
---

## The scale

These Tailwind steps are allowed. Everything else fails `pnpm audit:ds`.

| Token | Tailwind | px | Typical use |
|---|---|---|---|
| 3xs | `0.5` | 2 | Icon-to-text nudge, tag padding |
| 2xs | `1` | 4 | Label → field, tight inline groups |
| xs | `2` | 8 | Icon + label, button groups |
| sm | `3` | 12 | Inside compact containers |
| md | `4` | 16 | Default container padding, sibling gap |
| lg | `6` | 24 | Form field gap, card padding (roomy) |
| xl | `8` | 32 | Between groups |
| 2xl | `10` / `12` | 40 / 48 | Between sections |
| 3xl+ | `16` `20` `24` `40` | 64 · 80 · 96 · 160 | Page-level whitespace, heroes |

`1.5` (6px) and `px` (1px) are allowed only for hairline alignment inside components.

## Control sizes follow density

Heights and horizontal insets of controls come from `--corpus-density`. Never hard-code them:

- `h-control-xs` 24 · `sm` 32 · `md` 40 (default) · `lg` 48 · `xl` 64
- `px-inset-sm` 8 · `px-inset` 12 · `px-inset-lg` 16

To make the whole product more compact, change **density**, never individual paddings.

## Radius & elevation

- **Radius:** `rounded-sm` (inner elements: tags, checkboxes, menu items) · `rounded-md` (controls) · `rounded-lg` (tiles, panels) · `rounded-xl` (modals) · `rounded-full` (pills, avatars, switches). Nested corners get a smaller radius than their container.
- **Elevation:**
  - `shadow-raised`: cards that sit above the page.
  - `shadow-floating`: menus, popovers, tooltips.
  - `shadow-overlay`: modals, side panels, toasts.

  Anything that floats needs a shadow; nothing that sits in the flow does.
