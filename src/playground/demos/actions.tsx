import * as React from "react"
import { Add, Download, Edit, TrashCan, Copy, Share, Settings, Filter, TextBold, TextItalic, TextUnderline, ListBulleted, List as ListIcon, Grid as GridIcon, Save } from "@/registry/icons"
import type { DemoMap } from "./types"
import { Stack, Inline } from "@/registry/ui/layout"
import { Text } from "@/registry/ui/text"
import { Button, IconButton, ButtonSet } from "@/registry/ui/button"
import { Link } from "@/registry/ui/link"
import { Menu, MenuTrigger, MenuContent, MenuItem, MenuSeparator, MenuLabel, MenuCheckboxItem, MenuSub, MenuSubTrigger, MenuSubContent, ContextMenu, ContextMenuTrigger, ContextMenuContent, ContextMenuItem } from "@/registry/ui/menu"
import { MenuButton, ComboButton, OverflowMenu } from "@/registry/ui/menu-button"
import { ContentSwitcher } from "@/registry/ui/content-switcher"
import { CodeSnippet } from "@/registry/ui/code-snippet"
import { AILabel, AISurface } from "@/registry/ui/ai-label"
import { TextInput } from "@/registry/ui/text-input"
import { Tile } from "@/registry/ui/tile"
import { toast } from "@/registry/ui/notification"
import { Breadcrumb } from "@/registry/ui/breadcrumb"

function MenuDemo() {
  const [grid, setGrid] = React.useState(true)
  return (
    <Inline gap="lg" wrap>
      <Menu>
        <MenuTrigger asChild><Button variant="secondary">Open menu</Button></MenuTrigger>
        <MenuContent>
          <MenuLabel>Project</MenuLabel>
          <MenuItem icon={Edit} shortcut="⌘E">Rename</MenuItem>
          <MenuItem icon={Copy} shortcut="⌘D">Duplicate</MenuItem>
          <MenuSub>
            <MenuSubTrigger>Share</MenuSubTrigger>
            <MenuSubContent>
              <MenuItem>Copy link</MenuItem>
              <MenuItem>Invite people</MenuItem>
            </MenuSubContent>
          </MenuSub>
          <MenuSeparator />
          <MenuCheckboxItem checked={grid} onCheckedChange={setGrid}>Show grid</MenuCheckboxItem>
          <MenuSeparator />
          <MenuItem icon={TrashCan} danger>Delete</MenuItem>
        </MenuContent>
      </Menu>
      <ContextMenu>
        <ContextMenuTrigger asChild>
          <Tile className="w-64 cursor-context-menu">Right-click this tile</Tile>
        </ContextMenuTrigger>
        <ContextMenuContent>
          <ContextMenuItem icon={Edit}>Rename</ContextMenuItem>
          <ContextMenuItem icon={Share}>Share</ContextMenuItem>
          <ContextMenuItem icon={TrashCan} danger>Delete</ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>
    </Inline>
  )
}

function AIDemo() {
  const [value, setValue] = React.useState("Acme Logistics GmbH")
  return (
    <Stack gap="lg">
      <Inline gap="md"><AILabel size="xs" /><AILabel size="sm" /><AILabel size="md" /></Inline>
      <div className="max-w-sm">
        <TextInput
          label="Company name"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          labelAddon={
            <AILabel size="xs" title="Autofilled from the email" onRevert={() => setValue("")}>
              Extracted from the sender signature with 92% confidence. Model: claude-sonnet-5-5.
            </AILabel>
          }
        />
      </div>
      <AISurface className="max-w-md">
        <Inline justify="between"><Text variant="headline">Suggested reply</Text><AILabel size="sm" /></Inline>
        <Text tone="muted" className="mt-2">Thanks for the request — we can ship 12 pallets from Rotterdam on Monday. I've attached the quote.</Text>
        <Inline className="mt-4"><Button size="sm">Use reply</Button><Button size="sm" variant="ghost">Regenerate</Button></Inline>
      </AISurface>
    </Stack>
  )
}

