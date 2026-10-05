---
name: vita-psychology
description: Decide layout, grouping, ordering, defaults, feedback and wording by how people perceive, decide and remember (gestalt principles, attention, memory and judgment), and keep every principle on the person's side. Use when laying out a screen, grouping or ordering content and actions, choosing a default, deciding what to show or hide, designing a confirmation, a wait or an error, or when something "feels off" and no checklist item says why. Also use when reviewing a flow for manipulation.
---

# Vita Psychology

A checklist tells an agent what to do; this skill tells it why, so it can decide when the checklist runs out. Every principle below is written as a decision, and the Vita component or token that carries it. Vita uses psychology to help the person, never to steer them.

## Non-negotiables

1. **Every principle helps the person.** A principle used against them is a violation, whatever it gains the product (see Never).
2. **Decide, then point.** When this skill changes a choice, say which principle decided it in one line, so the reviewer can disagree with the principle, not the taste.
3. **Prefer the component that already encodes the principle.** `Group`, `ButtonSet`, `KpiGroup`, `TileSet`, `ListGroup`, `Form`, `ConfirmModal`, `EmptyState` and `toast` exist because of the rules below; reach for them before arranging by hand.

## Seeing: how a screen is read

- **Proximity.** Things close together read as one thing. Gaps inside a group are smaller than gaps between groups (`xs` inside, `md`/`lg` between siblings, `xl`/`2xl` between sections); related fields sit in one `Form` group; one meaning never spans two cards with a gap.
- **Common region.** A shared container says "these belong together" louder than closeness. One meaning, one surface (`KpiGroup`, `TileSet`, `ListGroup`); a card inside a card says nothing new, so one surface step per nesting.
- **Similarity.** Same look means same job. The same action keeps the same icon, label and position everywhere; a control styled like a button must act like one, and an element that only looks clickable is a lie the cursor exposes.
- **Continuity.** The eye follows a line. Everything aligns to the grid's left edge, numbers right-align in columns, and a flow's steps sit on one axis (`ProgressIndicator`), never scattered.
- **Figure and ground.** What matters sits on a quieter field. Elevation and glass mark the floating layer; the page behind a `Modal` or `RightPanel` recedes, and only floating layers cast shadows.
- **Closure and symmetry.** People complete shapes and expect balance. Concentric radii (`scope-*`, `rounded-inner-*`), matched paddings on one screen and tiles of equal height inside a `TileSet` keep a composition at rest.
- **Visual hierarchy.** Size, weight and position rank things; colour does not. One `title-1`, headings that step down one level at a time, and the brand colour reserved for "you can act here".

## Attention: what gets noticed, and how much fits

- **Few choices at a time (Hick).** More options mean slower, more anxious choices. One primary action per view; secondary actions in a `ButtonSet` or `OverflowMenu`; 2 to 6 options as a `RadioGroup`, 7 to 20 as a `Dropdown`, more as a `Combobox` with search.
- **Chunking (Miller).** Working memory holds a handful of items. Long forms become sections or steps, long lists get groups and headings, and a number over four digits gets a separator (`AnimatedNumber` formats it).
- **Progressive disclosure.** Show what most people need now; put the rest one deliberate step away (`Accordion`, `RightPanel`, "Advanced" sections). Hidden must be findable: a visible label says what is behind the step.
- **Isolation (von Restorff).** One thing that looks different is the one that gets seen. Spend it on the primary action or the one status that needs attention; two accents cancel each other, and a screen full of colour says nothing.
- **Position (serial position).** First and last get remembered. The most important action is first in a `ButtonSet` or last in an `ActionBar` (the primary sits at the end, nearest the thumb); the first row of a table is the one people read.
- **Change blindness.** People miss what changes without motion. Nothing snaps: a value that changes rolls (`AnimatedNumber`), an item that leaves closes its space, and a new message arrives with gravity (`vita-motion-design`).
- **Goal gradient.** People speed up as they near the end. Show progress on multi-step work (`ProgressIndicator`, `ProgressBar` with a known total), and never add a step after the one that looked last.

