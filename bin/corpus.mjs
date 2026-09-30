#!/usr/bin/env node
/**
 * corpus — install and keep Corpus in sync inside any React + Tailwind v4 repo.
 *
 *   npx github:jacopoenergy/corpus-design-system init        full install (components, styles, docs, skills, audit, hook, templates)
 *   npx github:jacopoenergy/corpus-design-system add button  add components (+ internal deps)
 *   npx github:jacopoenergy/corpus-design-system update      refresh system files; never touches theme.css or corpus/ (your product files)
 *   npx github:jacopoenergy/corpus-design-system audit       run the design-system audit
 *   npx github:jacopoenergy/corpus-design-system list        list components
 *
 * Options: --dir src/components/corpus  --styles src/styles/corpus  --alias @/components/corpus  --no-skills  --no-hook  --yes
 */
import fs from "node:fs"
import path from "node:path"
import { execSync, spawnSync } from "node:child_process"
import { fileURLToPath } from "node:url"

const PKG = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..")
const CWD = process.cwd()
const [cmd = "help", ...rest] = process.argv.slice(2)
const flags = Object.fromEntries(rest.filter((a) => a.startsWith("--")).map((a) => { const [k, v] = a.slice(2).split("="); return [k, v ?? true] }))
const positional = rest.filter((a) => !a.startsWith("--"))

const cfgFile = path.join(CWD, "corpus.config.json")
const existing = fs.existsSync(cfgFile) ? JSON.parse(fs.readFileSync(cfgFile, "utf8")) : {}
const cfg = {
  componentsDir: flags.dir ?? existing.componentsDir ?? "src/components/corpus",
  stylesDir: flags.styles ?? existing.stylesDir ?? "src/styles/corpus",
  componentsAlias: flags.alias ?? existing.componentsAlias ?? "@/components/corpus",
  taxonomy: existing.taxonomy ?? "corpus/taxonomy.json",
  audit: existing.audit ?? { include: ["src"], exclude: [] },
}
cfg.audit.exclude = [...new Set([...(cfg.audit.exclude ?? []), cfg.componentsDir, cfg.stylesDir])]

const RUNTIME_DEPS = ["radix-ui", "class-variance-authority", "clsx", "tailwind-merge", "@carbon/icons-react", "@carbon/pictograms-react", "react-day-picker", "date-fns", "@fontsource-variable/inter", "@fontsource/jetbrains-mono"]

const log = (...a) => console.log(...a)
const ok = (m) => log(`  ✓ ${m}`)
const rel = (p) => path.relative(CWD, p) || "."

/* ---------------- helpers ---------------- */
function rewrite(src) {
  return src
    .replaceAll("@/registry/ui/", `${cfg.componentsAlias}/`)
    .replaceAll("@/registry/", `${cfg.componentsAlias}/`)
}
function writeFile(dest, content, { overwrite = true } = {}) {
  if (!overwrite && fs.existsSync(dest)) return false
  fs.mkdirSync(path.dirname(dest), { recursive: true })
  fs.writeFileSync(dest, content)
  return true
}
function copyTree(srcDir, destDir, { transform, overwrite = true, filter = () => true } = {}) {
  let n = 0
  if (!fs.existsSync(srcDir)) return 0
  for (const e of fs.readdirSync(srcDir, { withFileTypes: true })) {
    const s = path.join(srcDir, e.name), d = path.join(destDir, e.name)
    if (e.isDirectory()) n += copyTree(s, d, { transform, overwrite, filter })
    else if (filter(s)) {
      const content = fs.readFileSync(s, "utf8")
      if (writeFile(d, transform ? transform(content, s) : content, { overwrite })) n++
    }
  }
  return n
}
const HEADER = (file) => `/* Corpus — generated from ${file}. Do not edit here; change it upstream in the design system and run \`corpus update\`. */\n`

/** Map a registry module id ("ui/button", "lib/utils", "icons", "blocks/login") → source file. */
function registryFile(id) {
  for (const ext of [".tsx", ".ts"]) {
    const f = path.join(PKG, "src/registry", id + ext)
    if (fs.existsSync(f)) return f
  }
  return null
}
function destFor(id) {
  const flat = id.startsWith("ui/") ? id.slice(3) : id
  const src = registryFile(id)
  return path.join(CWD, cfg.componentsDir, flat + path.extname(src))
}
function depsOf(id, seen = new Set()) {
  if (seen.has(id)) return seen
  seen.add(id)
  const src = fs.readFileSync(registryFile(id), "utf8")
  for (const m of src.matchAll(/from\s+"@\/registry\/([^"]+)"/g)) depsOf(m[1], seen)
  return seen
}
function installComponents(ids) {
  const all = new Set()
  ids.forEach((id) => depsOf(id, all))
  for (const id of all) {
    const src = registryFile(id)
    writeFile(destFor(id), HEADER(`src/registry/${id}`) + rewrite(fs.readFileSync(src, "utf8")))
  }
  return [...all]
}
function allComponentIds() {
  const ids = []
  for (const dir of ["ui", "blocks"]) for (const f of fs.readdirSync(path.join(PKG, "src/registry", dir))) ids.push(`${dir}/${f.replace(/\.tsx?$/, "")}`)
  return ids
}
function pm() {
  if (fs.existsSync(path.join(CWD, "pnpm-lock.yaml"))) return "pnpm add"
  if (fs.existsSync(path.join(CWD, "yarn.lock"))) return "yarn add"
  if (fs.existsSync(path.join(CWD, "bun.lockb")) || fs.existsSync(path.join(CWD, "bun.lock"))) return "bun add"
  return "npm install"
}

