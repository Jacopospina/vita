---
title: Spacing
summary: One 2px-based scale, density-aware control sizes, and a hard ban on off-scale values.
status: stable
use_when:
  - Any padding, margin or gap
avoid_when:
  - Arbitrary values like p-[13px] → forbidden
  - Off-scale steps (p-5, gap-7, m-9) → the audit rejects them
---

## The scale

| Name | Tailwind | px | Typical use |
|---|---|---|---|
| 3xs | `0.5` | 2 | Icon nudges |
| 2xs | `1` | 4 | Label → field |
| xs | `2` | 8 | Icon + label |
| sm | `3` | 12 | Compact containers |
| md | `4` | 16 | Default padding, siblings |
| lg | `6` | 24 | Form fields, roomy cards |
| xl | `8` | 32 | Between groups |
| 2xl | `10` / `12` | 40 / 48 | Between sections |
| 3xl+ | `16` `20` `24` `40` | 64–160 | Page whitespace |

## Sizes follow density

- **Control heights.** `h-control-xs` 24 · `sm` 32 · `md` 40 · `lg` 48 · `xl` 64.
- **Control insets.** `px-inset-sm` 8 · `px-inset` 12 · `px-inset-lg` 16.
- **One knob.** Change `--corpus-density`, never individual paddings.

## Radius

- **`rounded-sm`.** Inner elements: tags, checkboxes, menu items.
- **`rounded-md`.** Controls.
- **`rounded-lg`.** Tiles and panels.
- **`rounded-xl`.** Modals.
- **`rounded-full`.** Pills, avatars, switches.

## Elevation

- **`shadow-raised`.** Cards above the page.
- **`shadow-floating`.** Menus, popovers, tooltips.
- **`shadow-overlay`.** Modals, panels, toasts.

> [!NOTE] Anything that floats has a shadow; nothing in the page flow does. Nested corners are always smaller than their container's.
