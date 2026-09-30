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
  // The floating label owns the empty state; placeholders (examples, formats) appear only while focused.
  "placeholder:text-transparent focus:placeholder:text-placeholder",
  "hover:border-border-strong",
  "focus-visible:outline-2 focus-visible:outline-offset-0 focus-visible:outline-focus focus-visible:border-transparent focus-visible:animate-focus-in",
  "disabled:cursor-not-allowed disabled:border-border-subtle disabled:bg-layer-1 disabled:text-disabled-foreground",
  "read-only:border-border-subtle read-only:bg-transparent read-only:hover:border-border-subtle",
  "aria-invalid:border-error aria-invalid:focus-visible:outline-error",
)

/* Fields are tall enough to hold their floating label inside. Values sit below the floated label. */
export const fieldSize = {
  sm: "h-control-md px-inset pt-3.5",
  md: "h-control-lg px-inset pt-4",
  lg: "h-14 px-inset-lg pt-5",
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
  /** Fields are REQUIRED by default. Mark the exceptions deliberately: the label reads "(optional)". */
  optional?: boolean
  /** Extra help control (e.g. a Toggletip), shown at the start of the helper row — never above the field. */
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
  /** The control has a value the input can't express via :placeholder-shown (select, dropdown, multiselect). */
  filled?: boolean
  /** Multi-line control: the label rests at the top instead of the vertical centre. */
  multiline?: boolean
  children: (a11y: { id: string; "aria-describedby"?: string; "aria-invalid"?: true; "aria-required"?: true }) => React.ReactNode
}

/* The label floats (moves up, shrinks) when the field is focused or holds a value. */
/* Straight up + smaller type — no scaling, so it never looks like it tilts. */
const floated = [
  "group-focus-within/field:-translate-y-[calc(50%+0.6rem)] group-focus-within/field:text-caption",
  "group-has-[:is(input,textarea):not(:placeholder-shown)]/field:-translate-y-[calc(50%+0.6rem)] group-has-[:is(input,textarea):not(:placeholder-shown)]/field:text-caption",
  "group-data-[filled]/field:-translate-y-[calc(50%+0.6rem)] group-data-[filled]/field:text-caption",
].join(" ")
const floatedMultiline = [
  "group-focus-within/field:-translate-y-2 group-focus-within/field:text-caption",
  "group-has-[textarea:not(:placeholder-shown)]/field:-translate-y-2 group-has-[textarea:not(:placeholder-shown)]/field:text-caption",
].join(" ")

/**
 * FieldShell — the anatomy of every field: a FLOATING LABEL inside the control → the control → helper/validation.
 * The label rests inside the field like a placeholder; on focus or once filled it glides up and shrinks,
 * still inside the field. Labels are never placed above fields. Fields are required unless marked optional.
 */
export function FieldShell({ id: idProp, label, hideLabel, helperText, invalid, invalidText, warn, warnText, optional, labelAddon, filled, multiline, className, children }: FieldShellProps) {
  const auto = React.useId()
  const id = idProp ?? auto
  const msgId = `${id}-msg`
  const showInvalid = invalid && invalidText
  const showWarn = !invalid && warn && warnText
  const message = showInvalid ? invalidText : showWarn ? warnText : helperText
  return (
    <div data-field="" data-invalid={invalid || undefined} data-filled={filled || undefined} className={cn("group/field flex min-w-0 flex-col", className)}>
      <div className="relative">
        {children({ id, "aria-describedby": message ? msgId : undefined, "aria-invalid": invalid || undefined, "aria-required": optional ? undefined : true })}
        <LabelPrimitive.Root
          htmlFor={id}
          className={cn(
            "pointer-events-none absolute left-inset max-w-[calc(100%-4rem)] truncate text-body text-placeholder select-none motion-productive",
            "group-focus-within/field:text-muted-foreground group-data-[invalid]/field:text-error-foreground",
            multiline ? cn("top-3", floatedMultiline) : cn("top-1/2 -translate-y-1/2", floated),
            hideLabel && "sr-only",
          )}
        >
          {label}
          {optional && <span> (optional)</span>}
        </LabelPrimitive.Root>
      </div>
      {labelAddon || message ? (
        <div className="flex items-start gap-1">
          {labelAddon && <span className="pt-1">{labelAddon}</span>}
          <FieldMessage id={msgId} kind={showInvalid ? "error" : showWarn ? "warn" : "help"} className="min-w-0 flex-1">{message}</FieldMessage>
        </div>
      ) : (
        <FieldMessage id={msgId} kind="help" />
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

/*
 * BLEND — fields that are ONE data point share one container: the parent owns border, radius and
 * background; the fields inside are flat (no border, no radius), labels sit inside, hairlines divide.
 */
const ctl = "[&_[data-field]_:is(input,select,textarea,button[aria-haspopup],button[role=combobox])]"
const blendFields = cn(
  "overflow-hidden rounded-md [&_[data-field]]:bg-field",
  "[&_[data-field]:focus-within]:outline-2 [&_[data-field]:focus-within]:-outline-offset-2 [&_[data-field]:focus-within]:outline-focus [&_[data-field]:focus-within]:animate-focus-in",
  "[&_[data-field][data-invalid]]:outline-2 [&_[data-field][data-invalid]]:-outline-offset-2 [&_[data-field][data-invalid]]:outline-error",
  `${ctl}:rounded-none ${ctl}:border-0 ${ctl}:bg-transparent ${ctl}:outline-none ${ctl}:animate-none`,
  "[&_[data-field]_[aria-live]]:px-inset [&_[data-field]_[aria-live]]:pb-1",
  // Calm inside a blend: no staggered rise, no sliding messages — fades only.
  "*:animate-none! [&_[aria-live]_p]:translate-y-0",
)

/**
 * FormRow — the ONLY way to put fields side by side, and only when they are ONE data point for the user
 * (first + last name, card expiry month + year, street + number). Forms are otherwise one column:
 * people scan forms top-left in an F pattern and miss the second column.
 * The pair blends: one container (border, radius, background), flat fields inside, a hairline between.
 */
export function FormRow({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      role="group"
      className={cn(
        "grid grid-cols-1 gap-px border border-border-field bg-border-field sm:auto-cols-fr sm:grid-flow-col",
        blendFields,
        "*:first:rounded-t-[calc(var(--corpus-radius-md)-1px)] *:last:rounded-b-[calc(var(--corpus-radius-md)-1px)]",
        "sm:*:first:rounded-bl-[calc(var(--corpus-radius-md)-1px)] sm:*:first:rounded-tr-none sm:*:last:rounded-tr-[calc(var(--corpus-radius-md)-1px)] sm:*:last:rounded-bl-none",
        className,
      )}
      {...props}
    />
  )
}

/** FormActions — the submit row of a page form. Actions belong together: joined, zero gap. Primary first (reading order). */
export function FormActions({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className="pt-2"><Group className={className} {...props} /></div>
}

/**
 * FluidForm — dense, expert data entry: every field blends into one tall container, labels inside.
 * Always ONE column (F-pattern rule). Pairs that are one data point go in a FormRow inside it.
 * BREAKING (0.2): the `columns` prop was removed — multi-column forms are not allowed.
 */
export function FluidForm({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "grid w-full grid-cols-1 gap-px border border-border-subtle bg-border-subtle",
        "[&>[role=group]]:rounded-none [&>[role=group]]:border-0",
        blendFields,
        "rounded-lg *:first:rounded-t-[calc(var(--corpus-radius-lg)-1px)] *:last:rounded-b-[calc(var(--corpus-radius-lg)-1px)]",
        className,
      )}
      {...props}
    />
  )
}
