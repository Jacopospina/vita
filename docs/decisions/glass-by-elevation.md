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
- **Tier by layer.** glass-1…5: blur 10 · 14 · 18 · 24 · 30px, fill 24 · 20 · 16 · 80 · 8% (dialogs revised, below).
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

## Revision — 2026-10-01: dialogs are denser

- **glass-4 fill 12% → 44%.** Modals and Spotlight blended into the page behind them; a dialog is where people read and decide, so it must read first.
- **Only this tier.** Every other tier keeps its fill; blur still rises with the layer.
- **Still glass.** 44% stays below the rejected near-opaque range (66–86%), so the frost still shows.

## Revision — 2026-10-01 (later): dialogs are near-opaque

- **glass-4 fill 44% → 80%.** 44% still let the page blend through; a dialog must read as a solid sheet. The blur stays, so only a hint of the page shows at the edges of colour.
- **The "near-opaque" rejection no longer applies to dialogs.** It still holds for every other tier: shell, menus and notifications stay thin glass.
