---
title: Icons
summary: One icon set through one Icon component, at four sizes. An icon supports a label; it rarely replaces one.
status: stable
import: "import { Icon } from \"@/components/vita/icon\"\nimport { Add } from \"@/components/vita/icons\"\n\n<Icon as={Add} size=\"sm\" />"
use_when:
  - Reinforcing an action or a status label
  - Icon-only controls with universal meaning (close, search, menu, overflow), always with a tooltip
avoid_when:
  - Other icon libraries → forbidden
  - Decorating headings or list items
  - Large illustrative use → Pictogram
---

## Sizes

- **`sm`: 16px.** Inside buttons, fields, tags and menus (default).
- **`md`: 20px.** Standalone icon buttons, header, toolbars.
- **`lg`: 24px.** Dense empty states.
- **`xl`: 32px.** Tiles and feature highlights.

## Rules

1. **One way in.** Import from `@/components/vita/icons`, render with `<Icon as={…} />`.
2. **Icons inherit text color.** Only status icons get their own color.
3. **Decorative by default.** Pass `label` only when the icon alone carries meaning.
4. **One icon per concept.** The taxonomy maps concepts to icons: delete is always `TrashCan`.
5. **Far right on buttons.** A button's icon always sits at its right edge, after the label.
6. **Icon-only needs a label.** `IconButton` requires it and shows it as a tooltip.
7. **Disclosure chevrons: down when closed, up when open.** A chevron that reveals content below always points down while closed and rotates up once open. Sideways chevrons mean "go to" or "open to the side" only.

## Common mapping

| Concept | Icon |
|---|---|
| Create | `Add` |
| Edit | `Edit` |
| Delete | `TrashCan` |
| More actions | `OverflowMenuVertical` / `OverflowMenuHorizontal` |
| Settings | `Settings` |
| Filter | `Filter` |
| Export | `Download` |
| External link | `Launch` |
| Close | `Close` |
| Status | `CheckmarkFilled` · `WarningAltFilled` · `ErrorFilled` · `InformationFilled` |