function installStyles({ keepTheme }) {
  const dest = path.join(CWD, cfg.stylesDir)
  for (const f of ["corpus.css", "tokens.css", "motion.css", "presets.css"]) writeFile(path.join(dest, f), fs.readFileSync(path.join(PKG, "src/styles", f), "utf8"))
  const wroteTheme = writeFile(path.join(dest, "theme.css"), fs.readFileSync(path.join(PKG, "src/styles/theme.css"), "utf8"), { overwrite: !keepTheme })
  ok(`styles → ${rel(dest)}${wroteTheme ? "" : " (kept your theme.css)"}`)
}

function installAgentLayer({ skills, hook }) {
  // docs for agents
  const docsN = copyTree(path.join(PKG, "docs"), path.join(CWD, ".corpus/docs"), { transform: (c) => c.replaceAll("@/components/corpus", cfg.componentsAlias) })
  for (const f of ["llms.txt"]) if (fs.existsSync(path.join(PKG, f))) writeFile(path.join(CWD, ".corpus", f), fs.readFileSync(path.join(PKG, f), "utf8"))
  if (fs.existsSync(path.join(PKG, "docs/index.json"))) writeFile(path.join(CWD, ".corpus/docs/index.json"), fs.readFileSync(path.join(PKG, "docs/index.json"), "utf8"))
  ok(`${docsN} docs → .corpus/docs`)
  // audit scripts
  for (const f of ["corpus-audit.mjs", "corpus-rules.mjs", "claude-hook.mjs"]) writeFile(path.join(CWD, ".corpus/scripts", f), fs.readFileSync(path.join(PKG, "scripts", f), "utf8"))
  writeFile(path.join(CWD, ".corpus/eslint/corpus-plugin.mjs"), fs.readFileSync(path.join(PKG, "eslint/corpus-plugin.mjs"), "utf8").replace("../scripts/corpus-rules.mjs", "../scripts/corpus-rules.mjs"))
  ok("audit + eslint plugin → .corpus/")
  // skills
  if (skills) {
    const n = copyTree(path.join(PKG, "skills"), path.join(CWD, ".claude/skills"), { transform: (c) => c.replaceAll("@/components/corpus", cfg.componentsAlias) })
    ok(`${n} skill files → .claude/skills/corpus-*`)
  }
  // AGENTS.md + CLAUDE.md
  const block = fs.readFileSync(path.join(PKG, "templates/AGENTS.consumer.md"), "utf8").replaceAll("@/components/corpus", cfg.componentsAlias)
  const agents = path.join(CWD, "AGENTS.md")
  const cur = fs.existsSync(agents) ? fs.readFileSync(agents, "utf8") : ""
  const marked = `<!-- corpus:start -->\n${block}\n<!-- corpus:end -->`
  fs.writeFileSync(agents, cur.includes("<!-- corpus:start -->") ? cur.replace(/<!-- corpus:start -->[\s\S]*<!-- corpus:end -->/, marked) : (cur ? cur + "\n\n" : "") + marked + "\n")
  const claude = path.join(CWD, "CLAUDE.md")
  const cc = fs.existsSync(claude) ? fs.readFileSync(claude, "utf8") : ""
  if (!cc.includes("@AGENTS.md")) fs.writeFileSync(claude, (cc ? cc + "\n\n" : "") + "@AGENTS.md\n")
  ok("AGENTS.md (Corpus rules block) + CLAUDE.md → @AGENTS.md")
  // Claude Code hook: audit every file an agent edits
  if (hook) {
    const settingsPath = path.join(CWD, ".claude/settings.json")
    const settings = fs.existsSync(settingsPath) ? JSON.parse(fs.readFileSync(settingsPath, "utf8")) : {}
    settings.hooks ??= {}
    settings.hooks.PostToolUse ??= []
    const command = "node .corpus/scripts/claude-hook.mjs"
    if (!JSON.stringify(settings.hooks.PostToolUse).includes(command)) settings.hooks.PostToolUse.push({ matcher: "Edit|Write|MultiEdit", hooks: [{ type: "command", command }] })
    writeFile(settingsPath, JSON.stringify(settings, null, 2) + "\n")
    ok("Claude Code PostToolUse hook → .claude/settings.json (agents get audit feedback on every edit)")
  }
}

