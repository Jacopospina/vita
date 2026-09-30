---
title: Motion
summary: Productive and expressive tokens with physical, spring-like feel. Motion explains change; it never decorates.
status: stable
use_when:
  - Showing a change of state, a spatial relationship, or feedback to an action
avoid_when:
  - Decorative loops, parallax, bouncing attention-seekers
  - Raw durations or cubic-beziers (duration-300, ease-[...]) → use tokens
  - Animating layout properties (width/height/top) on large surfaces → use transform/opacity
---

## Two modes

- **Productive** (default, about 95% of UI): quick, subtle, efficient. It lets the user keep working. Use it for hover, press, toggles, dropdowns, tooltips, accordions and table changes.
- **Expressive**: slower, more visible, with personality. Use it for moments that matter: a modal or side panel entering, a first-run celebration, a primary action completing a long flow. **At most one expressive motion on screen at a time.**

## Tokens

| Duration | ms | Use |
|---|---|---|
| `duration-fast-01` | 70 | Press, toggle, checkbox tick |
| `duration-fast-02` | 110 | Hover, color, fade (default transition) |
| `duration-moderate-01` | 150 | Dropdown, tooltip, popover, chevron rotate |
| `duration-moderate-02` | 240 | Accordion, toast, side panel |
| `duration-slow-01` | 400 | Modal, page-level transition |
| `duration-slow-02` | 700 | Background dimming, expressive hero |

| Easing | Use |
|---|---|
| `ease-productive` | Element stays on screen and changes (expand, reorder) |
| `ease-productive-enter` / `-exit` | Element appears / leaves (menus, tooltips) |
| `ease-expressive` / `-enter` / `-exit` | Same, for expressive moments |
| `ease-spring` | Physical things users "touch": switch thumbs, drag-and-drop settle, sheets |

Ready-made animations:

- `animate-enter-scale` / `animate-exit-scale`: popovers, menus, modals.
- `animate-enter-fade` / `animate-exit-fade`: tooltips, overlays.
- `animate-enter-slide-up` / `animate-exit-slide-down`: toasts.
- `animate-enter-panel-right` / `animate-exit-panel-right` (and the left variants): panels.
- `animate-expand` / `animate-collapse`: accordion and collapsible content.
- `animate-spin`, `animate-shimmer`, `animate-indeterminate`: loading.

## Choreography rules

1. **Exit faster than enter.** The user's attention is already moving on (exit ≈ 70% of enter).
2. **Distance sets duration.** Small, near moves are fast; large or far moves are slower. A 40px dropdown doesn't take 400ms.
3. **Origin matters.** Popovers scale from their trigger (`transform-origin` is set by Radix). Panels slide from the edge they live on.
4. **One thing moves at a time.** Stagger groups by 20–40ms at most, and never beyond 6 items.
5. **No motion without cause.** Nothing animates on page load except skeletons and first-run moments.
6. **Reduced motion:** Corpus swaps slides and scales for short fades automatically (cross-fade instead of movement). Feedback still happens; only the movement is removed. Never gate essential feedback behind animation.
7. **Performance:** animate only `transform` and `opacity`, except for the height collapse on accordions (small content).

## Decision guide

| You want to show… | Use |
|---|---|
| "I heard your click" | `active:scale-98` (built into Button) + `duration-fast-01` |
| Something appeared from a control | `animate-enter-scale` (origin at the trigger) |
| Something appeared from the system | `animate-enter-slide-up` (toast) |
| Hierarchy: something covers the page | Overlay fade `duration-slow-01` + content `animate-enter-scale` |
| Content changed in place | `animate-enter-fade`, no movement |
| Progress without a known end | Skeleton shimmer (layout known) or spinner (unknown) |
