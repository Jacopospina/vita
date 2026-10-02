# Vita

**Give your ideas life.**

Every product has three parts. **Animus**, the mind, is the backend logic: rules, data and structure. **Anima**, the soul, is the AI layer: the language model that perceives, interprets and speaks. **Vita**, life, is the design system: the living experience where the mind's logic and the soul's intelligence become one thing people can touch, read and trust.

**The AI-agent-first design system, born for humans and machines making together.** Vita is documented and built so AI agents make designer-quality design decisions on their own; designers, engineers, PMs and agents ship the same quality of UI because the system decides for them. It's for React + Tailwind v4:

- **Which component** to use and when not to (decision guides for every component).
- **How things move** (motion tokens and choreography rules).
- **How things look consistent** (one token set, one checklist).
- **Which words** to use (personas → taxonomy → content rules).
- **What's forbidden** (an audit that fails the build on local components or raw values).

---

## Contents

| | |
|---|---|
| **Foundations** (12) | Vita · principles · theming · grid · spacing · color · typography · motion · icons · pictograms · accessibility · content, personas & taxonomy |
| **Components** (41 + guide) | Accordion, AI label, Breadcrumb, Button, Checkbox, Code snippet, Contained list, Content switcher, Data table, Date picker, Dropdown (+ Combobox, MultiSelect), File uploader, Form (+ FluidForm), Inline loading, Link, List, Loading (+ Skeleton), Menu, Menu buttons, Modal, Notification (+ Toast, Callout), Number input, Pagination, Popover (+ Toggletip), Progress bar, Progress indicator, Radio button, Search, Select, Slider, Structured list, Tabs, Tag, Text input, Tile, Toggle, Tooltip, Tree view, UI shell header / left panel / right panel, plus Empty state, Status indicator, Page header, Truncate, Toolbar, Layout, Text, Icon, Pictogram |
| **Patterns** (17) | Common actions, Dialogs, Disabled states, Disclosures, Empty states, Filtering, Fluid styles, Forms, Global header, Loading, Login, Notifications, Overflow content, Read-only states, Search, Status indicators, Text toolbar |
| **Skills** (6) | `vita-architect`, `vita-copywriting`, `vita-personae`, `vita-motion-design`, `vita-consistency`, `vita-theming` |
| **Enforcement** | `vita-audit` (CLI/CI), ESLint plugin (editor), Claude Code hook (agents fix violations as they write) |

Every page in the docs site has the same four tabs:

1. **Overview:** live preview, when to use / when not to, and every variant.
2. **Guidelines:** the rules.
3. **Tokens:** extracted from source, resolved live.
4. **Code:** import, install and source.

## Run the docs & playground

```bash
nvm use            # Node 24
pnpm install
pnpm dev           # http://localhost:5173, palette icon in the header opens the live theme editor
pnpm check         # typecheck + lint + vita-audit + tests
```

## Install Vita in a product repo

The repo is private, so anyone with access installs straight from GitHub:

```bash
pnpm dlx github:Jacopospina/vita init
# or: npx github:Jacopospina/vita init   (if npm reports ECOMPROMISED, run `npm cache verify` first)
```

`init` does the following:

- Copies components to `src/components/vita/` and styles to `src/styles/vita/`.
- Copies docs (for agents) to `.vita/docs/`.
- Installs the skills to `.claude/skills/`.
- Writes the Vita rules block into `AGENTS.md`, and points `CLAUDE.md` at it.
- Adds a Claude Code hook that audits every file an agent edits.
- Creates `vita/` (product.md, personas, taxonomy.json), adds the `vita:audit` / `vita:update` scripts, and installs the runtime dependencies.

Then:

1. In your global CSS, replace `@import "tailwindcss";` with `@import "./styles/vita/vita.css";`.
2. Alias `@/components/vita` → `src/components/vita` (tsconfig `paths` + bundler alias).
3. Mount `<TooltipProvider>` and `<Toaster />` once at the root.
4. Fill in `vita/product.md`, then ask your agent to *"use the vita-personae skill"*.
5. Tune `src/styles/vita/theme.css`.

Other commands:

```bash
npx github:Jacopospina/vita add data-table modal   # just some components (+ their deps)
npx github:Jacopospina/vita update                 # pull latest system files; keeps theme.css and vita/
npx github:Jacopospina/vita audit                  # run the audit
```

## Personalise in about 10 variables

All visual decisions derive from `src/styles/theme.css`:

```css
:root {
  --vita-brand-hue: 258;      --vita-brand-chroma: 0.2;
  --vita-neutral-hue: 258;    --vita-neutral-chroma: 0.006;
  --vita-radius: 0.5rem;      --vita-density: 1;
  --vita-font-sans: "Google Sans Flex Variable", system-ui, sans-serif;
  --vita-font-mono: "Google Sans Code Variable", ui-monospace, monospace;  /* code + numbers */
  --vita-type-base: 0.875rem; --vita-type-ratio: 1.2;
  --vita-motion-scale: 1;
}
```

- Colors are generated in OKLCH, so any hue stays readable.
- Dark mode is automatic (`.dark` or `data-theme="dark"`).
- Presets: `data-vita-preset="square|soft|mono"`.
- Words are personalised too: `vita/taxonomy.json`.

## The rule

> **Never local components, patterns or raw values.** Always reuse Vita, unless a designer explicitly approves an exception, marked `// vita-allow <rule>: <reason>, approved by @name`.

Tailwind's default palette, sizes, radii, shadows and easings are **removed**, so off-system classes don't even compile. What remains is caught by `vita-audit`: raw colors, arbitrary values, off-scale spacing, raw `<button>`/`<input>`/`<table>`, foreign icon/UI libraries, `dark:` overrides, inline styles and banned taxonomy words.

## Repository layout

```
docs/            foundations · components · patterns (markdown + frontmatter: use_when, avoid_when, related)
  index.json     machine-readable catalog for agents        (pnpm llms)
llms.txt         compact overview for agents                 (pnpm llms)
skills/          agent skills installed into consumer repos
src/styles/      theme.css (knobs) · tokens.css · motion.css · presets.css · vita.css (entry)
src/registry/    ui/* components · blocks/* · icons.ts · pictograms.ts · lib · hooks
src/playground/  the docs site (built only with Vita: it passes its own audit)
scripts/         vita-audit · vita-rules · claude-hook · build-llms
eslint/          vita ESLint plugin
bin/vita.mjs   the CLI
templates/       AGENTS block · product · persona · taxonomy
```
