---
title: Theming & personalisation
summary: Change about ten variables in one file and the whole system re-skins: color, shape, density, type and motion.
status: stable
import: "@import \"./styles/corpus.css\";  /* once, at the app root */\n/* then edit ONLY src/styles/theme.css */"
use_when:
  - Adapting Corpus to a new brand or product
  - Making a denser admin tool or a calmer consumer app
avoid_when:
  - Tweaking a single component (never) → change the knob, or propose a new variant upstream
  - Adding a one-off color → add a semantic token to tokens.css via a design-system PR
---

## The knobs

`src/styles/theme.css` is the **only** file a product team edits. Everything else is derived from it.

| Knob | Default | What it changes |
|---|---|---|
| `--corpus-brand-hue` | `258` | Primary, links, focus, selection, AI gradient |
| `--corpus-brand-chroma` | `0.2` | How vivid the brand is (0 = monochrome) |
| `--corpus-neutral-hue` / `--corpus-neutral-chroma` | `258` / `0.006` | Tint of every grey, surface and border |
| `--corpus-hue-success/warning/error/info` | `150/75/25/245` | Support colors (keep their meaning) |
| `--corpus-radius` | `0.5rem` | Every corner, via `sm` (×0.5), `md` (×1), `lg` (×1.5), `xl` (×2) |
| `--corpus-density` | `1` | Height of every control, row and inset (0.8 compact → 1.2 touch) |
| `--corpus-font-sans` / `-display` / `-mono` / `-numeric` | Google Sans Flex / Flex / Google Sans Code / Code | Typefaces (numeric = numbers & values) |
| `--corpus-type-base` | `0.875rem` | Body size; the whole ramp scales from it |
| `--corpus-type-ratio` | `1.2` | Contrast between type levels |
| `--corpus-motion-scale` | `1` | Multiplies every duration (0 turns motion off) |

Colors are computed in **OKLCH**, so lightness stays perceptually consistent across any hue you choose. A green brand and a purple brand get equally readable buttons.

## Presets

Add `data-corpus-preset` to `<html>` to try a full personality:

- `square`: square corners, grotesk type, pure greys (enterprise)
- `soft`: soft 12px corners, system font, slightly roomier (consumer)
- `mono`: near-monochrome brand, compact (developer tools)

Presets only override knobs. They prove the architecture, and you can copy one as a starting point.

## Dark mode

Add the `dark` class, or `data-theme="dark"`, to any ancestor. Tokens flip; components don't change.

- Never write `dark:` utilities in product code.
- If something looks wrong in dark mode, the token is wrong: fix it in `tokens.css`.

## Rules

1. **Product code never reads knobs directly.** It uses semantic utilities: `bg-primary`, `text-muted-foreground`, `h-control-md`, `rounded-md`.
2. **New semantic tokens are a design-system change.** Add them to `tokens.css`, map them in `corpus.css`, and document them in *Color*.
3. **Keep support hues meaningful.** You can shift error from red-orange to red. It can never become blue.
4. **Check contrast after changing lightness-sensitive knobs.** Brand chroma above 0.25 on hues 90–110 (yellow) will fail white text. The playground's Theme panel shows it live.

## Taxonomy personalisation

Words are themable too. See *Content, personas & taxonomy*: `corpus/taxonomy.json` holds the product's vocabulary, and the `corpus-content` skill enforces it.
