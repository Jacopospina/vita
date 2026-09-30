---
title: Capsule
summary: Quick feedback at the top centre. Icon on the left, title over subtitle in the middle, the semantic story on the right.
status: stable
import: "import { capsule } from \"@/components/corpus/notification\"\n\nconst id = capsule({ icon: <Icon as={CloudUpload} size=\"md\" />, title: \"Syncing knowledge\", subtitle: \"Help center\", story: { progress: 40 }, duration: 0 })\ncapsule.update(id, { story: { progress: 100 }, duration: 1800 })"
use_when:
  - Glanceable feedback that something connected, finished or is progressing
  - A live value worth watching for a few seconds (sync progress, a connection)
avoid_when:
  - Anything that needs reading or an action → toast banner
  - Errors the user must fix → InlineNotification next to the cause
  - Long-running work the user should track → ProgressBar in the page
related: [notification, notifications, progress-bar, loading]
---

## Anatomy — always three parts

| Left | Centre | Right |
|---|---|---|
| **Icon:** what this is about | **Title** over **subtitle** | **The story:** progress, status or a live node |

Include the story whenever there is one. It is what the compact capsule shows first:
- `{ progress: n }` → a ring with a rolling number that turns success at 100.
- `{ status: kind }` → the kind's icon, drawn in.
- Any node, e.g. a `Thinking` orb.

## Rules

1. **Only one capsule at any time.** A new request waits: the current capsule rewinds out, then the newest one enters. Never two on screen.
2. **Update, don't stack.** Use `capsule.update(id, …)`, so progress morphs in place and never re-enters.
3. **Short:** 3s by default. `duration: 0` keeps it until you update it with a duration.
4. **Same material as notifications:** frosted `glass`, following the theme.

## Choreography

Capsule motion is **productive**: straight and quick, with no bounce.

1. **Enter, compact:** the capsule slides down from outside the viewport with a fade. It shows only the story (progress ring, status), or only the icon when there is no story.
2. **Read:** it stays compact for about 400ms, long enough to read the story at a glance.
3. **Expand:** it widens. The icon slides in on the left, the title opens, and the story travels to the right. The story stays mounted, so live progress keeps counting.
4. **Exit:** the same film rewound. It narrows back to the icon, then slides up out of the viewport and fades.
5. **Mount `<Toaster />` once.** It hosts both banners and capsules.
