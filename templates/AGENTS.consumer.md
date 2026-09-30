# Corpus — UI rules for agents (non-negotiable)

This product's UI is built **only** with the Corpus design system. Corpus is the product's body: every visible pixel comes from it.

## Before writing any UI

1. Load the `corpus-design-system` skill (`.claude/skills/corpus-design-system/SKILL.md`).
2. Read `.corpus/docs/index.json` to find the right pattern and components. Choose components with `.corpus/docs/components/choosing-components.md`.
3. Write every string with the `corpus-content` skill, using `corpus/taxonomy.json` and `corpus/personas/`.
4. Add motion only as the `corpus-motion` skill allows.

## Hard rules

- Import UI only from `@/components/corpus/*`, and icons only from `@/components/corpus/icons`.
- **Never create local components, patterns or styles** that duplicate or re-skin Corpus. Never use raw values: hex/rgb, arbitrary Tailwind `[...]`, palette colors, `text-sm`-style sizes, off-scale spacing, inline styles, `dark:` overrides.
- **Never edit files in `src/components/corpus/` or `src/styles/corpus/`** except `theme.css`. Those are synced from the design system (`npm run corpus:update`).
- Missing something? Stop and tell the user. Propose a composition of existing Corpus components, or describe a design-system request. Only a designer can approve an exception, marked with `// corpus-allow <rule>: <reason> — approved by @name`.
- Done means `npm run corpus:audit` reports 0 violations, with typecheck and lint passing.

## Skills available

| Skill | Use for |
|---|---|
| `corpus-design-system` | Building or reviewing any UI |
| `corpus-content` | Any user-visible text |
| `corpus-personas` | Personas, end-to-end journeys, taxonomy |
| `corpus-motion` | Transitions and animation |
| `corpus-visual-consistency` | Polishing and visual review |
| `corpus-theme` | Brand, density, radius, type changes (theme.css only) |
