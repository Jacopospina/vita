---
title: Cards
summary: A card is a pattern, not a component. It is composed of components (a Tile, an Icon, Text) to show one item people scan in a set.
status: experimental
use_when:
  - Items people scan side by side (tasks, tickets, runs, documents)
  - A board or a grid where each item needs a status and a title
avoid_when:
  - Uniform records people compare → Data table
  - A list with one line per item → List / Contained list
related: [tile, list-item, data-table, status-indicators]
---

> [!NOTE] A pattern is made of components, individually. There is no Card component: compose a `Tile`, an `Icon` and `Text`, so every card stays built from the same parts.

## Anatomy

- **Status first.** A 16px status glyph leads the title (not started, in progress, done), coloured by its meaning.
- **Title.** One line, medium weight, the item's own words.
- **Meta.** The item's ID and time in caption, separated by a dot.

## Rules

1. **No shadow, ever.** A card sits on the page with a hairline border on the raised surface; shadows are for things that float.
2. **One look per set.** Every card in a grid has the same parts in the same places, so the eye compares, not reads.
3. **The whole card is the target** when it opens something: use `ClickableTile` for the same composition.
4. **Status by meaning.** The glyph and its colour come from the status semantics, never decoration.
5. **A status you can change** is the glyph itself: an icon button (named "Status: In progress. Change status") that opens a menu of statuses, each with its glyph; the glyph redraws on change.

## Example

```tsx
<Tile className="flex flex-col gap-2 border border-border-subtle bg-raised p-3 pb-2.5">
  <Inline gap="xs"><Icon as={Incomplete} className="text-info" /><Text weight="medium">Index the help center</Text></Inline>
  <Inline gap="sm"><Text variant="caption" tone="muted">THEO-131</Text><Text variant="caption" tone="muted" aria-hidden>•</Text><Text variant="caption" tone="muted">Today, 10:05</Text></Inline>
</Tile>
```
