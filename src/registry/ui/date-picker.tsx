import * as React from "react"
import { DayPicker, type DateRange } from "react-day-picker"
import { format, isValid, parse, addDays, startOfMonth, endOfMonth, subMonths, nextMonday, isSameDay } from "date-fns"
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from "@/registry/icons"
import { cn } from "@/registry/lib/utils"
import { FieldShell, fieldClasses, fieldSize, type FieldBaseProps, type FieldSize } from "@/registry/ui/form"
import { Icon } from "@/registry/ui/icon"
import { Popover, PopoverAnchor, PopoverContent } from "@/registry/ui/popover"

/**
 * DatePicker
 *   simple  → typed date only (birthdays, known dates far away). Faster than scrolling a calendar.
 *   single  → typed OR picked from a calendar (near-future scheduling).
 *   range   → start–end (reporting periods, bookings).
 * Always accept typing. Show the format as placeholder. Validate on blur, not per keystroke.
 * `months` shows one or two months side by side. `presets` add common choices ("Last 7 days") beside the calendar
 * as ONE blended group of actions (joined rows, one surface) — picking one selects it and jumps the calendar there.
 */
export function Calendar({ className, ...props }: React.ComponentProps<typeof DayPicker>) {
  return (
    <DayPicker
      showOutsideDays
      animate
      className={cn("p-1 text-body", className)}
      // Roomy, easy targets (36px days). A range is ONE continuous band on the cells: rounded only on its outer
      // corners (start: left, end: right), square in between; start and end days are filled.
      classNames={{
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
        day: "size-control-xl p-0 text-center",
        day_button: "size-control-xl rounded-md text-body tabular-nums duration-fast-02 hover:bg-hover focus-ring",
        today: "font-semibold text-primary",
        selected: "[&>button]:bg-primary [&>button]:text-primary-foreground [&>button]:hover:bg-primary-hover",
        range_start: "rounded-l-md bg-selected last:rounded-r-md",
        range_end: "rounded-r-md bg-selected first:rounded-l-md",
        // each week row's band is one shape: rounded where the row's highlight begins and ends, even mid-range
        range_middle: "rounded-none bg-selected first:rounded-l-md last:rounded-r-md [&>button]:!rounded-none [&>button]:!bg-transparent [&>button]:!text-selected-foreground [&>button]:hover:!bg-hover",
        outside: "text-disabled-foreground",
        disabled: "text-disabled-foreground [&>button]:pointer-events-none",
        root: "relative",
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
      }}
      components={{
        Chevron: ({ orientation }) => <Icon as={orientation === "left" ? ChevronLeft : ChevronRight} />,
      }}
      {...props}
    />
  )
}

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
