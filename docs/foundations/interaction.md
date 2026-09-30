---
title: Interaction
summary: Built for products where AI carries the complexity. One hand per device, intent over input, nothing redundant, nothing that snaps.
status: stable
import: "import { useShortcut } from \"@/components/corpus/hooks/use-shortcut\"\nimport { Kbd } from \"@/components/corpus/kbd\"\nimport { Composer } from \"@/components/corpus/composer\""
use_when:
  - Designing any flow, interaction or shortcut
  - Deciding between a form and an intent-first flow
avoid_when:
  - Adding a control that repeats one that already exists (Cancel next to ×)
  - Shortcuts that need the right hand
---

> [!IMPORTANT] The AI does the complex work. The user states intent, reviews and approves. Every screen should feel lighter than the task it replaces.

## The interaction model

1. **Intent over input.** The user says what they want (typed, spoken or handed to an agent) and reviews what the AI prepared. Forms are the fallback, not the default.
2. **One hand per device.** Right hand on the pointer, left hand on the keyboard. Every task completes with the mouse alone; shortcuts accelerate it with the left hand.
3. **Never repeat a way out.** Dialogs and panels close with ×, Escape or a click outside. They never have Cancel, Close or Dismiss buttons.
4. **Belonging has no gaps.** Things that belong together touch: button sets, action bars, swatches, input + button.
5. **Nothing snaps.** Every change of position, size, color or value transitions, and variants morph into each other.
6. **Low cognitive load.** One decision per view, at most one primary action, and everything else progressively disclosed.

## Left-hand shortcuts

| Keys | Action |
|---|---|
| `Esc` | Close the top layer · clear and leave search · discard an inline edit |
| `⌘F` / `Ctrl+F` | Focus the page's search |
| `⌘S` | Save / primary action of a form |
| `⌘E` | Edit the current object |
| `⌘D` | Duplicate |
| `⌘Z` / `⌘⇧Z` | Undo / redo |
| `⌘A` | Select all rows |
| `Tab` / `⇧Tab` | Move between controls |
| `Space` | Toggle, select, open |
| `1`–`5` | Switch tabs or segments (when focus isn't in a field) |

> [!WARNING] Never bind shortcuts to right-hand keys (Enter, arrows, Delete, P, L, O…). `useShortcut` warns in development when a combination needs the right hand.

## Pointer economy

- **Act where the eye is.** Put actions next to the content they affect, not in far corners.
- **Big targets for frequent actions.** Primary actions fill their action bar; row actions appear on hover or through ⋮.
- **Choose instead of type.** Suggestions, defaults, AI prefill and pickers before free text.
- **Right-click accelerates.** Context menus duplicate visible actions, never replace them.

## Belonging

- **Button sets.** Joined, zero gap, primary last.
- **Action bars.** A modal or panel's actions span its full width, flush to its edge.
- **Swatches and scales.** Colors of one family sit edge to edge.
- **Composites.** Combo buttons, segmented controls, pagination and toolbars are one object.

> [!TIP] Test it: if removing the gap makes two things read as one object, they belong together. If it makes them confusing, they don't.
