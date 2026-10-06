---
title: Installation
summary: Add Vita to a React + Tailwind v4 product in one command, components, styles, docs, agent skills, the audit and its hooks.
status: stable
related: [cli, skills, registry, theming]
---

## Two ways in

<!-- block: install-options -->

## What it adds

- **Every building block.** Buttons, forms, tables and the rest, as [[code you own and can change|`src/components/vita`, imported as `@/components/vita/<name>`]].
- **The look.** Colours, type, spacing and motion, all steered by [[about ten settings|`theme.css` in `src/styles/vita`]] that restyle everything at once.
- **The guide.** Everything you're reading here, written so both people and agents can follow it.
- **Your agent's know-how.** The [[skills|`.claude/skills/vita-*`]] and [[rules|the Vita block in `AGENTS.md`]] your agent reads before it builds, plus a [[check on every file it changes|an edit hook that runs the audit]].
- **A quality check.** One [[command|`npm run vita:audit`]] that flags anything not built from Vita.
- **A place for your product.** [[Files|`vita/product.md`, `vita/personae/`, `vita/taxonomy.json`]] where you describe what you make and who it's for.

## Then

1. **Switch on the look.** Point your app's [[main stylesheet|global CSS: replace `@import "tailwindcss";` with the Vita stylesheet the installer prints]] at Vita's.
2. **Let your code find Vita.** Make sure [[the components' address|`@/components/vita`, in your tsconfig paths and bundler alias]] points at the components folder.
3. **Add two helpers once.** The [[tooltip and notification hosts|`<TooltipProvider>` and `<Toaster />` at the app root]], so every tooltip and message works.
4. **Describe your product.** Tell your agent what you make and who it's for, and let it write [[your product file and personae|`vita/product.md`, then the vita-personae skill]].
5. **Make it yours.** Pick colours, corners and type in the Theme panel, then copy the [[settings|`theme.css`]] (see [Theming](#/foundations/theming)).
6. **Keep it right.** Run the [[quality check|`npm run vita:audit`, in CI]] every time code changes.

## Options

- **`--dir`, `--styles`, `--alias`.** Install into other folders or under another import alias.
- **`--no-skills`, `--no-hook`.** Skip the agent skills or the edit hook.
- **`--yes`.** Accept defaults without asking.
