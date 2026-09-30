/**
 * Shared Corpus lint rules — used by scripts/corpus-audit.mjs (CLI/CI/agent hooks)
 * and eslint/corpus-plugin.mjs (editor feedback). One source of truth.
 */
export const ALLOWED_SPACING = new Set(["0", "0.5", "1", "1.5", "2", "2.5", "3", "4", "5", "6", "8", "10", "12", "16", "20", "24", "40", "px", "auto", "full"])

export function createRules({ alias = "@/components/corpus" } = {}) {
  const ALIAS = alias
  return [
  {
    id: "raw-color",
    test: (line, ext) => ext !== ".css" || !/--corpus-/.test(line) ? /(#[0-9a-fA-F]{3,8}\b(?![\w-]*[:=]\s*['"]?\w))|\b(rgba?|hsla?|oklch|oklab|lab|lch|color-mix)\(/.exec(stripImports(line)) : null,
    msg: "Raw color value. Use a semantic token utility (bg-layer-1, text-muted-foreground, border-border-subtle…).",
  },
  {
    id: "palette-color",
    test: (line) => /\b(?:bg|text|border|ring|fill|stroke|from|via|to|outline|decoration|divide|shadow|accent|caret|placeholder)-(?:slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose|white|black)(?:-\d{2,3})?(?:\/\d+)?\b/.exec(line),
    msg: "Tailwind palette color. Corpus only has semantic colors — see docs/foundations/color.md.",
  },
  {
    id: "arbitrary-value",
    test: (line) => /(?<![\w$])(?!(?:[\w-]*:)*(?:group-|peer-)?(?:data|aria|supports|has|not|nth|in)-\[)[a-z][\w:-]*-\[[^\]\s]+\]/.exec(stripImports(line)) ?? /(?<=["'`\s])\[[a-z-]+:[^\]\s]+\](?=["'`\s])/.exec(line),
    msg: "Arbitrary Tailwind value. Use a token; if none fits, it's a design-system change.",
  },
  {
    id: "type-size",
    test: (line) => /\btext-(?:xs|sm|base|lg|[2-9]?xl)\b/.exec(line) ?? /\bfont-(?:thin|extralight|light|extrabold|black)\b/.exec(line),
    msg: "Tailwind type size/weight. Use a role (text-body, text-title-2, text-caption…) and regular/medium/semibold only.",
  },
  {
    id: "off-scale-spacing",
    test: (line) => {
      const re = /(?<![\w-])-?(?:p|px|py|pt|pr|pb|pl|ps|pe|m|mx|my|mt|mr|mb|ml|ms|me|gap|gap-x|gap-y|space-x|space-y)-(\d+(?:\.\d+)?)\b/g
      let m
      while ((m = re.exec(line))) if (!ALLOWED_SPACING.has(m[1])) return m
      return null
    },
    msg: "Off-scale spacing. Allowed steps: 0.5 1 1.5 2 2.5 3 4 5 6 8 10 12 16 20 24 40 (2·4·6·8·10·12·16·20·24·32·40·48·64·80·96·160px).",
  },
  {
    id: "raw-shape",
    test: (line) => /\brounded(?:-(?:[trblse]{1,2}))?-(?:xs|2xl|3xl|4xl)\b|\brounded(?=["'\s`])(?!-)|\bshadow-(?:xs|sm|md|lg|xl|2xl|inner)\b/.exec(line),
    msg: "Radius/shadow outside the scale. Use rounded-sm|md|lg|xl|full and shadow-raised|floating|overlay.",
  },
  {
    id: "raw-motion",
    test: (line) => /\bduration-\d+\b|\bease-(?:linear|in|out|in-out)\b|\bdelay-\d+\b|\banimate-(?:bounce|ping|pulse)\b|cubic-bezier\(/.exec(line),
    msg: "Raw motion value. Use duration-fast-01…slow-02, ease-productive/expressive/spring, animate-enter-*/exit-*.",
  },
  {
    id: "spinner",
    test: (line) => /\banimate-spin\b|\bSpinner\b|\bspinner\b(?=["'\s>])/.exec(line),
    msg: "Spinners belong to the old world. Use <Thinking mode=…> / <Loading> / <InlineLoading> / Skeleton.",
  },
  {
    id: "dark-variant",
    test: (line) => /(?<![\w-])dark:(?=[\w[-])/.exec(line),
    msg: "`dark:` override. Tokens already flip in dark mode — fix the token, not the component.",
  },
  {
    id: "inline-style",
    test: (line, ext) => (ext === ".tsx" || ext === ".jsx") && /style=\{\{(?![^}]*--)/.exec(line),
    msg: "Inline style. Use token utilities (only CSS custom-property assignments are tolerated).",
  },
  {
    id: "raw-element",
    test: (line, ext) => (ext === ".tsx" || ext === ".jsx") && /<(button|input|select|textarea|a|table|dialog|progress|details|h[1-6])(?=[\s>])/.exec(line),
    msg: (m) => `Raw <${m[1]}>. Use the Corpus component (${suggest[m[1]]}).`,
  },
  {
    id: "foreign-icons",
    test: (line) => /from\s+["'](?:lucide-react|@heroicons\/[^"']+|react-icons\/[^"']*|@mui\/icons-material[^"']*|@tabler\/icons-react|@phosphor-icons\/react|@radix-ui\/react-icons|@carbon\/[^"']+)["']/.exec(line),
    msg: `Import icons/pictograms from "${ALIAS}/icons" / "${ALIAS}/pictograms" and render with <Icon>/<Pictogram>.`,
  },
  {
    id: "foreign-ui",
    test: (line) => /from\s+["'](?:@radix-ui\/[^"']+|radix-ui|@headlessui\/react|@mui\/material|antd|@chakra-ui\/[^"']+|@mantine\/[^"']+|react-bootstrap)["']/.exec(line),
    msg: `UI primitives are wrapped by Corpus. Import from "${ALIAS}/…" instead.`,
  },
  ]
}

export const suggest = {
  button: "Button / IconButton", input: "TextInput / Checkbox / Search / NumberInput", select: "Select / Dropdown",
  textarea: "TextArea", a: "Link / ClickableTile", table: "DataTable / StructuredList", dialog: "Modal",
  progress: "ProgressBar", details: "Accordion / Disclosure",
  h1: "PageHeader or Heading level={1}", h2: "Heading level={2}", h3: "Heading level={3}", h4: "Heading level={4}", h5: "Text variant=\"headline\"", h6: "Text variant=\"headline\"",
}

export function stripImports(line) {
  return line.replace(/^\s*import .*$/, "").replace(/https?:\/\/\S+/g, "")
}

