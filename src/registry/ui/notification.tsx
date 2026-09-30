import * as React from "react"
import { CheckmarkFilled, ErrorFilled, InformationFilled, WarningAltFilled, Close } from "@/registry/icons"
import { cn } from "@/registry/lib/utils"
import { Icon } from "@/registry/ui/icon"
import { Button } from "@/registry/ui/button"
import { useExit } from "@/registry/hooks/use-exit"
import { ProgressRing } from "@/registry/ui/progress-bar"
import { animateChildren } from "@/registry/ui/animated"
import type { IconType } from "@/registry/icons"

/**
 * Notifications — tell users about system status.
 *   InlineNotification  → tied to a section/task, stays until resolved (form errors summary, permission issues).
 *   Callout             → static, non-dismissible contextual info that is part of the page content.
 *   Toast               → brief confirmation of something the user just did; auto-dismisses. NEVER for errors that need action.
 *   ActionableNotification → needs a response; if it blocks work, use a Modal instead.
 */
type Kind = "info" | "success" | "warning" | "error"

const icons = { info: InformationFilled, success: CheckmarkFilled, warning: WarningAltFilled, error: ErrorFilled } as const

const iconTone = { info: "text-info", success: "text-success", warning: "text-warning", error: "text-error" } as const

/**
 * Notice — the ONE notification anatomy, shared by inline notifications, callouts and toast banners:
 * squircle card on a NEUTRAL surface · icon tile on the left (the icon + its semantic color carry the kind —
 * never a colored bar or tinted fill) · title over subtitle · optional action · × appears on hover/focus.
 *   surface solid → in page content (inline, callout) · glass → floating over content (toast banner)
 */
function Notice({ icon, kind, eyebrow, source, title, subtitle, children, action, onClose, surface = "solid", motion, role, className }: {
  icon?: React.ReactNode
  kind?: Kind
  eyebrow?: React.ReactNode
  source?: React.ReactNode
  title?: React.ReactNode
  subtitle?: React.ReactNode
  children?: React.ReactNode
  action?: { label: string; onClick: () => void }
  onClose?: () => void
  surface?: "solid" | "glass"
  motion?: string
  role?: string
  className?: string
}) {
  return (
    <div
      data-ai-context=""
      role={role}
      className={cn(
        "group/notice pointer-events-auto relative flex w-full items-start gap-3 squircle p-3 text-body text-foreground [--corpus-squircle-r:var(--corpus-radius-lg)]",
        surface === "glass" ? "glass" : "border border-border-subtle bg-layer-1",
        motion,
        className,
      )}
    >
      {icon && (
        <span aria-hidden className={cn("flex size-10 shrink-0 items-center justify-center squircle bg-background/70 shadow-raised [--corpus-squircle-r:var(--corpus-radius-md)]", kind && iconTone[kind])}>
          {icon}
        </span>
      )}
      <div className={cn("flex min-w-0 flex-1 flex-col", !subtitle && !children && !eyebrow && !source && "self-center")}>
        {eyebrow && <p className="text-caption font-medium tracking-wide text-muted-foreground uppercase">{eyebrow}</p>}
        {source && <p className="font-semibold">{source}</p>}
        {title && <p className="font-semibold">{title}</p>}
        {subtitle && <p className="text-foreground/80">{subtitle}</p>}
        {children && <div className="text-foreground/80">{children}</div>}
      </div>
      {action && (
        <Button size="sm" variant="secondary" onClick={action.onClick} className="self-center">
          {action.label}
        </Button>
      )}
      {onClose && (
        <button
          type="button"
          aria-label="Close notification"
          onClick={onClose}
          className="absolute -top-2 -left-2 flex size-6 scale-75 items-center justify-center rounded-full border border-border-subtle bg-raised text-muted-foreground opacity-0 shadow-raised group-focus-within/notice:scale-100 group-focus-within/notice:opacity-100 group-hover/notice:scale-100 group-hover/notice:opacity-100 hover:text-foreground focus-ring"
        >
          <Icon as={Close} size="sm" />
        </button>
      )}
    </div>
  )
}

export interface NotificationProps {
  kind?: Kind
  title: React.ReactNode
  subtitle?: React.ReactNode
  /** Visible action (max 1). */
  action?: { label: string; onClick: () => void }
  onClose?: () => void
  /** Custom icon (agent / app mark). Defaults to the kind's icon. */
  icon?: IconType
  className?: string
  role?: "status" | "alert" | "log"
}

export function InlineNotification({ kind = "info", title, subtitle, action, onClose, icon, className, role }: NotificationProps) {
  const [leaving, exit] = useExit()
  const [closed, setClosed] = React.useState(false)
  if (closed) return null
  return (
    <Notice
      kind={kind}
      icon={<Icon as={icon ?? icons[kind]} size="md" draw="in" />}
      title={title}
      subtitle={subtitle}
      action={action}
      role={role ?? (kind === "error" ? "alert" : "status")}
      motion={leaving ? "animate-exit-slide-down" : "animate-enter-slide-up"}
      onClose={onClose && (() => exit(() => { setClosed(true); onClose() }))}
      className={className}
    />
  )
}

