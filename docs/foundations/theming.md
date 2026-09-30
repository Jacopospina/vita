---
title: Theming & personalisation
summary: Change about ten variables in one file and the whole system re-skins — color, shape, density, type and motion.
status: stable
import: "@import \"./styles/corpus.css\";  /* once, at the app root */\n/* then edit ONLY src/styles/theme.css */"
use_when:
  - Adapting Corpus to a new brand or product
  - Making a denser admin tool or a calmer consumer app
avoid_when:
  - Tweaking a single component → change the knob, or propose a variant upstream
  - Adding a one-off color → add a semantic token through a design-system change
---

> [!TIP] Open the palette icon in the header to tune every knob live, then copy the generated `theme.css`.

## The knobs

| Knob | Default | Changes |
|---|---|---|
| `--corpus-brand-hue` / `-chroma` | `257.4` / `0.218` | Primary, links, focus, selection, AI gradient |
| `--corpus-neutral-hue` / `-chroma` | `286` / `0.007` | The tint of every grey, surface and border |
| `--corpus-hue-success/warning/error/info` | `147 / 63 / 29 / 257` | Support colors (keep their meaning) |
| `--corpus-radius` | `0.5rem` | Every corner |
| `--corpus-density` | `1.08` | Control heights and insets fully; padding, margin and gap at half strength (never below 90%) |
| `--corpus-font-sans` / `-mono` / `-numeric` | Google Sans Flex / Code / Code | Typefaces |
| `--corpus-type-base` / `-ratio` | `0.8125rem` / `1.2` | The whole type ramp (13px body: desktop-native) |
| `--corpus-motion-scale` | `1` | Every duration (0 = off) |

## Presets

- **square.** Square corners, grotesk type, pure greys (enterprise).
- **soft.** 12px corners, system font, roomier (consumer).
- **mono.** Near-monochrome brand, compact (developer tools).

## Rules

1. **Product code never reads knobs.** It uses semantic utilities: `bg-primary`, `h-control-md`, `rounded-md`.
2. **New semantic tokens are a system change.** Add them to `tokens.css` in light and dark, then document them in *Color*.
3. **Support hues keep their meaning.** Shift them ±15°, never swap them.
4. **Check contrast after color changes.** Yellow and lime brands (hue 85–120) usually fail with white text.

> [!NOTE] Dark mode: add `.dark` or `data-theme="dark"` to any ancestor. Increased contrast: automatic, or `data-corpus-contrast="high"`.
