import * as React from "react"

/** Controlled/uncontrolled state helper used by Vita components. */
export function useControllable<T>(value: T | undefined, defaultValue: T, onChange?: (v: T) => void) {
  const [inner, setInner] = React.useState(defaultValue)
  const isControlled = value !== undefined
  const current = isControlled ? value : inner
  const set = React.useCallback(
    (next: T) => {
      if (!isControlled) setInner(next)
      onChange?.(next)
    },
    [isControlled, onChange],
  )
  return [current, set] as const
}
