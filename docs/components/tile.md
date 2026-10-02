---
title: Tile
summary: A surface that groups related content. Base, clickable, selectable and expandable, and never nested.
status: stable
import: "import { Tile, ClickableTile, SelectableTile, ExpandableTile, TileGroup, TileSet, TileSetItem } from \"@/components/vita/tile\""
use_when:
  - Base, grouping related info on a page (a metric, a summary)
  - Clickable, a card that is one destination (a project, a feature area)
  - Selectable, choosing among rich options (plans, templates), single or multi
  - Expandable, summary first, details on demand
  - TileSet, several cards that share one meaning, as one object
avoid_when:
  - Tables of records → DataTable
  - Wrapping every section in a card "to make it look designed" → use whitespace
  - Tiles inside tiles → flatten the hierarchy
related: [contained-list, radio-button, checkbox, accordion]
---

> [!IMPORTANT] Cards that share one meaning are one `TileSet`: the set owns background and radius, items inside are flat and divided by hairlines. Never a grid of separate cards with gaps.

## Rules

1. **Surfaces:**
   - `Tile` sits on `layer-1` with no border.
   - `elevated` (raised surface + border) is only for tiles over complex backgrounds. Tiles never cast a shadow, resting or hovered.
2. **A ClickableTile has one destination and no inner interactive elements.** Its arrow slides slightly on hover (productive motion).
3. **Selectable tiles:**
   - `single` uses radio semantics inside a `TileGroup`; `multi` uses checkbox semantics.
   - The selected state is a primary border plus a `selected` background plus a check icon, never color alone.
4. **Titles** use `headline`, descriptions `body muted`. At most one pictogram, at the top.
5. **Grids of tiles** use `Grid gutter="narrow"`, or `condensed` for mosaic layouts.