function installProductTemplates() {
  let n = 0
  n += writeFile(path.join(CWD, "corpus/product.md"), fs.readFileSync(path.join(PKG, "templates/product.template.md"), "utf8"), { overwrite: false }) ? 1 : 0
  n += writeFile(path.join(CWD, "corpus/personas/_template.md"), fs.readFileSync(path.join(PKG, "templates/persona.template.md"), "utf8"), { overwrite: false }) ? 1 : 0
  n += writeFile(path.join(CWD, "corpus/taxonomy.json"), fs.readFileSync(path.join(PKG, "templates/taxonomy.template.json"), "utf8"), { overwrite: false }) ? 1 : 0
  ok(n ? `product templates → corpus/ (product.md, personas/, taxonomy.json)` : "corpus/ product files already exist (kept)")
}

function patchPackageJson() {
  const p = path.join(CWD, "package.json")
  if (!fs.existsSync(p)) return
  const pkg = JSON.parse(fs.readFileSync(p, "utf8"))
  pkg.scripts ??= {}
  pkg.scripts["corpus:audit"] ??= "node .corpus/scripts/corpus-audit.mjs"
  pkg.scripts["corpus:update"] ??= "npx github:jacopoenergy/corpus-design-system update"
  fs.writeFileSync(p, JSON.stringify(pkg, null, 2) + "\n")
  ok("package.json scripts: corpus:audit, corpus:update")
}

/* ---------------- commands ---------------- */
const commands = {
  init() {
    log(`\nCorpus → ${CWD}\n`)
    fs.writeFileSync(cfgFile, JSON.stringify(cfg, null, 2) + "\n")
    ok("corpus.config.json")
    const ids = installComponents(allComponentIds())
    ok(`${ids.length} modules → ${cfg.componentsDir}`)
    installStyles({ keepTheme: true })
    installAgentLayer({ skills: !flags["no-skills"], hook: !flags["no-hook"] })
    installProductTemplates()
    patchPackageJson()
    if (!flags["no-install"]) {
      const c = `${pm()} ${RUNTIME_DEPS.join(" ")}`
      log(`\n  installing runtime dependencies…`)
      try { execSync(c, { stdio: "inherit", cwd: CWD }) } catch { log(`  ! install failed — run manually:\n    ${c}`) }
    }
    log(`
Next:
  1. In your global CSS, replace \`@import "tailwindcss";\` with:
       @import "./${path.relative(path.join(CWD, "src"), path.join(CWD, cfg.stylesDir, "corpus.css")).replaceAll("\\", "/")}";
  2. Make sure "${cfg.componentsAlias}" resolves to ${cfg.componentsDir} (tsconfig paths / vite alias).
  3. Mount <TooltipProvider> and <Toaster /> once at the app root.
  4. Fill corpus/product.md, then ask your agent: "use the corpus-personas skill to create our personas and taxonomy".
  5. Tune the brand in ${cfg.stylesDir}/theme.css (≈10 knobs).
  6. Run \`npm run corpus:audit\` in CI.
`)
  },
  add() {
    if (!positional.length) return log("usage: corpus add <component...>   (see `corpus list`)")
    const ids = positional.map((n) => (registryFile(`ui/${n}`) ? `ui/${n}` : registryFile(`blocks/${n}`) ? `blocks/${n}` : registryFile(n) ? n : null))
    const missing = positional.filter((_, i) => !ids[i])
    if (missing.length) return log(`unknown: ${missing.join(", ")} — see \`corpus list\``)
    const all = installComponents(ids)
    ok(`${all.length} modules → ${cfg.componentsDir}: ${all.join(", ")}`)
  },
  update() {
    log(`\nUpdating Corpus system files (your theme.css and corpus/ are untouched)\n`)
    const present = allComponentIds().filter((id) => fs.existsSync(destFor(id)))
    const ids = installComponents(present.length ? present : allComponentIds())
    ok(`${ids.length} modules refreshed`)
    installStyles({ keepTheme: true })
    installAgentLayer({ skills: !flags["no-skills"], hook: !flags["no-hook"] })
  },
  audit() {
    const script = fs.existsSync(path.join(CWD, ".corpus/scripts/corpus-audit.mjs")) ? path.join(CWD, ".corpus/scripts/corpus-audit.mjs") : path.join(PKG, "scripts/corpus-audit.mjs")
    const r = spawnSync(process.execPath, [script, ...rest], { stdio: "inherit", cwd: CWD })
    process.exit(r.status ?? 1)
  },
  list() {
    allComponentIds().forEach((id) => log(`  ${id.replace(/^ui\//, "")}`))
  },
  help() {
    log(fs.readFileSync(fileURLToPath(import.meta.url), "utf8").split("*/")[0].replace("#!/usr/bin/env node\n/**", "").replace(/^ \* ?/gm, ""))
  },
}

;(commands[cmd] ?? commands.help)()
