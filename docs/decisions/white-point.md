---
title: White point
summary: Warmth is the screen's white point, one tint multiplied over everything, so colours keep their hue. The dial and the weather both set it.
status: accepted
date: 2026-10-05
decided_by: Jacopo
supersedes: weather-tint
related: [theming, material, weather-tint]
---

## Decision

- **Warmth is a colour temperature.** The screen's white point follows a real light source, from about 10000 K through daylight (6500 K, neutral) to about 4000 K, in even steps the eye reads evenly. Whites turn cream or icy, blacks stay black.
- **Colours keep their hue.** The greys keep the neutral knobs; brand, support colours, images and shadows only change in light.
- **One knob, two sources.** `--vita-warmth` (-1 cool to 1 warm) is the theme's own; the weather adds a lean of 0.25 either way (about 5600 K or 7100 K). Three states and four modes stay as before, but the weather is off by default (Neutral): a screen that changes colour on its own surprises people who didn't ask for it.
- **Free when neutral.** The layer exists only while the screen leans, so a neutral screen pays nothing.

## Why

- **Swapping the greys' hue read as a different colour,** not as warmth: a tinted grey turned into another tint.
- **A white point is how screens already do it,** so people read it as light, not as a new palette.

## Rejected, avoid

- **Tinting only the floating layers** (the previous record): the warmth stopped at the glass, and the rest of the screen stayed cold.
- **Rotating or lerping the greys' hue toward warm or cool.**

## Revisit when

- **A phone shows scroll cost** from the full-screen blend while the screen leans.
