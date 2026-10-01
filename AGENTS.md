# Working on Corpus (the design system itself)

**Positioning:** Corpus is the AI-agent-first design system, born for humans and machines making together. Every change must keep it documented and enforced well enough that an agent makes designer-quality decisions on its own.

Corpus is consumed by humans and AI agents in product repos, so every change must keep the system **coherent, documented and enforceable**.

## When you add or change a component

1. **Source:** `src/registry/ui/<name>.tsx`.
   - Use tokens only.
   - Wrap Radix primitives, and never expose them.
   - Icons come from `@/registry/icons`.
   - Put a header comment stating what it's for and what to use instead.
2. **Docs:** `docs/components/<slug>.md` with frontmatter: `title`, `summary`, `status`, `import`, `use_when`, `avoid_when`, `related`. The body holds variants, opinions, accessibility and an example.
3. **Decision guide:** update `docs/components/choosing-components.md` if the component changes any choice.
4. **Demos:** add every variant and state to `src/playground/demos/*.tsx`. The first demo is the hero preview.
5. **Manifest:** `src/playground/manifest.ts`. Map the sources in `src/playground/sources.ts` if the slug ≠ the filename.
6. **Choreography check:** expressive arrivals (notifications, dialogs, field messages) obey *Motion → Gravity*. Nothing may mount, unmount or swap on a state change without a transition (see *Motion → State changes never snap*): `forceMount` + data-state for indicators, `SwapIcon` for glyphs, `useExit`/`FieldMessage` for leaving content, `reveal` for expand/collapse.
7. Run `pnpm llms` (regenerates `docs/index.json` and `llms.txt`), then `pnpm check`.
8. For visual changes, run `pnpm visual`: every page in real Chrome — no phantom scroll, nothing gliding after load, axe (WCAG A/AA) clean, and a screenshot diff against your local baseline (`--update` accepts).

## Writing docs (card-first — pages must be scannable in seconds)

The docs renderer turns markdown into Corpus components. Write for it:

- **Every rule is a card.** Use a list whose items start with `**Title.** one sentence.` Numbered lists become numbered cards.
- **Alerts instead of paragraphs.** Use `> [!NOTE]`, `> [!TIP]`, `> [!IMPORTANT]`, `> [!WARNING]` or `> [!CAUTION]` for the one thing to remember. At most 2 per page.
- **No paragraph longer than 2 sentences.** If it's longer, it's a list of cards.
- **Comparisons are tables.** Tables become structured lists.
- **Negative lists** under a heading containing "Don't", "Never" or "Avoid" render as red ✕ cards.

## Rules

- **Decisions are written down.** Before changing anything a record in `docs/decisions/` covers, read it. Changing a decided thing means superseding the record (`docs/decisions/how-we-decide.md`) in the same commit — never a silent reversal.

- **Disclosure chevrons point down when closed and up when open.** Any chevron that reveals content below it (accordion, dropdown, section, expandable row, tree node) follows this rule, and it rotates with a transition. Chevrons pointing sideways only mean "go to" or "open to the side" (navigation rows, submenus, pagination).
- **Docs never name external design systems or vendors.** Corpus speaks in its own voice.
- **Corpus's own voice is the Creator** (`docs/getting-started/brand.md`): docs, the showcase, onboarding and release notes speak to the maker and aim to awaken the creator in them; the primary slogan is "Give your ideas a body." Product microcopy inside Vita demos stays plain (content rules).
- **Example product in demos and docs is "Vita".** No real company or client names.
- **The playground is product code.** It must pass `pnpm audit:ds` with zero violations (dogfooding).
- **Tokens:** new semantic tokens go in `src/styles/tokens.css` (light + dark), are mapped in `src/styles/corpus.css`, and are documented in `docs/foundations/color.md` (or the relevant foundation). Never add knobs lightly: the promise is "about 10 variables".
- **Breaking changes** (renamed props, removed variants) need a note in the component doc and in the commit message.
- Node 24 (`.nvmrc`), pnpm.
