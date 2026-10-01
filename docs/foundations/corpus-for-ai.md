---
title: Corpus for AI
summary: Corpus is built for agents as much as for people — machine-readable docs, skills, rules, decisions and an audit that answers on every edit.
status: stable
use_when:
  - Setting up an agent to design or build with Corpus
  - Understanding how Corpus keeps agent-built screens consistent
avoid_when:
  - Looking for the AI label or AI surfaces in the product → AI label
related: [skills, cli, how-we-decide]
---

> [!IMPORTANT] Agents don't need more parts; they need judgment. Corpus writes every design decision down and enforces it, so an agent makes the choices a designer would.

## What an agent reads

- **`llms.txt`.** The compact map of every page: what each is for, when to use it, when not to.
- **`docs/index.json`.** The same catalogue, machine-readable: import paths, use and avoid lists, related pages.
- **Docs.** Every page is written card-first: rules an agent can follow line by line.
- **Decisions.** Why things are the way they are, so an agent never reverses a choice by accident.
- **Skills.** Six skills that turn the docs into designer-quality behaviour.

## What keeps it honest

- **The audit.** Raw colours, off-scale spacing, local components, status colours used as decoration — all fail.
- **The edit hook.** Every file an agent edits is audited on the spot, and the agent sees the result.
- **Exceptions are visible.** A deviation needs a written reason and an approver; `pnpm exceptions` lists them all.

## Rules

1. **One source of UI.** Agents compose Corpus components; they never invent local ones.
2. **Decide like a designer.** Pick by intent ("one of many options" → Dropdown), not by look.
3. **Read before changing.** A decided thing is changed by superseding its record, in the same commit.
