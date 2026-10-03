import * as React from "react"

/**
 * useMedia, a media query as React state, so a component can change its anatomy (not only its styles) by screen
 * or pointer. Reads the same signals as the stylesheet, nothing is configured.
 *   useMedia("(max-width: 40rem)")   a phone-width window
 *   useCoarsePointer()               a finger is the pointer (decision: Touch adapts by itself)
 */
export function useMedia(query: string) {
  const subscribe = React.useCallback(
    (cb: () => void) => {
      const mq = window.matchMedia?.(query)
      mq?.addEventListener?.("change", cb)
      return () => mq?.removeEventListener?.("change", cb)
    },
    [query],
  )
  return React.useSyncExternalStore(subscribe, () => window.matchMedia?.(query).matches ?? false, () => false)
}

/** True when the primary pointer is a finger (phones, tablets): the one signal touch adapts to. */
export function useCoarsePointer() {
  return useMedia("(pointer: coarse)")
}

/** True on a phone-width window (up to 40rem), where layouts fold: header at the bottom, tables as cards. */
export function usePhone() {
  return useMedia("(max-width: 40rem)")
}
