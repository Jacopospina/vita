import * as React from "react"

/**
 * useExit, play an exit before something disappears. Nothing in Vita vanishes instantly.
 *   const [leaving, exit] = useExit()
 *   <div className={leaving ? "animate-exit-scale" : undefined}> … onClick={() => exit(onDismiss)}
 */
export function useExit(ms = 150) {
  const [leaving, setLeaving] = React.useState(false)
  const exit = React.useCallback(
    (done: () => void) => {
      if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return done()
      setLeaving(true)
      window.setTimeout(() => {
        // done() FIRST: the parent's removal and our reset commit in the same batch, so the element
        // never renders one more visible frame (exit keyframes also hold their end state: fill "both").
        done()
        setLeaving(false)
      }, ms)
    },
    [ms],
  )
  return [leaving, exit] as const
}
