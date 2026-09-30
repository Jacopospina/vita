# Corpus

**The body of every product we build.**

Every product has three parts. **Animus**, the mind, is the logic that reasons and decides. **Anima**, the soul, is its purpose, character and the experience it creates. **Corpus**, the body, is the visible form through which mind and soul reach the world. It is also a *body of work*: components, tokens and patterns that grow over time.

Corpus is an opinionated, AI-agent-first design system for React + Tailwind v4. Designers, engineers, PMs and AI agents all ship the same quality of UI because the system decides for them:

- **Which component** to use and when not to (decision guides for every component).
- **How things move** (motion tokens and choreography rules).
- **How things look consistent** (one token set, one checklist).
- **Which words** to use (personas → taxonomy → content rules).
- **What's forbidden** (an audit that fails the build on local components or raw values).

---

## Contents

| | |
|---|---|
| **Foundations** (12) | Corpus · principles · theming · grid · spacing · color · typography · motion · icons · pictograms · accessibility · content, personas & taxonomy |
| **Components** (41 + guide) | Accordion, AI label, Breadcrumb, Button, Checkbox, Code snippet, Contained list, Content switcher, Data table, Date picker, Dropdown (+ Combobox, MultiSelect), File uploader, Form (+ FluidForm), Inline loading, Link, List, Loading (+ Skeleton), Menu, Menu buttons, Modal, Notification (+ Toast, Callout), Number input, Pagination, Popover (+ Toggletip), Progress bar, Progress indicator, Radio button, Search, Select, Slider, Structured list, Tabs, Tag, Text input, Tile, Toggle, Tooltip, Tree view, UI shell header / left panel / right panel, plus Empty state, Status indicator, Page header, Truncate, Toolbar, Layout, Text, Icon, Pictogram |
| **Patterns** (17) | Common actions, Dialogs, Disabled states, Disclosures, Empty states, Filtering, Fluid styles, Forms, Global header, Loading, Login, Notifications, Overflow content, Read-only states, Search, Status indicators, Text toolbar |
| **Skills** (6) | `corpus-design-system`, `corpus-content`, `corpus-personas`, `corpus-motion`, `corpus-visual-consistency`, `corpus-theme` |
| **Enforcement** | `corpus-audit` (CLI/CI), ESLint plugin (editor), Claude Code hook (agents fix violations as they write) |

Every page in the docs site has the same four tabs:

1. **Overview:** live preview, when to use / when not to, and every variant.
2. **Guidelines:** the rules.
3. **Tokens:** extracted from source, resolved live.
4. **Code:** import, install and source.

## Run the docs & playground

```bash
nvm use            # Node 24
pnpm install
pnpm dev           # http://localhost:5173 — palette icon in the header opens the live theme editor
pnpm check         # typecheck + lint + corpus-audit + tests
```

## Install Corpus in a product repo

The repo is private, so anyone with access installs straight from GitHub:

```bash
npx github:jacopoenergy/corpus-design-system init
```

`init` does the following:

- Copies components to `src/components/corpus/` and styles to `src/styles/corpus/`.
- Copies docs (for agents) to `.corpus/docs/`.
- Installs the skills to `.claude/skills/`.
- Writes the Corpus rules block into `AGENTS.md`, and points `CLAUDE.md` at it.
- Adds a Claude Code hook that audits every file an agent edits.
- Creates `corpus/` (product.md, personas, taxonomy.json), adds the `corpus:audit` / `corpus:update` scripts, and installs the runtime dependencies.

Then:

1. In your global CSS, replace `@import "tailwindcss";` with `@import "./styles/corpus/corpus.css";`.
2. Alias `@/components/corpus` → `src/components/corpus` (tsconfig `paths` + bundler alias).
3. Mount `<TooltipProvider>` and `<Toaster />` once at the root.
4. Fill in `corpus/product.md`, then ask your agent to *"use the corpus-personas skill"*.
5. Tune `src/styles/corpus/theme.css`.

Other commands:

```bash
npx github:jacopoenergy/corpus-design-system add data-table modal   # just some components (+ their deps)
npx github:jacopoenergy/corpus-design-system update                 # pull latest system files; keeps theme.css and corpus/
npx github:jacopoenergy/corpus-design-system audit                  # run the audit
```

## Personalise in about 10 variables

All visual decisions derive from `src/styles/theme.css`:

```css
:root {
  --corpus-brand-hue: 258;      --corpus-brand-chroma: 0.2;
  --corpus-neutral-hue: 258;    --corpus-neutral-chroma: 0.006;
  --corpus-radius: 0.5rem;      --corpus-density: 1;
  --corpus-font-sans: "Inter Variable", system-ui, sans-serif;
  --corpus-type-base: 0.875rem; --corpus-type-ratio: 1.2;
  --corpus-motion-scale: 1;
}
```

- Colors are generated in OKLCH, so any hue stays readable.
- Dark mode is automatic (`.dark` or `data-theme="dark"`).
- Presets: `data-corpus-preset="square|soft|mono"`.
- Words are personalised too: `corpus/taxonomy.json`.

## The rule

> **Never local components, patterns or raw values.** Always reuse Corpus, unless a designer explicitly approves an exception, marked `// corpus-allow <rule>: <reason> — approved by @name`.

Tailwind's default palette, sizes, radii, shadows and easings are **removed**, so off-system classes don't even compile. What remains is caught by `corpus-audit`: raw colors, arbitrary values, off-scale spacing, raw `<button>`/`<input>`/`<table>`, foreign icon/UI libraries, `dark:` overrides, inline styles and banned taxonomy words.

## Repository layout

```
docs/            foundations · components · patterns (markdown + frontmatter: use_when, avoid_when, related)
  index.json     machine-readable catalog for agents        (pnpm llms)
llms.txt         compact overview for agents                 (pnpm llms)
skills/          agent skills installed into consumer repos
src/styles/      theme.css (knobs) · tokens.css · motion.css · presets.css · corpus.css (entry)
src/registry/    ui/* components · blocks/* · icons.ts · pictograms.ts · lib · hooks
src/playground/  the docs site (built only with Corpus: it passes its own audit)
scripts/         corpus-audit · corpus-rules · claude-hook · build-llms
eslint/          corpus ESLint plugin
bin/corpus.mjs   the CLI
templates/       AGENTS block · product · persona · taxonomy
```
