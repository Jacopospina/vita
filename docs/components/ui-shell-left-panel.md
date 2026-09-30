---
title: UI shell left panel
summary: Side navigation between the product's main areas. Expanded (default) or rail; an overlay drawer on small screens.
status: stable
import: "import { LeftPanel, SideNavItem, SideNavMenu, SideNavSection } from \"@/components/corpus/ui-shell\""
use_when:
  - Products with 5+ top-level areas or two-level navigation
  - Settings/admin areas with many sections
avoid_when:
  - 2–4 areas → HeaderNavItem in the Header
  - Views of one object → Tabs
  - Deep hierarchies → TreeView inside the panel
related: [ui-shell-header, tree-view, breadcrumb]
---

## Variants

- **Expanded** (256px): the default for products used daily.
- **Rail** (48px, expands on hover): content-heavy products where screen space matters. Icons are mandatory.
- **Mobile:** an off-canvas drawer opened from the header's ☰, with a scrim.

## Rules

1. **Max two levels:** `SideNavMenu` groups children. A third level means the IA needs rethinking.
2. **Sections** (`SideNavSection title`) group areas by purpose ("Workspace", "Admin"), with ≤ 7 items per section.
3. **Active item:** a `selected` background plus medium weight. Exactly one active item.
4. **Icons:** all top-level items have one, or none do. In rail mode they're required.
5. **Labels match page titles exactly** (taxonomy).
6. **Order by frequency of use,** not alphabetically. Settings go last.

## Look

- **Floating glass.** The panel floats 8px from the window's edges, with frosted `glass` and rounded corners. Rows inside use the concentric radius.
- **Sections like a file browser.** A `SideNavSection` shows a small muted header over its rows. With `collapsible`, a chevron appears on hover and the rows fold away.
- **Rows.** Compact, with an accent icon and the label. The current page gets a soft grey highlight, not a coloured fill.
