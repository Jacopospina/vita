---
title: Design principles
summary: Four principles every Vita screen is built on, then the timeless principles of interface design they stand on. When two conflict, the lower number wins.
status: stable
---

> [!IMPORTANT] AI now carries much of the complexity inside products. What's left for the interface is to be cheap to use, light to think about, and alive to the eye.

## Vita's principles

1. **Keep the interaction cost low.** Every time a hand leaves the keyboard for the mouse, or the mouse for the keyboard, people pay for it. Vita keeps one hand on each device and never makes them switch to finish a task.
2. **Ask less, so people think less.** The AI does the complex work, so the interface needs fewer inputs. Each screen asks for one decision, prefills the rest, and lets people review instead of fill in.
3. **Recognition over recall.** Seeing is cheaper than remembering. Options, states, shortcuts and context stay visible, so people pick what they recognise instead of recalling what they once learned.
4. **Choreograph every change.** The eye follows motion and loses what snaps. Every element that appears, moves, changes or leaves does it with a transition people can follow.

## 1. Keep the interaction cost low

- **One hand per device.** Right hand on the pointer, left hand on the keyboard. Every task completes with the mouse alone; shortcuts speed it up with the left hand only.
- **Act where the hand already is.** Actions sit next to what they affect, not in far corners; frequent actions get big targets.
- **Choose instead of type.** Suggestions, defaults, AI prefill and pickers come before free text.
- **Never repeat a way out.** Dialogs and panels close with ×, Escape or a click outside. No Cancel, Close or Dismiss buttons.
- **Right-click accelerates.** Context menus repeat visible actions, never replace them.

| Keys | Action |
|---|---|
| `Esc` | Close the top layer · clear and leave search · discard an inline edit |
| `⌘F` / `Ctrl+F` | Focus the page's search |
| `⌘S` | Save, or the primary action of a form |
| `⌘E` | Edit the current object |
| `⌘D` | Duplicate |
| `⌘Z` / `⌘⇧Z` | Undo / redo |
| `⌘A` | Select all rows |
| `Tab` / `⇧Tab` | Move between controls |
| `Space` | Toggle, select, open |
| `1` to `5` | Switch tabs or segments (when focus isn't in a field) |

> [!WARNING] Never bind a shortcut to right-hand keys (Enter, arrows, Delete, P, L, O). `useShortcut` warns in development when a combination needs the right hand.

## 2. Ask less, so people think less

- **Intent over input.** People say what they want (typed, spoken or handed to an agent) and review what the AI prepared. Forms are the fallback.
- **One decision per view.** At most one primary action; everything else steps down or waits behind a disclosure.
- **Belonging has no gaps.** Things that belong together touch (button sets, action bars, segmented controls), so they read as one object, not many.
- **Real words.** Labels come from the product's taxonomy, never internal jargon, never "Submit".
- **Write for the scan.** People skim the top and the left edge: the point comes first, headings start with the information, paragraphs stop at two sentences, and lines stay readable (about 45 to 75 characters).
- **Neutral by default.** About 90% of a screen is greys; colour is kept for meaning.

## 3. Recognition over recall

- **Show the options.** Suggestions in the composer, values in dropdowns, recent and suggested items: people choose from what they see instead of typing what they remember.
- **Labels never disappear.** A field's label stays visible while it's filled (it floats up); a placeholder is an example, never the label.
- **Shortcuts are visible where they work.** Every control with a shortcut shows its keys in its tooltip; nothing is a secret.
- **State stays on screen.** Applied filters are tags, the current page is highlighted, the selected value shows in its field, today is marked in the calendar.
- **Context travels with the decision.** A confirmation names what it acts on ("Delete 3 agents?"), and errors say what to fix next to where it is.
- **Icons come with words.** An icon alone always has a tooltip; in navigation and menus, icons sit next to a label.

## 4. Choreograph every change

- **Nothing snaps.** Position, size, colour and value all transition; variants morph; numbers roll; text reveals.
- **Everything leaves before it goes.** Removed tags, dismissed notifications and deleted rows play an exit, so people see what disappeared.
- **Static layout never moves.** Pages don't animate into place on load; only change moves.
- **Show the work.** When the AI works, Sofia shows which kind of work it is. Never a spinner.

## Timeless principles of interface design

The ground Vita stands on: principles good interfaces have always shared.

- **Clarity.** Text is legible at every size, icons are precise, and purpose is obvious at a glance.
- **Deference.** The interface helps people understand and act on their content; it never competes with it.
- **Depth.** Layers, motion and material show hierarchy and where things come from.
- **Consistency.** The same problem gets the same pattern, word, shortcut and place, so what people learn once works everywhere.
- **Direct manipulation.** People act on things themselves (drag, swipe, resize) and see the result at once.
- **Feedback.** Every action is acknowledged, every process shows its state, and results are clear.
- **Metaphors.** Familiar, physical ideas make the new easy to learn: layers you can lift, liquid that flows.
- **User control.** People, not the system, start and control actions; the system advises and confirms, then steps back.
- **Aesthetic integrity.** How it looks matches how it behaves: calm for focused work, expressive for moments of delight.

## How an agent applies them

1. **Persona.** Who is this for, and what's their job?
2. **Pattern.** Start from *Intent-first input* when the task can be described.
3. **Components.** Choose them with *Choosing a component*.
4. **Words.** Write every string through the taxonomy.
5. **Audit.** Run `vita-audit` until it reports 0 violations.
