---
title: Motion
summary: Choreography is everything. Nothing snaps — every change transitions, variants morph like liquid, numbers roll and text reveals.
status: stable
use_when:
  - Always — motion is on by default for every property change
avoid_when:
  - Switching transitions off on a component → tune duration or easing instead
  - Raw durations or cubic-beziers (duration-300, ease-[...]) → use tokens
  - Decorative loops, parallax, attention-seeking bounces
---

> [!IMPORTANT] Corpus reflects the life of the product behind it. If a position, size, color, value or variant changes, it moves there — it never jumps.

## Two characters

- **Productive.** Efficient, responsive, subtle and out of the way. The default for moments where the user is focused on a task: button states, dropdowns, revealing more information, rendering tables and charts.
- **Expressive.** Enthusiastic, vibrant, highly visible. For significant moments: opening a new page, pressing the primary action, system alerts and notifications appearing, or when the movement itself carries meaning.

## Who uses which

| Productive (`motion-productive`) | Expressive (`motion-expressive`) |
|---|---|
| Hover, press and focus states | Page enter and leave choreography |
| Dropdowns, menus, tooltips, popovers | Modals opening (`animate-enter-dialog`) |
| Accordions, disclosures, reveals | Primary button press |
| Table sorting, pagination, data rendering | Toasts and notifications appearing |
| Checkbox, radio, toggle state | Side panels sliding in |
| Field validation messages | Tab underline and segmented pill travel |
| Search clear, file rows | Number rolls and text reveals |

> [!TIP] Unsure? If the user is mid-task, it's productive. If the moment deserves attention or the movement itself means something, it's expressive.

## Nothing snaps

1. **Every property transitions.** Color, background, border, radius, shadow, opacity, transform, width, height, padding, gap and font size animate by default, even to and from `auto`.
2. **Variants morph.** Changing a button from secondary to primary, sm to lg, or light to dark transforms the same element; nothing is swapped.
3. **Indicators slide.** The tab underline and the segmented-control pill travel between options.
4. **Lists re-flow.** Re-sorting a table glides each row to its new place (View Transitions via `morph()`).
5. **Pages choreograph, never fade as a whole.** On navigation the page's major containers sink out in sequence (fast), then the new page's containers rise in from blur, 60ms apart.
6. **Everything enters and leaves.** Components mount with an entrance (rise, scale or slide) and play an exit before they disappear — dismissed notifications, removed tags, deleted files.

## Text choreography

- **Numbers roll.** `AnimatedNumber`: every digit rolls like a slot machine, up when the value grows and down when it shrinks, staggered from the last digit, de-blurring as it lands.
- **Text reveals.** `AnimatedText`: letter by letter, each sliding up from below and de-blurring, 18ms apart (capped so long labels finish in ~0.6s).
- **Where it's built in.** Every `Text`, `Button` and `Tag` label, toggle state text, dropdown values, counts, slider values, loading messages, validation messages and status labels. Icons that swap (menu ↔ close, show ↔ hide) scale in.

## State changes never snap

1. **Indicators stay mounted.** Checkmarks, radio dots, selected marks and menu checks scale and fade in *and* out; they never unmount on state change.
2. **Icons that depend on state swap.** Use `SwapIcon`: status, sort direction, step state, menu ↔ close.
3. **Controls that come and go keep their slot.** Clear buttons, shortcut hints, counts and batch bars fade and scale, then give their space back smoothly.
4. **Messages leave gracefully.** A resolved error or warning collapses, blurs and fades out (`FieldMessage`); switching kinds cross-fades.
5. **Branches expand.** Tree and disclosure content open and close with `reveal` / `reveal-open`.
6. **Focus settles in.** Focus rings arrive over 400ms, from wide and transparent to tight and solid.

## Enter & exit

| Use | For |
|---|---|
| `stagger` | A container whose children should enter in sequence (and leave in sequence under `data-leaving`) |
| `animate-enter-*` / `animate-exit-*` | Single elements: scale (popovers, menus), slide-up (notifications, toasts), panel (side panels), fade |
| `useExit()` | Play the exit before removing something from the DOM |

## Durations

| Token | ms | Use |
|---|---|---|
| `duration-fast-01` | 70 | Press, toggle, checkbox tick |
| `duration-fast-02` | 110 | Hover, color, fade |
| `duration-moderate-01` | 150 | Default for every property change |
| `duration-moderate-02` | 240 | Indicators, accordions, toasts, panels |
| `duration-slow-01` | 400 | Modals, number rolls, text reveals |
| `duration-slow-02` | 700 | Background dim, hero moments |
| `duration-expressive` | 480 | The expressive character: gentle start, long graceful settle |

## Easings

- **`ease-productive` (+ `-enter`, `-exit`).** Task-focused changes.
- **`ease-expressive` (+ `-enter`, `-exit`).** Significant moments.
- **`ease-spring`.** Things users touch: switches, the segmented pill, drag and drop.

## Choreography

1. **Exit faster than enter.**
2. **Distance sets duration.**
3. **Origin matters.** Popovers grow from their trigger; panels slide from their edge.
4. **Stagger, don't swarm.** 35ms between digits or words, at most 6 items in a group.

> [!NOTE] Reduced motion keeps color and opacity fades but removes movement, morphs and staggers. Feedback still happens.

## Using it

```tsx
import { morph } from "@/components/corpus/hooks/use-morph"
import { AnimatedNumber, AnimatedText } from "@/components/corpus/animated"

morph(() => setSort(next))            // rows with view-transition-name glide
<AnimatedNumber value={runs} />       // 1,284 → 1,302 rolls
<AnimatedText>{status}</AnimatedText> // "Deploying" → "Live" reveals
```
