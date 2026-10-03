---
title: Scramble text
summary: Text on its way, set in its real typeface. Glyphs change one by one where the words will be, each blurring out as the next blurs in, then the real text lands in random order.
status: inception
import: "import { ScrambleText } from \"@/components/vita/scramble-text\""
use_when:
  - A title, name, value or sentence is loading and its style is known
  - Numbers or IDs are on their way (charset digits or mixed)
  - Refreshing text in place (loading with the old text present)
avoid_when:
  - Avatars, images, cards and other shapes → Skeleton
  - A region whose layout is unknown → Loading (Thinking)
  - Known progress → ProgressBar
related: [loading, thinking, inline-loading]
---

## How it behaves

1. **Loading.** The line is set in its real size and weight, sharp, about as long as the text will be (`length`). Each glyph changes on its own random clock, in place like a lock-screen clock: the old one blurs out while the new one unblurs in, never a snap.
2. **Arriving.** The real letters land in random order, each with the same blur-out, blur-in; the width glides to the real text.
3. **Settled.** Plain text again: nothing left running.

## Rules

- **Set the style, not a shape.** Pass the same text classes the final text will have, so nothing moves when it arrives.
- **Guess the length.** `length` is the expected number of characters: a name about 14, a value about 6.
- **Pick the charset by content.** `letters` for words, `digits` for numbers, `mixed` for IDs and codes.
- **Never clipped.** A changing glyph's blur reaches past it; nothing around it may cut it flat.
- **Values use it too.** `Kpi loading` scrambles its digits in the numeric face, so the handover to the number is seamless.
- **Text present on mount never scrambles.** Static content never animates on load; only text that arrives later resolves.

## Accessibility

- **Announced once.** While loading, screen readers hear `label` ("Loading") and the region is `aria-busy`; the shuffling glyphs are hidden from them.
- **Reduced motion.** The placeholder line holds still, and the text appears without the letter-by-letter lock.

## Example

```tsx
<ScrambleText text={agent?.name} length={14} className="text-title-2" />
<ScrambleText text={runs?.toLocaleString()} length={6} charset="digits" />
```
