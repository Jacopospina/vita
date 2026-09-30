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

The story is required, and it is what makes a capsule a capsule:
- `{ progress: n }` → a ring with a rolling number that turns success at 100.
- `{ status: kind }` → the kind's icon, drawn in.
- Any node, e.g. a `Thinking` orb.

## Rules

1. **Only one capsule at any time.** A new request waits: the current capsule rewinds out, then the newest one enters. Never two on screen.
2. **Update, don't stack.** Use `capsule.update(id, …)`, so progress morphs in place and never re-enters.
3. **Short:** 3s by default. `duration: 0` keeps it until you update it with a duration.
4. **Same material as notifications:** frosted `glass`, following the theme.

## Choreography

1. **Fall:** the icon-only pill drops from outside the viewport with gravity and fades in, reaching its lowest point just below rest. Only the icon is visible.
2. **Bounce back and expand:** from that lowest point it springs back to rest, and during exactly that bounce it widens to reveal the title and the story.
3. **Exit:** the same film rewound. It narrows back to the icon, then slides up out of the viewport and fades.
5. **Mount `<Toaster />` once.** It hosts both banners and capsules.
