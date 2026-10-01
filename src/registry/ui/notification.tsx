import * as React from "react"
import { Close } from "@/registry/icons"
import { cn } from "@/registry/lib/utils"
import { status } from "@/registry/lib/status"
import { Icon } from "@/registry/ui/icon"
import { Button } from "@/registry/ui/button"
import { useExit } from "@/registry/hooks/use-exit"
import { useFlip } from "@/registry/hooks/use-flip"
import { ProgressRing } from "@/registry/ui/progress-bar"
import { IconPlaceholder } from "@/registry/ui/icon-placeholder"
import { animateChildren } from "@/registry/ui/animated"
import type { IconType } from "@/registry/icons"

/**
 * Notifications, tell users about system status.
 *   InlineNotification  → tied to a section/task, stays until resolved (form errors summary, permission issues).
 *   Callout             → static, non-dismissible contextual info that is part of the page content.
 *   Toast               → brief confirmation of something the user just did; auto-dismisses. NEVER for errors that need action.
 *   ActionableNotification → needs a response; if it blocks work, use a Modal instead.
 */
type Kind = "info" | "success" | "warning" | "error"

// Glyph and colour per kind come from the one status map, so a notification's "error" matches every other error.
const icons = { info: status.info.icon, success: status.success.icon, warning: status.warning.icon, error: status.error.icon } as const

const iconTone = { info: status.info.iconColor, success: status.success.iconColor, warning: status.warning.iconColor, error: status.error.iconColor } as const

/**
 * Notice, the ONE notification anatomy, shared by inline notifications, callouts and toast banners:
 * squircle card on a NEUTRAL surface · IconPlaceholder (soft) on the left (the icon + its semantic color carry the kind,
 * never a colored bar or tinted fill) · title over subtitle · optional action · × appears on hover/focus.
 *   surface solid → in page content (inline, callout) · glass → floating over content (toast banner)
 */
function Notice({ icon, kind, eyebrow, source, title, subtitle, children, action, onClose, surface = "solid", motion, role, className }: {
  icon?: IconType | React.ReactNode
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
        "group/notice pointer-events-auto relative flex w-full items-start gap-3 squircle p-3 text-body text-foreground [--vita-squircle-r:var(--vita-radius-lg)]",
        surface === "glass" ? "glass glass-5" : "border border-border-subtle bg-raised",
        motion,
        className,
      )}
    >
      {icon && <IconPlaceholder icon={icon} tone={kind ?? "neutral"} size="lg" draw />}
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
          // Hover reveals it; a finger can't hover, so on touch the × is always there, with a finger-sized target.
          className="tap absolute -top-2 -left-2 flex size-6 scale-75 items-center justify-center rounded-full border border-border-subtle bg-raised text-muted-foreground opacity-0 shadow-raised group-focus-within/notice:scale-100 group-focus-within/notice:opacity-100 group-hover/notice:scale-100 group-hover/notice:opacity-100 hover:text-foreground focus-ring pointer-coarse:scale-100 pointer-coarse:opacity-100"
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
      icon={icon ?? icons[kind]}
      title={title}
      subtitle={subtitle}
      action={action}
      role={role ?? (kind === "error" ? "alert" : "status")}
      motion={leaving ? "animate-exit-slide-down" : "animate-enter-fall"}
      onClose={onClose && (() => exit(() => { setClosed(true); onClose() }))}
      className={className}
    />
  )
}

/** Callout, permanent, non-dismissible guidance inside page content. Same anatomy, no close. */
export function Callout({ kind = "info", title, children, className }: { kind?: Kind; title?: React.ReactNode; children: React.ReactNode; className?: string }) {
  return <Notice kind={kind} icon={icons[kind]} title={title} role="note" className={className}>{children}</Notice>
}

/* ---------------- Banners (toast) & Capsules (quick feedback) ---------------- */

type ToastIcon = IconType | React.ReactNode

