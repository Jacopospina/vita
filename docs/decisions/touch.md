---
title: Touch adapts by itself
summary: When a finger is the pointer, Vita grows its targets, its type and its hit areas, lightens its glass and switches the thinking orb to a filter-free renderer, without a knob and without a product doing anything.
status: accepted
date: 2026-10-01
decided_by: Jacopo
related: [accessibility, spacing, theming, material, thinking, glass-by-elevation]
---

## Decision

- **Touch is detected, never configured.** `pointer: coarse` (phones, tablets) is the one signal. There is no touch preset and no touch knob.
- **Density floors at 1.1.** Controls, fields and insets read as if `--vita-density` were at least 1.1; `h-field-md` lands on 44px. A team's larger value still wins (`max()` only raises).
- **Type floors at 16px.** The whole ramp grows from a 16px body: readable at arm's length, and iOS stops zooming into fields set below 16px.
- **Small standalone controls carry a 44px hit area** through the `tap` utility: checkboxes, radios, switches, slider knobs, lone × and ⓘ buttons. The visual stays; the invisible target grows.
- **Every control answers at once.** `touch-action: manipulation` on buttons, links, fields and ARIA widgets; the grey tap highlight and the long-press callout are off. The press state is the feedback.
- **Hover never hides a control.** What hover reveals (a notification's ×, a sort arrow, a section chevron) shows under a finger via `pointer-coarse:`.
- **No tilt, no glare, no layers.** `tilt` is flat where nothing can hover, so buttons don't each hold a GPU texture; the press scale still plays. Buttons no longer declare `will-change`.
- **Glass blurs at six tenths of its radius.** Tiers keep their order (see *Glass by elevation*, revision).
- **The thinking orb draws without filters** on touch and low-core devices, and desktops hand over to that renderer when their frames run late (see *Thinking*).
- **The AI outline turns in 4° steps** on touch: 15 repaints a second instead of 60, with no visible difference.

## Why

- **A 13px, 28px-control desktop system was being shipped to phones as is.** Fields zoomed on focus in Safari, targets were under 32px, and hover-only controls could never be reached.
- **The thinking orb was the single largest cost on a phone.** Its SVG filter chain re-rasterised a 560px canvas five times a frame on the CPU; the homepage orb alone made the page lag.
- **Backdrop blur under a scrolling page** is the classic mobile stutter; halving the radius quarters the cost.
- **Agents build for phones too.** The system has to make the right call so nobody has to remember it.

## Rejected, avoid

- **A touch preset or `--vita-touch` knob.** It would be forgotten; the promise is "about ten variables".
- **Extended hit areas on every button.** In dense groups (button sets, header actions, table rows) a 44px target overlaps the neighbour's visible box, so taps land on the wrong control. Hence `tap` is explicit and only for standalone controls.
- **`maximum-scale=1` to stop the iOS zoom.** It disables pinch-zoom for everyone; the 16px floor fixes the cause.
- **Capping the orb at 30 fps.** Capped rates read as stepping; a cheaper renderer at full rate is the answer.

## Revisit when

- **A product needs the desktop ramp on tablets** (a floor opt-out, decided here first).
- **`ctx.filter` lands everywhere.** Canvas-native blur could replace the metaball field with less code.
