---
title: Progress indicator
summary: The steps of a multi-step task, with where the user is and what's left. Completed steps stay reachable.
status: stable
import: "import { ProgressIndicator } from \"@/components/vita/progress-indicator\""
use_when:
  - Wizards, onboarding, checkout, 3–6 sequential steps the user completes
avoid_when:
  - System progress → ProgressBar
  - Non-sequential sections → Tabs
  - 2 steps → a single page with a clear continue
  - 7+ steps → split the flow or group steps
related: [progress-bar, tabs, forms]
---

## Rules

1. **Step labels are nouns** describing the content ("Purpose", "Knowledge", "Review"), not "Step 1".
2. **Completed steps are clickable** to go back. Future steps are not.
3. **Invalid steps** show a warning icon and a secondary label saying what's missing.
4. **Horizontal** above the form on desktop; **vertical** in narrow side layouts and on mobile.
5. **The last step is always Review,** a summary with edit links, before an irreversible submit.
