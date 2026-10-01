import * as React from "react"
import { ArrowUp, Attachment, Microphone, MicrophoneFilled, Close } from "@/registry/icons"
import { cn } from "@/registry/lib/utils"
import { Icon } from "@/registry/ui/icon"
import { IconButton } from "@/registry/ui/button"
import { useExit } from "@/registry/hooks/use-exit"
import { useFlip } from "@/registry/hooks/use-flip"

/**
 * Composer — INTENT-FIRST INPUT. The user says what they want (type, speak, attach) and the system does the work.
 * Prefer one Composer + an AI-prepared review over a form of many fields.
 *
 *   - Suggestions fill the composer with one click (mouse-only path).
 *   - Voice uses the browser's speech recognition when available.
 *   - Enter sends, Shift+Enter adds a line.
 */
type SpeechRecognitionLike = { continuous: boolean; interimResults: boolean; lang: string; start(): void; stop(): void; onresult: ((e: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void) | null; onend: (() => void) | null }

export interface ComposerProps {
  placeholder?: string
  onSubmit: (value: string, files: File[]) => void
  suggestions?: string[]
  voice?: boolean
  attachments?: boolean
  loading?: boolean
  size?: "md" | "lg"
  className?: string
  label?: string
}

export function Composer({ placeholder = "Describe what you need", onSubmit, suggestions = [], voice = true, attachments = true, loading, size = "md", className, label = "Message" }: ComposerProps) {
  const [value, setValue] = React.useState("")
  const [files, setFiles] = React.useState<File[]>([])
  const chips = React.useRef<HTMLUListElement>(null)
  useFlip(chips)
  const [listening, setListening] = React.useState(false)
  const recRef = React.useRef<SpeechRecognitionLike | null>(null)
  const inputRef = React.useRef<HTMLTextAreaElement>(null)
  const fileRef = React.useRef<HTMLInputElement>(null)
  const Speech = typeof window !== "undefined" ? ((window as unknown as { SpeechRecognition?: new () => SpeechRecognitionLike; webkitSpeechRecognition?: new () => SpeechRecognitionLike }).SpeechRecognition ?? (window as unknown as { webkitSpeechRecognition?: new () => SpeechRecognitionLike }).webkitSpeechRecognition) : undefined

  const canSend = !!value.trim() || files.length > 0 || !!loading
  const submit = () => {
    const v = value.trim()
    if (!v && !files.length) return
    onSubmit(v, files)
    setValue("")
    setFiles([])
  }

  const toggleVoice = () => {
    if (!Speech) return
    if (listening) return recRef.current?.stop()
    const rec = new Speech()
    rec.continuous = true
    rec.interimResults = true
    rec.lang = navigator.language
    const base = value ? value + " " : ""
    rec.onresult = (e) => setValue(base + Array.from(e.results).map((r) => r[0].transcript).join(""))
    rec.onend = () => setListening(false)
    recRef.current = rec
    rec.start()
    setListening(true)
  }

  return (
    <div className={cn("flex w-full flex-col gap-2", className)}>
      <div
        className={cn(
          // Styled exactly like a text input: field border and fill, no resting shadow, same radius, hover and focus.
          "flex flex-col scope-md border border-border-field bg-field duration-moderate-02 ease-productive",
          "hover:border-border-strong hover:bg-layer-1",
          "focus-within:border-transparent focus-within:outline-1 focus-within:outline-(--corpus-ring) focus-within:focus-halo focus-within:animate-focus-in",
          listening && "border-transparent outline-1 outline-primary",
        )}
      >
        {/* Always mounted: the row opens/closes (reveal), chips spring in/out, the rest glide (FLIP). Keyed by file identity. */}
        <div className={cn("reveal motion-expressive", files.length > 0 && "reveal-open")}>
          {/* padding lives one level in, so the closed row collapses to exactly 0 */}
          <div>
            <ul ref={chips} className="flex flex-wrap gap-1.5 px-3 pt-2.5">
              {files.map((f) => (
                <AttachmentChip key={`${f.name}-${f.size}-${f.lastModified}`} file={f} onRemove={() => setFiles((x) => x.filter((y) => y !== f))} />
              ))}
            </ul>
          </div>
        </div>
        <textarea
          ref={inputRef}
          aria-label={label}
          rows={1}
          value={value}
          placeholder={listening ? "Listening…" : placeholder}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
              e.preventDefault()
              submit()
            }
          }}
          className={cn(
            // grows with the text up to 2.5 lines (the half line hints there is more), then scrolls
            "field-sizing-content max-h-[calc(2.5lh+var(--spacing)*2.5)] min-h-10 w-full resize-none overflow-y-auto bg-transparent px-3 pt-2.5 text-foreground outline-none placeholder:text-placeholder",
            size === "lg" ? "text-body-lg" : "text-body",
          )}
        />
        <div className="flex items-center gap-1 px-1.5 pb-1.5">
          {attachments && (
            <>
              <input ref={fileRef} type="file" multiple aria-label="Attach files" className="sr-only" tabIndex={-1} onChange={(e) => { setFiles((x) => [...x, ...Array.from(e.target.files ?? [])]); e.target.value = "" }} />
              <IconButton icon={Attachment} label="Attach files" size="sm" className="rounded-inner-1.5 [corner-shape:round]" onClick={() => fileRef.current?.click()} />
            </>
          )}
          {voice && Speech && (
            <IconButton icon={listening ? MicrophoneFilled : Microphone} label={listening ? "Stop dictation" : "Dictate"} size="sm" pressed={listening} onClick={toggleVoice} className={cn("rounded-inner-1.5 [corner-shape:round]", listening && "animate-pulse text-primary")} />
          )}
          <span className="flex-1" />
          {/* Send exists only when there's something to send — never a disabled button. It slides in from the
              composer's floor (its POSITION moves; nothing is clipped), fading in: expressive in, productive out. */}
          <span className="flex">
            <span
              inert={!canSend || undefined}
              aria-hidden={!canSend || undefined}
              className={cn(
                "flex",
                canSend ? "translate-y-0 opacity-100 duration-moderate-02 ease-spring" : "translate-y-3 opacity-0 duration-moderate-01 ease-productive",
              )}
            >
              <IconButton icon={ArrowUp} label="Send" variant="primary" size="sm" loading={loading} onClick={submit} className="rounded-full [corner-shape:round]" />
            </span>
          </span>
        </div>
      </div>
      {suggestions.length > 0 && (
        <div className="flex flex-wrap gap-2" aria-label="Suggestions">
          {suggestions.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => { setValue(s); inputRef.current?.focus() }}
              className="inline-flex h-control-sm items-center rounded-full border border-border bg-background px-3 text-footnote text-foreground duration-fast-02 hover:bg-hover focus-ring"
            >
              {s}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

function AttachmentChip({ file, onRemove }: { file: File; onRemove: () => void }) {
  const [leaving, exit] = useExit()
  return (
    <li className={cn("inline-flex h-6 origin-left items-center gap-1 rounded-full bg-layer-2 pr-0.5 pl-2 text-caption", leaving ? "animate-exit-scale" : "animate-chip-in")}>
      <Icon as={Attachment} size="sm" draw="in" />
      <span className="max-w-40 truncate">{file.name}</span>
      <button type="button" aria-label={`Remove ${file.name}`} onClick={() => exit(onRemove)} className="flex size-5 items-center justify-center rounded-full hover:bg-hover focus-ring">
        <Icon as={Close} size="sm" />
      </button>
    </li>
  )
}
