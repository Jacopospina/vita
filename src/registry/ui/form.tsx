import * as React from "react"
import { Label as LabelPrimitive } from "radix-ui"
import { WarningFilled, WarningAltFilled } from "@/registry/icons"
import { cn } from "@/registry/lib/utils"
import { Icon } from "@/registry/ui/icon"

/* ------------------------------------------------------------------ */
/* Shared field styling. Every text-like control uses these classes.   */
/* ------------------------------------------------------------------ */
export const fieldClasses = cn(
  "w-full min-w-0 rounded-md border border-border-field bg-field text-body text-foreground",
  "transition-[border-color,box-shadow,background-color] duration-fast-02 ease-productive",
  "placeholder:text-placeholder",
  "hover:border-border-strong",
  "focus-visible:outline-2 focus-visible:outline-offset-0 focus-visible:outline-focus focus-visible:border-transparent",
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
    <div data-field="" data-invalid={invalid || undefined} className={cn("flex min-w-0 flex-col gap-1.5", className)}>
      <div className={cn("flex items-center gap-1", hideLabel && "sr-only")}>
        <Label htmlFor={id}>
          {label}
          {optional && <span className="font-normal text-muted-foreground"> (optional)</span>}
        </Label>
        {labelAddon}
      </div>
      {children({ id, "aria-describedby": message ? msgId : undefined, "aria-invalid": invalid || undefined })}
      {message && (
        <p
          id={msgId}
          className={cn(
            "flex items-start gap-1 text-caption",
            showInvalid ? "text-error-foreground" : showWarn ? "text-warning-foreground" : "text-helper",
          )}
        >
          {showInvalid && <Icon as={WarningFilled} size="sm" className="mt-px" />}
          {showWarn && <Icon as={WarningAltFilled} size="sm" className="mt-px" />}
          <span>{message}</span>
        </p>
      )}
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

/** FormActions — the submit row. Primary last. Lives at the end of the form, left-aligned with the fields in page forms. */
export function FormActions({ className, align = "start", ...props }: React.HTMLAttributes<HTMLDivElement> & { align?: "start" | "end" }) {
  return <div className={cn("flex flex-wrap items-center gap-2 pt-2", align === "end" ? "justify-end" : "flex-row-reverse justify-end", className)} {...props} />
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
