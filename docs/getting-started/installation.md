---
title: Installation
summary: Add Vita to a React + Tailwind v4 product in one command, components, styles, docs, agent skills, the audit and its hooks.
status: stable
related: [cli, skills, registry, theming]
---

> [!TIP] **Not a coder? Let your agent do it.** Copy this prompt and paste it into your coding agent, in your project. It installs Vita, then walks you through the setup: your product, your users, your voice and your brand.
>
> ```prompt
> Set up the Vita design system in this project, then onboard me.
>
> 1. Run `npx github:Jacopospina/vita init` and do everything it prints.
> 2. Use the Vita skills to learn my product: my users (vita-personae), how it should sound (vita-copywriting) and my brand (vita-theming). Ask me one question at a time, in plain words.
> 3. From then on, act as my product designer: ask what I'm trying to achieve, recommend the best way to do it with Vita, then build it with Vita only.
> ```

## Install

```bash
npx github:Jacopospina/vita init
```
Needs React 19 and Tailwind CSS v4. Everything it installs is plain source in your repo, you own it.

## What it adds

- **Components.** `src/components/vita`, every component as editable source, imported as `@/components/vita/<name>`.
- **Styles.** `src/styles/vita`, tokens, motion and `theme.css`, the ten knobs that re-skin everything.
- **Docs.** The whole design system, readable by people and agents.
- **Agent layer.** Skills in `.claude/skills`, the Vita rules block in `AGENTS.md`, and a hook that audits every file an agent edits.
- **The audit.** `npm run vita:audit`, the design system is the only source of UI.
- **Product templates.** `vita/product.md`, personae and the product taxonomy.

## Then

1. **Import the styles.** In your global CSS, replace `@import "tailwindcss";` with the Vita stylesheet the installer prints.
2. **Resolve the alias.** Make sure `@/components/vita` points at the components folder (tsconfig paths and your bundler alias).
3. **Mount once.** `<TooltipProvider>` and `<Toaster />` at the app root.
4. **Describe the product.** Fill `vita/product.md`, then ask your agent to use the vita-personae skill for personae and taxonomy.
5. **Make it yours.** Tune `theme.css`, see [Theming](#/foundations/theming).
6. **Guard it.** Run `npm run vita:audit` in CI.

## Options

- **`--dir`, `--styles`, `--alias`.** Install into other folders or under another import alias.
- **`--no-skills`, `--no-hook`.** Skip the agent skills or the edit hook.
- **`--yes`.** Accept defaults without asking.
