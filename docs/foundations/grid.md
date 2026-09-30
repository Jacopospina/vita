---
title: Grid & layout
summary: A 16-column grid for page structure, stacks for everything inside it.
status: stable
import: "import { Grid, Column, Stack, Inline, Spacer, Container } from \"@/components/corpus/layout\""
use_when:
  - Laying out a page or region (Grid + Column)
  - Arranging elements vertically (Stack) or horizontally (Inline)
avoid_when:
  - Hand-written flex/grid divs with custom gaps → use Stack, Inline and Grid
  - Absolute positioning for layout → only for overlays, badges and icons in controls
---

## The grid

| Breakpoint | Columns | Gutter | Margin |
|---|---|---|---|
| sm (< 672px) | 4 | 32px | 16px |
| md (≥ 672px) | 8 | 32px | 32px |
| lg (≥ 1056px) | 16 | 32px | 32px |

- **wide gutter (32px).** Content pages; the default.
- **narrow gutter (16px).** Dashboards and dense UI.
- **condensed gutter (1px).** Tile mosaics.

## Standard layouts

- **Full (16).** Tables, dashboards, canvases.
- **Sidebar + content (4 + 12).** Filters and results, settings nav and form.
- **Content + aside (11 + 5).** A detail page with metadata or activity.
- **Readable.** `Container width="readable"` for long-form (~65 characters).
- **Form.** At most `max-w-xl`; never stretch fields full width.

## Stacks

- **`Stack`.** Vertical, 16px gap by default.
- **`Inline`.** Horizontal and centred, 8px gap by default.
- **Gap names.** `2xs` 4 · `xs` 8 · `sm` 12 · `md` 16 · `lg` 24 · `xl` 32 · `2xl` 48.

> [!IMPORTANT] Gaps between groups are always larger than gaps within a group. Proximity creates hierarchy without borders.

## Don't

- Nest a Grid inside a Column more than once.
- Use percentages or arbitrary widths.
- Centre body text or forms in product UI.
