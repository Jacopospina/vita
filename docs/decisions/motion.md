---
title: Motion
summary: Nothing snaps, except page load, global appearance swaps and floating-surface sizing, which never animate per element.
status: accepted
date: 2026-10-01
decided_by: Jacopo
related: [motion, interaction]
---

## Decision

- **Every state change transitions** (global productive transitions, FLIP for layout).
- **Page load doesn't animate layout.** Transitions and FLIP wait until fonts and layout settle.
- **Theme, preset and tint swap in one cross-fade**, never thousands of per-element transitions.
- **Floating surfaces are measured, not animated**, they never grow from 0.
- **Entrances never leave a filter behind** (it breaks glass inside).
- **Numbers swap digit by digit,** old and new moving together, never clipped, always regular weight.
- **Dropdown lists slide in from below.** No scale, no width growth.

## Why

- **Per-element transitions on load and theme switches** caused glides from the top left and lag.

## Rejected, avoid

- **Slot-machine reels in a clipping window.**
- **Animating a popover's width or a list's options while it opens.**

## Revisit when

- **A new global appearance knob appears** (route it through the cross-fade).

## Revision, 2026-10-01

- **Static layout never moves.** Layout glide (FLIP) is opt-in, only for lists whose items are added, removed or reordered. Stack and Inline no longer glide by default: font loading and reflow made headings and buttons drift.
- **No transition before styles exist.** The page sets the boot flag before any CSS applies, and style hot-updates (development) apply with transitions off, otherwise every element animated from its unstyled, top-left default.

