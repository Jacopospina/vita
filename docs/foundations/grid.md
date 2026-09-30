---
title: Grid & layout
summary: A 16-column grid for page structure, stacks for everything inside it.
status: stable
import: "import { Grid, Column, Stack, Inline, Spacer, Container } from \"@/components/corpus/layout\""
use_when:
  - Laying out a page or region (Grid + Column)
  - Arranging elements vertically (Stack) or horizontally (Inline)
avoid_when:
  - Hand-written flex/grid divs with custom gaps → use Stack/Inline/Grid
  - Absolute positioning for layout → only for overlays, badges and icons inside controls
---

## The grid

| Breakpoint | Columns | Gutter (`wide`) | Page margin |
|---|---|---|---|
| sm (< 672px) | 4 | 32px | 16px |
| md (≥ 672px) | 8 | 32px | 32px |
| lg (≥ 1056px) | 16 | 32px | 32px |

The gutter comes in three modes:

- **wide** (32px): default, for content pages.
- **narrow** (16px): dashboards and dense UIs.
- **condensed** (1px): tile mosaics and image walls.

```tsx
<Grid>
  <Column sm={4} md={8} lg={4}>Filters</Column>
  <Column sm={4} md={8} lg={12}>Results</Column>
</Grid>
```

## Opinionated layouts

Use these instead of inventing proportions.

| Layout | lg columns | When |
|---|---|---|
| Full | 16 | Tables, dashboards, canvases |
| Sidebar + content | 4 + 12 | Filters + results, settings nav + form |
| Content + aside | 11 + 5 | Detail page + metadata/activity |
| Readable | `Container width="readable"` | Articles, docs, long forms (~65ch) |
| Form | 8, max `max-w-xl` | Every form. Never stretch fields to full width. |

## Stacks

- `Stack` is vertical and has a 16px gap by default.
- `Inline` is horizontal, centred, with an 8px gap.
- Gap names map to the spacing scale: `3xs 2 · 2xs 4 · xs 8 · sm 12 · md 16 · lg 24 · xl 32 · 2xl 48 · 3xl 64`.

Rhythm rules:

- **Related** items (a label and its value, an icon and its text): `2xs`–`xs`.
- **Siblings** in a group (form fields, list rows): `md`–`lg`.
- **Sections**: `xl`–`2xl`.
- The gap between groups must always be larger than the gap within a group. That's how proximity creates hierarchy without borders.

## Don't

- Nest a `Grid` inside a `Column` more than once.
- Use percentages or arbitrary widths.
- Center-align body text or forms in product UI. Left alignment scans faster.
