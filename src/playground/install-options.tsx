import * as React from "react"
import { Copy, Terminal } from "@/registry/icons"
import { TileSet, TileSetItem } from "@/registry/ui/tile"
import { Text } from "@/registry/ui/text"
import { Button } from "@/registry/ui/button"
import { Tooltip } from "@/registry/ui/tooltip"
import { IconPlaceholder } from "@/registry/ui/icon-placeholder"
import { Thinking } from "@/registry/ui/thinking"
import { Glow } from "@/registry/ui/notification"

/** What a non-coder pastes into their coding agent: install, then onboard through the Vita skills. */
export const AGENT_PROMPT = `Set up the Vita design system in this project, then onboard me.

1. Run \`npx github:Jacopospina/vita init\` and do everything it prints.
2. Use the Vita skills to learn my product: my users (vita-personae), how it should sound (vita-copywriting) and my brand (vita-theming). Ask me one question at a time, in plain words.
3. From then on, act as my product designer: ask what I'm trying to achieve, recommend the best way to do it with Vita, then build it with Vita only.`

/** A labelled button says it itself: "Copied" with a check, then back (copying is instant, so no working state). */
export function CopyButton({ text, label, size = "sm", variant = "primary", reveal }: { text: string; label: string; size?: "sm" | "lg"; variant?: "primary" | "secondary"; reveal?: boolean }) {
  const [copied, setCopied] = React.useState(false)
  const timer = React.useRef(0)
  React.useEffect(() => () => window.clearTimeout(timer.current), [])
  const copy = async () => {
    try { await navigator.clipboard.writeText(text) } catch { /* clipboard blocked: still acknowledge */ }
    setCopied(true)
    window.clearTimeout(timer.current)
    timer.current = window.setTimeout(() => setCopied(false), 1500)
  }
  const button = <Button size={size} variant={variant} icon={Copy} status={copied ? "success" : "idle"} feedback={{ success: "Copied" }} onClick={copy}>{label}</Button>
  // `reveal`: what gets copied shows on hover and focus, for the people who want to read it before they paste.
  return reveal ? <Tooltip content={<code className="font-mono">{text}</code>}>{button}</Tooltip> : button
}

/** One install path: who it's for, what happens, and the one thing to do, pinned to the bottom of the card. */
function Option({ mark, title, who, children, action, glow }: { mark: React.ReactNode; title: string; who: string; children: React.ReactNode; action: React.ReactNode; glow?: boolean }) {
  return (
    <TileSetItem className={glow ? "relative isolate gap-3 overflow-hidden p-5 md:aspect-golden-wide" : "gap-3 p-5 md:aspect-golden-wide"}>
      {glow && <Glow />}
      {mark}
      <div className="flex flex-col gap-1 pt-2">
        <Text variant="headline" as="h3">{title}</Text>
        <Text variant="footnote" tone="muted">{who}</Text>
      </div>
      <Text tone="muted">{children}</Text>
      {/* The action sits at the foot of every card, so the three line up and the eye finds them in one sweep. Only the
          first is primary: it's the way most people should take. */}
      <div className="mt-auto flex flex-col items-start pt-4">{action}</div>
    </TileSetItem>
  )
}

/**
 * The two ways in, side by side as equals: let an agent do it (no code), or run one command (engineers).
 * Wide golden-ratio cards (1.618 : 1) from tablet up; one under the other on a phone.
 */
export function InstallOptions() {
  return (
    <TileSet columns={2}>
      <Option
        glow
        mark={<IconPlaceholder icon={<Thinking mode="idle" size="md" label="" />} size="lg" surface="solid" />}
        title="Let your agent do it"
        who="No code needed"
        action={<CopyButton text={AGENT_PROMPT} label="Copy prompt" size="lg" />}
      >
        Copy one prompt into your coding agent, in your project. It installs Vita, then walks you through your product, your users, your voice and your brand.
      </Option>
      <Option
        mark={<IconPlaceholder icon={Terminal} tone="brand" size="lg" surface="solid" />}
        title="Run one command"
        who="For engineers"
        action={<CopyButton text="npx github:Jacopospina/vita init" label="Copy command" size="lg" variant="secondary" reveal />}
      >
        Everything at once: the components, the look, the guide and your agent's know-how, as code you own and can change. Needs React 19 and Tailwind CSS v4.
      </Option>
    </TileSet>
  )
}
