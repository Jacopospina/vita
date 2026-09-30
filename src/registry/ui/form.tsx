import * as React from "react"
import { Label as LabelPrimitive } from "radix-ui"
import { WarningFilled, WarningAltFilled } from "@/registry/icons"
import { cn } from "@/registry/lib/utils"
import { Icon } from "@/registry/ui/icon"
import { animateChildren } from "@/registry/ui/animated"
import { Group } from "@/registry/ui/layout"

/* ------------------------------------------------------------------ */
/* Shared field styling. Every text-like control uses these classes.   */
/* ------------------------------------------------------------------ */
export const fieldClasses = cn(
  "w-full min-w-0 rounded-md border border-border-field bg-field text-body text-foreground",
  "duration-moderate-02 ease-productive",
  // The floating label owns the empty state; placeholders (examples, formats) appear only while focused.
  "placeholder:text-transparent focus:placeholder:text-placeholder",
  "hover:border-border-strong hover:bg-layer-1 hover:shadow-raised",
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
    // The slot always reserves one line, so messages appearing or leaving never push the layout.
    <div data-message="" className={cn("min-h-6 pt-1.5", className)} aria-live={k === "error" ? "assertive" : "polite"}>
      {shown && (
        <p
          id={id}
          className={cn(
            "flex items-start gap-1 text-caption motion-expressive",
            k === "error" ? "text-error-foreground" : k === "warn" ? "text-warning-foreground" : "text-helper",
            open ? "translate-y-0 opacity-100 blur-none" : "-translate-y-1 opacity-0 blur-xs",
          )}
        >
          <span className={cn("inline-flex shrink-0 overflow-hidden motion-expressive", k === "help" ? "max-w-0 opacity-0" : "max-w-4 opacity-100")}>
            {k !== "help" && <Icon key={k} as={k === "warn" ? WarningAltFilled : WarningFilled} size="sm" className="mt-px" draw="in" />}
          </span>
          <span className={open ? "animate-enter-fade" : undefined}>{animateChildren(shown.text)}</span>
        </p>
      )}
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

/** Form — vertical stack with the system's form rhythm (message line + 8px between fields). */
export function Form({ className, ...props }: React.FormHTMLAttributes<HTMLFormElement>) {
  // Each field already reserves a line for its message, so the gap between fields is small.
  return <form noValidate className={cn("flex w-full max-w-xl flex-col gap-2", className)} {...props} />
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
 * JOIN — fields that belong together TOUCH, but every field stays exactly the Corpus field
 * (its own border, radius, hover, focus, floating label). Joining only squares the inner corners,
 * collapses the shared border into one, and lifts the hovered/focused field so its outline is whole.
 */

/**
 * FormRow — the ONLY way to put fields side by side, and only when they are ONE data point for the user
 * (first + last name, card expiry month + year, a range). Forms are otherwise one column:
 * people scan forms top-left in an F pattern and miss a second column.
 */
export function FormRow({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      role="group"
      className={cn(
        "flex items-start *:min-w-0 *:flex-1",
        "[&>*:not(:first-child)]:-ml-px [&>*:not(:first-child)_:is(input,textarea,button[role=combobox],button[aria-haspopup])]:rounded-l-none [&>*:not(:last-child)_:is(input,textarea,button[role=combobox],button[aria-haspopup])]:rounded-r-none",
        "[&_:is(input,textarea,button[role=combobox],button[aria-haspopup]):hover]:relative [&_:is(input,textarea,button[role=combobox],button[aria-haspopup]):hover]:z-10 [&_:is(input,textarea,button[role=combobox],button[aria-haspopup]):focus-visible]:relative [&_:is(input,textarea,button[role=combobox],button[aria-haspopup]):focus-visible]:z-20",
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
 * FluidForm — dense, expert data entry: every field joins the next into one continuous column.
 * Always ONE column (F-pattern rule). Pairs that are one data point go in a FormRow inside it.
 * BREAKING (0.2): the `columns` prop was removed — multi-column forms are not allowed.
 */
export function FluidForm({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "flex w-full flex-col [&_[data-message]]:min-h-0 [&_[data-message]]:pt-0 [&_[data-message]:has(p)]:pt-1.5 [&_[data-message]:has(p)]:pb-1",
        "[&>*:not(:first-child)]:-mt-px [&>*:not(:first-child)_:is(input,textarea,button[role=combobox],button[aria-haspopup])]:rounded-t-none [&>*:not(:last-child)_:is(input,textarea,button[role=combobox],button[aria-haspopup])]:rounded-b-none",
        "[&_:is(input,textarea,button[role=combobox],button[aria-haspopup]):hover]:relative [&_:is(input,textarea,button[role=combobox],button[aria-haspopup]):hover]:z-10 [&_:is(input,textarea,button[role=combobox],button[aria-haspopup]):focus-visible]:relative [&_:is(input,textarea,button[role=combobox],button[aria-haspopup]):focus-visible]:z-20",
        className,
      )}
      {...props}
    />
  )
}
