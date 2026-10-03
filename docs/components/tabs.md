---
title: Tabs
summary: Switch between peer views of the same context, Overview · Activity · Settings.
status: stable
import: "import { Tabs, TabsList, TabsTrigger, TabsContent } from \"@/components/vita/tabs\""
use_when:
  - pill (default), page-level views of one object; a raised pill slides between tabs
  - line, dense toolbars or where a track would be too heavy
  - contained, tabs attached to a panel/tile (secondary level)
avoid_when:
  - Same data in different presentations → ContentSwitcher
  - The same content at a different size or scale → StepSlider (tabs mean different content in each)
  - Steps the user must complete in order → ProgressIndicator
  - Navigation between different objects/areas → Side nav
  - Content users need to compare side by side → show both
  - A single tab → no tabs
related: [content-switcher, progress-indicator, page-header]
---

## Variants

- **Pill (default).** A segmented track with a raised pill that slides between tabs on a spring. Use it almost everywhere.
- **Line.** An underline that glides; for dense toolbars or when a track would compete with content.
- **Contained.** Tabs attached to the top of a panel or tile.

> [!NOTE] Tabs and Content switcher now look alike on purpose. The difference is meaning: tabs switch *different content*, the switcher changes *how the same content is shown*.

## Rules

1. **2–6 tabs.** Labels are 1–2 word nouns, in sentence case, without icons. Don't use counts unless they're essential ("Comments 3").
2. **The first tab is the most used** (Overview).
3. **Put tab state in the URL** for page-level tabs, so it's shareable and survives a reload.
4. **Don't put forms that span several tabs under one Save.** Each tab saves independently, or use a multi-step form.
5. **Content fades in** (`animate-enter-fade`), with no sliding.
6. **Disabled tabs** are rare. Prefer hiding a tab the user can never use.

## Hold and nudge

- **Swing to browse.** Press and give a gentle swing left or right: each swing moves exactly one step in that direction and shows its content. To keep going, pause briefly and swing again, or swing the other way. It's a gesture, not a distance, so there's no aiming and no effort.
- **Hold and slide on touch.** Hold a tab for a moment, then slide: the tab under the thumb is the one shown, the pill leaning toward the thumb as it goes. Lift to keep it. A tap still selects; a swipe that moves at once scrolls.
- **Click and keyboard unchanged.** A click selects a tab, and arrow keys move between tabs.
- **More tabs than room scroll sideways,** without a scrollbar (the cut edge says there is more); a thumb pans the list.
