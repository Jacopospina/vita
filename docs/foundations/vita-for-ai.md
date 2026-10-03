---
title: Vita for AI
summary: How Vita shows AI to the people using a product (honest, explainable, in their control), and how it lets AI agents build that product like a designer would.
status: stable
use_when:
  - Designing any screen where AI generates, suggests, fills in, searches or speaks
  - Choosing how AI work looks, waits, explains itself and hands control back
  - Setting up an agent to design or build with Vita
avoid_when:
  - Branding or marketing flair → the AI spectrum is reserved for AI provenance
  - Plain logic that isn't AI (a sort, a calculation) → ordinary components, no AI marks
related: [ai-label, thinking, intent-first, agent-conversation, voice-conversation, skills]
---

> [!IMPORTANT] People trust AI they can see working, understand and undo. Every AI moment in a Vita product is marked, explained and reversible.

## Principles

1. **Transparent.** Anything AI produced, suggested or changed carries a mark. No silent AI.
2. **Explainable.** One click on the mark says what the AI did, from which sources, and how sure it is.
3. **In the person's control.** AI output is editable, rejectable and revertible; it is never submitted on someone's behalf.
4. **Honest about the work.** While AI works, the screen shows which kind of work it is (recalling, searching, making), never a spinner.
5. **Restrained.** AI styling marks provenance; it never decorates. A screen full of rainbows says nothing.

## Visual language

AI has one look in Vita, and nothing else may borrow it. It reads as light: a spectrum that glows, never a colour of its own.

- **The spectrum.** A slowly turning outline in the AI colours (`ai-gradient-border`) marks an AI surface or a standalone AI label.
- **AI words.** `text-ai` colours the words that say AI made something ("Drafted by Support triage"), orange to pink to purple to teal.
- **The AI surface.** `AISurface` wraps a generated block (a suggested reply, a summary): the spectrum edge with a clean surface inside, so the content stays easy to read.
- **Sofia.** The thinking liquid is the AI at work: it changes form with the kind of work, from recall to search to making, and listens and talks in voice.
- **Quiet in context.** Inside a field, a tile or an AI surface, the AI label turns muted, so a screen with many AI values stays calm.

## Explainability

The AI label is the door to an explanation. Clicking it opens a popover that answers four questions in plain words:

- **What happened.** "Suggested from 3 similar tickets", "Extracted from the sender's signature".
- **From where.** The sources it used, linked when people can open them.
- **How sure.** A confidence people can act on ("high confidence"), never a raw score.
- **Which model.** The agent or model that did it.

Write it for someone who doesn't know how AI works: no jargon, no "I", no hype.

## The person stays in control

- **Revert.** When AI overwrote a value, the label offers the way back (`onRevert`): "Restore my value".
- **Review before it counts.** AI fills in and suggests; the person confirms. Nothing AI produced is sent, published or paid without a person's action.
- **Ownership moves.** Once a person edits AI content, it becomes theirs: remove the mark, or show "Edited".

## AI components

| Component | What it does for AI |
|---|---|
| [AI label](#/components/ai-label) | Marks AI provenance and opens the explanation; offers revert |
| `AISurface` | Frames a generated block with the AI edge |
| [Thinking](#/components/thinking) | Sofia: shows the kind of work while AI works (retrieving, searching, generating) |
| [Composer](#/components/composer) | Where people state what they want, in their words (intent first) |
| [Chat bubble](#/components/chat-bubble) | A conversation with an agent, with AI marks on what it wrote |
| [Live waveform](#/components/live-waveform) | Sound flowing, in a voice conversation |
| [Scramble text](#/components/scramble-text) | Text on its way, set in its real type while AI produces it |

For whole flows, see the patterns: [Intent first](#/patterns/intent-first), [Agent conversation](#/patterns/agent-conversation) and [Voice conversation](#/patterns/voice-conversation).

## Showing the work

| Sofia | When |
|---|---|
| Retrieving | The agent recalls from memory or a knowledge base |
| Searching | The agent looks something up in tools or the web |
| Generating | The agent writes, drafts or makes |
| Listening | A person is speaking to the agent |
| Talking | The agent is speaking |
| Idle | The agent is present and ready |

- **Name the work.** Pair Sofia with words that say what's happening ("Searching the help center"); screen readers hear them too.
- **Plain logic isn't AI.** A save or a sort uses the basic state, without the AI spectrum.

## Accessibility

- **Marks are announced.** The AI label has an accessible name and its explanation is reachable by keyboard.
- **Never colour alone.** The spectrum is never the only signal; the label and the words carry the meaning.
- **Contrast holds.** AI surfaces keep body text at AA contrast in light and dark themes.
- **Calm motion.** Under reduced motion, Sofia holds a still frame with a gentle pulse and the spectrum stops turning.

## Vita for agents

Agents don't need more parts; they need judgment. Vita writes every design decision down and enforces it, so an agent makes the choices a designer would.

- **What an agent reads.** `llms.txt` (the map of every page), `docs/index.json` (the same, machine-readable), card-first docs, decision records and six skills.
- **The audit.** Raw colours, off-scale spacing, local components and decorative status colours fail the build.
- **The edit hook.** Every file an agent edits is audited on the spot, and the agent sees the result.
- **Visible exceptions.** A deviation needs a written reason and an approver; `pnpm exceptions` lists them all.
- **One source of UI.** Agents compose Vita components and pick by intent; they never invent local ones.
- **Read before changing.** A decided thing changes only by superseding its record, in the same commit.
