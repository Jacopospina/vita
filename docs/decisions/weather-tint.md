---
title: Weather tint
summary: Floating layers lean cold or warm with the weather outside, Dynamic by default, or fixed Neutral, Cold or Warm.
status: accepted
date: 2026-10-01
decided_by: Jacopo
related: [theming, material]
---

## Decision

- **Three states.** Cold below 15 °C, neutral 15–18 °C, warm from 18 °C. Chroma 0.014.
- **Four modes.** Dynamic (default) · Neutral · Cold · Warm, remembered per device.
- **Floating layers only.** Glass surfaces carry it; the page, cards, fields, lines and text stay neutral.
- **Neutrals are pure grey** by default (no permanent violet cast).

## Why

- **A continuous, barely-there tint read as nothing.** Three clear states read as intent.
- **Tinting every surface muddied the hierarchy**; on the floating layers it reinforces it.

## Rejected, avoid

- **Tinting the page background or in-flow containers.**
- **An on/off toggle.** People wanted to pin a state, not just disable it.

## Revisit when

- **Glass fills change a lot** (the tint's strength rides on them).
