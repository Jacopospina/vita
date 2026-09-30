---
title: Icon tile
summary: A glyph on a small squircle tile. The one leading visual for list rows, notifications and banners.
status: stable
import: "import { IconTile } from \"@/components/corpus/icon-tile\"\n\n<IconTile icon={Bot} tone=\"brand\" />\n<IconTile icon={WarningAltFilled} variant=\"soft\" tone=\"warning\" size=\"lg\" />"
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

1. **Never hand-roll a colored square.** Every icon-on-a-tile in Corpus is an `IconTile`, so tone, radius and size stay in sync.
2. **Tone carries meaning.** `filled` tones name a category. `soft` tones name a status kind.
3. **Decorative.** The tile is `aria-hidden`; the text beside it carries the meaning.
