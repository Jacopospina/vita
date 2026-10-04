---
title: Designing for desktop
summary: A big screen, a precise pointer and a keyboard: on desktop Vita shows more at once, nests less, puts every command in reach and lets people shape their workspace.
status: stable
use_when:
  - Designing any screen people use at a desk, with a mouse, trackpad and keyboard
  - Deciding how much to show at once, and where commands live
avoid_when:
  - Phones and tablets → Touch adapts by itself (decision)
related: [touch, grid, spacing, cursors, theming, global-search, right-panel, selection-toolbar]
---

> [!IMPORTANT] On desktop people sit at arm's length, often for hours, with several apps open. Give them more at once, fewer layers, and every command one keystroke away.

## Who is at the desk

- **A large screen, often two.** Room for a list and its detail side by side, or a table with every column.
- **Arm's length.** About 30 to 90cm away, so compact density and the desktop type ramp read comfortably.
- **A precise pointer and a keyboard.** Small targets are fine, hover carries meaning, and shortcuts are expected.
- **Minutes to hours.** Quick tasks and deep work, switching between apps all day.

## Best practices

1. **More in fewer levels.** Use the width: a list beside its detail, a side panel beside the page; show it rather than nest it behind another click.
2. **Less modality.** Edit inline or in the right panel; a modal is only for a decision that must interrupt.
3. **Comfortable density.** Show more without making people squint: compact rows, never smaller type than the scale allows, prose held at a readable width.
4. **Let people arrange their space.** The side nav folds to a rail, panels open and close, and the layout adapts at every window width; nothing assumes a full screen.
5. **A focus mode for deep work.** Long editing or reading can hide the chrome and keep only the content.
6. **Every command in reach.** Global search (⌘K) finds any page or action, menus hold the rest; nothing is only reachable by a hidden gesture.
7. **Precision is a feature.** Click to select, Shift-click a range, ⌘-click to add, drag to select text (the Selection toolbar acts on it), right-click for a context menu.
8. **Shortcuts accelerate.** Frequent actions have a left-hand shortcut, shown in their tooltip and menu; every task still works by mouse alone and by keyboard alone.
9. **Personal by design.** Light or dark, density, accent and type follow the person's choice, and the layout remembers what they opened, resized and hid.
10. **Leaving and coming back is free.** Drafts save themselves and the page returns where it was; switching away never loses work.

## Pointer and keyboard signals

- **The cursor says the interaction.** Hand, text, grab or not-allowed (decision: Cursors say the interaction).
- **Hover previews, never hides.** Hover reveals secondary actions and tooltips, and the same controls show under a finger.
- **Focus is visible.** The focus ring appears from the keyboard, never from a click.

## Don't

- **Stretching a phone layout.** One narrow column in the middle of a wide screen wastes it.
- **A modal for every edit.** It blocks the page people need to look at while editing.
- **Commands only in a context menu.** Right-click accelerates; it never holds the only way to do something.
