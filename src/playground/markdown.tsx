import * as React from "react"
import { marked } from "marked"
import { cn } from "@/registry/lib/utils"

marked.setOptions({ gfm: true })

/** Renders Corpus docs markdown with system typography (see prose.css — tokens only). */
export function Markdown({ source, className }: { source: string; className?: string }) {
  const html = React.useMemo(() => marked.parse(source, { async: false }) as string, [source])
  return <div className={cn("corpus-prose", className)} dangerouslySetInnerHTML={{ __html: html }} />
}
