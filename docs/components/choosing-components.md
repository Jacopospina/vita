---
title: Choosing a component
summary: The decision guide. Agents read this BEFORE picking any component. Start from the user's intent, not from the component you remember.
status: stable
---

> Rule zero: if two components could work, pick the one that shows the user **more context with fewer clicks**. If it's still a tie, pick the **simpler** one.

## 1. The user wants to DO something

| Intent | Use | Not |
|---|---|---|
| The main action of a view | `Button` primary (exactly one) | Two primaries, a link |
| Secondary actions next to the primary | `Button` secondary/tertiary, in a `ButtonSet` | More primaries |
| Low-emphasis or repeated actions (toolbars, rows) | `Button` ghost / `IconButton` | Tertiary everywhere |
| Several related actions under one label ("Export ▾") | `MenuButton` | A dropdown (dropdowns pick values) |
| One default action + variations ("Save" + "Save as…") | `ComboButton` | Two separate buttons |
| Secondary actions on a row, card or tile | `OverflowMenu` (⋮) | Rows of icon buttons (max 2 visible) |
| Destructive action | `Button` danger **inside** a `ConfirmModal` | A danger button that acts immediately |
| Go somewhere | `Link` (text) / `ClickableTile` (card) | A button that navigates |
| Format text | `Toolbar` (Text toolbar pattern) | A row of loose icon buttons |

## 2. The user wants to CHOOSE something

```
How many options?
├─ 2, and it's on/off
│   ├─ takes effect immediately ............ Toggle
│   └─ applies on submit ................... Checkbox
├─ 2–6, pick ONE ......................... RadioGroup (all visible = faster)
│   └─ options are rich (plans, templates) .. SelectableTile (single)
├─ 2–5, switching the VIEW of the same data .. ContentSwitcher
├─ a few ordered steps of ONE property (size) . StepSlider
├─ 7–20, pick ONE
│   ├─ need icons/descriptions/custom UI .... Dropdown
│   └─ options written inline, grouped ..... Select
├─ > 20, pick ONE, user knows what to type .. Combobox
├─ several of ≤ 6 ......................... CheckboxGroup
├─ several of > 6 ......................... MultiSelect
├─ a number
│   ├─ exact value ......................... NumberInput
│   └─ approximate / relative .............. Slider (+ visible value)
├─ a date ................................ DatePicker (simple if far away, single if near, range for periods)
└─ a file ................................ FileUploader
```

## 2b. The user wants to choose a COLOUR

| Need | Use | Not |
|---|---|---|
| One colour from a small set | `SwatchPicker` | A hue slider, a Dropdown of colour names |
| A precise or continuous colour | `Slider` / `TextInput` | A wall of swatches |
| A setting whose effect is visual (radius, density, size, speed) | `PreviewPicker` | A slider with a number |

## 3. The user wants to ENTER something

| Input | Use |
|---|---|
| Short text (≤ 1 line) | `TextInput` |
| Long text | `TextArea` |
| Password | `PasswordInput` |
| Search a collection | `Search` |
| Numeric identifiers (phone, card, postcode) | `TextInput inputMode="numeric"` (these are not quantities) |
| Many fields for experts, dense | `FluidForm` (Fluid styles pattern) |

## 4. The user wants to SEE a collection

```
Are items uniform records with the same attributes?
├─ yes
│   ├─ need sort / select / bulk actions / > 10 rows ... DataTable (+ Pagination)
│   └─ few rows, read-mostly, key/value or comparison .. StructuredList
└─ no / items are "things" with an action each
    ├─ simple rows with a trailing action ............ ContainedList
    ├─ visual cards, one destination each ............ ClickableTile grid
    ├─ hierarchy of unknown depth .................... TreeView
    └─ bullet points in content ...................... List
```

## 5. The user wants to ORGANISE a page

| Need | Use | Not |
|---|---|---|
| Peer views of one object (Overview · Activity · Settings) | `Tabs` | ContentSwitcher |
| Same data, different presentation (List · Grid) | `ContentSwitcher` | Tabs |
| The same content at a different scale (size 48 · 64 · 80, density, zoom) | `StepSlider` | Tabs, ContentSwitcher |
| Many sections the user scans by title (FAQ, filters) | `Accordion` | Tabs (> 6) |
| One optional section ("Advanced options") | `Disclosure` / `ExpandableTile` | A one-item accordion |
| Where am I in a deep hierarchy | `Breadcrumb` | A back button only |
| Steps the user completes | `ProgressIndicator` | Tabs |
| Group related content | `Tile` | Nested tiles |

## 6. The system wants to TELL the user something

| Situation | Use |
|---|---|
| "Done": the user's action succeeded | `toast` (success, auto-dismiss) |
| Glanceable "it connected / it's syncing" with a live value | `capsule` (icon · title · story) |
| Something needs fixing, tied to a section | `InlineNotification` near the cause |
| Must decide before continuing | `ConfirmModal` / `Modal` |
| Static guidance in content | `Callout` |
| State of an object | `StatusIndicator` (or `Tag` in dense rows) |
| Name or explain an icon/term on hover | `Tooltip` / `DefinitionTooltip` |
| Explanation with a link or rich content | `Toggletip` / `Popover` |
| Content made by AI | `AILabel` + `AISurface` |

## 7. Something is LOADING

| Situation | Use |
|---|---|
| < 300ms | Nothing |
| Layout known | `Skeleton` (preferred) for shapes: avatars, images, cards |
| Text whose style is known (a title, a name, a value) | `ScrambleText`: glyphs change one by one in the real typeface, each blurring out as the next blurs in, then the text lands |
| One action in progress | `Button loading` or `InlineLoading` |
| Measurable progress | `ProgressBar` |
| Region with unknown layout | `Loading` / `Thinking` (mode: basic, retrieving, generating, searching), `overlay` only if interaction must be blocked |
| A voice agent waiting, listening or speaking | `Thinking` idle / listening / talking |

## 8. The user wants to TALK to an agent

| Need | Use | Not |
|---|---|---|
| A voice conversation with an agent | `ConversationBar` (+ `useMicrophone`) | A record button and a spinner |
| Show that the microphone hears them, or that the agent is speaking | `LiveWaveform` | A pulsing dot, a fake animation |
| Pick, test and mute the microphone | `MicSelector` | A plain Dropdown of device ids |
| Show whose turn it is | `Thinking` idle / listening / talking | A status text alone |
| Dictate into a field | `Composer` (its microphone) | A ConversationBar |

## 9. Layers: what floats over what

| Needs the page visible? | Blocks interaction? | Use |
|---|---|---|
| No | Yes | `Modal` |
| Yes | No, large content | `RightPanel` |
| Yes | No, small content anchored to a control | `Popover` |
| Yes | No, text only | `Tooltip` |

## Red flags

If you catch yourself doing any of these, stop and re-read this page:

- Writing a `div` with `onClick`.
- A placeholder used as the only label.
- A search that shows blank space when nothing matches.
- A shortcut that no tooltip shows.
- Filters applied but not visible as tags.
- A second primary button.
- A modal that opens another modal.
- A tooltip containing a link.
- A table with one column.
- Tabs with one tab.
- An accordion with one item.
- A dropdown with two options.
- A checkbox that saves instantly.
