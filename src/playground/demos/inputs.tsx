import * as React from "react"
import type { DemoMap } from "./types"
import { SwatchPicker } from "@/registry/ui/swatch-picker"
import { PreviewPicker } from "@/registry/ui/preview-picker"
import { Stack, Inline } from "@/registry/ui/layout"
import { Text } from "@/registry/ui/text"
import { Button } from "@/registry/ui/button"
import { Checkbox, CheckboxGroup } from "@/registry/ui/checkbox"
import { RadioGroup, RadioButton } from "@/registry/ui/radio-button"
import { TextInput, PasswordInput, TextArea } from "@/registry/ui/text-input"
import { HelperText } from "@/registry/ui/helper-text"
import { NumberInput } from "@/registry/ui/number-input"
import { Search } from "@/registry/ui/search"
import { Select, SelectOption, SelectGroup } from "@/registry/ui/select"
import { Dropdown, Combobox, MultiSelect } from "@/registry/ui/dropdown"
import { Option, OptionList } from "@/registry/ui/option"
import { Bot, Plug, UserAvatar, Flash, Image } from "@/registry/icons"
import { DatePicker, DateRangePicker, Calendar, CalendarDay, datePresets, rangePresets } from "@/registry/ui/date-picker"
import { Tile } from "@/registry/ui/tile"
import type { DateRange } from "react-day-picker"
import { Slider, StepSlider } from "@/registry/ui/slider"
import { Toggle } from "@/registry/ui/toggle"
import { FileUploader, type UploadFile } from "@/registry/ui/file-uploader"
import { Form, FormGroup, FormRow, FormActions, FluidForm } from "@/registry/ui/form"
import { Toggletip } from "@/registry/ui/popover"
import { Link } from "@/registry/ui/link"
import { gotcha } from "@/registry/ui/gotcha"

const countries = ["Austria", "Belgium", "Denmark", "France", "Germany", "Ireland", "Italy", "Netherlands", "Norway", "Poland", "Portugal", "Spain", "Sweden", "Switzerland", "United Kingdom"].map((c) => ({ value: c.toLowerCase(), label: c }))

function InlineCalendars() {
  const [day, setDay] = React.useState<Date | undefined>(() => new Date())
  const [range, setRange] = React.useState<DateRange | undefined>(() => ({ from: new Date(), to: new Date(Date.now() + 5 * 864e5) }))
  return (
    <Inline gap="lg" align="start" wrap>
      <Tile><Calendar mode="single" selected={day} onSelect={setDay} /></Tile>
      <Tile><Calendar mode="range" numberOfMonths={2} selected={range} onSelect={setRange} /></Tile>
    </Inline>
  )
}

function UploaderDemo({ variant }: { variant: "button" | "dropzone" }) {
  const [files, setFiles] = React.useState<UploadFile[]>([
    { id: "a", name: "refund-policy.pdf", status: "complete" },
    { id: "b", name: "help-center.pages", status: "error", error: "Pages files aren't supported. Export as PDF or Markdown and try again." },
  ])
  return (
    <FileUploader
      variant={variant}
      label="Knowledge sources"
      accept=".pdf,.md,.csv"
      maxSizeMb={10}
      files={files}
      onRemove={(id) => setFiles((f) => f.filter((x) => x.id !== id))}
      onFilesAdded={(added) => {
        const next = added.map((f) => ({ id: crypto.randomUUID(), name: f.name, status: "uploading" as const }))
        setFiles((f) => [...f, ...next])
        setTimeout(() => setFiles((f) => f.map((x) => (next.some((n) => n.id === x.id) ? { ...x, status: "complete" } : x))), 1200)
      }}
    />
  )
}

function FormDemo() {
  const [submitted, setSubmitted] = React.useState(false)
  const [email, setEmail] = React.useState("")
  const invalid = submitted && !/^\S+@\S+\.\S+$/.test(email)
  return (
    <Form onSubmit={(e) => { e.preventDefault(); setSubmitted(true); if (!invalid && email) gotcha("Workspace created") }}>
      <FormRow>
        <TextInput label="First name" autoComplete="given-name" />
        <TextInput label="Last name" autoComplete="family-name" />
      </FormRow>
      <TextInput label="Work email" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} invalid={invalid} invalidText="Enter an email address like name@company.com" />
      <TextInput label="Workspace name" optional helperText="Shown to everyone you invite" />
      <FormGroup legend="Notifications">
        <Checkbox label="Email me when an agent fails" defaultChecked />
        <Checkbox label="Weekly usage summary" helperText="Every Monday at 09:00" />
      </FormGroup>
      <Checkbox label={<>I agree to the <Link inline href="#">terms of service</Link></>} />
      <FormActions>
        <Button type="submit">Create workspace</Button>
      </FormActions>
    </Form>
  )
}

