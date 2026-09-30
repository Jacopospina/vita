---
name: corpus-motion
description: Decide whether and how anything should animate in a Corpus product — durations, easings, choreography, reduced motion. Use when adding transitions, animations, micro-interactions, entrance/exit effects, loading motion, or when someone asks to "make it feel smoother/alive".
---

# Corpus motion

Motion explains change. It never decorates. Read `.corpus/docs/foundations/motion.md` for the full rules.

## Step 1: nothing snaps

Corpus transitions every property change by default and morphs variants. Your job is to never break that and to use the right character:

- **Productive** (default): task-focused changes — states, dropdowns, reveals, tables.
- **Expressive**: significant moments — page changes, the primary action, alerts and notifications appearing, movement that carries meaning.
- **Values**: numbers use `AnimatedNumber` (slot-machine roll, staggered, blur→sharp); changing text uses `AnimatedText` (letter-by-letter stagger, slide up, blur→sharp).
- **Reorders and layout jumps**: wrap the state change in `morph()` and give moving items a `view-transition-name`.

## Step 2: prefer what the component already does

Corpus components ship with correct motion: Modal, Popover, Menu, Tooltip, Toast, Accordion, RightPanel, Toggle, Button press, Skeleton. **Don't add or override their animation.**

## Step 3: pick tokens (never raw values)

| Situation | Classes |
|---|---|
| Hover / color change | `transition-colors duration-fast-02 ease-productive` |
| Press / toggle / tick | `duration-fast-01` |
| Small reveal near a control | `animate-enter-scale` / `animate-exit-scale` |
| Content swapped in place | `animate-enter-fade` |
| System message arrives | `animate-enter-slide-up` |
| Panel from an edge | `animate-enter-panel-right` / `animate-exit-panel-right` |
| Height expand | `animate-expand` / `animate-collapse` |
| Physical, draggable, thumbs | `ease-spring` |
| Big moment (onboarding done, hero) | `ease-expressive-*` + `duration-slow-01`, **one at a time** |

## Choreography rules

- Exit faster than enter.
- Distance sets duration.
- One thing moves at a time.
- Stagger ≤ 40ms, and ≤ 6 items.
- Animate only `transform` and `opacity`, except height collapse on small content.
- Loops only for indeterminate loading.

## Reduced motion

Corpus automatically turns movement into fades under `prefers-reduced-motion`. Your job:

- Never hide essential information behind animation.
- Never use JS-driven animation without checking `matchMedia("(prefers-reduced-motion: reduce)")`.
- Wrap decorative spins in `motion-safe:`.

## Anti-patterns (reject)

- Bouncy entrances.
- Parallax.
- Attention-seeking pulses on CTAs.
- `animate-bounce` or `animate-ping`.
- Durations over 400ms for UI chrome.
- Animating layout (width/top) on large surfaces.
- Motion that delays a user's next action.