/** Callout — permanent, non-dismissible guidance inside page content. Same anatomy, no close. */
export function Callout({ kind = "info", title, children, className }: { kind?: Kind; title?: React.ReactNode; children: React.ReactNode; className?: string }) {
  return <Notice kind={kind} icon={<Icon as={icons[kind]} size="md" />} title={title} role="note" className={className}>{children}</Notice>
}

/* ---------------- Banners (toast) & Capsules (quick feedback) ---------------- */

type ToastIcon = IconType | React.ReactNode

export interface ToastOptions {
  /** Semantic kind: picks the default icon tile when no icon is given. */
  kind?: Kind
  /** Icon tile on the left. Pass an Icon type or any node (e.g. an app mark). `false` = the no-icon variant. */
  icon?: ToastIcon | false
  /** Who is speaking (app, agent or feature name), shown first. */
  source?: string
  /** Small uppercase eyebrow, e.g. "Time sensitive". */
  eyebrow?: string
  title: string
  subtitle?: string
  action?: { label: string; onClick: () => void }
  /** ms. Default 5000; 0 = persistent (only for actionable toasts). Min 4000 for readability. */
  duration?: number
}

export type CapsuleStory =
  | { progress: number; max?: number }
  | { status: Kind }
  | React.ReactNode

export interface CapsuleOptions {
  /** ALWAYS present: what this is about. */
  icon: ToastIcon
  title: string
  subtitle?: string
  /** ALWAYS present: the semantic story on the right — progress, status, or a custom node. */
  story: CapsuleStory
  /** ms. Default 3000. 0 = stays until dismissed/updated. */
  duration?: number
}

type Rec = { id: number; leaving?: boolean } & ({ type: "banner"; o: ToastOptions } | { type: "capsule"; o: CapsuleOptions })

// One store per page, shared across module instances (hot reload, duplicate bundles) so a
// mounted <Toaster /> always hears every toast() / capsule() call.
type CapsuleRec = Extract<Rec, { type: "capsule" }>
type Store = { seq: number; items: Rec[]; listeners: Set<(t: Rec[]) => void>; timers: Map<number, number>; next?: CapsuleRec }
const g = globalThis as typeof globalThis & { __corpusNotifications?: Store }
const store: Store = (g.__corpusNotifications ??= { seq: 0, items: [], listeners: new Set(), timers: new Map() })
const emit = () => store.listeners.forEach((l) => l([...store.items]))

// Capsules rewind (collapse, then slide out) so they need longer before removal.
const exitMs = { banner: 260, capsule: 620 } as const

function dismiss(id: number) {
  store.items = store.items.map((t) => (t.id === id ? { ...t, leaving: true } : t))
  emit()
  window.setTimeout(() => {
    store.items = store.items.filter((t) => t.id !== id)
    // ONE capsule at a time: the queued one enters only after the current one has fully left.
    if (store.next && !store.items.some((t) => t.type === "capsule")) showCapsule(store.next)
    emit()
  }, exitMs[store.items.find((t) => t.id === id)?.type ?? "banner"])
}
function schedule(id: number, ms: number) {
  window.clearTimeout(store.timers.get(id))
  if (ms > 0) store.timers.set(id, window.setTimeout(() => dismiss(id), ms))
}

/** toast({ source: "Vita", title: "Agent deployed", subtitle: "Support triage is live" }) — a notification banner, top-right. Max 3. */
export function toast(opts: ToastOptions) {
  const id = ++store.seq
  const banners = store.items.filter((t) => t.type === "banner")
  if (banners.length >= 3) dismiss(banners[0].id)
  store.items = [...store.items, { id, type: "banner", o: opts }]
  emit()
  schedule(id, opts.duration === 0 ? 0 : Math.max(opts.duration ?? 5000, 4000))
  return id
}
toast.dismiss = dismiss

/** capsule({ icon: Headphones, title: "Entheos", subtitle: "Connected", story: { progress: 100 } }) — quick feedback capsule, top-center. */
export function capsule(opts: CapsuleOptions) {
  const rec: CapsuleRec = { id: ++store.seq, type: "capsule", o: opts }
  const current = store.items.filter((t) => t.type === "capsule")
  if (current.length === 0) {
    showCapsule(rec)
    emit()
  } else {
    // Rule: only one capsule on screen. The current one rewinds out; the newest request waits (older waiting ones are dropped).
    store.next = rec
    current.filter((t) => !t.leaving).forEach((t) => dismiss(t.id))
  }
  return rec.id
}
function showCapsule(rec: CapsuleRec) {
  if (store.next?.id === rec.id) store.next = undefined
  store.items = [...store.items, rec]
  schedule(rec.id, rec.o.duration ?? 3000)
}
/** Update a capsule in place (progress 40 → 100 morphs; nothing re-enters). */
capsule.update = (id: number, patch: Partial<CapsuleOptions>) => {
  if (store.next?.id === id) {
    store.next = { ...store.next, o: { ...store.next.o, ...patch } }
    return
  }
  store.items = store.items.map((t) => (t.id === id && t.type === "capsule" ? { ...t, o: { ...t.o, ...patch } } : t))
  emit()
  if (patch.duration !== undefined) schedule(id, patch.duration)
}
capsule.dismiss = (id: number) => {
  if (store.next?.id === id) store.next = undefined
  else dismiss(id)
}

