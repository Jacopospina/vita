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
| `--vita-warmth` | `0` | The screen's white point, from `-1` (cool) to `1` (warm): one tint over everything, every colour keeps its hue |
| `--vita-hue-success/warning/error/info` | `147 / 50 / 29 / 257` | Support colors (keep their meaning) |
| `--vita-radius` | `0.5rem` | Every corner, including pills (tags, chips, capsules square off at 0) and icon tiles (always proportional to their size) |
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

## Warmth follows the weather

- **A colour temperature, not a new hue.** Warmth changes the light the screen is seen in, like a display's warm setting. Daylight (6500 K) is neutral; `1` is about 4000 K and `-1` about 10000 K. Whites turn cream or icy, blacks stay black, every colour keeps its hue.
- **Your grey stays yours.** Stone, Mist, Sand, Moss or Haze is the grey the interface is made of; warmth only changes the light it's seen in.
- **Three states.** With `useWeatherTint` turned on (it's off by default) the screen leans **cool** below 15 °C, stays **neutral** from 15 to 18 °C, and leans **warm** from 18 °C up.
- **On top of the knob.** The weather adds its lean to `--vita-warmth`, about 5600 K on a warm day and 7100 K on a cold one, so a warm theme on a cold day sits a little cooler, never orange.
- **Where the reading comes from.** The current temperature for the user's area (estimated from their timezone, never from a location prompt), refreshed every 30 minutes. Offline, it falls back to a seasonal estimate.
- **It fades.** A change of state cross-fades the page once.
- **Four modes.** **Neutral** (`"none"`, the default) never leans. **Dynamic** (`"dynamic"`) changes with the weather, **Cold** (`"cold"`) always leans cool and **Warm** (`"warm"`) always leans warm. The choice is remembered on the device.
