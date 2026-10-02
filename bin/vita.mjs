#!/usr/bin/env node
/**
 * vita, install and keep Vita in sync inside any React + Tailwind v4 repo.
 *
 *   npx github:Jacopospina/vita init        full install (components, styles, docs, skills, audit, hook, templates)
 *   npx github:Jacopospina/vita add button  add components (+ internal deps)
 *   npx github:Jacopospina/vita update      refresh system files; never touches theme.css or vita/ (your product files)
 *   npx github:Jacopospina/vita audit       run the design-system audit
 *   npx github:Jacopospina/vita list        list components
 *
 * Options: --dir src/components/vita  --styles src/styles/vita  --alias @/components/vita  --no-skills  --no-hook  --yes
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

const cfgFile = path.join(CWD, "vita.config.json")
const existing = fs.existsSync(cfgFile) ? JSON.parse(fs.readFileSync(cfgFile, "utf8")) : {}
const cfg = {
  componentsDir: flags.dir ?? existing.componentsDir ?? "src/components/vita",
  stylesDir: flags.styles ?? existing.stylesDir ?? "src/styles/vita",
  componentsAlias: flags.alias ?? existing.componentsAlias ?? "@/components/vita",
  taxonomy: existing.taxonomy ?? "vita/taxonomy.json",
  audit: existing.audit ?? { include: ["src"], exclude: [] },
}
cfg.audit.exclude = [...new Set([...(cfg.audit.exclude ?? []), cfg.componentsDir, cfg.stylesDir])]

const RUNTIME_DEPS = ["radix-ui", "class-variance-authority", "clsx", "tailwind-merge", "@carbon/icons-react", "@carbon/pictograms-react", "react-day-picker", "date-fns", "@fontsource-variable/google-sans-flex", "@fontsource-variable/google-sans-code"]

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
const HEADER = (file) => `/* Vita, generated from ${file}. Do not edit here; change it upstream in the design system and run \`vita update\`. */\n`

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
  for (const f of ["vita.css", "tokens.css", "motion.css", "presets.css", "palette.css"]) writeFile(path.join(dest, f), fs.readFileSync(path.join(PKG, "src/styles", f), "utf8"))
  const wroteTheme = writeFile(path.join(dest, "theme.css"), fs.readFileSync(path.join(PKG, "src/styles/theme.css"), "utf8"), { overwrite: !keepTheme })
  ok(`styles → ${rel(dest)}${wroteTheme ? "" : " (kept your theme.css)"}`)
}

function installAgentLayer({ skills, hook }) {
  // docs for agents
  const docsN = copyTree(path.join(PKG, "docs"), path.join(CWD, ".vita/docs"), { transform: (c) => c.replaceAll("@/components/vita", cfg.componentsAlias) })
  for (const f of ["llms.txt"]) if (fs.existsSync(path.join(PKG, f))) writeFile(path.join(CWD, ".vita", f), fs.readFileSync(path.join(PKG, f), "utf8"))
  if (fs.existsSync(path.join(PKG, "docs/index.json"))) writeFile(path.join(CWD, ".vita/docs/index.json"), fs.readFileSync(path.join(PKG, "docs/index.json"), "utf8"))
  ok(`${docsN} docs → .vita/docs`)
  // audit scripts
  for (const f of ["vita-audit.mjs", "vita-rules.mjs", "claude-hook.mjs"]) writeFile(path.join(CWD, ".vita/scripts", f), fs.readFileSync(path.join(PKG, "scripts", f), "utf8"))
  writeFile(path.join(CWD, ".vita/eslint/vita-plugin.mjs"), fs.readFileSync(path.join(PKG, "eslint/vita-plugin.mjs"), "utf8").replace("../scripts/vita-rules.mjs", "../scripts/vita-rules.mjs"))
  ok("audit + eslint plugin → .vita/")
  // skills
  if (skills) {
    // The skills were renamed (Architect, Consistency, Motion Design, Copywriting, Personae, Theming): an update removes
    // the old folders, or agents would load two versions of the same skill.
    for (const old of ["vita-design-system", "vita-visual-consistency", "vita-motion", "vita-content", "vita-personas", "vita-theme"]) {
      const dir = path.join(CWD, ".claude/skills", old)
      if (fs.existsSync(path.join(dir, "SKILL.md"))) { fs.rmSync(dir, { recursive: true, force: true }); ok(`removed renamed skill .claude/skills/${old}`) }
    }
    const n = copyTree(path.join(PKG, "skills"), path.join(CWD, ".claude/skills"), { transform: (c) => c.replaceAll("@/components/vita", cfg.componentsAlias) })
    ok(`${n} skill files → .claude/skills/vita-*`)
  }
  // AGENTS.md + CLAUDE.md
  const block = fs.readFileSync(path.join(PKG, "templates/AGENTS.consumer.md"), "utf8").replaceAll("@/components/vita", cfg.componentsAlias)
  const agents = path.join(CWD, "AGENTS.md")
  const cur = fs.existsSync(agents) ? fs.readFileSync(agents, "utf8") : ""
  const marked = `<!-- vita:start -->\n${block}\n<!-- vita:end -->`
  fs.writeFileSync(agents, cur.includes("<!-- vita:start -->") ? cur.replace(/<!-- vita:start -->[\s\S]*<!-- vita:end -->/, marked) : (cur ? cur + "\n\n" : "") + marked + "\n")
  const claude = path.join(CWD, "CLAUDE.md")
  const cc = fs.existsSync(claude) ? fs.readFileSync(claude, "utf8") : ""
  if (!cc.includes("@AGENTS.md")) fs.writeFileSync(claude, (cc ? cc + "\n\n" : "") + "@AGENTS.md\n")
  ok("AGENTS.md (Vita rules block) + CLAUDE.md → @AGENTS.md")
  // Claude Code hook: audit every file an agent edits
  if (hook) {
    const settingsPath = path.join(CWD, ".claude/settings.json")
    const settings = fs.existsSync(settingsPath) ? JSON.parse(fs.readFileSync(settingsPath, "utf8")) : {}
    settings.hooks ??= {}
    settings.hooks.PostToolUse ??= []
    const command = "node .vita/scripts/claude-hook.mjs"
    if (!JSON.stringify(settings.hooks.PostToolUse).includes(command)) settings.hooks.PostToolUse.push({ matcher: "Edit|Write|MultiEdit", hooks: [{ type: "command", command }] })
    writeFile(settingsPath, JSON.stringify(settings, null, 2) + "\n")
    ok("Claude Code PostToolUse hook → .claude/settings.json (agents get audit feedback on every edit)")
  }
}

function installProductTemplates() {
  let n = 0
  n += writeFile(path.join(CWD, "vita/product.md"), fs.readFileSync(path.join(PKG, "templates/product.template.md"), "utf8"), { overwrite: false }) ? 1 : 0
  n += writeFile(path.join(CWD, "vita/personas/_template.md"), fs.readFileSync(path.join(PKG, "templates/persona.template.md"), "utf8"), { overwrite: false }) ? 1 : 0
  n += writeFile(path.join(CWD, "vita/taxonomy.json"), fs.readFileSync(path.join(PKG, "templates/taxonomy.template.json"), "utf8"), { overwrite: false }) ? 1 : 0
  ok(n ? `product templates → vita/ (product.md, personas/, taxonomy.json)` : "vita/ product files already exist (kept)")
}

function patchPackageJson() {
  const p = path.join(CWD, "package.json")
  if (!fs.existsSync(p)) return
  const pkg = JSON.parse(fs.readFileSync(p, "utf8"))
  pkg.scripts ??= {}
  pkg.scripts["vita:audit"] ??= "node .vita/scripts/vita-audit.mjs"
  pkg.scripts["vita:update"] ??= "npx github:Jacopospina/vita update"
  fs.writeFileSync(p, JSON.stringify(pkg, null, 2) + "\n")
  ok("package.json scripts: vita:audit, vita:update")
}

/* ---------------- commands ---------------- */
const commands = {
  init() {
    log(`\nVita → ${CWD}\n`)
    fs.writeFileSync(cfgFile, JSON.stringify(cfg, null, 2) + "\n")
    ok("vita.config.json")
    const ids = installComponents(allComponentIds())
    ok(`${ids.length} modules → ${cfg.componentsDir}`)
    installStyles({ keepTheme: true })
    installAgentLayer({ skills: !flags["no-skills"], hook: !flags["no-hook"] })
    installProductTemplates()
    patchPackageJson()
    if (!flags["no-install"]) {
      const c = `${pm()} ${RUNTIME_DEPS.join(" ")}`
      log(`\n  installing runtime dependencies…`)
      try { execSync(c, { stdio: "inherit", cwd: CWD }) } catch { log(`  ! install failed, run manually:\n    ${c}`) }
    }
    log(`
