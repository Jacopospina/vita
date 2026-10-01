import * as React from "react"
import { View, ViewOff } from "@/registry/icons"
import { cn } from "@/registry/lib/utils"
import { FieldShell, fieldClasses, fieldSize, type FieldBaseProps, type FieldSize } from "@/registry/ui/form"
import { SwapIcon } from "@/registry/ui/icon"

/** TextInput — single-line free text. If the answer set is known and ≤ ~7, use Radio/Select instead. */
export interface TextInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "size">, FieldBaseProps {
  size?: FieldSize
  /** Character counter (shows when maxLength is set). */
  showCount?: boolean
}

export const TextInput = React.forwardRef<HTMLInputElement, TextInputProps>(
  ({ label, hideLabel, helperText, invalid, invalidText, warn, warnText, optional, labelAddon, size = "md", showCount, className, id, ...props }, ref) => {
    const [count, setCount] = React.useState(String(props.value ?? props.defaultValue ?? "").length)
    return (
      <FieldShell {...{ id, label, hideLabel, helperText, invalid, invalidText, warn, warnText, optional, labelAddon, className }}>
        {(a11y) => (
          <div className="relative">
            <input
              ref={ref}
              {...a11y}
              {...props}
              placeholder={props.placeholder ?? " "}
              onChange={(e) => {
                setCount(e.target.value.length)
                props.onChange?.(e)
              }}
              className={cn(fieldClasses, fieldSize[size], showCount && props.maxLength && "pr-16")}
            />
            {showCount && props.maxLength && (
              <span className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-caption text-helper tabular-nums">
                {count}/{props.maxLength}
              </span>
            )}
          </div>
        )}
      </FieldShell>
    )
  },
)
TextInput.displayName = "TextInput"

/** PasswordInput — TextInput with a show/hide toggle. */
export const PasswordInput = React.forwardRef<HTMLInputElement, Omit<TextInputProps, "type" | "showCount">>(
  ({ label, hideLabel, helperText, invalid, invalidText, warn, warnText, optional, labelAddon, size = "md", className, id, ...props }, ref) => {
    const [visible, setVisible] = React.useState(false)
    return (
      <FieldShell {...{ id, label, hideLabel, helperText, invalid, invalidText, warn, warnText, optional, labelAddon, className }}>
        {(a11y) => (
          <div className="relative">
            <input ref={ref} type={visible ? "text" : "password"} {...a11y} {...props} placeholder={props.placeholder ?? " "} className={cn(fieldClasses, fieldSize[size], "pr-control-md")} />
            <button
              type="button"
              onClick={() => setVisible((v) => !v)}
              aria-label={visible ? "Hide password" : "Show password"}
              className="tap absolute inset-y-0 right-0 flex w-control-md items-center justify-center rounded-md text-muted-foreground hover:text-foreground focus-ring-inset"
            >
              <SwapIcon as={visible ? ViewOff : View} />
            </button>
          </div>
        )}
      </FieldShell>
    )
  },
)
PasswordInput.displayName = "PasswordInput"

/** TextArea — multi-line text (comments, descriptions). Grows to fit up to `rows` then scrolls. */
export interface TextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement>, FieldBaseProps {
  showCount?: boolean
}

export const TextArea = React.forwardRef<HTMLTextAreaElement, TextAreaProps>(
  ({ label, hideLabel, helperText, invalid, invalidText, warn, warnText, optional, labelAddon, className, id, rows = 4, showCount, ...props }, ref) => {
    const [count, setCount] = React.useState(String(props.value ?? props.defaultValue ?? "").length)
    return (
      <FieldShell multiline {...{ id, label, hideLabel, helperText, invalid, invalidText, warn, warnText, optional, labelAddon, className }}>
        {(a11y) => (
          <>
            <textarea
              ref={ref}
              rows={rows}
              {...a11y}
              {...props}
              placeholder={props.placeholder ?? " "}
              onChange={(e) => {
                setCount(e.target.value.length)
                props.onChange?.(e)
              }}
              className={cn(fieldClasses, "field-sizing-content min-h-24 resize-y px-inset pt-7 pb-2")}
            />
            {showCount && props.maxLength && (
              <span className="self-end text-caption text-helper tabular-nums">
                {count}/{props.maxLength}
              </span>
            )}
          </>
        )}
      </FieldShell>
    )
  },
)
TextArea.displayName = "TextArea"
