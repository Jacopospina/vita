---
title: Helper text
summary: One small, muted line that says how to use what it sits under. Use it wherever a hint is needed; fields use it too, so every hint in Vita looks the same.
status: stable
import: "import { HelperText } from \"@/components/vita/helper-text\"\n\n<HelperText>Visible to everyone in the workspace</HelperText>"
use_when:
  - A one-line hint or requirement, anywhere it's needed
  - A field's hint (fields set it for you through helperText)
avoid_when:
  - A field's error or warning → the field's invalidText / warnText
  - Something that needs attention → Callout
  - A paragraph of explanation → Text
related: [text-input, form, code-snippet, notification]
---

## Rules

- **One line, under what it describes.** It sits 6px below, on the same left edge, and never above or beside.
- **Says how, not what.** "Visible to everyone in the workspace", "Needs React 19 and Tailwind CSS v4": the thing the reader would otherwise get wrong.
- **One shared line.** A field's `helperText` renders this exact style, so a hint under a command and a hint under a field never drift apart.
- **Not a warning.** Errors and warnings belong to the field (invalidText, warnText); anything urgent is a Callout.

## Accessibility

- **Tie it to its control.** Give it an `id` and point the control's `aria-describedby` at it; fields do this themselves.
- **Contrast holds.** The helper colour keeps AA contrast on every surface, light and dark.

## Example

```tsx
<HelperText>Visible to everyone in the workspace</HelperText>
```
