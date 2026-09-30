import * as React from "react"
import { ArrowUp, Attachment, Microphone, MicrophoneFilled, Close } from "@/registry/icons"
import { cn } from "@/registry/lib/utils"
import { Icon } from "@/registry/ui/icon"
import { IconButton } from "@/registry/ui/button"

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
  const [listening, setListening] = React.useState(false)
  const recRef = React.useRef<SpeechRecognitionLike | null>(null)
  const inputRef = React.useRef<HTMLTextAreaElement>(null)
  const fileRef = React.useRef<HTMLInputElement>(null)
  const Speech = typeof window !== "undefined" ? ((window as unknown as { SpeechRecognition?: new () => SpeechRecognitionLike; webkitSpeechRecognition?: new () => SpeechRecognitionLike }).SpeechRecognition ?? (window as unknown as { webkitSpeechRecognition?: new () => SpeechRecognitionLike }).webkitSpeechRecognition) : undefined

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
    <div className={cn("flex w-full flex-col gap-3", className)}>
      <div
        className={cn(
          "flex flex-col scope-xl border border-border-field bg-field shadow-raised duration-fast-02 ease-productive",
          "focus-within:border-transparent focus-within:outline-2 focus-within:outline-focus focus-within:animate-focus-in",
          listening && "border-transparent outline-2 outline-primary",
        )}
      >
        {files.length > 0 && (
          <ul className="flex flex-wrap gap-2 px-4 pt-3">
            {files.map((f, i) => (
              <li key={i} className="inline-flex h-6 items-center gap-1 rounded-full bg-layer-2 pr-0.5 pl-2 text-caption">
                <Icon as={Attachment} size="sm" />
                <span className="max-w-40 truncate">{f.name}</span>
                <button type="button" aria-label={`Remove ${f.name}`} onClick={() => setFiles((x) => x.filter((_, j) => j !== i))} className="flex size-5 items-center justify-center rounded-full hover:bg-hover focus-ring">
                  <Icon as={Close} size="sm" />
                </button>
              </li>
            ))}
          </ul>
        )}
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
            "field-sizing-content max-h-60 min-h-12 w-full resize-none bg-transparent px-4 pt-3 text-foreground outline-none placeholder:text-placeholder",
            size === "lg" ? "text-body-lg" : "text-body",
          )}
        />
        <div className="flex items-center gap-1 px-2 pb-2">
          {attachments && (
            <>
              <input ref={fileRef} type="file" multiple className="sr-only" tabIndex={-1} onChange={(e) => { setFiles((x) => [...x, ...Array.from(e.target.files ?? [])]); e.target.value = "" }} />
              <IconButton icon={Attachment} label="Attach files" size="sm" className="rounded-inner-2" onClick={() => fileRef.current?.click()} />
            </>
          )}
          {voice && Speech && (
            <IconButton icon={listening ? MicrophoneFilled : Microphone} label={listening ? "Stop dictation" : "Dictate"} size="sm" pressed={listening} onClick={toggleVoice} className={cn("rounded-inner-2", listening && "animate-pulse text-primary")} />
          )}
          <span className="flex-1" />
          <IconButton icon={ArrowUp} label="Send" variant="primary" size="sm" loading={loading} disabled={!value.trim() && !files.length} onClick={submit} className="rounded-full" />
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
