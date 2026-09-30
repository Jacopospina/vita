import * as React from "react"
import { Label as LabelPrimitive } from "radix-ui"
import { WarningFilled, WarningAltFilled } from "@/registry/icons"
import { cn } from "@/registry/lib/utils"
import { SwapIcon } from "@/registry/ui/icon"
import { animateChildren } from "@/registry/ui/animated"
import { Group } from "@/registry/ui/layout"

/* ------------------------------------------------------------------ */
/* Shared field styling. Every text-like control uses these classes.   */
/* ------------------------------------------------------------------ */
export const fieldClasses = cn(
  "w-full min-w-0 rounded-md border border-border-field bg-field text-body text-foreground",
  " duration-fast-02 ease-productive",
  "placeholder:text-placeholder",
  "hover:border-border-strong",
  "focus-visible:outline-2 focus-visible:outline-offset-0 focus-visible:outline-focus focus-visible:border-transparent focus-visible:animate-focus-in",
  "disabled:cursor-not-allowed disabled:border-border-subtle disabled:bg-layer-1 disabled:text-disabled-foreground",
  "read-only:border-border-subtle read-only:bg-transparent read-only:hover:border-border-subtle",
  "aria-invalid:border-error aria-invalid:focus-visible:outline-error",
)

export const fieldSize = {
  sm: "h-control-sm px-inset",
  md: "h-control-md px-inset",
  lg: "h-control-lg px-inset-lg",
} as const
export type FieldSize = keyof typeof fieldSize

/* ------------------------------------------------------------------ */

export function Label({ className, ...props }: React.ComponentProps<typeof LabelPrimitive.Root>) {
  return <LabelPrimitive.Root className={cn("text-footnote font-medium text-foreground select-none", className)} {...props} />
}

export interface FieldBaseProps {
  label: React.ReactNode
  /** Visually hide the label (still announced). Only when context makes it obvious, e.g. a search in a toolbar. */
  hideLabel?: boolean
  helperText?: React.ReactNode
  invalid?: boolean
  invalidText?: React.ReactNode
  warn?: boolean
  warnText?: React.ReactNode
  /** Corpus marks OPTIONAL fields, not required ones. Most fields in a good form are required. */
  optional?: boolean
  /** Slot rendered next to the label, e.g. a Toggletip. */
  labelAddon?: React.ReactNode
}

/* ------------------------------------------------------------------ */
/* FieldMessage — helper / warning / error text that ENTERS and EXITS. */
/* ------------------------------------------------------------------ */
type MessageKind = "help" | "warn" | "error"
interface Message { kind: MessageKind; text: React.ReactNode }

/** Keeps the last message around while it plays its exit, then lets it go. */
function useLinger(msg: Message | null, ms = 280) {
  const [shown, setShown] = React.useState<Message | null>(msg)
  const [leaving, setLeaving] = React.useState(false)
  if (msg && (msg.kind !== shown?.kind || msg.text !== shown?.text)) {
    setShown(msg)
    setLeaving(false)
  } else if (!msg && shown && !leaving) {
    setLeaving(true)
  }
  React.useEffect(() => {
    if (!leaving) return
    const t = window.setTimeout(() => {
      setShown(null)
      setLeaving(false)
    }, ms)
    return () => window.clearTimeout(t)
  }, [leaving, ms])
  return [shown, leaving] as const
}

/**
 * FieldMessage — the one place validation text lives. When an error or warning is resolved,
 * its text and icon collapse, blur and fade out; switching kinds cross-fades. Nothing vanishes.
 */
export function FieldMessage({ id, kind, children, className }: { id?: string; kind: MessageKind; children?: React.ReactNode; className?: string }) {
  const [shown, leaving] = useLinger(children ? { kind, text: children } : null)
  const open = !!shown && !leaving
  const k = shown?.kind ?? kind
  return (
    <div className={cn("reveal motion-productive", open && "reveal-open", className)} aria-live={k === "error" ? "assertive" : "polite"}>
      <div>
        <p
          id={id}
          className={cn(
            "flex items-start gap-1 pt-1.5 text-caption motion-expressive",
            k === "error" ? "text-error-foreground" : k === "warn" ? "text-warning-foreground" : "text-helper",
            open ? "translate-y-0 opacity-100 blur-none" : "-translate-y-1 opacity-0 blur-xs",
          )}
        >
          <span className={cn("inline-flex shrink-0 overflow-hidden motion-expressive", k === "help" ? "max-w-0 scale-50 opacity-0" : "max-w-4 scale-100 opacity-100")}>
            <SwapIcon as={k === "warn" ? WarningAltFilled : WarningFilled} size="sm" className="mt-px" />
          </span>
          <span>{animateChildren(shown?.text)}</span>
        </p>
      </div>
    </div>
  )
}

