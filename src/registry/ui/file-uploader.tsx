import * as React from "react"
import { Close, CheckmarkFilled, WarningFilled, Upload } from "@/registry/icons"
import { cn } from "@/registry/lib/utils"
import { Icon } from "@/registry/ui/icon"
import { Button } from "@/registry/ui/button"
import { Label } from "@/registry/ui/form"
import { useExit } from "@/registry/hooks/use-exit"

/**
 * FileUploader — attach files. Two entry points, one list:
 *   button   → compact, in forms
 *   dropzone → primary task is uploading (imports, document collection)
 * Always state accepted types and max size up front; validate per file and explain the fix.
 */
export interface UploadFile {
  id: string
  name: string
  status: "uploading" | "complete" | "error"
  error?: string
}

export function FileUploader({ label, description, accept, multiple = true, maxSizeMb, variant = "dropzone", files, onFilesAdded, onRemove, disabled, className }: {
  label: string
  description?: string
  accept?: string
  multiple?: boolean
  maxSizeMb?: number
  variant?: "button" | "dropzone"
  files: UploadFile[]
  onFilesAdded: (files: File[]) => void
  onRemove: (id: string) => void
  disabled?: boolean
  className?: string
}) {
  const inputRef = React.useRef<HTMLInputElement>(null)
  const [over, setOver] = React.useState(false)
  const id = React.useId()
  const hint = description ?? [accept && `Accepted: ${accept.replaceAll(",", ", ")}`, maxSizeMb && `Max ${maxSizeMb} MB per file`].filter(Boolean).join(" · ")
  const pick = () => inputRef.current?.click()
  return (
    <div className={cn("flex w-full max-w-xl flex-col gap-3", className)}>
      <div className="flex flex-col gap-1">
        <Label htmlFor={id} className="text-headline">{label}</Label>
        {hint && <p className="text-footnote text-helper">{hint}</p>}
      </div>
      <input ref={inputRef} id={id} type="file" className="sr-only" accept={accept} multiple={multiple} disabled={disabled} onChange={(e) => { onFilesAdded(Array.from(e.target.files ?? [])); e.target.value = "" }} />
      {variant === "button" ? (
        <Button variant="tertiary" size="md" icon={Upload} onClick={pick} disabled={disabled} className="w-fit">
          Add file{multiple ? "s" : ""}
        </Button>
      ) : (
        <button
          type="button"
          disabled={disabled}
          onClick={pick}
          onDragOver={(e) => { e.preventDefault(); setOver(true) }}
          onDragLeave={() => setOver(false)}
          onDrop={(e) => { e.preventDefault(); setOver(false); onFilesAdded(Array.from(e.dataTransfer.files)) }}
          className={cn(
            "flex min-h-24 w-full flex-col items-center justify-center gap-1 rounded-lg border border-dashed border-border-strong p-6 text-body text-muted-foreground",
            " duration-fast-02 ease-productive hover:bg-hover focus-ring disabled:pointer-events-none disabled:text-disabled-foreground",
            over && "border-primary bg-selected",
          )}
        >
          <Icon as={Upload} size="md" className="text-primary" />
          <span><span className="text-link">Browse files</span> or drag and drop here</span>
        </button>
      )}
      {files.length > 0 && (
        <ul className="flex flex-col gap-2">
          {files.map((f) => (
            <FileRow key={f.id} file={f} onRemove={onRemove} />
          ))}
        </ul>
      )}
    </div>
  )
}

function FileRow({ file: f, onRemove }: { file: UploadFile; onRemove: (id: string) => void }) {
  const [leaving, exit] = useExit()
  return (
            <li className={cn("flex flex-col rounded-md bg-layer-1", leaving ? "animate-exit-scale" : "animate-enter-slide-up", f.status === "error" && "outline outline-error")}>
              <div className="flex h-control-md items-center gap-2 pr-1 pl-4">
                <span className="min-w-0 flex-1 truncate text-body">{f.name}</span>
                {f.status === "uploading" && <span role="status" aria-label="Uploading" className="size-4 animate-spin rounded-full border-2 border-primary border-r-transparent" />}
                {f.status === "complete" && <Icon as={CheckmarkFilled} className="text-success" label="Uploaded" />}
                {f.status === "error" && <Icon as={WarningFilled} className="text-error" label="Upload failed" />}
                {f.status !== "uploading" && (
                  <button type="button" aria-label={`Remove ${f.name}`} onClick={() => exit(() => onRemove(f.id))} className="flex size-control-sm items-center justify-center rounded-sm text-muted-foreground hover:bg-hover hover:text-foreground focus-ring">
                    <Icon as={Close} />
                  </button>
                )}
              </div>
              {f.error && <p className="border-t border-border-subtle px-4 py-2 text-caption text-error-foreground">{f.error}</p>}
            </li>
  )
}
