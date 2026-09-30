/** Loads /docs/**.md and parses the small YAML frontmatter subset Corpus docs use. */
const raw = import.meta.glob("/docs/**/*.md", { query: "?raw", import: "default", eager: true }) as Record<string, string>

export interface DocMeta {
  title?: string
  summary?: string
  status?: string
  import?: string
  use_when?: string[]
  avoid_when?: string[]
  related?: string[]
  [k: string]: string | string[] | undefined
}

export interface Doc {
  meta: DocMeta
  body: string
}

export function parseFrontmatter(src: string): Doc {
  const m = /^---\n([\s\S]*?)\n---\n?/.exec(src)
  if (!m) return { meta: {}, body: src }
  const meta: DocMeta = {}
  let listKey: string | null = null
  for (const line of m[1].split("\n")) {
    const item = /^\s+-\s+(.*)$/.exec(line)
    if (item && listKey) {
      ;(meta[listKey] as string[]).push(unquote(item[1]))
      continue
    }
    const kv = /^([a-z_]+):\s*(.*)$/.exec(line)
    if (!kv) continue
    const [, k, v] = kv
    if (v === "") {
      listKey = k
      meta[k] = []
    } else if (v.startsWith("[")) {
      meta[k] = v.slice(1, -1).split(",").map((s) => unquote(s.trim())).filter(Boolean)
      listKey = null
    } else {
      meta[k] = unquote(v)
      listKey = null
    }
  }
  return { meta, body: src.slice(m[0].length) }
}

const unquote = (s: string) => {
  if (s.startsWith('"') && s.endsWith('"')) {
    try {
      return JSON.parse(s) as string
    } catch {
      /* fall through */
    }
  }
  return s.replace(/^["']|["']$/g, "")
}

export function getDoc(section: string, slug: string): Doc | undefined {
  const src = raw[`/docs/${section}/${slug}.md`]
  return src ? parseFrontmatter(src) : undefined
}
