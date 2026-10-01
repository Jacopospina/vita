---
title: CLI
summary: One command line to install Vita, add components, stay up to date and audit any repo.
status: stable
related: [installation, registry, skills]
---

## Commands

| Command | Does |
|---|---|
| `vita init` | Full install: components, styles, docs, skills, audit, hook and product templates |
| `vita add <component…>` | Adds components and the internal pieces they depend on |
| `vita update` | Refreshes system files; never touches your `theme.css` or `vita/` product files |
| `vita audit` | Runs the design-system audit on your code |
| `vita list` | Lists every component you can add |

Run any of them with `npx github:Jacopospina/vita <command>`.

## Rules

- **Update often.** `vita update` brings every fix and component to your product; your theme and product files are never overwritten.
- **Audit in CI.** `npm run vita:audit` fails the build on raw colours, off-scale spacing, local components and other deviations.
- **Exceptions need a reason.** `// vita-allow <rule>: <why>, approved by @<owner>` on the line, or the audit fails.

## Working on Vita itself

- **`pnpm check`.** Types, lint, audit and tests.
- **`pnpm visual`.** Every page in a real browser: layout, accessibility and screenshots.
- **`pnpm exceptions`.** Every approved deviation, with its age.
- **`pnpm changelog` · `pnpm release <major|minor|patch>`.** The changelog and versioned releases.
