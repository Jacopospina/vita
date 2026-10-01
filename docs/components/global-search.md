---
title: Global search
summary: Spotlight for the product, a liquid-glass capsule in the header that summons a floating search panel with ⌘K from anywhere.
status: stable
import: "import { GlobalSearch } from \"@/components/vita/global-search\""
use_when:
  - Product-wide search from the global header (pages, records, settings)
avoid_when:
  - Searching a list or a page's content → Search
  - Filtering a table → the table's toolbar Search
related: [search, ui-shell-header, global-header]
---

## Anatomy

- **Trigger.** A search button among the header's global actions (its tooltip shows ⌘K), separated from theme and links by a small dot (`HeaderSeparator`).
- **Panel.** A floating glass panel near the top of the screen, no scrim behind it: one large field, and results that grow beneath it.
- **Results.** Grouped by section; the first group is the top hit. Rows are [Option](#/components/dropdown) rows.
- **Preview square.** On the right, the highlighted result made tangible: the real component, colour swatches for a palette, a huge "Aa" for type, shrunk to fit, never interactive. Pass `preview` (a node, or a function so it renders only when shown); without one it shows the section, title and description.

## Interaction

1. **Summon.** Click the capsule, or press ⌘K anywhere. The panel rises in; the cursor is already in the field.
2. **Type.** Results appear and update with every keystroke; the panel grows to fit them.
3. **Move.** ↑ and ↓ move the highlight while the cursor stays in the field; the top hit starts highlighted.
4. **Open.** Enter, or a click, opens the result and dismisses the panel.
5. **Leave.** Esc clears the query; a second Esc, or a click anywhere else, dismisses.

## Rules

- **One per product,** in the same place on every page.
- **Always preview.** Every result should show what it is before it's opened.
- **Best match first.** Labels that start with the query rank above ones that only contain it; eight results at most.
- **Say when nothing matches:** "No results for “…”", never an empty panel.
