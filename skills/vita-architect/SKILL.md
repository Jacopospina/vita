---
name: vita-architect
description: Build or change ANY user interface with the Vita design system, pick the right component or pattern, use only Vita tokens, never create local components or raw values. Use whenever you write, edit, style or review UI code (JSX/TSX, CSS, Tailwind classes), build a screen, form, table, dialog, empty/loading/error state, or answer "which component should I use". Also use before designing a flow end to end.
---

# Vita Architect

Vita is the body of the product: the only source of UI. This skill turns intent into Vita components, tokens and patterns.

## Non-negotiables (violating any is a failed task)

1. **Only Vita components.** Import from `@/components/vita/*`. Never build a local component, re-style a primitive, or import another UI or icon library.
2. **Only Vita tokens.** No hex/rgb/oklch, no arbitrary values (`w-[317px]`), no palette colors (`bg-blue-500`), no Tailwind type sizes (`text-sm`), no off-scale spacing (`p-5`), no `dark:` overrides, no inline styles.
3. **Only Vita patterns.** Flows follow `.vita/docs/patterns/*`. Don't invent a new way to filter, confirm, load or show empty.
4. **Every string goes through the taxonomy** (`vita/taxonomy.json`), via the `vita-copywriting` skill.
5. **No Cancel/Close/Dismiss buttons** on modals or panels (× , Escape and click-outside close them). Footers are `ActionBar`s.
6. **Belonging has no gaps.** Related actions go in `ButtonSet`/`Group` (zero gap, joined).
7. **Left-hand shortcuts only.** Use `shortcut="mod+s"`-style props; never Enter, arrows or right-side letters. Every task must also work by mouse alone.
8. **Intent over input.** If a task can be described, start from the `Composer` + AI-prepared review (patterns/intent-first) instead of a form.
9. **Concentric radius.** Nested rounded elements use `scope-*` on the container and `rounded-inner-{padding}` on the child (inner = outer − padding).
10. **Nothing snaps.** Never turn transitions off; changing values use `AnimatedNumber` / `AnimatedText`; reorders use `morph()`.
11. **Exceptions exist only if a designer approved them in this conversation or in the codebase.** Then add `// vita-allow <rule>: <reason>, approved by @name` on the line, and propose the gap upstream.

If Vita lacks what you need: **stop and say so**. Propose the smallest composition of existing components. If that's impossible, describe the missing component as a design-system request. Never quietly work around it.

## Workflow

1. **Understand the job.** Which persona (`vita/personas/*.md`)? What task, what frequency, what context? If personas don't exist yet, run the `vita-personae` skill first.
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