## Doing: effort, feedback and errors

- **Big, near targets (Fitts).** Frequent actions are large and close; small standalone controls get `tap` (44px). A destructive action never sits where a hurried thumb lands next to a safe one: separate it with space, or move it behind the overflow menu.
- **Feedback within 100ms.** Every press shows something at once (pressed state, a pending label, the opened surface on its first frame); over a second shows progress; over ten says what is being done and offers a way out.
- **Recognition over recall.** Show options, recent values and the current state instead of asking people to remember them (`Combobox` recent items, filled defaults, breadcrumbs, the selected row kept visible).
- **Forgiveness.** Undo beats confirmation: a reversible action acts at once and offers Undo in a `toast`. Only irreversible actions confirm (`ConfirmModal danger`), naming the object and the consequence, with the safe choice as the default focus.
- **Error prevention over error messages.** Constrain the input (`DatePicker`, `NumberInput`, `Select`) before validating the text; validate on blur, not on every keystroke; put the message next to the cause (`InlineNotification`, `FieldMessage`), never in a toast.
- **Convention (Jakob).** People spend most of their time in other products, so a control is where they expect it: search top right, primary action at the end of the bar, the × in the corner. Vita's patterns are the convention; a new way to filter, confirm or load is a cost to the person.
- **Consistency over cleverness.** Same thing, same place: a control that moves between screens is a control people must find again.

## Judging: defaults, framing and trust

- **Defaults decide (default effect).** Most people keep the default, so the default is the choice most of them would make for themselves, never the one that benefits the product. Pre-filled, never pre-checked for consent.
- **Anchors.** The first number or option seen frames the rest. Order options by what the person wants (frequency, then alphabet), never by what the product wants chosen.
- **Framing and loss aversion.** The same fact reads differently as gain or loss. State consequences plainly and symmetrically ("Deleting removes 12 files"), never as a threat ("You will lose everything"), and never dress a cancel as a loss.
- **Choice overload.** Beyond about six comparable options people choose worse or not at all. Offer a recommended option, group the rest, and let search do the choosing past twenty.
- **Peak and end.** A flow is remembered by its hardest moment and its last one. Make the end a clear "done" (a `toast` or a success `EmptyState` with the next step), and spend the care on the step people dread (payment, deletion, the long form).
- **Trust is cumulative.** Every honest signal (a true progress bar, a visible AI mark, a real Undo) earns a little; one dishonest one spends it all. AI output is marked (`AILabel`), explainable and reversible (`.vita/docs/foundations/vita-for-ai.md`).
- **Reciprocity and social proof, with care.** Give before asking (a useful empty state before a sign-up), and show what others did only when it is true and relevant, never as invented counts or urgency.

## Never

- **Dark patterns.** No confirmshaming ("No thanks, I like paying more"), no pre-checked consent, no roach motel (easy in, hard out), no hidden costs, no nagging, no disguised ads.
- **False urgency or scarcity.** No countdowns, "only 2 left" or "3 people are looking" unless literally true and useful to the person.
- **Asymmetric friction.** Leaving, cancelling, deleting an account or declining is as easy as the opposite: same number of steps, same prominence.
- **Guilt, fear or shame as motivation.** Consequences are stated, not weaponised.
- **A default that serves the product over the person.** Report it as a violation in review, whatever the request said.

## Workflow

1. **Name the moment.** Reading (grouping, hierarchy), choosing (options, defaults), acting (targets, feedback, errors) or judging (framing, trust). Read the matching section.
2. **Pick the principle, then the component.** Most principles are already a component or a token; use it as designed (`vita-architect` picks it, `vita-consistency` checks the rhythm).
3. **Run the Never list** on every flow that asks for money, consent, data or a decision to leave.
4. **Say why.** One line per decision this skill changed: "proximity: moved the helper under its field".

## Review mode

When reviewing a screen for how it feels, report in this order: a Never violation, a wrong default or ordering, a missing feedback or progress, a grouping that misleads, a hierarchy that competes. Always propose the Vita-native fix and name the principle.
