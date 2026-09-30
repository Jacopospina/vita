import * as React from "react"
import { DayPicker, type DateRange } from "react-day-picker"
import { format, isValid, parse } from "date-fns"
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
 */
export function Calendar({ className, ...props }: React.ComponentProps<typeof DayPicker>) {
  return (
    <DayPicker
      showOutsideDays
      className={cn("p-1 text-body", className)}
      classNames={{
        months: "flex flex-col gap-4 sm:flex-row",
        month: "flex flex-col gap-2",
        month_caption: "flex h-control-sm items-center justify-center font-semibold",
        nav: "absolute inset-x-1 top-1 flex justify-between",
        button_previous: "flex size-control-sm items-center justify-center rounded-sm hover:bg-hover focus-ring",
        button_next: "flex size-control-sm items-center justify-center rounded-sm hover:bg-hover focus-ring",
        month_grid: "border-collapse",
        weekdays: "flex",
        weekday: "w-control-sm text-caption font-normal text-helper",
        week: "mt-0.5 flex",
        day: "size-control-sm p-0 text-center",
        day_button: "size-control-sm rounded-sm tabular-nums transition-colors hover:bg-hover focus-ring",
        today: "font-semibold text-primary",
        selected: "[&>button]:bg-primary [&>button]:text-primary-foreground [&>button]:hover:bg-primary-hover",
        range_middle: "[&>button]:!bg-selected [&>button]:!text-selected-foreground rounded-none",
        range_start: "",
        range_end: "",
        outside: "text-disabled-foreground",
        disabled: "text-disabled-foreground [&>button]:pointer-events-none",
        root: "relative",
      }}
      components={{
        Chevron: ({ orientation }) => <Icon as={orientation === "left" ? ChevronLeft : ChevronRight} />,
      }}
      {...props}
    />
  )
}

const FMT = "dd/MM/yyyy"

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
        className={cn(fieldClasses, fieldSize[size], onOpen && "pr-10")}
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
  value?: Date
  onValueChange?: (d: Date | undefined) => void
  size?: FieldSize
  disabled?: boolean
  minDate?: Date
  maxDate?: Date
  className?: string
}

export function DatePicker({ mode = "single", value, onValueChange, size = "md", disabled, minDate, maxDate, className, ...field }: DatePickerProps) {
  const [inner, setInner] = React.useState<Date | undefined>(value)
  const [open, setOpen] = React.useState(false)
  const current = value ?? inner
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
          <PopoverContent className="w-auto p-3">
            <Calendar mode="single" selected={current} defaultMonth={current} disabled={[...(minDate ? [{ before: minDate }] : []), ...(maxDate ? [{ after: maxDate }] : [])]} onSelect={(d) => { set(d); setOpen(false) }} autoFocus />
          </PopoverContent>
        </Popover>
      )}
    </FieldShell>
  )
}

export function DateRangePicker({ value, onValueChange, size = "md", disabled, className, startLabel = "Start date", endLabel = "End date", ...field }: Omit<DatePickerProps, "mode" | "value" | "onValueChange" | "label"> & {
  label?: React.ReactNode
  value?: DateRange
  onValueChange?: (r: DateRange | undefined) => void
  startLabel?: string
  endLabel?: string
}) {
  const [inner, setInner] = React.useState<DateRange | undefined>(value)
  const [open, setOpen] = React.useState(false)
  const current = value ?? inner
  const set = (r: DateRange | undefined) => { setInner(r); onValueChange?.(r) }
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
      <PopoverContent className="w-auto p-3">
        <Calendar mode="range" numberOfMonths={2} selected={current} defaultMonth={current?.from} onSelect={set} autoFocus />
      </PopoverContent>
    </Popover>
  )
}