export const actionDemos: DemoMap = {
  "components/button": [
    {
      title: "Hierarchy",
      description: "One primary per view. Step down: secondary → tertiary → ghost.",
      render: () => (
        <Inline wrap gap="sm">
          <Button>Primary</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="tertiary">Tertiary</Button>
          <Button variant="ghost">Ghost</Button>
        </Inline>
      ),
    },
    {
      title: "Danger",
      description: "Only for destructive actions, usually inside a confirmation.",
      render: () => (
        <Inline wrap gap="sm">
          <Button variant="danger">Delete project</Button>
          <Button variant="danger-tertiary">Delete project</Button>
          <Button variant="danger-ghost">Delete</Button>
        </Inline>
      ),
    },
    {
      title: "Sizes",
      render: () => (
        <Inline wrap gap="sm" align="end">
          <Button size="sm">Small</Button>
          <Button size="md">Medium</Button>
          <Button size="lg">Large</Button>
        </Inline>
      ),
    },
    {
      title: "With icon, icon-only, loading, disabled",
      render: () => (
        <Inline wrap gap="sm">
          <Button icon={Add}>Create quote</Button>
          <Button variant="tertiary" icon={Download} iconPosition="start">Export</Button>
          <IconButton icon={Edit} label="Edit" />
          <IconButton icon={Settings} label="Settings" variant="secondary" />
          <Button loading>Saving</Button>
          <Button disabled>Disabled</Button>
        </Inline>
      ),
    },
    {
      title: "Button set",
      description: "Primary last (right). Stacked in narrow containers.",
      render: () => (
        <Stack gap="lg">
          <ButtonSet><Button variant="secondary">Cancel</Button><Button>Save changes</Button></ButtonSet>
          <div className="max-w-xs"><ButtonSet stacked><Button variant="secondary">Cancel</Button><Button>Save changes</Button></ButtonSet></div>
        </Stack>
      ),
    },
  ],
  "components/link": [
    {
      title: "Standalone, inline, external, disabled",
      render: () => (
        <Stack gap="md">
          <Inline gap="lg" wrap>
            <Link href="#/components/link">Standalone link</Link>
            <Link href="https://github.com/jacopoenergy/corpus-design-system" external>Corpus repository</Link>
            <Link disabled>Disabled</Link>
            <Link size="sm" href="#/components/link">Small</Link>
            <Link size="lg" href="#/components/link">Large</Link>
          </Inline>
          <Text>Inline links sit in running text, like this <Link inline href="#/components/link">privacy policy</Link>, and are always underlined.</Text>
        </Stack>
      ),
    },
  ],
  "components/menu": [{ title: "Menu, submenu, checkbox items, context menu", render: () => <MenuDemo /> }],
  "components/menu-buttons": [
    {
      title: "Menu button · Combo button · Overflow menu",
      render: () => (
        <Inline gap="lg" wrap>
          <MenuButton label="Export">
            <MenuItem>Export as CSV</MenuItem>
            <MenuItem>Export as PDF</MenuItem>
            <MenuItem>Export as XLSX</MenuItem>
          </MenuButton>
          <ComboButton label="Save" variant="primary" onClick={() => toast({ kind: "success", title: "Saved" })}>
            <MenuItem icon={Save}>Save as…</MenuItem>
            <MenuItem>Save as template</MenuItem>
          </ComboButton>
          <OverflowMenu>
            <MenuItem icon={Edit}>Edit</MenuItem>
            <MenuItem icon={Copy}>Duplicate</MenuItem>
            <MenuSeparator />
            <MenuItem icon={TrashCan} danger>Delete</MenuItem>
          </OverflowMenu>
        </Inline>
      ),
    },
  ],
  "components/content-switcher": [
    {
      title: "Text, icon-only, sizes",
      render: () => (
        <Stack gap="md">
          <ContentSwitcher label="Time range" items={[{ value: "d", label: "Day" }, { value: "w", label: "Week" }, { value: "m", label: "Month" }, { value: "y", label: "Year" }]} />
          <ContentSwitcher label="Layout" iconOnly items={[{ value: "list", label: "List view", icon: ListIcon }, { value: "grid", label: "Grid view", icon: GridIcon }]} />
          <ContentSwitcher label="Size" size="sm" items={[{ value: "a", label: "Small" }, { value: "b", label: "Switcher" }]} />
        </Stack>
      ),
    },
  ],
  "components/code-snippet": [
    {
      title: "Inline, single-line, multi-line",
      render: () => (
        <Stack gap="md">
          <Text>Install with <CodeSnippet type="inline">pnpm add radix-ui</CodeSnippet> then import.</Text>
          <CodeSnippet>npx github:jacopoenergy/corpus-design-system init</CodeSnippet>
          <CodeSnippet type="multi">{`import { Button } from "@/components/corpus/button"\n\nexport function Save() {\n  return <Button>Save changes</Button>\n}`}</CodeSnippet>
        </Stack>
      ),
    },
  ],
  "components/ai-label": [{ title: "Sizes, autofilled field, AI surface", render: () => <AIDemo /> }],
  "components/breadcrumb": [
    {
      title: "Default and collapsed",
      render: () => (
        <Stack gap="md">
          <Breadcrumb items={[{ label: "Workspace", href: "#" }, { label: "Projects", href: "#" }, { label: "Q3 forecast" }]} />
          <Breadcrumb items={[{ label: "Home", href: "#" }, { label: "Accounts", href: "#" }, { label: "EMEA", href: "#" }, { label: "Germany", href: "#" }, { label: "Berlin", href: "#" }, { label: "Acme GmbH" }]} />
        </Stack>
      ),
    },
  ],
}

export const toolbarIcons = { TextBold, TextItalic, TextUnderline, ListBulleted, Filter }
