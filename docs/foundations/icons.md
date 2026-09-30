---
title: Icons
summary: One icon set through one Icon component, at four sizes. An icon supports a label; it rarely replaces one.
status: stable
import: "import { Icon } from \"@/components/corpus/icon\"\nimport { Add } from \"@/components/corpus/icons\"\n\n<Icon as={Add} size=\"sm\" />"
use_when:
  - Reinforcing an action or a status label
  - Icon-only controls with universally understood meaning (close, search, menu, overflow), always with a tooltip
avoid_when:
  - Other icon libraries (lucide, heroicons, material) → forbidden
  - Decorating headings or list items for visual interest
  - Large illustrative use → Pictogram
---

## Sizes

| Size | px | Where |
|---|---|---|
| `sm` | 16 | Inside buttons, fields, tags, menus, inline with body text (default) |
| `md` | 20 | Standalone icon buttons, header actions, toolbars, notifications |
| `lg` | 24 | Rare. Dense empty states, feature bullets |
| `xl` | 32 | Tiles, feature highlights |

## Rules

1. **Import glyphs from `@/components/corpus/icons` and render them only through `<Icon as={…} />`.** The wrapper handles size, `aria-hidden` and color inheritance.
2. **Icons inherit text color.** Never color an icon differently from its label, except status icons (`text-success`, `text-error`, …).
3. **Decorative by default.** If the icon is the only carrier of meaning (a status icon without text), pass `label`.
4. **One icon per concept, everywhere.** The product vocabulary maps concepts to icons in `corpus/taxonomy.json` → `icons`. Delete is always `TrashCan`, edit is always `Edit`.
5. **Buttons:** the icon goes *after* the label for primary and forward actions (`ArrowRight`, `Add`) and allows leading icons for tertiary and ghost toolbar actions (`iconPosition="start"`).
6. **Icon-only buttons need `label`.** `IconButton` enforces it and shows a tooltip.

## Common mapping

| Concept | Icon |
|---|---|
| Create / add | `Add` |
| Edit | `Edit` |
| Delete | `TrashCan` |
| More actions | `OverflowMenuVertical` (rows), `OverflowMenuHorizontal` (cards, toolbars) |
| Settings | `Settings` |
| Filter | `Filter` |
| Download / export | `Download` |
| External link | `Launch` |
| Close / dismiss | `Close` |
| Success / warning / error / info | `CheckmarkFilled` / `WarningAltFilled` / `ErrorFilled` / `InformationFilled` |
