---
title: Glass by elevation
summary: Every floating surface is frosted glass, more frosted the higher it floats; the page scrolls beneath the shell so the material is visible.
status: accepted
date: 2026-10-01
decided_by: Jacopo
related: [material, color, ui-shell-header]
---

## Decision

- **Glass on every z-indexed surface.** Side nav, header, right panel, menus, popovers, dialogs, notifications, capsules, pinned toolbars.
- **Tier by layer.** glass-1…5: blur 10 · 14 · 18 · 24 · 30px, fill 24 · 20 · 16 · 12 · 8%.
- **The page scrolls under the shell.** Header, side nav and right panel float over a full-window scroller.
- **A whisper of lift.** Light mode brightens the backdrop 3%.
- **Only floating layers carry the weather tint** (via `elevated`).

## Why

- **Depth reads at a glance.** The higher a layer, the more it frosts.
- **Glass needs something behind it.** With content beside the header instead of under it, no opacity could show the material.
- **Stronger lift bleached the page** to flat white, hiding the frost.

## Rejected — avoid

- **Opaque or near-opaque fills** (66–86%). They read as plain white panels.
- **A 12% backdrop lift.** It flattened everything behind the glass to white.
- **Glass on in-flow cards and tiles.** Only z-indexed surfaces are material.

## Revisit when

- **Readability suffers** over busy content (raise the fill for that tier only).
