---
name: vita-consistency
description: Make any Vita screen look like it was designed by the same person as every other screen, hierarchy, spacing rhythm, alignment, surfaces, color restraint, typography roles, density. Use when building or polishing a screen, when asked to "make it look better/cleaner/more consistent", or when reviewing UI visually.
---

# Vita Consistency

Consistency comes from rules, not taste. Run this checklist on every screen, top to bottom. Every "no" gets fixed with a Vita token or component, never a one-off. Each section rests on a perception principle (proximity, common region, similarity, continuity, figure and ground, hierarchy): when an item fails and you need the why, or the fix isn't on this list, the `vita-psychology` skill has it.

## 1. Hierarchy (squint test)

- [ ] The most important thing is found first. Exactly **one** `title-1` (via `PageHeader`) and **one** primary button in view.
- [ ] Heading levels step down one at a time: `title-1` → `title-2` sections → `title-3` subsections → `headline` groups.
- [ ] Hierarchy comes from size, weight and position. Color is not used to rank things.
- [ ] At most two text colors per region: `text-foreground` + `text-muted-foreground`. `text-helper` only for helper text and metadata.

## 2. Rhythm & spacing

- [ ] Things that belong together touch (0 gap): button sets, action bars, swatches, segments. Use `Group`/`ButtonSet`/`ActionBar`.
- [ ] Every component stays inside its own box and nothing in it overlaps: measure the parts against the box (labels, knobs, ends), don't trust the picture at one size.
- [ ] One gutter: cards on a page are 20px apart (the grid gutter, `Stack gap="xl"`) in every direction. A column of stacked cards uses the same gap as the cards beside it; measure, don't eyeball.
- [ ] One meaning, one surface: a row of related numbers is one `KpiGroup`, related cards one `TileSet`, related rows one `ListGroup`. Separate cards with gaps between them say "these are different things".
- [ ] Different components side by side have a real gap (≥ 8px, `Inline` default 12px) and are vertically centred on each other.
- [ ] Gaps inside groups are smaller than gaps between groups: related `xs`, siblings `md`/`lg`, sections `xl`/`2xl`.
- [ ] Form fields are 24px apart (`Form` handles this). Sections are 32–48px apart.
- [ ] Container padding is consistent: tiles `p-4` (compact) or `p-6` (roomy), never mixed on one screen.
- [ ] Every value is on the scale (the audit enforces this).

## 3. Alignment

- [ ] Everything aligns to the grid's left edge. There are no centred body text or forms in product UI (empty states and login are the exceptions).
- [ ] Numbers are right-aligned with `tabular-nums` in tables and metrics.
- [ ] Icons are optically aligned with their text (Vita components handle this; don't nudge with margins).

## 4. Surfaces & depth

- [ ] One surface step per nesting: `background` → `layer-1` → `layer-2`. No card inside a card.
- [ ] Borders are used sparingly: whitespace first, `border-border-subtle` second, `border` for fields only.
- [ ] Only floating layers have shadows (`shadow-floating` / `shadow-overlay`). Tiles and cards never cast one, resting or hovered.
- [ ] Radius is concentric: inner = outer − padding. Containers use `scope-*`, children `rounded-inner-{padding}`.
- [ ] Every corner follows the theme. A surface, row, tile or picker option is rounded by a Vita radius (`rounded-sm|md|lg|xl`, `scope-*`), never `rounded-none`. `rounded-inner-*` only inside a `scope-*` parent: without one it computes radius-md minus the padding, which is often 0 (a sharp corner the theme can't reach).
- [ ] Buttons keep their squircle. Never pass `rounded-*` or `corner-shape` to a Button or IconButton (it's dropped, and a test fails): to fit a bar, change its height (`h-8`, `size-8`), never its corners.
- [ ] Check at two radii. Flip the theme radius (Square, Default, Round): every corner must change with it. One that stays sharp at Default is a bug.

## 5. Color restraint

- [ ] The screen is about 90% neutral. Brand color only marks "you can act here" (primary, links, selection, focus).
- [ ] Status colors appear only for status, always with an icon and text.
- [ ] The AI gradient appears only on AI-generated content.

## 6. Components used the same way everywhere

- [ ] The same action has the same label, icon and position as on other screens (`vita/taxonomy.json → actions`).
- [ ] Controls in a row share one size (`sm`/`md`/`lg`), matching density.
- [ ] Icons come from the Vita set, at sizes `sm` (inline) or `md` (standalone), and are the same icon for the same concept.

## 7. States are designed, not forgotten

For every data region, confirm it has:

- **Loading:** a skeleton.
- **Empty:** an `EmptyState` of the right kind.
- **Error:** an inline error or error empty state, with retry.
- **Overflow:** truncation rules applied.

Also check disabled and read-only states per their patterns, dark mode and 200% zoom.

## Output

When asked to polish, return:

1. The checklist items that failed.
2. The exact Vita-native change for each.
3. The code.
