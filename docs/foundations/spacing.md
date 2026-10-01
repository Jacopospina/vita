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

> [!IMPORTANT] Belonging has no gaps. Items that belong together (button sets, action bars, swatches, segments) touch at 0px — use `Group`, `ButtonSet` or `ActionBar`. Spacing is for separating things that don't belong together.

## Touch or space?

- **Belong together → touch.** Button sets, action bars, joined fields, swatches: 0px, one shape (`Group`, `ButtonSet`, `FormRow`).
- **Different components → space and align.** A button next to a status, a field next to a hint: at least 8px apart (12px by default with `Inline`), vertically centred on each other.

## The scale

| Name | Tailwind | px at density 1 | Typical use |
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

- **Control heights.** `h-control-xs` 20 · `sm` 24 · `md` 28 · `lg` 32 · `xl` 36 — desktop-native density (mini · small · regular · large · extra large).
- **Field heights.** `h-field-sm` 36 · `md` 40 · `lg` 44 — a step taller to hold the floating label.
- **Control insets.** `px-inset-sm` 6 · `px-inset` 8 · `px-inset-lg` 12.
- **One knob.** `--corpus-density` scales control sizes fully, and the spacing scale (padding, margin, gap) at half strength with a 90% floor — so small gaps stay comfortable at low density.
- **Touch floors it at 1.1.** Under a finger (`pointer: coarse`) every size above reads as if density were at least 1.1: `h-control-md` 31 · `h-field-md` 44. Small standalone controls add a 44px hit area with `tap`.

## Radius

- **`rounded-sm`.** Inner elements: tags, checkboxes, menu items.
- **`rounded-md`.** Controls.
- **`rounded-lg`.** Tiles and panels.
- **`rounded-xl`.** Modals.
- **`rounded-full`.** Pills, avatars, switches.

## Concentric radius

- **Inner radius = outer radius − padding.** A 20px container with 8px padding gives its children a 12px radius; never below 0.
- **Mark the container.** Use `scope-sm|md|lg|xl` instead of `rounded-*` on containers that hold rounded children.
- **Derive the child.** Use `rounded-inner-{padding step}` (e.g. `rounded-inner-2` inside `p-2`); a second level uses `rounded-inner2-*`.
- **Derive the wrapper.** A container that wraps controls takes its radius from them: `rounded-outer-{padding step}` = control radius + padding (e.g. `rounded-outer-1 p-1` around 8px controls gives 12px).
- **Never sharp.** Every container, row and band is rounded unless a component doc says otherwise.
- **Built in.** Segmented controls, toolbars, menus, lists, the composer, code snippets and modals already follow it.

## Elevation

- **`shadow-raised`.** Cards above the page.
- **`shadow-floating`.** Menus, popovers, tooltips.
- **`shadow-overlay`.** Modals, panels, toasts.

> [!NOTE] Anything that floats has a shadow; nothing in the page flow does. Nested corners always follow the concentric formula.
