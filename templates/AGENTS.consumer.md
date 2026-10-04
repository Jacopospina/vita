# Vita, UI rules for agents (non-negotiable)

This product's UI is built **only** with the Vita design system. Vita is the product's body: every visible pixel comes from it.

## Before writing any UI

1. Load the `vita-architect` skill (`.claude/skills/vita-architect/SKILL.md`).
2. Read `.vita/docs/index.json` to find the right pattern and components. Choose components with `.vita/docs/components/choosing-components.md`.
3. Write every string with the `vita-copywriting` skill, using `vita/taxonomy.json` and `vita/personae/`.
4. Add motion only as the `vita-motion-design` skill allows.

## Hard rules

- Import UI only from `@/components/vita/*`, and icons only from `@/components/vita/icons`.
- **Never create local components, patterns or styles** that duplicate or re-skin Vita. Never use raw values: hex/rgb, arbitrary Tailwind `[...]`, palette colors, `text-sm`-style sizes, off-scale spacing, inline styles, `dark:` overrides.
- **Never edit files in `src/components/vita/` or `src/styles/vita/`** except `theme.css`. Those are synced from the design system (`npm run vita:update`).
- Missing something? Stop and tell the user. Propose a composition of existing Vita components, or describe a design-system request. Only a designer can approve an exception, marked with `// vita-allow <rule>: <reason>, approved by @name`.
- **Modals and panels never get Cancel/Close/Dismiss buttons.** ×, Escape and click-outside close them.
- **Belonging has no gaps:** related actions go in `ButtonSet` / `Group`.
- **Left-hand shortcuts only** (`shortcut="mod+s"`); every task must also work by mouse alone.
- **Intent over input:** prefer `Composer` + AI-prepared review over long forms.
- **Nothing snaps:** never disable transitions; use `AnimatedNumber` / `AnimatedText` for changing values and `morph()` for reorders.
- Done means `npm run vita:audit` reports 0 violations, with typecheck and lint passing.

## Skills available

| Skill | Use for |
|---|---|
| `vita-architect` | Building or reviewing any UI |
| `vita-copywriting` | Any user-visible text |
| `vita-personae` | Personae, end-to-end journeys, taxonomy |
| `vita-motion-design` | Transitions and animation |
| `vita-consistency` | Polishing and visual review |
| `vita-theming` | Brand, density, radius, type changes (theme.css only) |