function SwatchDemo() {
  const [v, setV] = React.useState("blue")
  const hues = ["blue", "indigo", "purple", "pink", "red", "orange", "yellow", "green", "mint", "teal", "cyan", "brown"]
  return <SwatchPicker label="Label colour" size="sm" value={v} onValueChange={setV} items={hues.map((h) => ({ value: h, label: h[0].toUpperCase() + h.slice(1), color: `var(--vita-palette-${h}-500)` }))} className="max-w-sm" />
}

export const inputDemos: DemoMap = {
  "components/preview-picker": [
    {
      title: "Choose by seeing",
      description: "Each tile draws its own effect: here, the density of a list.",
      render: () => (
        <PreviewPicker
          label="Density"
          defaultValue="default"
          className="max-w-sm"
          items={[
            { value: "compact", label: "Compact", preview: <span className="flex w-8 flex-col gap-0.5">{[0, 1, 2].map((i) => <span key={i} className="h-0.5 rounded-full bg-current" />)}</span> },
            { value: "default", label: "Default", preview: <span className="flex w-8 flex-col gap-1">{[0, 1, 2].map((i) => <span key={i} className="h-0.5 rounded-full bg-current" />)}</span> },
            { value: "roomy", label: "Roomy", preview: <span className="flex w-8 flex-col gap-1.5">{[0, 1, 2].map((i) => <span key={i} className="h-0.5 rounded-full bg-current" />)}</span> },
          ]}
        />
      ),
    },
  ],
  "components/swatch-picker": [
    { title: "Choose a colour", description: "Every option visible, the chosen name beside the label. Arrows move the choice.", render: () => <SwatchDemo /> },
    {
      title: "Sizes",
      render: () => (
        <Stack gap="lg" className="max-w-sm">
          <SwatchPicker label="Small" size="sm" items={["blue", "green", "orange"].map((h) => ({ value: h, label: h[0].toUpperCase() + h.slice(1), color: `var(--vita-palette-${h}-500)` }))} />
          <SwatchPicker label="Medium" items={["blue", "green", "orange"].map((h) => ({ value: h, label: h[0].toUpperCase() + h.slice(1), color: `var(--vita-palette-${h}-500)` }))} />
        </Stack>
      ),
    },
  ],
  "components/text-input": [
    {
      title: "States",
      render: () => (
        <Stack gap="lg" className="max-w-sm">
          <TextInput label="Agent name" placeholder="e.g. Support triage" helperText="Visible to everyone in the workspace" />
          <TextInput label="Cost centre" optional labelAddon={<Toggletip>Used to split run costs on your invoice.</Toggletip>} />
          <TextInput label="Email" defaultValue="jacopo@" invalid invalidText="Enter a complete email address" />
          <TextInput label="Webhook URL" defaultValue="http://hooks.theo.dev/in" warn warnText="Use https in production" />
          <TextInput label="Workspace ID" defaultValue="ws_83hf72" readOnly helperText="Read-only" />
          <TextInput label="Disabled" disabled placeholder="Not available" />
          <TextInput label="Greeting" maxLength={60} showCount defaultValue="Hi! How can I help?" />
        </Stack>
      ),
    },
    { title: "Sizes", render: () => <Stack gap="md" className="max-w-sm"><TextInput size="sm" label="Small" /><TextInput size="md" label="Medium (default)" /><TextInput size="lg" label="Large" /></Stack> },
    { title: "Password & text area", render: () => <Stack gap="lg" className="max-w-sm"><PasswordInput label="API key" helperText="Stored encrypted. Shown once." /><TextArea label="Instructions" maxLength={280} showCount placeholder="What should this agent do, and never do?" /></Stack> },
  ],
  "components/number-input": [
    {
      title: "Default, units, bounds, invalid, read-only",
      render: () => (
        <Stack gap="lg" className="max-w-xs">
          <NumberInput label="Max concurrent runs" defaultValue={4} min={1} max={50} />
          <NumberInput label="Timeout" unit="s" defaultValue={30} step={5} min={5} />
          <NumberInput label="Agents" defaultValue={120} min={1} max={100} helperText="Max 100 on your plan" />
          <NumberInput label="Temperature" defaultValue={0.2} readOnly />
        </Stack>
      ),
    },
  ],
  "components/selection-highlight": [
    {
      title: "Select across lines",
      description: "Drag across the lines: each row has soft corners and melts into the next where they meet, with no transition.",
      render: () => (
        <Text className="max-w-prose">
          Support triage reads each new ticket, checks the help center and past resolutions, and answers when it is confident. When the customer asks for a person, it hands the conversation to the Support queue with a summary.
        </Text>
      ),
    },
  ],
  "components/search": [
    {
      title: "Field, toolbar, expandable, sizes",
      render: () => (
        <Stack gap="lg" className="max-w-md">
          <Search placeholder="Search agents" />
          <Search size="sm" variant="toolbar" placeholder="Small" shortcut="mod+shift+1" />
          <Search size="md" variant="toolbar" placeholder="Medium" shortcut="mod+shift+2" />
          <Search size="lg" variant="toolbar" placeholder="Large" shortcut="mod+shift+3" />
          <Inline><Search variant="expandable" /><Text tone="muted">← expandable</Text></Inline>
          <Search size="lg" placeholder="Large" />
        </Stack>
      ),
    },
  ],
  "components/select": [
    {
      title: "Native select",
      render: () => (
        <Stack gap="lg" className="max-w-xs">
          <Select label="Country">{countries.map((c) => <SelectOption key={c.value} value={c.value}>{c.label}</SelectOption>)}</Select>
          <Select label="Region" defaultValue="emea">
            <SelectGroup label="Europe"><SelectOption value="emea">EMEA</SelectOption><SelectOption value="uk">UK &amp; Ireland</SelectOption></SelectGroup>
            <SelectGroup label="Americas"><SelectOption value="na">North America</SelectOption><SelectOption value="latam">LATAM</SelectOption></SelectGroup>
          </Select>
          <Select label="Model" invalid invalidText="Choose a model"><SelectOption value="large">Theo Large</SelectOption></Select>
          <Select label="Disabled" disabled />
        </Stack>
      ),
    },
  ],
  "components/dropdown": [
    {
      title: "Dropdown · Combobox · Multiselect",
      render: () => (
        <Stack gap="lg" className="max-w-xs">
          <Dropdown label="Model" items={[{ value: "fast", label: "Theo Fast", description: "Lowest latency and cost" }, { value: "large", label: "Theo Large" }, { value: "vision", label: "Theo Vision", description: "Reads images and PDFs" }]} defaultValue="large" />
          <Combobox label="Country" items={countries} helperText="Type to filter" />
          <MultiSelect label="Data residency" items={countries.slice(0, 8)} defaultValue={["france", "germany"]} />
          <Dropdown label="Disabled" items={[]} disabled />
          <Inline gap="2xs"><Text tone="muted">Sort by</Text><Dropdown type="inline" label="Sort by" hideLabel items={[{ value: "new", label: "Newest" }, { value: "old", label: "Oldest" }]} defaultValue="new" /></Inline>
        </Stack>
      ),
    },
    {
      title: "Multiselect",
      description: "Open it: what's chosen sits at the top, the rest follow. Click anywhere on a row to toggle it.",
      render: () => <MultiSelect label="Data residency" items={countries.slice(0, 8)} defaultValue={["germany", "italy"]} className="max-w-xs" />,
    },
    {
      title: "Empty, with helper text",
      render: () => <MultiSelect label="Markets" items={countries.slice(0, 8)} helperText="Choose every market this agent answers for" className="max-w-xs" />,
    },
    {
      title: "Invalid and disabled",
      render: () => (
        <Stack gap="md" className="max-w-xs">
          <MultiSelect label="Teams" items={[{ value: "s", label: "Support" }, { value: "f", label: "Finance" }]} invalid invalidText="Choose at least one team" />
          <MultiSelect label="Unavailable" items={[]} disabled />
        </Stack>
      ),
    },
    {
      title: "States",
      description: "Default · highlighted (pointer or keyboard) · selected · selected and highlighted · disabled. One choice: the chosen option is a selected row, no tick.",
      render: () => (
        <OptionList>
          <Option label="Theo Large" />
          <Option label="Theo Fast" highlighted />
          <Option label="Theo Vision" selected />
          <Option label="Theo Voice" selected highlighted />
          <Option label="Theo Legacy" disabled />
        </OptionList>
      ),
    },
    {
      title: "With description",
      render: () => (
        <OptionList>
          <Option label="Theo Large" description="Most capable, slower" selected />
          <Option label="Theo Fast" description="Quick answers, lower cost" highlighted />
          <Option label="Theo Vision" description="Reads images and documents" />
        </OptionList>
      ),
    },
    {
      title: "With icon",
      render: () => (
        <OptionList>
          <Option icon={Bot} label="Agents" selected />
          <Option icon={Plug} label="Integrations" />
          <Option icon={UserAvatar} label="People" highlighted />
        </OptionList>
      ),
    },
    {
      title: "Right side: meta, meta + symbol, symbol",
      description: "A small label on the right, a label followed by a symbol, or a symbol alone.",
      render: () => (
        <OptionList>
          <Option label="Theo Large" meta="Default" selected />
          <Option label="Theo Fast" meta="2× faster" trailingIcon={Flash} highlighted />
          <Option label="Theo Vision" trailingIcon={Image} />
          <Option label="Theo Voice" meta="Beta" />
        </OptionList>
      ),
    },
    {
      title: "Live, with meta and symbols",
      render: () => (
        <Dropdown
          label="Model"
          defaultValue="l"
          className="max-w-xs"
          items={[
            { value: "l", label: "Theo Large", meta: "Default" },
            { value: "f", label: "Theo Fast", meta: "2× faster", trailingIcon: Flash },
            { value: "v", label: "Theo Vision", trailingIcon: Image },
          ]}
        />
      ),
    },
    {
      title: "Multiple selection",
      description: "Several ticks; the whole row toggles. Never a checkbox inside the row.",
      render: () => (
        <OptionList multiple>
          <Option multiple label="France" selected />
          <Option multiple label="Germany" selected highlighted />
          <Option multiple label="Italy" />
          <Option multiple label="Spain" />
        </OptionList>
      ),
    },
    {
      title: "Live, in each dropdown",
      render: () => (
        <Stack gap="md" className="max-w-xs">
          <Dropdown label="Model" defaultValue="l" items={[{ value: "l", label: "Theo Large" }, { value: "f", label: "Theo Fast" }]} />
          <MultiSelect label="Countries" defaultValue={["fr", "de"]} items={[{ value: "fr", label: "France" }, { value: "de", label: "Germany" }, { value: "it", label: "Italy" }, { value: "es", label: "Spain" }]} />
        </Stack>
      ),
    }
  ],
  "components/date-picker": [
    {
      title: "Simple · Single · Range",
      render: () => (
        <Stack gap="lg">
          <DatePicker mode="simple" label="Contract start" helperText="Type the date, no calendar needed" />
          <DatePicker label="Go-live date" minDate={new Date()} />
          <DateRangePicker startLabel="From" endLabel="To" />
          <DatePicker label="Invalid" invalid invalidText="Go-live must be a weekday" />
        </Stack>
      ),
    },
    {
      title: "Day states",
      description: "The day button on its own, in every state it can take.",
      render: () => (
        <div className="flex flex-wrap gap-6">
          {([
            ["Default", 12, "default"],
            ["Today", 1, "today"],
            ["Selected", 24, "selected"],
            ["Range start", 9, "range-start"],
            ["Range middle", 13, "range-middle"],
            ["Range end", 17, "range-end"],
            ["Outside the month", 30, "outside"],
            ["Disabled", 10, "disabled"],
          ] as const).map(([name, day, state]) => (
            <Stack key={state} gap="xs" align="center">
              <CalendarDay day={day} state={state} />
              <Text variant="caption" tone="helper">{name}</Text>
            </Stack>
          ))}
        </div>
      ),
    },
    {
      title: "One or two months",
      description: "Single dates usually need one month; ranges read best across two.",
      render: () => (
        <Stack gap="lg">
          <DatePicker label="Review date" months={2} />
          <DateRangePicker startLabel="From" endLabel="To" months={1} />
        </Stack>
      ),
    },
    {
      title: "With presets",
      description: "Common choices sit beside the calendar as one blended group; picking one selects it and jumps there.",
      render: () => (
        <Stack gap="lg">
          <DatePicker label="Go-live date" presets={datePresets} />
          <DateRangePicker startLabel="From" endLabel="To" presets={rangePresets} />
        </Stack>
      ),
    },
    {
      title: "Inline calendars",
      render: () => <InlineCalendars />,
    },
  ],
  "components/checkbox": [
    {
      title: "States & group",
      render: () => (
        <Stack gap="lg">
          <CheckboxGroup legend="Channels" helperText="Select all that apply">
            <Checkbox label="Web chat" defaultChecked />
            <Checkbox label="Email" />
            <Checkbox label="Voice" helperText="Uses Theo Voice, billed per minute" />
            <Checkbox label="WhatsApp" disabled />
          </CheckboxGroup>
          <Checkbox label="Select all (indeterminate)" checked="indeterminate" />
          <CheckboxGroup legend="Terms" invalid invalidText="You must accept to continue"><Checkbox label="I accept the terms" invalid /></CheckboxGroup>
        </Stack>
      ),
    },
  ],
  "components/radio-button": [
    {
      title: "Vertical, horizontal, invalid",
      render: () => (
        <Stack gap="lg">
          <RadioGroup legend="Environment" defaultValue="standard">
            <RadioButton value="standard" label="Staging" helperText="Test with sample data · Free" />
            <RadioButton value="express" label="Production" helperText="Real users · billed per run" />
            <RadioButton value="same" label="Dedicated" disabled helperText="Available on Enterprise" />
          </RadioGroup>
          <RadioGroup legend="Units" orientation="horizontal" defaultValue="metric"><RadioButton value="metric" label="Metric" /><RadioButton value="imperial" label="Imperial" /></RadioGroup>
          <RadioGroup legend="Plan" invalid invalidText="Choose a plan"><RadioButton value="a" label="Team" /><RadioButton value="b" label="Enterprise" /></RadioGroup>
        </Stack>
      ),
    },
  ],
  "components/toggle": [
    {
      title: "Toggle",
      render: () => (
        <Stack gap="md" className="max-w-sm">
          <Toggle label="Human handoff" defaultChecked />
          <Toggle label="Log conversations" helperText="Kept for 30 days" />
          <Toggle label="Auto-deploy" stateText defaultChecked labelPosition="end" />
          <Toggle label="Small" size="sm" />
          <Toggle label="Disabled" disabled />
        </Stack>
      ),
    },
  ],
  "components/slider": [
    {
      title: "Single, range, formatted, without bounds",
      render: () => (
        <Stack gap="xl" className="max-w-md">
          <Slider label="Creativity" defaultValue={[40]} />
          <Slider label="Monthly budget" min={0} max={2000} step={50} defaultValue={[200, 1200]} formatValue={(v) => `$${v}`} />
          <Slider label="Confidence threshold" defaultValue={[80]} formatValue={(v) => `${v}%`} helperText="Below this, the agent hands off to a person" />
          <Slider label="Volume" showBounds={false} defaultValue={[60]} helperText="Without bounds, when the ends need no number" />
          <Slider label="Disabled" disabled defaultValue={[30]} />
        </Stack>
      ),
    },
    {
      title: "Stepped, for ordered steps of one property",
      description: "A size, a density, a level: the knob lands only on the steps, and shows the step by name.",
      render: () => (
        <Stack gap="xl" className="max-w-md">
          <StepSlider label="Pictogram size" hideLabel defaultValue="lg" steps={[{ value: "md", label: "Small" }, { value: "lg", label: "Medium" }, { value: "xl", label: "Large" }]} />
          <StepSlider label="Density" defaultValue="default" steps={[{ value: "compact", label: "Compact" }, { value: "default", label: "Default" }, { value: "roomy", label: "Roomy" }]} />
        </Stack>
      ),
    },
  ],
  "components/file-uploader": [
    { title: "Drop zone", render: () => <UploaderDemo variant="dropzone" /> },
    { title: "Button", render: () => <UploaderDemo variant="button" /> },
  ],
  "components/helper-text": [
    { title: "Helper text", description: "One small, muted line that says how to use what it sits under.", render: () => <HelperText>Visible to everyone in the workspace</HelperText> },
    {
      title: "Under a field",
      description: "A field's helperText is the same line, set for you.",
      render: () => <TextInput label="Workspace name" helperText="Visible to everyone in the workspace" className="max-w-sm" />,
    },
  ],
  "components/form": [
    { title: "Default form", description: "Submit empty to see validation.", render: () => <FormDemo /> },
    {
      title: "Fluid form, one column, pairs blend",
      description: "Every field in one container. The budget range is one data point, so its two ends share a row.",
      render: () => (
        <FluidForm className="max-w-xl">
          <TextInput label="Agent name" defaultValue="Support triage" />
          <TextInput label="Owner" />
          <Select label="Model" defaultValue="large"><SelectOption value="large">Theo Large</SelectOption><SelectOption value="fast">Theo Fast</SelectOption></Select>
          <FormRow><TextInput label="Monthly budget from" defaultValue="$200" /><TextInput label="to" defaultValue="$1,200" /></FormRow>
          <TextInput label="Max tokens" invalid invalidText="Enter a number from 256 to 32,000" defaultValue="abc" />
        </FluidForm>
      ),
    },
  ],
}
