---
title: CLI
summary: One command line to install Corpus, add components, stay up to date and audit any repo.
status: stable
related: [installation, registry, skills]
---

## Commands

| Command | Does |
|---|---|
| `corpus init` | Full install: components, styles, docs, skills, audit, hook and product templates |
| `corpus add <component…>` | Adds components and the internal pieces they depend on |
| `corpus update` | Refreshes system files; never touches your `theme.css` or `corpus/` product files |
| `corpus audit` | Runs the design-system audit on your code |
| `corpus list` | Lists every component you can add |

Run any of them with `npx github:Jacopospina/corpus <command>`.

## Rules

- **Update often.** `corpus update` brings every fix and component to your product; your theme and product files are never overwritten.
- **Audit in CI.** `npm run corpus:audit` fails the build on raw colours, off-scale spacing, local components and other deviations.
- **Exceptions need a reason.** `// corpus-allow <rule>: <why> — approved by @<owner>` on the line, or the audit fails.

## Working on Corpus itself

- **`pnpm check`.** Types, lint, audit and tests.
- **`pnpm visual`.** Every page in a real browser: layout, accessibility and screenshots.
- **`pnpm exceptions`.** Every approved deviation, with its age.
- **`pnpm changelog` · `pnpm release <major|minor|patch>`.** The changelog and versioned releases.
