---
title: Design principles
summary: Ten ranked rules every Corpus screen obeys. When two conflict, the lower number wins.
status: stable
---

> [!IMPORTANT] Corpus is built for products where AI carries the complexity. The interface stays light, alive and quick to leave.

## The ten principles

1. **The system is the only source of UI.** Every pixel is a Corpus component, pattern or token. A gap becomes a design-system change, never a local workaround.
2. **Intent over input.** Users say what they want and review what the AI prepared. Forms are the fallback.
3. **One hand per device.** Right hand on the mouse, left on the keyboard. Everything works by pointer; shortcuts use left-hand keys only.
4. **Never repeat a way out.** Dialogs and panels close with ×, Escape or a click outside. No Cancel, Close or Dismiss buttons.
5. **Belonging has no gaps.** Things that belong together touch: button sets, action bars, swatches, segmented controls.
6. **Nothing snaps.** Every change of position, size, color or value transitions; variants morph; numbers roll; text reveals.
7. **Clarity over cleverness.** In five seconds the user knows where they are, what they can do, and what matters most.
8. **Content first, hierarchy you can squint at.** Size, weight and position rank things; color comes last.
9. **Consistent by construction.** The same problem gets the same pattern, verb, shortcut and place.
10. **Accessible by default.** WCAG 2.2 AA is the floor: keyboard, focus, contrast, reduced motion.

## What they look like in practice

- **One primary action per view.** Everything else steps down: secondary → tertiary → ghost.
- **One composer, not twelve fields.** Describe → review → approve.
- **Real words from the taxonomy.** Never internal jargon, never "Submit".
- **Neutral, living screens.** About 90% greys; motion on every change.

## How an agent applies them

1. **Persona.** Who is this for, and what's their job?
2. **Pattern.** Start from *Intent-first input* when the task can be described.
3. **Components.** Choose them with *Choosing a component*.
4. **Words.** Write every string through the taxonomy.
5. **Audit.** Run `corpus-audit` until it reports 0 violations.
