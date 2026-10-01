---
title: Registry
summary: Vita ships as source, a registry of components, hooks, blocks, icons and styles you install into your repo and own.
status: stable
related: [installation, cli]
---

## What's in it

| Folder | Holds |
|---|---|
| `ui/` | Every component, one file each (`button.tsx`, `dropdown.tsx`…) |
| `blocks/` | Larger, ready-made compositions (login) |
| `hooks/` | Behaviour shared by components (shortcuts, motion, the sun and weather themes) |
| `lib/` | Shared logic (status semantics, the liquid simulation, making words) |
| `icons.ts` · `pictograms.ts` | The only places glyphs come from |
| `styles/` | Tokens, motion, theme knobs and presets |

## Rules

- **Import through the alias.** `@/components/vita/<name>`, never copy a component's insides into product code.
- **Source you own, not a black box.** You can read every line; changes that help everyone go back into Vita.
- **Add what you use.** `vita add <name>` brings a component and its internal dependencies.
