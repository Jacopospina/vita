import * as React from "react"
import { CheckmarkFilled, ErrorFilled, InformationFilled, WarningAltFilled, Close } from "@/registry/icons"
import { cva } from "class-variance-authority"
import { cn } from "@/registry/lib/utils"
import { Icon } from "@/registry/ui/icon"
import { Button } from "@/registry/ui/button"
import { useExit } from "@/registry/hooks/use-exit"

/**
 * Notifications — tell users about system status.
 *   InlineNotification  → tied to a section/task, stays until resolved (form errors summary, permission issues).
 *   Callout             → static, non-dismissible contextual info that is part of the page content.
 *   Toast               → brief confirmation of something the user just did; auto-dismisses. NEVER for errors that need action.
 *   ActionableNotification → needs a response; if it blocks work, use a Modal instead.
 */
type Kind = "info" | "success" | "warning" | "error"

const icons = { info: InformationFilled, success: CheckmarkFilled, warning: WarningAltFilled, error: ErrorFilled } as const

const shell = cva("relative flex w-full gap-3 rounded-md border-l-4 text-body text-foreground", {
  variants: {
    kind: {
      info: "border-l-info bg-info-subtle",
      success: "border-l-success bg-success-subtle",
      warning: "border-l-warning bg-warning-subtle",
      error: "border-l-error bg-error-subtle",
    },
    contrast: { low: "", high: "bg-inverse text-inverse-foreground" },
  },
})
const iconTone = { info: "text-info", success: "text-success", warning: "text-warning-foreground", error: "text-error" } as const

export interface NotificationProps {
  kind?: Kind
  title: React.ReactNode
  subtitle?: React.ReactNode
  /** Visible action (max 1, a ghost button). */
  action?: { label: string; onClick: () => void }
  onClose?: () => void
  /** high contrast = toast style on inverse surface */
  contrast?: "low" | "high"
  className?: string
  role?: "status" | "alert" | "log"
}

export function InlineNotification({ kind = "info", title, subtitle, action, onClose, contrast = "low", className, role }: NotificationProps) {
  const [leaving, exit] = useExit()
  const [closed, setClosed] = React.useState(false)
  if (closed) return null
  return (
    <div role={role ?? (kind === "error" ? "alert" : "status")} className={cn(shell({ kind, contrast }), leaving ? "animate-exit-slide-down" : "animate-enter-slide-up", "items-start py-3 pr-2 pl-4", className)}>
      <Icon as={icons[kind]} size="md" className={cn("mt-px", iconTone[kind])} />
      <div className="flex min-w-0 flex-1 flex-wrap items-baseline gap-x-2 gap-y-1 py-px">
        <p className="font-semibold">{title}</p>
        {subtitle && <p className={contrast === "high" ? "opacity-80" : "text-muted-foreground"}>{subtitle}</p>}
      </div>
      {action && (
        <Button size="sm" variant="ghost" onClick={action.onClick} className={cn("-my-1", contrast === "high" && "text-inverse-foreground")}>
          {action.label}
        </Button>
      )}
      {onClose && (
        <button type="button" aria-label="Close notification" onClick={() => exit(() => { setClosed(contrast === "low"); onClose() })} className="-my-1 flex size-control-sm items-center justify-center rounded-sm opacity-70 hover:opacity-100 focus-ring">
          <Icon as={Close} />
        </button>
      )}
    </div>
  )
}

/** Callout — permanent, non-dismissible guidance inside page content. */
export function Callout({ kind = "info", title, children, className }: { kind?: Kind; title?: React.ReactNode; children: React.ReactNode; className?: string }) {
  return (
    <aside className={cn(shell({ kind }), "items-start p-4", className)}>
      <Icon as={icons[kind]} size="md" className={cn("mt-px", iconTone[kind])} />
      <div className="flex flex-col gap-1">
        {title && <p className="font-semibold">{title}</p>}
        <div className="text-muted-foreground">{children}</div>
      </div>
    </aside>
  )
}

/* ---------------- Toasts ---------------- */

export interface ToastOptions {
  kind?: Kind
  title: string
  subtitle?: string
  action?: { label: string; onClick: () => void }
  /** ms. Default 5000; 0 = persistent (only for actionable toasts). Min 4000 for readability. */
  duration?: number
}
type ToastRecord = ToastOptions & { id: number; leaving?: boolean }

let seq = 0
const listeners = new Set<(t: ToastRecord[]) => void>()
let toasts: ToastRecord[] = []
const emit = () => listeners.forEach((l) => l([...toasts]))

function dismiss(id: number) {
  toasts = toasts.map((t) => (t.id === id ? { ...t, leaving: true } : t))
  emit()
  setTimeout(() => {
    toasts = toasts.filter((t) => t.id !== id)
    emit()
  }, 150)
}

/** toast({ kind: "success", title: "Project created" }) — call from anywhere. Max 3 visible. */
export function toast(opts: ToastOptions) {
  const id = ++seq
  toasts = [...toasts.slice(-2), { ...opts, id }]
  emit()
  const d = opts.duration ?? 5000
  if (d > 0) setTimeout(() => dismiss(id), Math.max(d, 4000))
  return id
}
toast.dismiss = dismiss

/** Toaster — mount once at the app root. Bottom-right on desktop, bottom-center on mobile. */
export function Toaster() {
  const [items, setItems] = React.useState<ToastRecord[]>([])
  React.useEffect(() => {
    listeners.add(setItems)
    return () => void listeners.delete(setItems)
  }, [])
  return (
    <div aria-live="polite" className="pointer-events-none fixed inset-x-4 bottom-4 z-60 flex flex-col items-center gap-2 sm:inset-x-auto sm:right-6 sm:bottom-6 sm:items-end">
      {items.map((t) => (
        <div key={t.id} className={cn("pointer-events-auto w-full max-w-sm shadow-overlay rounded-md", t.leaving ? "animate-exit-slide-down" : "animate-enter-slide-up")}>
          <InlineNotification kind={t.kind} title={t.title} subtitle={t.subtitle} action={t.action} contrast="high" onClose={() => dismiss(t.id)} role="status" />
        </div>
      ))}
    </div>
  )
}