export interface FieldShellProps extends FieldBaseProps {
  id?: string
  className?: string
  children: (a11y: { id: string; "aria-describedby"?: string; "aria-invalid"?: true }) => React.ReactNode
}

/** FieldShell — label → control → helper/validation. Wires ids & aria automatically. */
export function FieldShell({ id: idProp, label, hideLabel, helperText, invalid, invalidText, warn, warnText, optional, labelAddon, className, children }: FieldShellProps) {
  const auto = React.useId()
  const id = idProp ?? auto
  const msgId = `${id}-msg`
  const showInvalid = invalid && invalidText
  const showWarn = !invalid && warn && warnText
  const message = showInvalid ? invalidText : showWarn ? warnText : helperText
  return (
    <div data-field="" data-invalid={invalid || undefined} className={cn("flex min-w-0 flex-col", className)}>
      <div className={cn("flex items-center gap-1 pb-1.5", hideLabel && "sr-only")}>
        <Label htmlFor={id}>
          {label}
          {optional && <span className="font-normal text-muted-foreground"> (optional)</span>}
        </Label>
        {labelAddon}
      </div>
      {children({ id, "aria-describedby": message ? msgId : undefined, "aria-invalid": invalid || undefined })}
      <FieldMessage id={msgId} kind={showInvalid ? "error" : showWarn ? "warn" : "help"}>{message}</FieldMessage>
    </div>
  )
}

/* ------------------------------------------------------------------ */

/** Form — vertical stack with the system's form rhythm (24px between fields). */
export function Form({ className, ...props }: React.FormHTMLAttributes<HTMLFormElement>) {
  return <form noValidate className={cn("flex w-full max-w-xl flex-col gap-6", className)} {...props} />
}

/** FormGroup — a fieldset with a legend for related fields (address, radio group, checkbox group). */
export function FormGroup({ legend, helperText, className, children, ...props }: React.FieldsetHTMLAttributes<HTMLFieldSetElement> & { legend: React.ReactNode; helperText?: React.ReactNode }) {
  return (
    <fieldset className={cn("flex min-w-0 flex-col gap-4", className)} {...props}>
      <legend className="mb-1 text-headline text-foreground">{legend}</legend>
      {helperText && <p className="-mt-3 text-footnote text-helper">{helperText}</p>}
      {children}
    </fieldset>
  )
}

/** FormRow — side-by-side fields that belong together (first/last name, city/postcode). Collapses on small screens. */
export function FormRow({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("grid grid-cols-1 gap-4 sm:auto-cols-fr sm:grid-flow-col", className)} {...props} />
}

/** FormActions — the submit row of a page form. Actions belong together: joined, zero gap. Primary first (reading order). */
export function FormActions({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className="pt-2"><Group className={className} {...props} /></div>
}

/**
 * FluidForm — "fluid" style: fields tile edge-to-edge, labels sit INSIDE the box.
 * Use for dense, expert data-entry (configuration, long admin forms) where scanning many fields matters more than whitespace.
 * Don't mix fluid and default fields in one form.
 */
export function FluidForm({ className, columns = 2, ...props }: React.HTMLAttributes<HTMLDivElement> & { columns?: 1 | 2 | 3 }) {
  return (
    <div
      className={cn(
        "grid w-full gap-px overflow-hidden rounded-lg border border-border-subtle bg-border-subtle",
        columns === 1 ? "grid-cols-1" : columns === 2 ? "grid-cols-1 sm:grid-cols-2" : "grid-cols-1 sm:grid-cols-3",
        // restyle every Corpus field inside
        "[&_[data-field]]:gap-0.5 [&_[data-field]]:bg-field [&_[data-field]]:px-inset [&_[data-field]]:pt-2 [&_[data-field]]:pb-1",
        "[&_[data-field]:focus-within]:outline-2 [&_[data-field]:focus-within]:-outline-offset-2 [&_[data-field]:focus-within]:outline-focus",
        "[&_[data-field][data-invalid]]:outline-2 [&_[data-field][data-invalid]]:-outline-offset-2 [&_[data-field][data-invalid]]:outline-error",
        "[&_[data-field]_label]:text-caption [&_[data-field]_label]:text-muted-foreground",
        "[&_[data-field]_:is(input,select,textarea,button[aria-haspopup],button[role=combobox])]:h-control-sm [&_[data-field]_:is(input,select,textarea,button[aria-haspopup],button[role=combobox])]:rounded-none [&_[data-field]_:is(input,select,textarea,button[aria-haspopup],button[role=combobox])]:border-0 [&_[data-field]_:is(input,select,textarea,button[aria-haspopup],button[role=combobox])]:bg-transparent [&_[data-field]_:is(input,select,textarea,button[aria-haspopup],button[role=combobox])]:px-0 [&_[data-field]_:is(input,select,textarea,button[aria-haspopup],button[role=combobox])]:outline-none",
        className,
      )}
      {...props}
    />
  )
}
