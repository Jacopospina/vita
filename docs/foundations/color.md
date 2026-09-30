---
title: Color
summary: Semantic tokens only. Color communicates interactivity, status and hierarchy; it never decorates.
status: stable
use_when:
  - Coloring anything, via semantic utilities (bg-layer-1, text-muted-foreground, border-border-subtle)
avoid_when:
  - Palette colors (bg-blue-500) → they don't exist in Corpus
  - Hex/rgb/oklch literals in product code → forbidden
  - Color as the only carrier of meaning → pair it with an icon and text
---

## Token families

| Family | Tokens | Rule |
|---|---|---|
| Surfaces | `background` · `layer-1..3` · `raised` · `field` · `inverse` · `overlay` | Each nested region steps **one** layer. Floating things use `raised`. |
| Text | `foreground` · `muted-foreground` · `helper` · `placeholder` · `disabled-foreground` | Two text levels per region at most: `foreground` + `muted-foreground`. |
| Interactive | `primary` (+ `-hover` `-active` `-foreground` `-subtle`) · `secondary` · `link` · `focus` | Brand color = "you can act here". Never use `primary` for decoration. |
| State | `hover` · `active` · `selected` · `selected-foreground` | `hover`/`active` are translucent washes that work on any layer. |
| Support | `success` · `warning` · `error` · `info` (+ `-subtle`, `-foreground`) | Only for status. Use `-subtle` backgrounds with `-foreground` text. |
| Lines | `border-subtle` · `border` · `border-field` · `border-strong` | Dividers use `subtle`. Field outlines use `field` (≥ 3:1 contrast). |
| AI | `ai-from` · `ai-to` · `ai-subtle` | Only for AI-generated content (see *AI label*). |

## Layering and depth

```
background ─┬─ layer-1  (tiles, table containers, side nav)
            │    └─ layer-2  (table header, nested panel, zebra rows)
            │         └─ layer-3  (rare; a third nesting usually means the layout is wrong)
            └─ raised + shadow (menus, popovers, modals: anything that floats)
```

## Opinions

1. **Neutral first.** A screen should be about 90% neutrals. If more than one element per region is brand-colored, hierarchy has collapsed.
2. **One accent.** Don't introduce secondary brand colors. Categorical data visualisation gets its own palette. Everything else doesn't.
3. **Status colors are reserved.** Green means success/on, red means error/destructive, amber means warning. A red "Sale" badge is a bug.
4. **Dark mode is not inverted light mode.** Surfaces get *lighter* as they rise. The tokens already do this. Never use `dark:` overrides in product code.
5. **Contrast:**
   - Body text ≥ 4.5:1.
   - Large text and UI boundaries ≥ 3:1.
   - `placeholder` is exempt, but never put essential info in a placeholder.
