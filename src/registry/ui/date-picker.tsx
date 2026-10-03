import * as React from "react"
import { flushSync } from "react-dom"
import { DayPicker, type DateRange, type DayPickerProps } from "react-day-picker"
import { format, isValid, parse, addDays, addMonths, startOfMonth, endOfMonth, subMonths, nextMonday, isSameDay } from "date-fns"
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from "@/registry/icons"
import { cn, motionMs } from "@/registry/lib/utils"
import { FieldShell, fieldClasses, fieldSize, type FieldBaseProps, type FieldSize } from "@/registry/ui/form"
import { Icon } from "@/registry/ui/icon"
import { AnimatedText } from "@/registry/ui/animated"
import { Button } from "@/registry/ui/button"
import { Popover, PopoverAnchor, PopoverContent } from "@/registry/ui/popover"

/**
 * DatePicker
 *   simple  → typed date only (birthdays, known dates far away). Faster than scrolling a calendar.
 *   single  → typed OR picked from a calendar (near-future scheduling).
 *   range   → start–end (reporting periods, bookings).
 * Always accept typing. Show the format as placeholder. Validate on blur, not per keystroke.
 * `months` shows one or two months side by side. `presets` add common choices ("Last 7 days") beside the calendar
 * as ONE blended group of actions (joined rows, one surface), picking one selects it and jumps the calendar there.
 */
/** The day cell's looks, shared by the calendar and CalendarDay, so a day reads the same everywhere. */
const dayClasses = {
  day: "size-control-xl p-0 text-center",
  day_button: "size-control-xl rounded-md text-body tabular-nums duration-fast-02 hover:bg-hover focus-ring",
  // Today: primary, with a small dot under the number (absolutely placed, so the number never moves).
  today: "text-primary [&>button]:relative [&>button]:after:absolute [&>button]:after:bottom-1.5 [&>button]:after:left-1/2 [&>button]:after:size-1 [&>button]:after:-translate-x-1/2 [&>button]:after:rounded-full [&>button]:after:bg-current",
  selected: "[&>button]:bg-primary [&>button]:text-primary-foreground [&>button]:hover:bg-primary-hover",
  range_start: "rounded-l-md bg-selected last:rounded-r-md",
  range_end: "rounded-r-md bg-selected first:rounded-l-md",
  range_middle: "rounded-none bg-selected first:rounded-l-md last:rounded-r-md [&>button]:!rounded-none [&>button]:!bg-transparent [&>button]:!text-selected-foreground [&>button]:hover:!bg-hover",
  // Outside days can still be picked: quieter than this month (helper grey), never the disabled grey (it fails contrast).
  outside: "text-helper",
  disabled: "text-disabled-foreground [&>button]:pointer-events-none",
}

export type CalendarDayState = "default" | "today" | "selected" | "range-start" | "range-middle" | "range-end" | "outside" | "disabled"

/**
 * CalendarDay, one day button on its own, in any state (for documentation, legends and previews).
 * In product UI days live inside Calendar / DatePicker.
 */
export function CalendarDay({ day, state = "default" }: { day: number; state?: CalendarDayState }) {
  const cell = {
    default: "",
    today: dayClasses.today,
    selected: dayClasses.selected,
    "range-start": cn(dayClasses.range_start, dayClasses.selected),
    "range-middle": dayClasses.range_middle,
    "range-end": cn(dayClasses.range_end, dayClasses.selected),
    outside: dayClasses.outside,
    disabled: dayClasses.disabled,
  }[state]
  return (
    <div className={cn(dayClasses.day, cell)}>
      <button type="button" disabled={state === "disabled"} aria-pressed={state === "selected" || state.startsWith("range") || undefined} className={dayClasses.day_button}>
        {day}
      </button>
    </div>
  )
}

