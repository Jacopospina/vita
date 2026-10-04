---
title: Content, personae & taxonomy
summary: Words are part of the design system. Personae decide who we speak to, the taxonomy fixes the words, and skills enforce them.
status: stable
use_when:
  - Writing any user-visible string, labels, buttons, errors, empty states, emails, AI responses
  - Starting a new product or flow (create personae first)
avoid_when:
  - Inventing a term that isn't in the taxonomy → add it to the taxonomy first
  - Writing copy before knowing the persona
setup_title: Teach Vita your users
setup: Tell Vita about your users, analytics included, and it tailors every word to them. Until then, it writes for the average internet user (Guidelines tab).
setup_skill: vita-copywriting
setup_files: [vita/personae]
---

## The chain

1. **`vita/product.md`.** What the product is, for whom, and the job it does.
2. **`vita/personae/*.md`.** 2–4 personae, created with the `vita-personae` skill.
3. **`vita/taxonomy.json`.** The one vocabulary: objects, actions, statuses, banned words, tone.
4. **Every string.** Written with the `vita-copywriting` skill; banned words fail the audit.

## Vita's defaults

Until you teach Vita your users, it writes for the average internet user, drawn from global research on internet use, reading and attitudes to AI. Your own personae and taxonomy replace these defaults.

### Default persona: Alex, 31

- **Phone first.** A mid-range Android phone, often the only way online, used in short sessions between other tasks.
- **Online about 6½ hours a day.** To find information, keep in touch with family and friends, and watch video.
- **Their own language first.** Most likely lives in a city in Asia; English is often a second language.
- **Skims.** Reads about a fifth of a screen, so the first line and the first words do the work.
- **Everyday reading skills.** Even in the richest countries, 1 adult in 4 struggles with dense text.
- **Already uses AI.** Wants it fast and right, and worries most that it's wrong.
- **Data costs money.** Light pages, few images, nothing wasted.

### Who the typical user is

The typical internet user is an urban adult around 31, on a smartphone, in a middle-income country. Their reading and digital skills are everyday, not advanced.

| Attribute | Evidence | What it means |
|---|---|---|
| Scale | 6.12 billion people online, 73.8% of the world (April 2026) | Online is the norm; about 2.2 billion are still offline |
| Age | World median age about 31; 82% of 15 to 24 year olds online | Late 20s to mid 30s |
| Where | China alone has about 1.3 billion users; China and India hold over a third | Most likely Asian; English often a second language |
| City or country | 85% of urban people online, 58% of rural | Urban |
| Income | 94% online in high-income countries, 23% in low-income | Middle income, price-sensitive |
| Device | Smartphones are about 89% of handsets; Android about 69% of mobile | An Android phone, a small screen |
| Access | In low and middle-income countries the phone is often the only way online | Phone first; a computer is secondary or absent |
| Data cost | An entry-level phone costs the poorest fifth about 44% of a month's income | Light pages, few images |
| Reading | 26% of adults in OECD countries read only short, simple texts | 1 in 4 struggle with dense text |
| AI | 81.2% of online adults used AI in the past month | Already uses AI; worries most that it's wrong |

### Sources

- DataReportal, Digital 2026 and the Mid-Year Global Update (GWI, Similarweb and GSMA Intelligence data)
- ITU, Facts and Figures 2025
- GSMA, State of Mobile Internet Connectivity 2025 and 2026
- Pew Research Center, analysis of UN World Population Prospects 2024
- StatCounter, mobile OS market share, September 2026
- OECD, Survey of Adult Skills (PIAAC, cycle 2)
- Nielsen Norman Group, research on writing for the web and reading on mobile
- UK Home Office and GOV.UK, readability and plain English guidance
- Chatbot expectation surveys (Zoom, Botpress, Master of Code, SurveyMonkey) and Scientific Reports (2026), on trust in AI chatbots

### Default word rules

