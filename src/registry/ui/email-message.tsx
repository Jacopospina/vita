import * as React from "react"
import { Close } from "@/registry/icons"
import { cn } from "@/registry/lib/utils"
import { Avatar } from "@/registry/ui/avatar"
import { Thinking } from "@/registry/ui/thinking"
import { Button, IconButton } from "@/registry/ui/button"

/**
 * EmailMessage: one email, read or reviewed in place. Subject and time, the sender (avatar, name, address), the
 * recipients, then the message. When an agent wrote it, a provenance header says so ("Drafted by …", in the AI
 * spectrum) and carries the actions that decide its fate (edit, send).
 *
 *   <EmailMessage subject="Your quote" from={{ name: "Indie Novak", email: "indie@theo.ai" }} to={["ops@client.com"]}
 *     time="Now" draftedBy="Support triage" actions={<Button size="sm">Send</Button>}>…</EmailMessage>
 *
 * Recipients can be edited (`editableRecipients`): Cc and Bcc appear only when added, each with its own way out.
 * Not for: a chat turn → ChatBubble; composing from scratch → a Form with a TextArea or Composer.
 */
export interface EmailParty {
  name: string
  email: string
  avatar?: string
}

export interface EmailMessageProps {
  subject: React.ReactNode
  from: EmailParty
  to: string[]
  cc?: string[]
  bcc?: string[]
  /** When it was sent or drafted ("Now", "09:41", "Yesterday"). */
  time: React.ReactNode
  /** The agent that drafted it: shows the provenance header. */
  draftedBy?: string
  /** Actions in the header (e.g. Edit, Send). Shown with or without the provenance line. */
  actions?: React.ReactNode
  /** Let people add and remove Cc and Bcc (and edit them). Pair with onCcChange / onBccChange. */
  editableRecipients?: boolean
  onCcChange?: (cc: string[]) => void
  onBccChange?: (bcc: string[]) => void
  children: React.ReactNode
  className?: string
}

const list = (v: string) => v.split(/[,;\s]+/).map((x) => x.trim()).filter(Boolean)

/** One recipients line ("Cc: …"). Editable lines are a field; removing one folds it away before it goes. */
function RecipientLine({ label, value, editable, onChange, onRemove, focusSignal = 0 }: {
  label: string
  value: string[]
  editable?: boolean
  onChange?: (v: string[]) => void
  onRemove?: () => void
  /** Changes when the line is added: the field takes focus. */
  focusSignal?: number
}) {
  const [draft, setDraft] = React.useState(value.join(", "))
  const input = React.useRef<HTMLInputElement>(null)
  React.useEffect(() => {
    if (focusSignal) input.current?.focus({ preventScroll: true })
  }, [focusSignal])
  return (
    <div className="group/line flex min-h-5 items-center gap-1 text-body">
      <span className="shrink-0 text-foreground">{label}:</span>
      {editable ? (
        <input
          ref={input}
          aria-label={`${label} recipients`}
          value={draft}
          placeholder="name@company.com"
          onChange={(e) => setDraft(e.target.value)}
          onBlur={() => onChange?.(list(draft))}
          className="min-w-0 flex-1 rounded-sm bg-transparent text-muted-foreground outline-none placeholder:text-placeholder focus-visible:text-foreground focus-ring"
        />
      ) : (
        <span className="min-w-0 truncate text-muted-foreground">{value.join(", ")}</span>
      )}
      {onRemove && <IconButton icon={Close} label={`Remove ${label}`} size="sm" onClick={onRemove} className="size-6 opacity-0 group-hover/line:opacity-100 group-focus-within/line:opacity-100 pointer-coarse:opacity-100" />}
    </div>
  )
}