/** The calendar's class names, shared by the live month and the ghost months beside it while you swipe. */
const calendarClassNames = {
  months: "flex flex-col gap-6 sm:flex-row",
  month: "flex flex-col gap-2",
  month_caption: "flex h-control-md items-center justify-center text-body font-semibold",
  nav: "absolute inset-x-1 top-0 flex justify-between",
  button_previous: "flex size-control-md items-center justify-center rounded-md hover:bg-hover focus-ring",
  button_next: "flex size-control-md items-center justify-center rounded-md hover:bg-hover focus-ring",
  month_grid: "border-collapse",
  weekdays: "flex",
  weekday: "w-control-xl pb-1 text-caption font-medium text-helper",
  week: "mt-0.5 flex",
  day: dayClasses.day,
  day_button: dayClasses.day_button,
  today: dayClasses.today,
  selected: dayClasses.selected,
  range_start: dayClasses.range_start,
  range_end: dayClasses.range_end,
  // each week row's band is one shape: rounded where the row's highlight begins and ends, even mid-range
  range_middle: dayClasses.range_middle,
  outside: dayClasses.outside,
  disabled: dayClasses.disabled,
  root: "relative w-fit",
  // month change choreography. The picker names months by POSITION: moving forward, the new month enters
  // from "after" (right) and the old one exits to "before" (left); moving back, the reverse.
  weeks_after_enter: "animate-month-in-next",
  weeks_before_exit: "animate-month-out-next",
  weeks_before_enter: "animate-month-in-prev",
  weeks_after_exit: "animate-month-out-prev",
  caption_after_enter: "animate-month-caption-in",
  caption_after_exit: "animate-month-caption-out",
  caption_before_enter: "animate-month-caption-in",
  caption_before_exit: "animate-month-caption-out",
}

/** Swiping this far (a share of the calendar's width), or this fast (px/ms), turns the month. */
const SWIPE_SHARE = 0.3
const SWIPE_SPEED = 0.4
/** Moving this far is a swipe, not a tap on a day. */
const SWIPE_SLOP = 10

/**
 * Calendar, the month grid. Everything about it morphs:
 *   · months slide in and out sideways; the caption's letters morph in with the default stagger;
 *   · the frame eases between month heights (5 vs 6 week rows) instead of snapping;
 *   · away from the current month, a Today button reveals beneath the grid and brings you back;
 *   · drag the grid sideways (thumb or mouse) and the next or previous month comes along with it, already
 *     visible; let go and it snaps to whichever month is nearer, or springs back.
 */