- **Everyday words.** Words a 9 to 12 year old reader knows; any jargon is explained in passing.
- **Short sentences.** Under about 20 words, active voice, contractions ("you're", "we'll").
- **No idioms or slang.** They break in translation, and many readers use English as a second language.
- **Numbers as digits.** Dates and prices in the reader's local format.
- **The answer in the first line.** A phone shows 50 to 80 words; what isn't visible without scrolling, most people never find.

## A persona is

- **A job.** What they're trying to get done.
- **A context.** Device, time pressure, how often they come.
- **An expertise level.** Experts get domain terms; novices get plain language.
- **A vocabulary.** The words they already use, taken from real sources.
- **Anxieties.** What they fear going wrong, which microcopy must defuse.

## Taxonomy rules

1. **One concept, one word.** An "agent" is an agent everywhere, never a "bot" somewhere else.
2. **Buttons are verb + object.** "Create agent", never "Submit".
3. **Banned words have replacements.** Kept in `taxonomy.json → avoid`, flagged by the audit.
4. **Statuses are a closed set.** Each maps to a `StatusIndicator` kind.

## Voice

- **Plain and direct.** Write like a knowledgeable colleague.
- **Sentence case.** Everywhere.
- **Front-load.** "Delete 3 agents?", not "Are you sure you want to…".
- **Don't explain the obvious.** If a signifier already says it (a pointer cursor, a hover state, a chevron, a button's shape), the words don't repeat it: no "Click to…", "Tap here to…", "Change status" in labels or tooltips.
- **Name the thing.** Confirmations, toasts and errors say which object they mean, so nobody has to remember what they just did.
- **Buttons say what happens.** The confirm button repeats the title's verb.
- **Errors fix things, in human words.** What happened and how to fix it, written for someone who doesn't code: no status codes, exception names, field keys or IDs. No blame, no "oops".
- **No filler.** Drop "please", "simply", "just", "successfully".
- **No em dashes.** Use a comma, colon, full stop or parentheses. The build fails on one.
- **System messages speak to the persona.** Notifications, tags and tooltips are written for the persona (Vita's default until you teach it yours), and AI messages in the AI's voice: answer first, short, plain.
- **AI copy is honest.** Say what the AI did and how sure it is; never "I think".

## Vita's own voice

When Vita speaks for itself (these docs, the showcase, onboarding, release notes), it speaks as the Creator. Inside products built with Vita, the persona's plain voice always wins.

- **Speak to the maker.** "You make", "you shape": people are creators, never operators of a tool.
- **Verbs of making.** Make, shape, craft, compose, bring to life, release.
- **Possibility first.** Lead with what they'll create, then how; credit them, not Vita.
- **One slogan per surface.** The signature is "The first agentic design system." (decision: The slogan).
- **While agents work, a making word.** Sketching, Glazing, Weaving and more, one at a time; never "Loading".

## Write for the scan

People scan before they read: across the top, a shorter line below, then down the left edge. Write so the scan alone carries the meaning.

- **Most important first.** The first two paragraphs, and the first words of every heading, carry the point; people may read nothing else.
- **Headings start with the information.** "Billing errors" beats "About the errors you may see in billing".
- **Group what belongs together.** Sections, cards and tables give the eye places to stop, so nothing hides in a wall of text.
- **Emphasise the words that matter** (semibold, the emphasis weight), a few per section, never whole sentences.
- **Links say where they go.** "Read the billing guide", never "click here".
- **Lists over paragraphs.** Steps are numbered; options and rules are bulleted.

## Concise, scannable, objective

Research on reading on screens found that text written this way made people far faster and more accurate, and they remembered more of it.

- **Concise.** Cut about half the words. Shorter pages read as more complete, not less.
- **Scannable.** Short paragraphs (two sentences at most), headings, lists, emphasised keywords and tables.
- **Objective.** No promotional language, no buzzwords, no claims without proof.
- **Readable lines.** Body text stays around 45 to 75 characters a line; Vita's prose width does this for you.

## Length budgets

| Element | Max |
|---|---|
| Button | 3 words |
| Tab, menu item | 2 words |
| Toast title | 5 words |
| Helper text | 1 sentence |
| Error | 2 sentences |
| Empty-state description | 2 lines |
