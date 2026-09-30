---
title: Tabs
summary: Switch between peer views of the same context — Overview · Activity · Settings.
status: stable
import: "import { Tabs, TabsList, TabsTrigger, TabsContent } from \"@/components/corpus/tabs\""
use_when:
  - line — page-level views of one object, under the PageHeader
  - contained — tabs attached to a panel/tile (secondary level)
avoid_when:
  - Same data in different presentations → ContentSwitcher
  - Steps the user must complete in order → ProgressIndicator
  - Navigation between different objects/areas → Side nav
  - Content users need to compare side by side → show both
  - A single tab → no tabs
related: [content-switcher, progress-indicator, page-header]
---

## Rules

1. **2–6 tabs.** Labels are 1–2 word nouns, in sentence case, without icons. Don't use counts unless they're essential ("Comments 3").
2. **The first tab is the most used** (Overview).
3. **Put tab state in the URL** for page-level tabs, so it's shareable and survives a reload.
4. **Don't put forms that span several tabs under one Save.** Each tab saves independently, or use a multi-step form.
5. **Content fades in** (`animate-enter-fade`), with no sliding.
6. **Disabled tabs** are rare. Prefer hiding a tab the user can never use.
