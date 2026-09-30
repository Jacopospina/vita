import * as React from "react"
import type { DemoMap } from "./types"
import { Stack, Inline } from "@/registry/ui/layout"
import { Text } from "@/registry/ui/text"
import { Button } from "@/registry/ui/button"
import { Checkbox, CheckboxGroup } from "@/registry/ui/checkbox"
import { RadioGroup, RadioButton } from "@/registry/ui/radio-button"
import { TextInput, PasswordInput, TextArea } from "@/registry/ui/text-input"
import { NumberInput } from "@/registry/ui/number-input"
import { Search } from "@/registry/ui/search"
import { Select, SelectOption, SelectGroup } from "@/registry/ui/select"
import { Dropdown, Combobox, MultiSelect } from "@/registry/ui/dropdown"
import { DatePicker, DateRangePicker } from "@/registry/ui/date-picker"
import { Slider } from "@/registry/ui/slider"
import { Toggle } from "@/registry/ui/toggle"
import { FileUploader, type UploadFile } from "@/registry/ui/file-uploader"
import { Form, FormGroup, FormRow, FormActions, FluidForm } from "@/registry/ui/form"
import { Toggletip } from "@/registry/ui/popover"
import { Link } from "@/registry/ui/link"
import { toast } from "@/registry/ui/notification"

const countries = ["Austria", "Belgium", "Denmark", "France", "Germany", "Ireland", "Italy", "Netherlands", "Norway", "Poland", "Portugal", "Spain", "Sweden", "Switzerland", "United Kingdom"].map((c) => ({ value: c.toLowerCase(), label: c }))

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
    <Form onSubmit={(e) => { e.preventDefault(); setSubmitted(true); if (!invalid && email) toast({ kind: "success", title: "Workspace created" }) }}>
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
        <Button type="button" variant="ghost">Cancel</Button>
      </FormActions>
    </Form>
  )
}

export const inputDemos: DemoMap = {
  "components/text-input": [
    {
      title: "States",
      render: () => (
        <Stack gap="lg" className="max-w-sm">
          <TextInput label="Agent name" placeholder="e.g. Support triage" helperText="Visible to everyone in the workspace" />
          <TextInput label="Cost centre" optional labelAddon={<Toggletip>Used to split run costs on your invoice.</Toggletip>} />
          <TextInput label="Email" defaultValue="jacopo@" invalid invalidText="Enter a complete email address" />
          <TextInput label="Webhook URL" defaultValue="http://hooks.vita.dev/in" warn warnText="Use https in production" />
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
  "components/search": [
    {
      title: "Field, toolbar, expandable, sizes",
      render: () => (
        <Stack gap="lg" className="max-w-md">
          <Search placeholder="Search agents" />
          <Search size="sm" variant="toolbar" placeholder="Search runs" />
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
          <Select label="Country" placeholder="Choose a country">{countries.map((c) => <SelectOption key={c.value} value={c.value}>{c.label}</SelectOption>)}</Select>
          <Select label="Region" defaultValue="emea">
            <SelectGroup label="Europe"><SelectOption value="emea">EMEA</SelectOption><SelectOption value="uk">UK &amp; Ireland</SelectOption></SelectGroup>
            <SelectGroup label="Americas"><SelectOption value="na">North America</SelectOption><SelectOption value="latam">LATAM</SelectOption></SelectGroup>
          </Select>
          <Select label="Model" invalid invalidText="Choose a model" placeholder="Choose"><SelectOption value="large">Vita Large</SelectOption></Select>
          <Select label="Disabled" disabled placeholder="Unavailable" />
        </Stack>
      ),
    },
  ],
  "components/dropdown": [
    {
      title: "Dropdown · Combobox · Multiselect",
      render: () => (
        <Stack gap="lg" className="max-w-xs">
          <Dropdown label="Model" items={[{ value: "fast", label: "Vita Fast", description: "Lowest latency and cost" }, { value: "large", label: "Vita Large" }, { value: "vision", label: "Vita Vision", description: "Reads images and PDFs" }]} defaultValue="large" />
          <Combobox label="Country" items={countries} helperText="Type to filter" />
          <MultiSelect label="Data residency" items={countries.slice(0, 8)} defaultValue={["france", "germany"]} />
          <Dropdown label="Disabled" items={[]} disabled />
          <Inline gap="2xs"><Text tone="muted">Sort by</Text><Dropdown type="inline" label="Sort by" hideLabel items={[{ value: "new", label: "Newest" }, { value: "old", label: "Oldest" }]} defaultValue="new" /></Inline>
        </Stack>
      ),
    },
  ],
  "components/date-picker": [
    {
      title: "Simple · Single · Range",
      render: () => (
        <Stack gap="lg">
          <DatePicker mode="simple" label="Contract start" helperText="Type the date — no calendar needed" />
          <DatePicker label="Go-live date" minDate={new Date()} />
          <DateRangePicker startLabel="From" endLabel="To" />
          <DatePicker label="Invalid" invalid invalidText="Go-live must be a weekday" />
        </Stack>
      ),
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
            <Checkbox label="Voice" helperText="Uses Vita Voice, billed per minute" />
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
      title: "Single, range, formatted",
      render: () => (
        <Stack gap="xl" className="max-w-md">
          <Slider label="Creativity" defaultValue={[40]} />
          <Slider label="Monthly budget" min={0} max={2000} step={50} defaultValue={[200, 1200]} formatValue={(v) => `$${v}`} />
          <Slider label="Confidence threshold" defaultValue={[80]} formatValue={(v) => `${v}%`} helperText="Below this, the agent hands off to a person" />
          <Slider label="Disabled" disabled defaultValue={[30]} />
        </Stack>
      ),
    },
  ],
  "components/file-uploader": [
    { title: "Drop zone", render: () => <UploaderDemo variant="dropzone" /> },
    { title: "Button", render: () => <UploaderDemo variant="button" /> },
  ],
  "components/form": [
    { title: "Default form", description: "Submit empty to see validation.", render: () => <FormDemo /> },
    {
      title: "Fluid form",
      render: () => (
        <FluidForm>
          <TextInput label="Agent name" defaultValue="Support triage" />
          <TextInput label="Owner" />
          <Select label="Model" defaultValue="large"><SelectOption value="large">Vita Large</SelectOption><SelectOption value="fast">Vita Fast</SelectOption></Select>
          <TextInput label="Max tokens" invalid invalidText="Enter a number from 256 to 32,000" defaultValue="abc" />
        </FluidForm>
      ),
    },
  ],
}
