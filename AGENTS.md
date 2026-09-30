# Working on Corpus (the design system itself)

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
6. Run `pnpm llms` (regenerates `docs/index.json` and `llms.txt`), then `pnpm check`.

## Rules

- **Docs never name external design systems or vendors.** Corpus speaks in its own voice.
- **Example product in demos and docs is "Vita".** No real company or client names.
- **The playground is product code.** It must pass `pnpm audit:ds` with zero violations (dogfooding).
- **Tokens:** new semantic tokens go in `src/styles/tokens.css` (light + dark), are mapped in `src/styles/corpus.css`, and are documented in `docs/foundations/color.md` (or the relevant foundation). Never add knobs lightly: the promise is "about 10 variables".
- **Breaking changes** (renamed props, removed variants) need a note in the component doc and in the commit message.
- Node 24 (`.nvmrc`), pnpm.