export function EmailMessage({ subject, from, to, cc, bcc, time, draftedBy, actions, editableRecipients, onCcChange, onBccChange, children, className }: EmailMessageProps) {
  // Cc and Bcc lines show only when they have recipients or were just added: adding unfolds the line and focuses
  // its field; removing folds it away (it stays mounted, so the fold animates instead of snapping).
  const [showCc, setShowCc] = React.useState(!!cc?.length)
  const [showBcc, setShowBcc] = React.useState(!!bcc?.length)
  const [focusCc, setFocusCc] = React.useState(0)
  const [focusBcc, setFocusBcc] = React.useState(0)
  const add = (which: "cc" | "bcc") => {
    if (which === "cc") { setShowCc(true); setFocusCc((n) => n + 1) }
    else { setShowBcc(true); setFocusBcc((n) => n + 1) }
  }
  const remove = (which: "cc" | "bcc") => {
    if (which === "cc") { setShowCc(false); onCcChange?.([]) }
    else { setShowBcc(false); onBccChange?.([]) }
  }
  return (
    <article className={cn("flex flex-col gap-3 scope-lg border border-border-subtle bg-raised p-3", className)} aria-label={typeof subject === "string" ? subject : "Email"}>
      {(draftedBy || actions) && (
        <>
          <header className="flex min-h-7 items-center gap-2">
            {draftedBy && (
              <span className="flex min-w-0 flex-1 items-center gap-1.5">
                <Thinking mode="idle" size="sm" label="AI" />
                <span className="truncate text-footnote font-medium text-ai">Drafted by {draftedBy}</span>
              </span>
            )}
            {actions && <div className={cn("flex shrink-0 items-center gap-1", !draftedBy && "ml-auto")}>{actions}</div>}
          </header>
          <hr className="border-divider" />
        </>
      )}

      <div className="flex items-start gap-3">
        <div className="flex min-w-0 flex-1 flex-col gap-3">
          <h3 className="text-body font-medium text-foreground">{subject}</h3>
          <div className="flex items-start gap-3">
            <Avatar name={from.name} src={from.avatar} size="md" />
            <div className="flex min-w-0 flex-1 flex-col gap-1">
              <p className="truncate text-body">
                <span className="font-medium text-foreground">{from.name}</span> <span className="text-muted-foreground">{from.email}</span>
              </p>
              <div className="flex items-center gap-1">
                <div className="min-w-0 flex-1"><RecipientLine label="To" value={to} /></div>
                {/* Add Cc / Bcc: only the ones not already there. */}
                {editableRecipients && (
                  <div className="flex shrink-0 items-center gap-0.5">
                    <div className={cn("reveal-x motion-productive", !showCc && "reveal-x-open")}><div><Button variant="ghost" size="sm" className="h-6 px-1.5 text-muted-foreground" tabIndex={showCc ? -1 : 0} onClick={() => add("cc")}>Cc</Button></div></div>
                    <div className={cn("reveal-x motion-productive", !showBcc && "reveal-x-open")}><div><Button variant="ghost" size="sm" className="h-6 px-1.5 text-muted-foreground" tabIndex={showBcc ? -1 : 0} onClick={() => add("bcc")}>Bcc</Button></div></div>
                  </div>
                )}
              </div>
              <div className={cn("reveal motion-productive", showCc && "reveal-open")} inert={!showCc || undefined}>
                <div><RecipientLine label="Cc" value={cc ?? []} editable={editableRecipients} focusSignal={focusCc} onChange={onCcChange} onRemove={editableRecipients ? () => remove("cc") : undefined} /></div>
              </div>
              <div className={cn("reveal motion-productive", showBcc && "reveal-open")} inert={!showBcc || undefined}>
                <div><RecipientLine label="Bcc" value={bcc ?? []} editable={editableRecipients} focusSignal={focusBcc} onChange={onBccChange} onRemove={editableRecipients ? () => remove("bcc") : undefined} /></div>
              </div>
            </div>
          </div>
        </div>
        <span className="shrink-0 text-caption text-muted-foreground">{time}</span>
      </div>

      <hr className="border-divider" />
      <div className="text-body text-foreground">{children}</div>
    </article>
  )
}
