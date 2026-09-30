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
    { id: "a", name: "rate-card-2026.pdf", status: "complete" },
    { id: "b", name: "invoice-scan.heic", status: "error", error: "HEIC isn't supported. Export as JPG or PDF and try again." },
  ])
  return (
    <FileUploader
      variant={variant}
      label="Supporting documents"
      accept=".pdf,.jpg,.png"
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
    <Form onSubmit={(e) => { e.preventDefault(); setSubmitted(true); if (!invalid && email) toast({ kind: "success", title: "Account created" }) }}>
      <FormRow>
        <TextInput label="First name" autoComplete="given-name" />
        <TextInput label="Last name" autoComplete="family-name" />
      </FormRow>
      <TextInput label="Work email" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} invalid={invalid} invalidText="Enter an email address like name@company.com" />
      <TextInput label="Company" optional helperText="Shown on quotes you send" />
      <FormGroup legend="Notifications">
        <Checkbox label="Email me when a quote is accepted" defaultChecked />
        <Checkbox label="Weekly summary" helperText="Every Monday at 09:00" />
      </FormGroup>
      <Checkbox label={<>I agree to the <Link inline href="#">terms of service</Link></>} />
      <FormActions>
        <Button type="submit">Create account</Button>
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
          <TextInput label="Project name" placeholder="e.g. Q3 forecast" helperText="Visible to everyone in the workspace" />
          <TextInput label="Reference" optional labelAddon={<Toggletip>Your internal PO or job number. Appears on the invoice.</Toggletip>} />
          <TextInput label="Email" defaultValue="jacopo@" invalid invalidText="Enter a complete email address" />
          <TextInput label="Budget code" defaultValue="MKT-2026" warn warnText="This code closes on 31 Oct" />
          <TextInput label="Workspace ID" defaultValue="ws_83hf72" readOnly helperText="Read-only" />
          <TextInput label="Disabled" disabled placeholder="Not available" />
          <TextInput label="Title" maxLength={60} showCount defaultValue="Quarterly review" />
        </Stack>
      ),
    },
    { title: "Sizes", render: () => <Stack gap="md" className="max-w-sm"><TextInput size="sm" label="Small" /><TextInput size="md" label="Medium (default)" /><TextInput size="lg" label="Large" /></Stack> },
    { title: "Password & text area", render: () => <Stack gap="lg" className="max-w-sm"><PasswordInput label="Password" helperText="At least 12 characters" /><TextArea label="Description" maxLength={280} showCount placeholder="What is this project about?" /></Stack> },
  ],
  "components/number-input": [
    {
      title: "Default, units, bounds, invalid, read-only",
      render: () => (
        <Stack gap="lg" className="max-w-xs">
          <NumberInput label="Quantity" defaultValue={1} min={1} max={99} />
          <NumberInput label="Weight" unit="kg" defaultValue={12.5} step={0.5} min={0} />
          <NumberInput label="Seats" defaultValue={120} min={1} max={100} helperText="Max 100 on your plan" />
          <NumberInput label="Rate" defaultValue={4} readOnly unit="%" />
        </Stack>
      ),
    },
  ],
  "components/search": [
    {
      title: "Field, toolbar, expandable, sizes",
      render: () => (
        <Stack gap="lg" className="max-w-md">
          <Search placeholder="Search projects" />
          <Search size="sm" variant="toolbar" placeholder="Search in table" />
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
          <Select label="Currency" invalid invalidText="Choose a currency" placeholder="Choose"><SelectOption value="eur">EUR</SelectOption></Select>
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
          <Dropdown label="Priority" items={[{ value: "low", label: "Low", description: "Handle this week" }, { value: "normal", label: "Normal" }, { value: "high", label: "High", description: "Handle today" }]} defaultValue="normal" />
          <Combobox label="Country" items={countries} helperText="Type to filter" />
          <MultiSelect label="Markets" items={countries.slice(0, 8)} defaultValue={["france", "germany"]} />
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
          <DatePicker mode="simple" label="Date of birth" helperText="Type the date — no calendar needed" />
          <DatePicker label="Pickup date" minDate={new Date()} />
          <DateRangePicker startLabel="From" endLabel="To" />
          <DatePicker label="Invalid" invalid invalidText="Pickup must be a weekday" />
        </Stack>
      ),
    },
  ],
  "components/checkbox": [
    {
      title: "States & group",
      render: () => (
        <Stack gap="lg">
          <CheckboxGroup legend="Transport modes" helperText="Select all that apply">
            <Checkbox label="Road" defaultChecked />
            <Checkbox label="Sea" />
            <Checkbox label="Air" helperText="Surcharges may apply" />
            <Checkbox label="Rail" disabled />
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
          <RadioGroup legend="Shipping speed" defaultValue="standard">
            <RadioButton value="standard" label="Standard" helperText="3–5 working days · Free" />
            <RadioButton value="express" label="Express" helperText="Next working day · €12" />
            <RadioButton value="same" label="Same day" disabled helperText="Not available in your area" />
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
          <Toggle label="Email notifications" defaultChecked />
          <Toggle label="Dark mode" helperText="Follows your system unless set" />
          <Toggle label="Auto-renew" stateText defaultChecked labelPosition="end" />
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
          <Slider label="Volume" defaultValue={[40]} />
          <Slider label="Price range" min={0} max={2000} step={50} defaultValue={[200, 1200]} formatValue={(v) => `€${v}`} />
          <Slider label="Opacity" defaultValue={[80]} formatValue={(v) => `${v}%`} helperText="Applies to the whole layer" />
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
          <TextInput label="First name" defaultValue="Jacopo" />
          <TextInput label="Last name" />
          <Select label="Country" defaultValue="italy"><SelectOption value="italy">Italy</SelectOption><SelectOption value="uk">United Kingdom</SelectOption></Select>
          <TextInput label="Postcode" invalid invalidText="Enter a valid postcode" defaultValue="ABC" />
        </FluidForm>
      ),
    },
  ],
}