Next:
  1. In your global CSS, replace \`@import "tailwindcss";\` with:
       @import "./${path.relative(path.join(CWD, "src"), path.join(CWD, cfg.stylesDir, "vita.css")).replaceAll("\\", "/")}";
  2. Make sure "${cfg.componentsAlias}" resolves to ${cfg.componentsDir} (tsconfig paths / vite alias).
  3. Mount <TooltipProvider> and <Toaster /> once at the app root.
  4. Fill vita/product.md, then ask your agent: "use the vita-personae skill to create our personas and taxonomy".
  5. Tune the brand in ${cfg.stylesDir}/theme.css (≈10 knobs).
  6. Run \`npm run vita:audit\` in CI.
`)
  },
  add() {
    if (!positional.length) return log("usage: vita add <component...>   (see `vita list`)")
    const ids = positional.map((n) => (registryFile(`ui/${n}`) ? `ui/${n}` : registryFile(`blocks/${n}`) ? `blocks/${n}` : registryFile(n) ? n : null))
    const missing = positional.filter((_, i) => !ids[i])
    if (missing.length) return log(`unknown: ${missing.join(", ")}, see \`vita list\``)
    const all = installComponents(ids)
    ok(`${all.length} modules → ${cfg.componentsDir}: ${all.join(", ")}`)
  },
  update() {
    log(`\nUpdating Vita system files (your theme.css and vita/ are untouched)\n`)
    const present = allComponentIds().filter((id) => fs.existsSync(destFor(id)))
    const ids = installComponents(present.length ? present : allComponentIds())
    ok(`${ids.length} modules refreshed`)
    installStyles({ keepTheme: true })
    installAgentLayer({ skills: !flags["no-skills"], hook: !flags["no-hook"] })
  },
  audit() {
    const script = fs.existsSync(path.join(CWD, ".vita/scripts/vita-audit.mjs")) ? path.join(CWD, ".vita/scripts/vita-audit.mjs") : path.join(PKG, "scripts/vita-audit.mjs")
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
