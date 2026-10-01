import * as React from "react"
import { Copy, Checkmark, ChevronDown } from "@/registry/icons"
import { cn } from "@/registry/lib/utils"
import { Icon, SwapIcon } from "@/registry/ui/icon"
import { Tooltip } from "@/registry/ui/tooltip"
import { AnimatedText } from "@/registry/ui/animated"

/**
 * CodeSnippet — code or commands users will COPY.
 *   inline     → a token within a sentence (`npm install`)
 *   single     → one command
 *   multi      → blocks; collapses beyond `maxCollapsedLines`
 */
function useCopy() {
  const [copied, setCopied] = React.useState(false)
  const copy = async (text: string) => {
    try { await navigator.clipboard.writeText(text) } catch { /* clipboard blocked: still show feedback */ }
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }
  return { copied, copy }
}

function CopyButton({ text, className }: { text: string; className?: string }) {
  const { copied, copy } = useCopy()
  return (
    <Tooltip content={<AnimatedText>{copied ? "Copied" : "Copy to clipboard"}</AnimatedText>} side="left">
      <button type="button" onClick={() => copy(text)} aria-label="Copy to clipboard" className={cn("relative tap flex size-control-sm shrink-0 items-center justify-center rounded-sm text-muted-foreground hover:bg-hover hover:text-foreground focus-ring", className)}>
        <SwapIcon as={copied ? Checkmark : Copy} className={copied ? "text-success" : undefined} />
      </button>
    </Tooltip>
  )
}

export function CodeSnippet({ type = "single", children, maxCollapsedLines = 12, className, hideCopy }: { type?: "inline" | "single" | "multi"; children: string; maxCollapsedLines?: number; className?: string; hideCopy?: boolean }) {
  const [expanded, setExpanded] = React.useState(false)
  const { copied, copy } = useCopy()
  if (type === "inline") {
    return (
      <Tooltip content={<AnimatedText>{copied ? "Copied" : "Copy"}</AnimatedText>}>
        <button type="button" onClick={() => copy(children)} className={cn("rounded-sm bg-layer-2 px-1 font-mono text-[0.92em] text-foreground hover:bg-layer-3 focus-ring", className)}>
          {children}
        </button>
      </Tooltip>
    )
  }
  const lines = children.split("\n").length
  const collapsible = type === "multi" && lines > maxCollapsedLines
  return (
    <div className={cn("relative flex w-full items-start scope-md bg-layer-1 font-mono text-footnote text-foreground", className)}>
      <pre className={cn("min-w-0 flex-1 overflow-x-auto px-3", type === "single" ? "py-1.5 whitespace-pre" : "py-2.5", collapsible && !expanded && "max-h-72 overflow-y-hidden")}>
        <code>{children}</code>
      </pre>
      {!hideCopy && <CopyButton text={children} className="m-1 rounded-inner-1" />}
      {collapsible && (
        <button type="button" onClick={() => setExpanded((e) => !e)} className="absolute right-2 bottom-2 flex h-control-sm items-center gap-1 rounded-sm bg-layer-1 px-2 font-sans text-footnote text-link hover:bg-hover focus-ring">
          <AnimatedText>{expanded ? "Show less" : "Show more"}</AnimatedText>
          <Icon as={ChevronDown} className={cn(" duration-moderate-01", expanded && "rotate-180")} />
        </button>
      )}
    </div>
  )
}
