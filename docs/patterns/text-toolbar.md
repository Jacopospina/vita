---
title: Text toolbar
summary: Formatting controls for rich-text editing, grouped, labelled, keyboard-friendly, with shortcuts.
status: stable
import: "import { Toolbar, ToolbarButton, ToolbarToggle, ToolbarToggleGroup, ToolbarSeparator } from \"@/components/vita/toolbar\""
use_when:
  - Rich text editors (comments, descriptions, email drafts, notes)
avoid_when:
  - Plain text fields → TextArea
  - Page-level actions → PageHeader / ButtonSet
related: [button, tooltip]
---

## Anatomy

`[B I U S] | [• 1.] | [🔗 </>]` grouped by purpose, separated by `ToolbarSeparator`.

## Rules

1. **Toggles show state** (`selected` background) and reflect the current selection's formatting.
2. **One Tab stop** for the whole toolbar; arrows move within it (`Toolbar` handles roving focus).
3. **Every tool has a label with its shortcut** in the tooltip: "Bold (⌘B)".
4. **Minimal set first:** bold, italic, lists, link. Add more only when the persona needs them (see the taxonomy's persona expertise).
5. **Placement:**
   - Fixed above the editor for long-form editing.
   - Floating near the selection (Popover) for inline comments.
6. **Markdown shortcuts** (`**`, `-`, `1.`) are welcome accelerators, never the only way.
