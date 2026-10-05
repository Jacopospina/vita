---
title: Installation
summary: Add Vita to a React + Tailwind v4 product in one command, components, styles, docs, agent skills, the audit and its hooks.
status: stable
related: [cli, skills, registry, theming]
---

> [!TIP] **Not a coder? Let your agent do it.** Copy this prompt and paste it into your coding agent, in your project. It installs Vita, then walks you through the setup: your product, your users, your voice and your brand.
>
> ```prompt
> Set up the Vita design system in this project, then onboard me so Vita is tailored to my product. Work through these steps in order, and ask me one question at a time in plain words: I may not be technical.
>
> Install
> 1. Run `npx github:Jacopospina/vita init` in the repository root and accept the defaults.
> 2. Do everything it prints: import the Vita stylesheet in the global CSS, make sure `@/components/vita` resolves, and mount <TooltipProvider> and <Toaster /> at the app root. Check the app still starts.
> 3. Read AGENTS.md and the Vita skills it added (.claude/skills/vita-*). From now on, build every screen only from Vita components and tokens.
>
> Learn my product (use the vita-personae skill)
> 4. Interview me about the product: what it does, who uses it, the job they come to do, where and how often they use it, and what they fear going wrong. Write the answers to vita/product.md.
> 5. From my answers, create the personae in vita/personae/ and their journeys. Show me each persona in two lines and let me correct it.
> 6. Build the taxonomy in vita/taxonomy.json: the words my users use for things, and the words to avoid.
>
> Learn the voice (use the vita-copywriting skill)
> 7. Ask how the product should sound (up to three words, like calm, precise, warm) and, if it has AI, how the AI should speak: how long, and what it must never say. Write vita/ai-voice.md and tune the voice for each persona.
>
> Make it ours (use the vita-theming skill)
> 8. Ask for our brand colour and how dense or roomy the interface should feel, then set them in theme.css. Change only that file.
>
> Finish
> 9. Run the Vita audit (npm run vita:audit) and fix anything it finds.
> 10. Tell me in a few lines what you set up, and what I can ask you to build next.
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
