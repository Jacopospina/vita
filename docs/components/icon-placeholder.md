---
title: Icon placeholder
summary: The leading visual slot — a colored glyph on a neutral squircle tile, in small, medium and large. One look for list items, notifications and toast banners.
status: stable
import: "import { IconPlaceholder } from \"@/components/corpus/icon-placeholder\"\n\n<IconPlaceholder icon={Bot} tone=\"info\" size=\"md\" />\n<IconPlaceholder icon={WarningAltFilled} tone=\"warning\" size=\"lg\" />"
use_when:
  - Leading visual of a list row (settings, objects)
  - The left side of a notification or toast banner
  - An agent or app mark next to its name
avoid_when:
  - An icon inline with text or inside a button → Icon
  - Large illustrative marks → Pictogram
  - A person → avatar media
related: [list-item, notification, icons]
---

## Sizes

| Size | Tile | Where |
|---|---|---|
| `sm` | 24px | Dense rows, inline marks |
| `md` | 32px | List items |
| `lg` | 40px | Notifications and toast banners |

> [!NOTE]
> The radius is proportional, 22% of the tile, so every size is the same shape. The tile is flat, with no shadow.

## Rules

- **Two surfaces.** `tint` (default): a faint dark wash, on white surfaces like notifications. `solid`: a white tile, inside grey list groups (ListItem uses it).
- **Tone = meaning.** Neutral or brand for categories; a status tone only when the tile is that status, with its own glyph ([Color → Status semantics](#/foundations/color)).
1. **Never hand-roll an icon on a square.** Every icon-on-a-tile in Corpus is an `IconPlaceholder`, so tone, radius and size stay in sync.
2. **One look, three sizes.** A neutral tile with a colored glyph, everywhere. Only the size changes. The glyph's `tone` (neutral, brand, info, success, warning, error) carries the category or the kind.
3. **Decorative.** The tile is `aria-hidden`; the text beside it carries the meaning.

> [!NOTE]
> Renamed from `IconTile`. Import `IconPlaceholder` from `icon-placeholder`.
