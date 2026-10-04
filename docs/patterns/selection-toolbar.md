---
title: Selection toolbar
summary: The capsule of actions that appears over text the moment someone selects it: Ask AI about the words, Cut, Copy, Paste and Delete, plus what your product can do with them.
status: experimental
import: "import { SelectionToolbar, editActions, type AskRequest } from \"@/components/vita/selection-toolbar\""
use_when:
  - Text people select to act on it (notes, messages, documents, generated replies)
  - Asking the AI about exactly the words someone selected (explain, summarise, rewrite)
  - Offering product actions on a selection (Comment, Translate) next to the clipboard
avoid_when:
  - Formatting an editor's text (bold, lists, links) → Text toolbar
  - Actions on a whole item (a row, a card, a file) → Menu
related: [text-toolbar, menu, ai-label, common-actions]
---

> [!IMPORTANT] It answers a selection, at once and right where the eyes are. Select, and the actions are already there; act, and it's gone.

## Anatomy

- **Capsule.** Floating glass, centred above the selection; below it when there's no room.
- **Actions.** Words, not icons, divided by hairlines: Ask AI first (in primary), then the clipboard set, then the product's own.
- **Danger in red.** Delete is the only red word, and it comes last in its page.
- **Chevron.** More actions than fit (4 by default) page sideways; a back chevron returns.

## Rules

1. **Shows on release.** It appears the moment the pointer or the keys let go of a selection, never during the drag.
2. **Only what applies.** Editable text gets Cut, Copy, Paste and Delete; text people can only read gets Copy and the product's actions.
3. **Ask AI, then the clipboard.** With `onAsk`, Ask AI leads; then Cut, Copy, Paste, Delete, in that order, so a hand finds them without reading.
4. **Product actions are verbs on the words.** "Ask AI", "Comment", "Translate": each one acts on the selected text, written with the copywriting skill.
5. **The selection survives.** Pressing an action never clears what it acts on; after the action, the capsule leaves.
6. **One Tab stop.** Arrows move between actions; Escape closes it and keeps the selection.
7. **Under a finger it sits below.** The phone's own menu sits above a selection, so Vita's never covers it.

## Ask AI about the selection

Pass `onAsk` and the capsule opens into a small panel about exactly those words. The answer arrives in place, so nobody leaves the text to ask.

- **The words stay in view.** The panel quotes the selection, and the words stay highlighted while focus is in the panel.
- **Ask in one tap.** Suggestions fit the text: "Make it shorter" and "Fix the grammar" where it can be edited, "Explain this" and "Summarise" where it can't.
- **Name the work.** Sofia shows "Reading the selection" while the answer comes.
- **The answer is marked.** It arrives in an AI surface with its AI label, in the AI's voice (Vita for AI).
- **Replace or copy.** Editable text offers Replace, which types over exactly the selected words; every answer offers Copy.
- **Follow up.** The composer stays, for the next question about the same words.

## States

- **Hover and pressed.** Each action takes the hover wash and gives a little on press (110ms, 70ms for the press).
- **Focus.** The focus ring, from the keyboard only.
- **Arrive and leave.** It arrives visible on its first frame and settles into place; it scales out as it leaves.
- **Paging.** The next page cross-fades in place and the capsule's width follows.

## Don't

- **Icons only.** The words are the signifier; an icon row makes people guess.
- **More than one red action.** Only removal is red.
- **Covering the selection.** It never sits on the words it acts on.
