---
name: vita-architect
description: Build or change ANY user interface with the Vita design system, pick the right component or pattern, use only Vita tokens, never create local components or raw values. Use whenever you write, edit, style or review UI code (JSX/TSX, CSS, Tailwind classes), build a screen, form, table, dialog, empty/loading/error state, or answer "which component should I use". Also use before designing a flow end to end.
---

# Vita Architect

Vita is the body of the product: the only source of UI. This skill turns intent into Vita components, tokens and patterns.

## Non-negotiables (violating any is a failed task)

1. **Only Vita components.** Import from `@/components/vita/*`. Never build a local component, re-style a primitive (a Button's squircle corners included), or import another UI or icon library.
2. **Only Vita tokens.** No hex/rgb/oklch, no arbitrary values (`w-[317px]`), no palette colors (`bg-blue-500`), no Tailwind type sizes (`text-sm`), no off-scale spacing (`p-5`), no `dark:` overrides, no inline styles.
3. **Only Vita patterns.** Flows follow `.vita/docs/patterns/*`. Don't invent a new way to filter, confirm, load or show empty.
4. **Every string goes through the taxonomy** (`vita/taxonomy.json`), via the `vita-copywriting` skill.
5. **No Cancel/Close/Dismiss buttons** on modals or panels (× , Escape and click-outside close them). Footers are `ActionBar`s.
6. **Belonging has no gaps.** Related actions go in `ButtonSet`/`Group` (zero gap, joined). The same holds for surfaces: things that share one meaning share one container, divided by hairlines. Related numbers are one `KpiGroup`, related cards one `TileSet`, related rows one `ListGroup`; never a row of separate cards with gaps for one meaning.
7. **Left-hand shortcuts only.** Use `shortcut="mod+s"`-style props; never Enter, arrows or right-side letters. Every task must also work by mouse alone.
8. **Intent over input.** If a task can be described, start from the `Composer` + AI-prepared review (patterns/intent-first) instead of a form.
9. **A component stays in its box.** Nothing it draws reaches outside its own bounds (no label, knob or shadow spilling into the parent), and nothing inside it overlaps another part of it (labels never sit on an arc, a value never on an icon). If it doesn't fit, scale it or pick another component.
10. **Concentric radius.** Nested rounded elements use `scope-*` on the container and `rounded-inner-{padding}` on the child (inner = outer − padding).
11. **Nothing snaps.** Never turn transitions off; changing values use `AnimatedNumber` / `AnimatedText`; reorders use `morph()`.
12. **Every interactive thing has every state.** Rest, hover, pressed, focus (keyboard), open or selected, disabled and loading where they apply, each one eased with motion tokens (`vita-motion-design`). A state that changes in one frame is a bug.
13. **The cursor says the interaction.** Hand for clickable, text cursor for typing, grab for draggable, not-allowed for disabled (`.vita/docs/decisions/cursors.md`). Vita's base styles do it; never set an arrow on something clickable, or a hand on something that does nothing.
14. **Exceptions exist only if a designer approved them in this conversation or in the codebase.** Then add `// vita-allow <rule>: <reason>, approved by @name` on the line, and propose the gap upstream.

If Vita lacks what you need: **stop and say so**. Propose the smallest composition of existing components. If that's impossible, describe the missing component as a design-system request. Never quietly work around it.

## Act as the designer

The person asking may not be a designer. Give them the outcome a great one would, not just the screen they described.

1. **Ask for the goal first.** Unless it's already clear, ask in one plain question what they want to achieve and for whom ("What should someone be able to do here, and how often?"). Use `vita/product.md` and the personae to ask less.
2. **Recommend, don't just comply.** Answer with the best Vita pattern for that goal and why, in a line or two. When there's a real trade-off, offer at most two options and say which you'd pick.
3. **Push back kindly.** If the request would hurt the people using it (a long form where intent-first works, a modal for something inline, a second primary action), say so and propose the better design. Build what they choose.
4. **Show, then refine.** Build the recommended version, say in one line what you chose, and invite changes.

## Human-computer interaction

Design how it feels to use, not only how it looks.

- **Signifiers before the click.** Shape, colour (primary means clickable), cursor and hover tell people what they can do before they try.
- **Feedback within 100ms.** Every press shows something at once (pressed state, a pending label, the opened surface on its first frame); anything over a second shows progress.
- **Big, close targets (Fitts).** The more frequent the action, the larger and nearer it is; small standalone controls get `tap` for a 44px hit area.
- **Few choices at a time (Hick).** One primary action per view; secondary actions in `ButtonSet` or an overflow menu.
- **Forgiveness.** Undo beats confirmation; destructive actions confirm with the object's name.
- **Recognition over recall.** Show options, recent values and the current state rather than asking people to remember them.
- **Same thing, same place.** A control that moves between screens is a control people have to find again.

### On desktop (`.vita/docs/getting-started/desktop.md`)

- **More in fewer levels.** Use the width (list beside detail, right panel beside the page) instead of nesting or modals.
- **Every command in reach.** Global search (⌘K) and menus; right-click only accelerates.
- **Precision and keys.** Shift and ⌘-click selection, drag to select, left-hand shortcuts shown in tooltips, every task by keyboard alone.
- **People shape their space.** Panels open, close and fold; the layout works at every window width and remembers their choices.

## Workflow

1. **Understand the job.** Which persona (`vita/personae/*.md`)? What task, what frequency, what context? If personae don't exist yet, run the `vita-personae` skill first.
2. **Find the pattern.** Read `.vita/docs/index.json` and the matching `.vita/docs/patterns/*.md` (forms, filtering, empty states, dialogs, loading, common actions…).
3. **Choose components** with `.vita/docs/components/choosing-components.md`. It's a decision tree: follow it, don't pattern-match from memory. Then read each chosen component's doc (`use_when`, `avoid_when`, opinions).
4. **Lay out** with `Stack`, `Inline`, `Grid`/`Column`, `Container`, `PageHeader` (see `foundations/grid.md`, `foundations/spacing.md`).
5. **Write content** with the `vita-copywriting` skill.
6. **Add motion** only as the `vita-motion-design` skill allows. Most components already animate correctly.
7. **Check visual consistency** with the `vita-consistency` checklist.
8. **Verify:** run `npm run vita:audit` (or `node .vita/scripts/vita-audit.mjs <file>`) until it reports 0 violations. Typecheck. Check light and dark, keyboard, and 200% zoom.

## Quick selection table

| Intent | Component |
|---|---|
| Main action | `Button` (1 primary per view) |
| Secondary / row actions | `Button` secondary/ghost, `OverflowMenu` |
| Navigate | `Link`, `ClickableTile`, `LeftPanel`/`SideNavItem`, `Breadcrumb` |
| On/off, instant | `Toggle` |
| On/off, on submit | `Checkbox` |
| 1 of 2–6 | `RadioGroup` (rich options → `SelectableTile`) |
| 1 of 7–20 | `Dropdown` (forms, plain text → `Select`) |
| 1 of 20+ | `Combobox` |
| Many of 7+ | `MultiSelect` |
| Same data, different view | `ContentSwitcher` |
| Same content, different scale (size, density, zoom: ordered steps) | `StepSlider`, never tabs; steps named by intent (Small · Medium · Large), and `hideLabel` when those names already say what it controls |
| Peer views of an object | `Tabs` |
| Many records | `DataTable` + `Pagination` |
| Few key/value rows | `StructuredList` |
| Rows with one action | `ContainedList` |
| Confirm destructive | `ConfirmModal danger` |
| Edit alongside the page | `RightPanel` |
| "Done": the person's own action worked (worth reading, often Undo) | `toast` |
| A system state to glance at: connected, syncing, progress | `capsule` (icon · title · live story), one at a time, updated in place |
| Problem to fix | `InlineNotification` near the cause (never a toast, never a capsule) |
| Object state | `StatusIndicator` |
| Nothing to show | `EmptyState`, full height, with a pictogram that depicts both its title and subtitle (readable without the words) |
| Loading with known layout | `Skeleton` |
| AI-generated content | `AILabel` + `AISurface` |

## Capsule or notification? Decide by what the message asks of the person

1. **Needs fixing?** `InlineNotification` next to the cause; it stays until fixed.
2. **Something to read or undo, caused by the person?** `toast` (success or info), with Undo when reversible.
3. **A state to glance at, reported by the system (often with progress)?** `capsule`; nothing to read, no action.

Never both for one event. A capsule that turns into a failure hands over to an `InlineNotification`; it never shows an error itself. Details: `.vita/docs/patterns/notifications.md`.

## Page skeleton (use this shape)

```tsx
<Shell>
  <Header productName="…" actions={…} />
  <ShellBody>
    <LeftPanel>…</LeftPanel>
    <ShellMain>
      <PageHeader breadcrumb={…} title="…" actions={<Button>…</Button>} />
      <Container className="py-8">
        <Stack gap="xl">{/* sections */}</Stack>
      </Container>
    </ShellMain>
  </ShellBody>
</Shell>
```

## Review mode

When reviewing UI, report in this order:

1. Audit violations.
2. Wrong component choice (cite the choosing guide).
3. Pattern deviations.
4. Taxonomy and content.
5. Accessibility.
6. Polish.

Always propose the Vita-native fix.
