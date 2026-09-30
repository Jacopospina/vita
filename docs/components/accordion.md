---
title: Accordion
summary: A vertical stack of headers that each reveal a section. Progressive disclosure for content users scan by title.
status: stable
import: "import { Accordion, AccordionItem, AccordionTrigger, AccordionContent, Disclosure } from \"@/components/corpus/accordion\""
use_when:
  - FAQs, help content, long settings grouped by topic
  - Filter panels with many facets
  - Mobile layouts where sections would otherwise make the page very long
avoid_when:
  - One section → Disclosure or ExpandableTile
  - Content most users need → show it
  - Peer views of an object → Tabs
  - Sequential steps → ProgressIndicator
related: [disclosures, tabs, tile]
---

## Variants

- **align end** (default): the chevron is on the right. Best for content and FAQs.
- **align start**: the chevron leads. Best for nested settings and filters.
- **Sizes:** `sm` / `md` / `lg`.
- **Type:**
  - `single collapsible` when sections are alternatives.
  - `multiple` when users compare sections.

## Corpus opinions

1. **Headers are specific:** "How long is a quote valid?" beats "Validity".
2. **Never nest accordions.**
3. **Open the first or the most relevant item by default** when the user arrives with a goal.
4. **The motion is a height expand at `moderate-02`** and the chevron rotates. Reduced motion shows the content instantly.
5. **Content width** is capped at `max-w-prose` for readability.
