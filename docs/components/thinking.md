---
title: Thinking
summary: Vita never spins, it thinks. Tiny particles that blend like liquid show what kind of work is happening. Skeletons whenever the layout is known.
status: stable
import: "import { Loading, Skeleton, SkeletonText } from \"@/components/vita/loading\"\nimport { Thinking } from \"@/components/vita/thinking\""
use_when:
  - Skeleton, content with a known shape is on its way (cards, tables, profiles)
  - Loading / Thinking, a region is working and its layout is unknown
  - Loading overlay, interaction must be blocked while a region recomputes
avoid_when:
  - A single action → Button loading / InlineLoading
  - Measurable progress → ProgressBar
  - Anything under 300ms → show nothing
  - Spinners → they belong to the old world (the audit rejects them)
related: [inline-loading, progress-bar, loading-pattern]
---

> [!IMPORTANT] The mode tells the user what the system is doing. Pick it by the work, not by taste.

## Why the spinner belongs to the old world

- **A spinner says one thing: wait.** It can't tell a slow server from an agent reading your files, writing an answer or searching your tools. Every kind of work looks the same, so people learn nothing and trust nothing.
- **AI work has kinds, and people deserve to see them.** Retrieving, generating and searching take different time, carry different risk and end in different results. Showing which one is happening is how people stay in control of what the AI does.
- **Sofia carries meaning a spinner can't.** Each mode is its own motion: drops flowing into a core, a body shape-shifting, a comet scanning, a ring gathering a voice. Recognisable at a glance, in any size, without a word.
- **The AI is always visible.** Wherever the anima works, Sofia shows it. Never hide AI work behind a neutral spinner, and never dress plain logic up as AI.

## Where Sofia appears, across the whole product

| The work | Mode | Examples |
|---|---|---|
| Plain logic, no agent (heavy backend calls, imports, recalculations) | `basic` | Saving a large table, running a report, syncing an account |
| An agent recalling, through memory or connectors | `retrieving` | Reading the help center, pulling records from a CRM, loading a conversation's history |
| An agent creating | `generating` | Drafting a reply, building an agent, writing a summary |
| An agent searching, through the web or connected tools | `searching` | Searching connectors, scanning documents, looking up an order |
| A voice agent waiting, hearing, speaking | `idle` · `listening` · `talking` | A voice conversation (see Conversation bar) |

- **Every surface, every size.** Inline in a button (`sm`), in a chat line (`sm`), in a panel (`lg`), over a region (`Loading overlay`), on an empty state (`xl`).
- **One rule for agents and people.** If an agent builds the screen, it picks the mode the same way: by the work being done.

## Thinking modes

1. **Basic.** Plain logic with no agent involved: three droplets orbit and merge, calm and steady. Follows the brand or text color.
2. **Retrieving.** An agent recalling from memory: particles stream in from the edges and are absorbed by the core.
3. **Generating.** An agent creating: a liquid outline keeps pouring from one shape into the next (heart, drop, egg, peanut, clover, pills) and into minimal figures made of strokes (dashed ring, arcs, plus, equals, a wave), thinking in forms.
4. **Searching.** An agent looking things up: a comet with a fading trail scans a wobbling orbit.
5. **Idle, listening, talking.** A voice agent: a calm core when waiting (on small orbs, 16 to 24px, the Vita mark: a thin liquid ring with a drop at its heart, so Sofia stays recognisable), a ring that gathers the person's voice, a body that swells and ripples as the agent speaks. Pass `level` to follow real sound.

## Rules

1. **Agentic modes wear the AI spectrum** (they are AI provenance); basic uses `tone="brand"` or `current`.
2. **Skeletons first** when the layout is known, no orb over a blank card.
3. **Delay 300ms** so fast responses never flash a loader.
4. **Name the work.** `label="Searching the help center"` is announced to screen readers.
5. **Sizes:** `md` 24 is the smallest Sofia that reads as Sofia beside text (provenance lines, headers); `sm` 16 only inside buttons and dense rows · · `md` 24 · `lg` 48 regions · `xl` 96 empty regions · `2xl` 160 hero moments · `3xl` 280 the epicenter of a landing page (one per page).
6. **Reduced motion** shows a still frame with a gentle pulse.

## Performance

> [!NOTE] Loading never costs the user's machine. The orb picks the cheapest way to draw the same liquid and steps down on its own.

1. **One loop for every orb.** All orbs on a page share one animation frame; off-screen orbs and hidden tabs draw nothing.
2. **Three renderers, one liquid.** The *filter* renderer melts crisp drops through an SVG filter chain (blur, threshold, light, glow). The *GPU* renderer evaluates the same chain per pixel in one shader, at full resolution. The *field* renderer sums the drops on a small grid and upscales it, as a last resort.
3. **Touch starts on the GPU.** Phones, tablets, Save-Data and devices with four cores or less draw with the shader from the first frame: the same look as desktop, without re-rasterising a filter on the CPU. Without WebGL2 they use the field.
4. **Desktops step down by themselves.** The filter renderer watches its own frames; when they keep arriving late (under about 36 fps for a second), every orb switches to the GPU renderer for the rest of the session.
5. **No more frames than the eye sees.** The filter renderer draws at most 60 times a second (120 Hz displays doubled its cost for nothing visible) and at 1.5× resolution on orbs of 48px and up, where its blur hides the pixels. The field draws every display frame; it can afford to.
6. **Never choose a renderer.** `data-renderer` on the canvas says which one is drawing, for tests and profiling. Products don't pick.
