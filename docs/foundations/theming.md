---
title: Theming & personalisation
summary: Change about ten variables in one file and the whole system re-skins, color, shape, density, type and motion.
status: stable
import: "@import \"./styles/vita.css\";  /* once, at the app root */\n/* then edit ONLY src/styles/theme.css */"
use_when:
  - Adapting Vita to a new brand or product
  - Making a denser admin tool or a calmer consumer app
avoid_when:
  - Tweaking a single component → change the knob, or propose a variant upstream
  - Adding a one-off color → add a semantic token through a design-system change
---

> [!TIP] Open the palette icon in the header to tune every knob live, then copy the generated `theme.css`.

## The knobs

| Knob | Default | Changes |
|---|---|---|
| `--vita-brand-hue` / `-chroma` | `257.4` / `0.218` | Primary, links, focus, selection, AI gradient |
| `--vita-neutral-hue` / `-chroma` | `286` / `0` | The tint of every grey, surface and border. Pure grey by default; raise the chroma to tint |
| `--vita-hue-success/warning/error/info` | `147 / 50 / 29 / 257` | Support colors (keep their meaning) |
| `--vita-radius` | `0.5rem` | Every corner |
| `--vita-density` | `1` | Control heights and insets fully; padding, margin and gap at half strength (never below 90%). Floored at 1.1 on touch |
| `--vita-font-sans` / `-mono` / `-numeric` | Google Sans Flex / Code / Code | Typefaces |
| `--vita-type-base` / `-ratio` | `0.8125rem` / `1.2` | The whole type ramp (13px body: desktop-native). Floored at 16px on touch |
| `--vita-motion-scale` | `1` | Every duration (0 = off) |

> [!NOTE] Touch floors. When a finger is the pointer, density reads as at least 1.1 and the type base as at least 16px: fields reach 44px, text is readable at arm's length, and iOS no longer zooms into fields. `max()` only raises, so a team's own larger values stay.

## Presets

- **square.** Square corners, grotesk type, pure greys (enterprise).
- **soft.** 12px corners, system font, roomier (consumer).
- **mono.** Near-monochrome brand, compact (developer tools).

## Rules

1. **Product code never reads knobs.** It uses semantic utilities: `bg-primary`, `h-control-md`, `rounded-md`.
2. **New semantic tokens are a system change.** Add them to `tokens.css` in light and dark, then document them in *Color*.
3. **Support hues keep their meaning.** Shift them ±15°, never swap them.
4. **Check contrast after color changes.** Yellow and lime brands (hue 85–120) usually fail with white text.

> [!NOTE] Dark mode: add `.dark` or `data-theme="dark"` to any ancestor. Increased contrast: automatic, or `data-vita-contrast="high"`.

## Light and dark

- **Follows the sun.** Vita is light while the sun is up where the user is, and dark after sunset (`useSunTheme`). It estimates where the user is from their timezone (within about an hour of the real sunset) and never asks for their location: a theme is not worth a permission prompt.
- **People can still choose.** The theme toggle overrides it until the next sunrise or sunset.

## Greys follow the weather

- **Three states.** With `useWeatherTint` (on by default) the greys are **cold** below 15 °C, **neutral** from 15 to 18 °C, and **warm** from 18 °C up.
- **Floating layers only.** The tint colours only surfaces that float on a z-index, the glass of the side nav, header, right panel, menus, popovers, dialogs, notifications and pinned toolbars. The page, in-flow cards and tiles, fields, lines and text stay neutral.
- **Noticeable, still grey.** A tint is chroma 0.014: you see the warmth or the cool, but greys stay greys.
- **Where the reading comes from.** The current temperature for the user's area (estimated from their timezone, never from a location prompt), refreshed every 30 minutes. Offline, it falls back to a seasonal estimate.
- **It fades.** A change of state cross-fades the page once.
- **Four modes.** **Dynamic** (`"dynamic"`, the default) changes with the weather. **Neutral** (`"none"`) never tints, **Cold** (`"cold"`) is always cold and **Warm** (`"warm"`) is always warm. The choice is remembered on the device. While a tint is on, it replaces the neutral hue and tint knobs.