export function Calendar({ className, month: monthProp, onMonthChange, defaultMonth, ...props }: React.ComponentProps<typeof DayPicker>) {
  const [own, setOwn] = React.useState<Date>(() => defaultMonth ?? new Date())
  const month = monthProp ?? own
  const setMonth = (m: Date) => {
    if (monthProp === undefined) setOwn(m)
    onMonthChange?.(m)
  }
  const today = new Date()
  const shown = (props as { numberOfMonths?: number }).numberOfMonths ?? 1
  const away = month.getFullYear() * 12 + month.getMonth()
  const now = today.getFullYear() * 12 + today.getMonth()
  const offToday = now < away || now > away + shown - 1
  // The year only when it isn't this year ("December", but "January 2027").
  const formatters = { formatCaption: (d: Date) => format(d, d.getFullYear() === today.getFullYear() ? "MMMM" : "MMMM yyyy") }

  // Measured height: the frame transitions between month heights; clipped vertically only, so months still slide.
  const inner = React.useRef<HTMLDivElement>(null)
  const [h, setH] = React.useState<number>()
  React.useEffect(() => {
    const el = inner.current
    if (!el) return
    const ro = new ResizeObserver(() => setH(el.offsetHeight))
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  // SWIPE. The track (the live month) follows the pointer; the previous and next months ride beside it as ghosts,
  // mounted only while you drag. Let go: the track glides to the nearer month, then the live month swaps to it
  // in place (its own month animation held off for that one swap, so nothing plays twice).
  const frame = React.useRef<HTMLDivElement>(null)
  const [swipe, setSwipe] = React.useState<{ on: boolean; still: boolean }>({ on: false, still: true })
  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.button !== 0 || (e.target as Element).closest("nav")) return // the arrows stay buttons
    const fr = frame.current, el = inner.current
    if (!fr || !el) return
    const id = e.pointerId
    const startX = e.clientX, startY = e.clientY
    let moving = false, dx = 0, lastX = startX, lastT = performance.now(), v = 0
    const move = (ev: PointerEvent) => {
      if (ev.pointerId !== id) return
      dx = ev.clientX - startX
      if (!moving) {
        if (Math.abs(dx) < SWIPE_SLOP) return
        if (Math.abs(ev.clientY - startY) > Math.abs(dx)) return up(ev) // up and down is the page's
        moving = true
        setSwipe({ on: true, still: true })
        try { fr.setPointerCapture(id) } catch { /* the pointer may already be gone */ }
      }
      const t = performance.now()
      v = 0.6 * v + 0.4 * ((ev.clientX - lastX) / Math.max(1, t - lastT))
      lastX = ev.clientX
      lastT = t
      el.style.transition = "none"
      el.style.transform = `translateX(${dx}px)`
    }
    const up = (ev: PointerEvent) => {
      if (ev.pointerId !== id) return
      window.removeEventListener("pointermove", move)
      window.removeEventListener("pointerup", up)
      window.removeEventListener("pointercancel", up)
      if (!moving) return
      try { fr.releasePointerCapture(id) } catch { /* already released */ }
      // The press that became a swipe must not also pick the day it started on.
      const stop = (c: Event) => { c.stopPropagation(); c.preventDefault() }
      fr.addEventListener("click", stop, { capture: true })
      window.setTimeout(() => fr.removeEventListener("click", stop, { capture: true }), 400)
      const w = fr.clientWidth
      const dir = Math.abs(dx) > w * SWIPE_SHARE || Math.abs(v) > SWIPE_SPEED ? (dx < 0 ? 1 : -1) : 0
      const ms = motionMs(240)
      const land = () => {
        el.removeEventListener("transitionend", land)
        if (dir) {
          // The live month becomes the one the ghost showed, with no month animation: the glide already happened.
          flushSync(() => {
            setSwipe({ on: false, still: false })
            setMonth(addMonths(month, dir))
          })
        }
        el.style.transition = "none"
        el.style.transform = ""
        requestAnimationFrame(() => {
          el.style.transition = ""
          setSwipe({ on: false, still: true })
        })
      }
      if (!ms) return land()
      el.style.transition = `transform ${ms}ms var(--vita-ease-productive)`
      el.style.transform = `translateX(${dir ? -dir * w : 0}px)`
      el.addEventListener("transitionend", land)
      window.setTimeout(land, ms + 80) // if the transition never reports (a tab in the background), land anyway
    }
    window.addEventListener("pointermove", move)
    window.addEventListener("pointerup", up)
    window.addEventListener("pointercancel", up)
  }
  const ghost = (dir: -1 | 1) => (
    <div aria-hidden inert className={cn("absolute top-0 w-full", dir < 0 ? "right-full" : "left-full")}>
      <DayPicker showOutsideDays {...props} autoFocus={false} month={addMonths(month, dir)} formatters={formatters} className="p-1 text-body" classNames={calendarClassNames} components={ghostParts} hideNavigation />
    </div>
  )

  return (
    <div className={cn("w-fit", className)}>
      {/* Sideways touches stay with the calendar (the swipe); up and down stays the page's. */}
      <div ref={frame} onPointerDown={onPointerDown} className={cn("motion-productive touch-pan-y [overflow-y:clip] [&_button]:touch-pan-y", swipe.on && "[overflow-x:clip]")} style={{ height: h }}>
        <div ref={inner} className="relative">
          <DayPicker
            showOutsideDays
            animate={swipe.still}
            month={month}
            onMonthChange={setMonth}
            formatters={formatters}
            className="p-1 text-body"
            // Roomy, easy targets (36px days). A range is ONE continuous band on the cells: rounded only on its outer
            // corners (start: left, end: right), square in between; start and end days are filled.
            classNames={calendarClassNames}
            components={calendarParts}
            {...props}
          />
          {swipe.on && ghost(-1)}
          {swipe.on && ghost(1)}
        </div>
      </div>
      {/* Today, only once you've left the current month; reveals and collapses, never pops. */}
      <div className={cn("reveal motion-productive", offToday && "reveal-open")}>
        <div>
          <div className="flex justify-center pt-1 pb-1">
            <Button size="sm" variant="ghost" tabIndex={offToday ? undefined : -1} aria-hidden={!offToday || undefined} onClick={() => setMonth(new Date(today.getFullYear(), today.getMonth(), 1))}>
              Today
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

/** Stable across renders: defined inline, these would remount on every render (picking a day included) and the
    month name would replay its entrance each time. It plays only when a new month arrives. */
const calendarParts: DayPickerProps["components"] = {
  Chevron: ({ orientation }) => <Icon as={orientation === "left" ? ChevronLeft : ChevronRight} />,
  // The month name morphs in letter by letter (the default stagger) every time a new month arrives.
  CaptionLabel: ({ children, ...rest }) => (
    <span {...rest}>{typeof children === "string" ? <AnimatedText enter="mount">{children}</AnimatedText> : children}</span>
  ),
}
/** The ghost months beside a swipe: the same parts, with a still caption (they are only passing by). */
const ghostParts: DayPickerProps["components"] = { Chevron: calendarParts.Chevron }

const FMT = "dd/MM/yyyy"

export interface DatePreset { label: string; date: () => Date }
export interface RangePreset { label: string; range: () => DateRange }

/** Ready-made presets. Pass your own when the product has other common choices. */
export const datePresets: DatePreset[] = [
  { label: "Today", date: () => new Date() },
  { label: "Tomorrow", date: () => addDays(new Date(), 1) },
  { label: "In a week", date: () => addDays(new Date(), 7) },
  { label: "Next Monday", date: () => nextMonday(new Date()) },
]
export const rangePresets: RangePreset[] = [
  { label: "Today", range: () => ({ from: new Date(), to: new Date() }) },
  { label: "Last 7 days", range: () => ({ from: addDays(new Date(), -6), to: new Date() }) },
  { label: "Last 30 days", range: () => ({ from: addDays(new Date(), -29), to: new Date() }) },
  { label: "This month", range: () => ({ from: startOfMonth(new Date()), to: endOfMonth(new Date()) }) },
  { label: "Last month", range: () => ({ from: startOfMonth(subMonths(new Date(), 1)), to: endOfMonth(subMonths(new Date(), 1)) }) },
]

/** Presets as ONE blended group: joined rows on a single rounded surface (belonging), current one highlighted. */
function PresetList({ items, activeIndex, onPick }: { items: { label: string }[]; activeIndex: number; onPick: (i: number) => void }) {
  return (
    <div role="group" aria-label="Presets" className="flex w-36 shrink-0 flex-col self-start scope-md bg-layer-2 p-1">
      {items.map((p, i) => (
        <button
          key={p.label}
          type="button"
          aria-pressed={i === activeIndex}
          onClick={() => onPick(i)}
          className={cn("flex h-control-sm items-center rounded-inner-1 px-2.5 text-left text-body duration-fast-02 hover:bg-hover focus-ring-inset", i === activeIndex && "bg-raised font-medium shadow-raised hover:bg-raised")}
        >
          {p.label}
        </button>
      ))}
    </div>
  )
}

function DateField({ value, onValueChange, a11y, size, placeholder, onOpen, disabled, invalid }: {
  value?: Date
  onValueChange: (d: Date | undefined) => void
  a11y: object
  size: FieldSize
  placeholder: string
  onOpen?: () => void
  disabled?: boolean
  invalid?: boolean
}) {
  const [text, setText] = React.useState(value ? format(value, FMT) : "")
  const [prev, setPrev] = React.useState(value)
  if (prev !== value) {
    setPrev(value)
    setText(value ? format(value, FMT) : "")
  }
  return (
    <div className="relative flex-1">
      <input
        {...a11y}
        aria-invalid={invalid || undefined}
        disabled={disabled}
        placeholder={placeholder}
        value={text}
        onChange={(e) => setText(e.target.value)}
        onBlur={() => {
          const d = parse(text, FMT, new Date())
          onValueChange(isValid(d) ? d : undefined)
        }}
        className={cn(fieldClasses, fieldSize[size], "tabular-nums", onOpen && "pr-10")}
      />
      {onOpen && (
        <button type="button" aria-label="Open calendar" disabled={disabled} onClick={onOpen} className="absolute inset-y-0 right-0 flex w-10 items-center justify-center rounded-md text-muted-foreground hover:text-foreground focus-ring-inset">
          <Icon as={CalendarIcon} />
        </button>
      )}
    </div>
  )
}

export interface DatePickerProps extends FieldBaseProps {
  mode?: "simple" | "single"
  /** Months shown side by side in the calendar. */
  months?: 1 | 2
  /** Common choices beside the calendar, as one blended group. Pass `datePresets` or your own. */
  presets?: DatePreset[]
  value?: Date
  onValueChange?: (d: Date | undefined) => void
  size?: FieldSize
  disabled?: boolean
  minDate?: Date
  maxDate?: Date
  className?: string
}

export function DatePicker({ mode = "single", months = 1, presets, value, onValueChange, size = "md", disabled, minDate, maxDate, className, ...field }: DatePickerProps) {
  const [inner, setInner] = React.useState<Date | undefined>(value)
  const [open, setOpen] = React.useState(false)
  const current = value ?? inner
  const [month, setMonth] = React.useState<Date | undefined>(current)
  const activePreset = presets ? presets.findIndex((p) => current && isSameDay(p.date(), current)) : -1
  const set = (d: Date | undefined) => { setInner(d); onValueChange?.(d) }
  return (
    <FieldShell {...field} className={cn("max-w-xs", className)}>
      {(a11y) => (
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverAnchor asChild>
            <div className="flex">
              <DateField value={current} onValueChange={set} a11y={a11y} size={size} placeholder="dd/mm/yyyy" disabled={disabled} invalid={field.invalid} onOpen={mode === "single" ? () => setOpen(true) : undefined} />
            </div>
          </PopoverAnchor>
          <PopoverContent className="flex w-auto gap-3 p-3">
            {presets && <PresetList items={presets} activeIndex={activePreset} onPick={(i) => { const d = presets[i].date(); set(d); setMonth(d) }} />}
            <Calendar mode="single" numberOfMonths={months} selected={current} month={month} onMonthChange={setMonth} disabled={[...(minDate ? [{ before: minDate }] : []), ...(maxDate ? [{ after: maxDate }] : [])]} onSelect={(d) => { set(d); setOpen(false) }} autoFocus />
          </PopoverContent>
        </Popover>
      )}
    </FieldShell>
  )
}

export function DateRangePicker({ value, onValueChange, months = 2, presets, size = "md", disabled, className, startLabel = "Start date", endLabel = "End date", ...field }: Omit<DatePickerProps, "mode" | "value" | "onValueChange" | "label" | "presets"> & {
  label?: React.ReactNode
  /** Common ranges beside the calendar, as one blended group. Pass `rangePresets` or your own. */
  presets?: RangePreset[]
  value?: DateRange
  onValueChange?: (r: DateRange | undefined) => void
  startLabel?: string
  endLabel?: string
}) {
  const [inner, setInner] = React.useState<DateRange | undefined>(value)
  const [open, setOpen] = React.useState(false)
  const current = value ?? inner
  const set = (r: DateRange | undefined) => { setInner(r); onValueChange?.(r) }
  const [month, setMonth] = React.useState<Date | undefined>(current?.from)
  const same = (a?: Date, b?: Date) => (!a && !b) || (!!a && !!b && isSameDay(a, b))
  const activePreset = presets ? presets.findIndex((p) => { const r = p.range(); return !!current?.from && same(r.from, current.from) && same(r.to, current.to) }) : -1
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverAnchor asChild>
        <div className={cn("flex max-w-lg gap-2", className)}>
          <FieldShell {...field} label={startLabel} className="flex-1">
            {(a11y) => <DateField value={current?.from} onValueChange={(d) => set({ from: d, to: current?.to })} a11y={a11y} size={size} placeholder="dd/mm/yyyy" disabled={disabled} onOpen={() => setOpen(true)} />}
          </FieldShell>
          <FieldShell label={endLabel} className="flex-1">
            {(a11y) => <DateField value={current?.to} onValueChange={(d) => set({ from: current?.from, to: d })} a11y={a11y} size={size} placeholder="dd/mm/yyyy" disabled={disabled} onOpen={() => setOpen(true)} />}
          </FieldShell>
        </div>
      </PopoverAnchor>
      <PopoverContent className="flex w-auto gap-3 p-3">
        {presets && <PresetList items={presets} activeIndex={activePreset} onPick={(i) => { const r = presets[i].range(); set(r); setMonth(months === 2 && r.to ? subMonths(r.to, 1) : r.from) }} />}
        <Calendar mode="range" numberOfMonths={months} selected={current} month={month} onMonthChange={setMonth} onSelect={set} autoFocus />
      </PopoverContent>
    </Popover>
  )
}
