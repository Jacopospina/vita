---
name: vita-motion-design
description: Decide whether and how anything should animate in a Vita product, durations, easings, choreography, reduced motion. Use when adding transitions, animations, micro-interactions, entrance/exit effects, loading motion, or when someone asks to "make it feel smoother/alive".
---

# Vita Motion Design

Motion explains change. It never decorates. Read `.vita/docs/foundations/motion.md` for the full rules.

## Step 1: nothing snaps

Vita transitions every property change by default and morphs variants. Your job is to never break that and to use the right character:

- **Productive** (default): task-focused changes, states, dropdowns, reveals, tables.
- **Expressive**: significant moments, page changes, the primary action, alerts and notifications appearing, movement that carries meaning.
- **Glyphs**: an icon that changes with state is a `SwapIcon`: the old glyph morphs into the new one (copy → check). Never swap the `as` of a plain `Icon`.
- **Values**: numbers use `AnimatedNumber` (slot-machine roll, staggered, blur→sharp); changing text uses `AnimatedText` (letter-by-letter stagger, slide up, blur→sharp).
- **Reorders and layout jumps**: wrap the state change in `morph()` and give moving items a `view-transition-name`.
- **The space a thing leaves closes over time.** When an item leaves a row, check its NEIGHBOURS, not just the item: a field that fills the row (`flex-1`), the next chip, the button after it. Close the space with it: `Tag onDismiss` does it for you; for your own items use `collapseOut(el)` with `useExit`, or wrap optional controls in `reveal-x` and pull back their gap (`-ml-2` while closed). An exit that fades the item and then lets the row jump is still a snap.
- **Every state of an interactive thing eases.** Hover, pressed, focus, open or selected and disabled each get a transition (colours `duration-fast-02`, press `duration-fast-01`). Changing one state (a colour, a fill) means checking all of them.
- **Test the neighbour.** Add and remove every optional item (applied filters, clear buttons, counts) and watch the widest sibling. If it changes size in one frame, it snaps.

## Step 2: prefer what the component already does

Vita components ship with correct motion: Modal, Popover, Menu, Tooltip, Toast, Accordion, RightPanel, Toggle, Button press, Skeleton. **Don't add or override their animation.**

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

Vita automatically turns movement into fades under `prefers-reduced-motion`. Your job:

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