export interface ToastOptions {
  /** Semantic kind: picks the default icon placeholder when no icon is given. */
  kind?: Kind
  /** Icon placeholder on the left. Pass an Icon type or any node (e.g. an app mark). `false` = the no-icon variant. */
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
  /** The semantic story on the right, progress, status, or a custom node. Include it whenever there is one:
   *  it's what the compact capsule shows first. Without it, the compact capsule shows the icon. */
  story?: CapsuleStory
  /** ms. Default 3000. 0 = stays until dismissed/updated. */
  duration?: number
}

type Rec = { id: number; leaving?: boolean } & ({ type: "banner"; o: ToastOptions } | { type: "capsule"; o: CapsuleOptions })

// One store per page, shared across module instances (hot reload, duplicate bundles) so a
// mounted <Toaster /> always hears every toast() / capsule() call.
type CapsuleRec = Extract<Rec, { type: "capsule" }>
type Store = { seq: number; items: Rec[]; listeners: Set<(t: Rec[]) => void>; timers: Map<number, number>; next?: CapsuleRec }
const g = globalThis as typeof globalThis & { __vitaNotifications?: Store }
const store: Store = (g.__vitaNotifications ??= { seq: 0, items: [], listeners: new Set(), timers: new Map() })
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

/** toast({ source: "Theo", title: "Agent deployed", subtitle: "Support triage is live" }), a notification banner, top-right. Max 3. */
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

/** capsule({ icon: Headphones, title: "Entheos", subtitle: "Connected", story: { progress: 100 } }), quick feedback capsule, top-center. */
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

const kindIcon = icons

function renderIcon(icon: ToastIcon, className?: string) {
  if (icon && (typeof icon === "function" || (typeof icon === "object" && "render" in (icon as object)))) return <Icon as={icon as IconType} size="md" draw="in" className={className} />
  return icon as React.ReactNode
}

