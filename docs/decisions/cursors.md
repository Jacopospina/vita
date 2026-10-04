---
title: Cursors say the interaction
summary: The pointer changes with what is under it, so people know before they click whether a thing opens, selects, types, drags or is unavailable.
status: accepted
date: 2026-10-04
decided_by: Jacopo
related: [accessibility, motion, touch, ai-label]
---

## Decision

- **Clickable is a hand.** Buttons, links, tabs, options, menu items, switches, checkboxes, radios, tree rows and anything with a button role, the AI label included.
- **Typing is a text cursor.** Text fields, text areas and editable text.
- **Draggable is a grab.** Slider thumbs and anything you can pick up; it closes to grabbing while held.
- **Busy is progress.** An element marked `aria-busy` while it works.
- **Unavailable is not-allowed.** Disabled controls, whatever they would otherwise be.
- **Help is a question.** Words with an inline explanation (the tooltip's dotted underline).
- **Built into the base styles.** The rules have zero specificity, so a component's own `cursor-*` class still wins; nothing to add per component.

## Why

- **A signifier before the click.** The cursor is the first feedback a mouse user gets; an arrow over something clickable reads as "not clickable" (the AI label looked like plain text).
- **One rule, no drift.** The browser reset gives buttons an arrow; fixing it once in the base keeps every product consistent.

## Don't

- **A hand on something that does nothing.** Plain text, cards without an action and decorative icons keep the arrow.
- **A cursor as the only signal.** Touch has no cursor, so hover and focus states carry the same meaning.