const kindIcon = { info: InformationFilled, success: CheckmarkFilled, warning: WarningAltFilled, error: ErrorFilled } as const

function renderIcon(icon: ToastIcon, className?: string) {
  if (icon && (typeof icon === "function" || (typeof icon === "object" && "render" in (icon as object)))) return <Icon as={icon as IconType} size="md" draw="in" className={className} />
  return icon as React.ReactNode
}

/** Banner — the toast surface: the Notice anatomy on frosted glass. Icon tile optional (no-icon variant). */
export function Banner({ o, leaving, onClose }: { o: ToastOptions; leaving?: boolean; onClose: () => void }) {
  const icon = o.icon === false ? null : (o.icon ?? (o.kind ? kindIcon[o.kind] : null))
  return (
    <Notice
      surface="glass"
      kind={o.kind}
      icon={icon ? renderIcon(icon) : undefined}
      eyebrow={o.eyebrow}
      source={o.source}
      title={o.title}
      subtitle={o.subtitle}
      action={o.action}
      onClose={onClose}
      motion={leaving ? "animate-banner-out" : "animate-banner-in"}
    />
  )
}

function Story({ story }: { story: CapsuleStory }) {
  if (story && typeof story === "object" && "progress" in (story as object)) {
    const s = story as { progress: number; max?: number }
    return <ProgressRing value={s.progress} max={s.max} size={30} tone={s.progress >= (s.max ?? 100) ? "success" : "primary"} />
  }
  if (story && typeof story === "object" && "status" in (story as object)) {
    const k = (story as { status: Kind }).status
    return <Icon key={k} as={kindIcon[k]} size="lg" draw="in" className={iconTone[k]} />
  }
  return <>{story}</>
}

/**
 * Capsule — the quick-feedback capsule. ALWAYS: icon left · title/subtitle centre · semantic story right.
 * Choreography: an icon-only pill slides in (and fades) from above the viewport → then widens to reveal
 * title and story. Exit is the same film rewound: it narrows back to the icon, then slides up and out.
 */
export function Capsule({ o, leaving }: { o: CapsuleOptions; leaving?: boolean }) {
  const [landed, setLanded] = React.useState(false)
  React.useEffect(() => {
    const reduced = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches
    const t = window.setTimeout(() => setLanded(true), reduced ? 0 : 380)
    return () => window.clearTimeout(t)
  }, [])
  const open = landed && !leaving
  return (
    <div
      role="status"
      className={cn(
        "glass pointer-events-auto flex items-center rounded-full p-1.5 text-foreground",
        leaving ? "animate-island-out" : "animate-island-in",
      )}
    >
      <span className="flex size-8 shrink-0 items-center justify-center">{renderIcon(o.icon)}</span>
      <div className={cn("reveal-x motion-expressive", open && "reveal-x-open")}>
        <div className={cn("flex items-center gap-3 duration-moderate-02", open ? "opacity-100" : "opacity-0")}>
          <div className="flex w-56 max-w-[calc(100vw-8rem)] flex-col items-center pl-3 text-center">
            <p className="w-full truncate text-body font-semibold">{o.title}</p>
            {o.subtitle && <p className="w-full truncate text-footnote text-muted-foreground">{animateChildren(o.subtitle)}</p>}
          </div>
          <span className="flex size-8 shrink-0 items-center justify-center"><Story story={o.story} /></span>
        </div>
      </div>
    </div>
  )
}

const subscribe = (cb: () => void) => {
  store.listeners.add(cb)
  return () => void store.listeners.delete(cb)
}
const snapshot = () => store.items

/** Toaster — mount once at the app root. Banners top-right (slide in from the edge); capsules top-centre. */
export function Toaster() {
  const list = React.useSyncExternalStore(subscribe, snapshot, snapshot)
  return (
    <>
      <div aria-live="polite" className="pointer-events-none fixed top-3 right-3 z-60 flex w-90 max-w-[calc(100vw-1.5rem)] flex-col gap-2">
        {list.map((t) => (t.type === "banner" ? <Banner key={t.id} o={t.o} leaving={t.leaving} onClose={() => dismiss(t.id)} /> : null))}
      </div>
      <div aria-live="polite" className="pointer-events-none fixed top-3 left-1/2 z-60 flex -translate-x-1/2 flex-col items-center gap-2">
        {list.map((t) => (t.type === "capsule" ? <Capsule key={t.id} o={t.o} leaving={t.leaving} /> : null))}
      </div>
    </>
  )
}