/** Banner, the toast surface: the Notice anatomy on frosted glass. Icon placeholder optional (no-icon variant). */
export function Banner({ o, leaving, onClose }: { o: ToastOptions; leaving?: boolean; onClose: () => void }) {
  const icon = o.icon === false ? null : (o.icon ?? (o.kind ? kindIcon[o.kind] : null))
  return (
    <Notice
      surface="glass"
      kind={o.kind}
      icon={icon ?? undefined}
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

function Story({ story }: { story?: CapsuleStory }) {
  if (story && typeof story === "object" && "progress" in (story as object)) {
    const s = story as { progress: number; max?: number }
    return <ProgressRing value={s.progress} max={s.max} size={36} tone={s.progress >= (s.max ?? 100) ? "success" : "primary"} />
  }
  if (story && typeof story === "object" && "status" in (story as object)) {
    const k = (story as { status: Kind }).status
    return <Icon key={k} as={kindIcon[k]} size="lg" draw="in" className={iconTone[k]} />
  }
  return <>{story}</>
}

/**
 * Capsule, the quick-feedback capsule. ALWAYS: icon left · title/subtitle centre · semantic story right.
 * Choreography, the same character as the toast banner, from the top instead of the edge: a compact pill showing
 * ONLY the story (or the icon, when there is no story) falls in from above the viewport (scale, blur → sharp, gravity); ~400ms in it widens: the icon slides in on the left, the title
 * opens, the story travels to the right. Exit is the same film rewound: it narrows back, then slides up and out.
 */
/** How long the compact capsule (story only) stays readable before it expands, from the start of its enter. */
const COMPACT_MS = 400

export function Capsule({ o, leaving }: { o: CapsuleOptions; leaving?: boolean }) {
  const [landed, setLanded] = React.useState(false)
  const ref = React.useRef<HTMLDivElement>(null)
  React.useEffect(() => {
    const el = ref.current
    const enter = el?.getAnimations().find((a) => (a as CSSAnimation).animationName === "vita-island-in")
    const reduced = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches
    // Measured on the enter animation's own clock, so the compact moment is always ~400ms.
    const wait = reduced ? 0 : Math.max(0, COMPACT_MS - Number(enter?.currentTime ?? 0))
    const t = window.setTimeout(() => setLanded(true), wait)
    return () => window.clearTimeout(t)
  }, [])
  const open = landed && !leaving
  const hasStory = o.story !== undefined && o.story !== null && o.story !== false
  return (
    <div
      ref={ref}
      role="status"
      className={cn(
        "glass glass-5 pointer-events-auto flex items-center rounded-full p-1.5 text-foreground",
        leaving ? "animate-island-out" : "animate-island-in",
      )}
    >
      {/* Compact: the story alone (or the icon when there is no story). Expanded: icon · text · story. */}
      <div className={cn("reveal-x duration-moderate-02 ease-productive", (open || !hasStory) && "reveal-x-open")}>
        <div>
          {/* Ends fill the capsule's full inner height, so the visible edge sits the same 6px from the rim on every side. */}
          <span className="flex size-9 items-center justify-center rounded-full bg-icon-surface">{renderIcon(o.icon)}</span>
        </div>
      </div>
      <div className={cn("reveal-x duration-moderate-02 ease-productive", open && "reveal-x-open")}>
        <div>
          <div className={cn("flex w-56 max-w-[calc(100vw-8rem)] flex-col items-center px-3 text-center duration-moderate-02", open ? "opacity-100" : "opacity-0")}>
            <p className="w-full truncate text-body font-semibold">{o.title}</p>
            {o.subtitle && <p className="w-full truncate text-footnote text-muted-foreground">{animateChildren(o.subtitle)}</p>}
          </div>
        </div>
      </div>
      {hasStory && <span className="flex size-9 shrink-0 items-center justify-center"><Story story={o.story} /></span>}
    </div>
  )
}

const subscribe = (cb: () => void) => {
  store.listeners.add(cb)
  return () => void store.listeners.delete(cb)
}
const snapshot = () => store.items

/** Toaster, mount once at the app root. Banners top-right (slide in from the edge); capsules top-centre. */
export function Toaster() {
  const list = React.useSyncExternalStore(subscribe, snapshot, snapshot)
  // When a banner leaves or arrives, the others GLIDE to their new place, the stack never snaps.
  const banners = React.useRef<HTMLDivElement>(null)
  const capsules = React.useRef<HTMLDivElement>(null)
  useFlip(banners)
  useFlip(capsules)
  // Banners STACK: the newest sits in front on the highest layer; each older one sits a layer lower, peeking out
  // beneath it, a little smaller. Pointing at (or tabbing into) the stack fans it out into a list.
  const stack = list.filter((t) => t.type === "banner").reverse()
  const [open, setOpen] = React.useState(false)
  const fanned = open || stack.length <= 1
  return (
    <>
      <div
        ref={banners}
        aria-live="polite"
        onPointerEnter={() => setOpen(true)}
        onPointerLeave={() => setOpen(false)}
        onFocus={() => setOpen(true)}
        onBlur={(e) => { if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setOpen(false) }}
        className={cn("pointer-events-none fixed top-3 right-3 z-60 w-90 max-w-[calc(100vw-1.5rem)]", fanned ? "flex flex-col gap-2" : "grid *:[grid-area:1/1]")}
      >
        {stack.map((t, i) => (
          <div
            key={t.id}
            className="origin-top motion-productive"
            style={{
              zIndex: stack.length - i,
              transform: fanned ? undefined : `translateY(${i * 10}px) scale(${1 - i * 0.05})`,
              opacity: fanned || i < 3 ? undefined : 0,
            }}
          >
            {t.type === "banner" && <Banner o={t.o} leaving={t.leaving} onClose={() => dismiss(t.id)} />}
          </div>
        ))}
      </div>
      <div ref={capsules} aria-live="polite" className="pointer-events-none fixed top-3 left-1/2 z-60 flex -translate-x-1/2 flex-col items-center gap-2">
        {list.map((t) => (t.type === "capsule" ? <Capsule key={t.id} o={t.o} leaving={t.leaving} /> : null))}
      </div>
    </>
  )
}
