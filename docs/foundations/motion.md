---
title: Motion
summary: Productive by default, expressive for rare moments, physical where users touch. Motion explains change; it never decorates.
status: stable
use_when:
  - Showing a change of state, a spatial relationship, or feedback to an action
avoid_when:
  - Decorative loops, parallax, attention-seeking bounces
  - Raw durations or cubic-beziers (duration-300, ease-[...]) → use tokens
  - Animating layout properties on large surfaces → use transform and opacity
---

> [!TIP] Most components already animate correctly. Add motion only where a component doesn't.

## Two modes

- **Productive.** About 95% of UI: quick, subtle and efficient, for hover, press, menus and accordions.
- **Expressive.** Rare, meaningful moments like a panel arriving or a flow completing. One at a time.

## Durations

| Token | ms | Use |
|---|---|---|
| `duration-fast-01` | 70 | Press, toggle, checkbox tick |
| `duration-fast-02` | 110 | Hover, color, fade (default) |
| `duration-moderate-01` | 150 | Dropdown, tooltip, popover |
| `duration-moderate-02` | 240 | Accordion, toast, side panel |
| `duration-slow-01` | 400 | Modal, page transition |
| `duration-slow-02` | 700 | Background dim, hero |

## Easings

- **`ease-productive`.** Things that stay on screen and change.
- **`ease-productive-enter` / `-exit`.** Things that appear or leave.
- **`ease-expressive-*`.** The same, for big moments.
- **`ease-spring`.** Things users touch: switch thumbs, drag and drop, sheets.

## Choreography

1. **Exit faster than enter.** Attention has already moved on.
2. **Distance sets duration.** Small moves are fast.
3. **Origin matters.** Popovers grow from their trigger; panels slide from their edge.
4. **One thing moves at a time.** Stagger at most 40ms, across at most 6 items.
5. **No motion without cause.** Nothing animates on page load except skeletons.

> [!NOTE] Reduced motion is automatic: slides and scales become short fades. Feedback still happens; only the movement goes.

## Which animation?

| You want to show… | Use |
|---|---|
| "I heard your click" | Built into Button (`active:scale-98`) |
| Something came from a control | `animate-enter-scale` |
| Something came from the system | `animate-enter-slide-up` |
| Something covers the page | Overlay fade + `animate-enter-scale` |
| Content changed in place | `animate-enter-fade` |
| Waiting, layout known | Skeleton shimmer |
