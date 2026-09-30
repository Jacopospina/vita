---
title: Icon placeholder
summary: The leading visual slot — a glyph on a squircle tile in small, medium and large. Used by list items, notifications and toast banners.
status: stable
import: "import { IconPlaceholder } from \"@/components/corpus/icon-placeholder\"\n\n<IconPlaceholder icon={Bot} tone=\"brand\" />\n<IconPlaceholder icon={WarningAltFilled} variant=\"soft\" tone=\"warning\" size=\"lg\" />"
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

## Variants

| Variant | Tile | Glyph | Use for |
|---|---|---|---|
| `filled` (default) | Colored by `tone` | White | Categories: settings rows, agent and app marks |
| `soft` | Neutral surface | Colored by `tone` | Semantic kinds: notifications, banners, callouts |

## Sizes

| Size | Tile | Where |
|---|---|---|
| `sm` | 24px | List rows |
| `md` | 32px | Compact headers |
| `lg` | 40px | Notifications and toast banners |

## Rules

1. **Never hand-roll a colored square.** Every icon-on-a-tile in Corpus is an `IconPlaceholder`, so tone, radius and size stay in sync.
2. **Tone carries meaning.** `filled` tones name a category. `soft` tones name a status kind.
3. **Decorative.** The tile is `aria-hidden`; the text beside it carries the meaning.

> [!NOTE]
> Renamed from `IconTile`. Import `IconPlaceholder` from `icon-placeholder`.
