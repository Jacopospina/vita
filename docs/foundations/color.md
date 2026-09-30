---
title: Color
summary: Semantic tokens only. Color communicates interactivity, status and hierarchy; it never decorates.
status: stable
use_when:
  - Coloring anything, via semantic utilities (bg-layer-1, text-muted-foreground, border-border-subtle)
avoid_when:
  - Palette colors in product code (bg-blue-500) → they don't exist as utilities
  - Hex/rgb/oklch literals → forbidden
  - Color as the only carrier of meaning → pair it with an icon and text
---

> [!IMPORTANT] Two layers: **palette** (13 hues × 11 steps, primitives) feeds **semantic tokens** (what product code uses). Product code never touches the palette.

## The palette

- **13 system hues.** Red, orange, yellow, green, mint, teal, cyan, blue, indigo, purple, pink, brown, gray.
- **11 steps each.** 50 → 950 on one shared lightness curve; step 500 is the exact system color.
- **For charts and new tokens only.** Available as `--corpus-palette-{hue}-{step}` variables, never as utility classes.

## Semantic families

| Family | Tokens | Rule |
|---|---|---|
| Surfaces | `background` · `layer-1..3` · `raised` · `field` · `inverse` · `overlay` | Each nesting steps one layer. Floating things use `raised`. |
| Text | `foreground` · `muted-foreground` · `helper` · `placeholder` · `disabled-foreground` | Two text levels per region at most. |
| Interactive | `primary` (+ `-hover` `-active` `-foreground` `-subtle`) · `secondary` · `link` · `focus` | Brand color means "you can act here". |
| State | `hover` · `active` · `selected` · `selected-foreground` | Translucent washes that work on any layer. |
| Icon surface | `icon-surface` | The IconPlaceholder tile. Translucent white: a light well in light mode, a faint lift in dark mode. |
| Support | `success` · `warning` · `error` · `info` (+ `-subtle`, `-foreground`) | Status only. Text on tints uses `-foreground`. |
| Lines | `border-subtle` · `border` · `border-field` · `border-strong` | Fields use `border-field` (≥ 3:1). |
| AI | `ai-spectrum` · `ai-subtle` | The rainbow outline, only for AI-generated content. |

## Rules

1. **Neutral first.** About 90% of a screen is greys. More than one brand-colored element per region means hierarchy has collapsed.
2. **One accent.** No secondary brand colors. Charts use the palette; everything else uses semantic tokens.
3. **Status colors are reserved.** Green is success, red is error or destructive, orange is warning. A red "Sale" badge is a bug.
4. **Dark mode is its own palette.** Surfaces get lighter as they rise; system colors brighten. Never write `dark:` overrides.

## Contrast

> [!WARNING] The standard system blue and red with white text reach about 4:1, which is fine for 16px+ and bold labels but short of AA 4.5:1 for small text.

- **Increased contrast is automatic.** When the OS asks for more contrast, Corpus switches to the high-contrast variants (blue 7.6:1).
- **Force it per product.** Set `data-corpus-contrast="high"` on `<html>` for regulated or accessibility-critical products.
- **Text on tints always passes.** Every `-foreground` token uses the high-contrast variant.
