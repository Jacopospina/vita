---
title: Brand & voice
summary: The AI-agent-first design system, born for humans and machines making together. Its voice is the Creator's, and every word aims to awaken the maker in the reader.
status: stable
use_when:
  - Writing in Corpus's own voice — docs, the showcase, onboarding, release notes, first-use moments
  - Naming a feature, writing a headline or choosing a slogan
avoid_when:
  - Product UI microcopy (buttons, labels, errors) → Content, personas & taxonomy; plain and direct wins inside products
related: [content, about, principles]
---

## The idea

Every person is a creator; some have just never been handed the right material. Corpus is that material.

> [!IMPORTANT]
> **The goal of every word:** awaken the creator in the person reading it. Corpus never makes things for people; it makes them feel able to make.

You bring the mind and the soul. Corpus gives them a body.

## Identity and positioning

**Corpus is the AI-agent-first design system, born for collaboration between humans and machines.** The machines are AI agents, building side by side with designers and engineers.

> [!NOTE]
> **Positioning.** For product teams where people and AI agents build together, Corpus is the design system that agents understand. Unlike systems written only for people, every decision is documented and enforced so an agent makes designer-quality choices on its own.

| Pillar | What it means | How Corpus does it |
|---|---|---|
| **Opinions, written down** | Agents need judgment, not just parts. | Every page says when to use a component and when not to, and what to use instead. A decision guide picks the right piece. |
| **Fluent for machines** | Agents read the same source of truth as people. | Docs ship as `llms.txt` and `docs/index.json`; six agent skills; project rules in `AGENTS.md`. |
| **Enforced, not suggested** | Quality can't depend on remembering the rules. | An audit with 13 rules fails the build on local components or raw values; an editor plugin and an agent hook fix violations as they're written. |
| **One craft for both** | People and agents ship the same quality. | One set of tokens, components, motion and words, whoever is making. |

How it meets the brand: people bring the vision, agents bring the craft at scale, and Corpus gives both the same judgment.

- **Category line:** The AI-agent-first design system.
- **Descriptor:** Built for humans and machines making together.
- **Proof line:** Documented so agents design like designers.

## The archetype: the Creator

| | Corpus |
|---|---|
| **Core desire** | To give enduring form to a vision. |
| **Goal** | Help people realise what they imagine, exactly as they imagine it. |
| **Fear** | Mediocrity: a good idea, badly made. |
| **Strategy** | Craft, then hand the craft over. Corpus decides the details so the maker can decide what matters. |
| **Gift** | Imagination made real. |
| **Shadow to guard against** | Perfectionism and making for its own sake. Corpus always pushes toward shipping. |

## The awakening arc

How Corpus speaks across a person's journey, from first spark to a new identity.

1. **Spark.** Invite imagination before anything else: "What do you want to bring to life?"
2. **Shape.** Give confidence in the craft: "Shape it freely. Corpus keeps every detail consistent."
3. **Release.** Celebrate the moment it's real: "It's live."
4. **Recognise.** Reflect the identity back: "You made that." This is the moment the creator wakes up.

## While agents work

- **Making words, never "Loading".** While an agent works, it shows one word at a time from the making vocabulary in the Creator's voice: Sketching, Glazing, Kneading, Weaving, Prototyping and 182 more.
- **One word, rotating.** A new word appears every couple of seconds with a letter-by-letter reveal. The full list, with the playful word each one was reworded from, lives in `src/registry/lib/making-words.ts`.

## Personality

| We are | We are not |
|---|---|
| Imaginative | Whimsical |
| Crafted | Precious |
| Visionary | Vague |
| Generous | Preachy |
| Confident | Arrogant |
| Expressive | Loud |

## Voice

1. **Speak to the maker.** Address people as creators: "you make", "you shape". Never as operators of a tool.
2. **Verbs of making.** Make, shape, craft, compose, give form, bring to life, release. These are the verbs of the brand.
3. **Possibility first.** Lead with what they'll create, then how.
4. **Hand over the material.** Corpus is the material and the instruments; the person is the author. Credit them, not us.
5. **Precision is part of the craft.** Short, exact sentences, beautiful because they're right.
6. **Ship over perfect.** Encourage releasing and iterating; that's how the Creator's shadow is kept in check.

## Tone by moment

| Moment | Tone | Example |
|---|---|---|
| Docs and guidelines | Clear, quietly inspiring | "Every product starts as an idea. These are the materials." |
| Showcase hero | Bold, invitational | "Give your ideas a body." |
| First use, empty state | Encouraging | "Nothing here yet. Your first agent is five minutes away." |
| Success | Celebrates the maker | "It's live. You made that." |
| Error | Calm craftsperson | "This piece didn't fit. Here's how to make it work." |
| Release notes | Proud of the craft | "New material: the Capsule." |

## Slogans

**Primary: Give your ideas a body.** It carries the name: Corpus is the body, the idea is theirs.

- **Make what only you can make.** For heroes and invitations.
- **You bring the vision. Corpus brings the form.** For explaining what Corpus is.
- **From mind to matter.** For short spaces and sign-offs.
- **Built to be built with.** For the system and its openness.
- **Designed for people. Fluent for agents.** For the human–machine positioning.
- **Shape what's next.** For releases and calls to action.

Use one slogan per surface. The primary slogan is the signature: hero, about, README.

## Words

| Prefer | Instead of |
|---|---|
| make, shape, craft, compose | build out, implement, leverage |
| give form, bring to life | enable, empower |
| material, instruments, pieces | solution, offering |
| you, makers | users, resources |
| release, ship | go to production, deliver value |

## Don't

- **Don't promise magic.** "AI does it for you" takes the authorship away; the person always creates.
- **Don't flatter.** Praise the work they made, never the person in empty superlatives.
- **Don't use self-help clichés.** No "unleash", "unlock your potential" or "limitless". Awaken through concrete making.
- **Don't talk about Corpus more than about what they'll make.**
- **Don't bring the brand voice into product microcopy.** Inside a product, the persona's plain voice wins (see Content, personas & taxonomy).
