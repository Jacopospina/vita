import * as React from "react"
import { cn } from "@/registry/lib/utils"

/**
 * HelperText, the one line under something that says how to use it: a field's hint, a requirement under a command.
 * Small, muted, 6px below what it describes, aligned to its left edge. Every helper line in Vita is this component,
 * so a field's hint and a hint under a code block always match.
 * Use instead: errors and warnings on a field → the field's invalidText / warnText (FieldMessage); a note that needs
 * attention → Callout; a paragraph of explanation → Text.
 */

/** The helper line's type and colour, shared with FieldMessage so a field's hint is this exact line. */
export const helperTextClass = "text-caption text-helper"

export function HelperText({ className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
  return <p className={cn("max-w-prose pt-1.5", helperTextClass, className)} {...props} />
}
