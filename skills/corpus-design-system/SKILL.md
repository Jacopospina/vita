---
name: corpus-design-system
description: Build or change ANY user interface with the Corpus design system — pick the right component or pattern, use only Corpus tokens, never create local components or raw values. Use whenever you write, edit, style or review UI code (JSX/TSX, CSS, Tailwind classes), build a screen, form, table, dialog, empty/loading/error state, or answer "which component should I use". Also use before designing a flow end to end.
---

# Corpus design system

Corpus is the body of the product: the only source of UI. This skill turns intent into Corpus components, tokens and patterns.

## Non-negotiables (violating any is a failed task)

1. **Only Corpus components.** Import from `@/components/corpus/*`. Never build a local component, re-style a primitive, or import another UI or icon library.
2. **Only Corpus tokens.** No hex/rgb/oklch, no arbitrary values (`w-[317px]`), no palette colors (`bg-blue-500`), no Tailwind type sizes (`text-sm`), no off-scale spacing (`p-5`), no `dark:` overrides, no inline styles.
3. **Only Corpus patterns.** Flows follow `.corpus/docs/patterns/*`. Don't invent a new way to filter, confirm, load or show empty.
4. **Every string goes through the taxonomy** (`corpus/taxonomy.json`), via the `corpus-content` skill.
5. **No Cancel/Close/Dismiss buttons** on modals or panels (× , Escape and click-outside close them). Footers are `ActionBar`s.
6. **Belonging has no gaps.** Related actions go in `ButtonSet`/`Group` (zero gap, joined).
7. **Left-hand shortcuts only.** Use `shortcut="mod+s"`-style props; never Enter, arrows or right-side letters. Every task must also work by mouse alone.
8. **Intent over input.** If a task can be described, start from the `Composer` + AI-prepared review (patterns/intent-first) instead of a form.
9. **Concentric radius.** Nested rounded elements use `scope-*` on the container and `rounded-inner-{padding}` on the child (inner = outer − padding).
10. **Nothing snaps.** Never turn transitions off; changing values use `AnimatedNumber` / `AnimatedText`; reorders use `morph()`.
11. **Exceptions exist only if a designer approved them in this conversation or in the codebase.** Then add `// corpus-allow <rule>: <reason> — approved by @name` on the line, and propose the gap upstream.

If Corpus lacks what you need: **stop and say so**. Propose the smallest composition of existing components. If that's impossible, describe the missing component as a design-system request. Never quietly work around it.

## Workflow

1. **Understand the job.** Which persona (`corpus/personas/*.md`)? What task, what frequency, what context? If personas don't exist yet, run the `corpus-personas` skill first.
2. **Find the pattern.** Read `.corpus/docs/index.json` and the matching `.corpus/docs/patterns/*.md` (forms, filtering, empty states, dialogs, loading, common actions…).
3. **Choose components** with `.corpus/docs/components/choosing-components.md`. It's a decision tree: follow it, don't pattern-match from memory. Then read each chosen component's doc (`use_when`, `avoid_when`, opinions).
4. **Lay out** with `Stack`, `Inline`, `Grid`/`Column`, `Container`, `PageHeader` (see `foundations/grid.md`, `foundations/spacing.md`).
5. **Write content** with the `corpus-content` skill.
6. **Add motion** only as the `corpus-motion` skill allows. Most components already animate correctly.
7. **Check visual consistency** with the `corpus-visual-consistency` checklist.
8. **Verify:** run `npm run corpus:audit` (or `node .corpus/scripts/corpus-audit.mjs <file>`) until it reports 0 violations. Typecheck. Check light and dark, keyboard, and 200% zoom.

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
| Peer views of an object | `Tabs` |
| Many records | `DataTable` + `Pagination` |
| Few key/value rows | `StructuredList` |
| Rows with one action | `ContainedList` |
| Confirm destructive | `ConfirmModal danger` |
| Edit alongside the page | `RightPanel` |
| "Done" feedback | `toast` |
| Problem to fix | `InlineNotification` near the cause |
| Object state | `StatusIndicator` |
| Nothing to show | `EmptyState` |
| Loading with known layout | `Skeleton` |
| AI-generated content | `AILabel` + `AISurface` |

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

Always propose the Corpus-native fix.
