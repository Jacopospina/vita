---
title: Tree view
summary: Navigate or select within a hierarchy of unknown depth, with full keyboard support.
status: stable
import: "import { TreeView, type TreeNode } from \"@/components/vita/tree-view\""
use_when:
  - File/folder structures, org charts, category taxonomies, nested workspaces
  - The user needs to see siblings and ancestors while choosing
avoid_when:
  - ≤ 2 fixed levels of navigation → Side nav (SideNavMenu)
  - Collapsible content sections → Accordion
  - Nested records with attributes → DataTable with expandable rows
related: [ui-shell-left-panel, accordion]
---

## Rules

1. **Parents both expand and select** on click. The caret alone toggles.
2. **Icons distinguish node types** (folder vs document), and every node gets one or none does.
3. **Selected node:** `selected` background plus a 2px primary indicator bar.
4. **Open the path to the current selection** by default (`defaultExpanded`).
5. **Size `xs`** for very deep trees in side panels, `sm` otherwise.
6. **Keyboard:** ↑↓ move · → expand / go to first child · ← collapse / go to parent · Enter selects.
