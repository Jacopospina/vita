#!/usr/bin/env node
/**
 * pnpm visual — every docs page in a real browser (your installed Chrome; nothing is downloaded):
 *   1. Layout invariants — the page fits the window (no phantom scroll) and nothing glides into place after load.
 *   2. Accessibility — axe-core (WCAG 2 A/AA); serious and critical issues fail the run.
 *   3. Screenshots — saved to tests/visual/latest; compared with tests/visual/baseline (pnpm visual --update
 *      accepts them). Changes are listed for review, not failed: live components make pixels noisy.
 * Runs with reduced motion so pages settle. Flags: --update · --only <section/slug>
 */
import fs from "node:fs"
import path from "node:path"
import { createServer } from "vite"
import { chromium } from "playwright-core"

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..")
const args = process.argv.slice(2)
const update = args.includes("--update")
const only = args.includes("--only") ? args[args.indexOf("--only") + 1] : null
const out = path.join(root, "tests/visual")
for (const d of ["latest", "baseline"]) fs.mkdirSync(path.join(out, d), { recursive: true })

const index = JSON.parse(fs.readFileSync(path.join(root, "docs/index.json"), "utf8"))
const pages = [{ id: "home", url: "/#/" }, { id: "showcase", url: "/showcase.html" }, ...index.entries.map((e) => ({ id: `${e.section}-${e.slug}`, url: `/#/${e.section}/${e.slug}` }))]
  .filter((p) => !only || p.id === only.replace("/", "-"))

const server = await createServer({ root, logLevel: "error", server: { port: 0 } })
await server.listen()
const base = server.resolvedUrls.local[0].replace(/\/$/, "")
const axeSource = fs.readFileSync(path.join(root, "node_modules/axe-core/axe.min.js"), "utf8")
const browser = await chromium.launch({ channel: "chrome", headless: true })
const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: "reduce", colorScheme: "light" })

const failures = [], changed = []
for (const p of pages) {
  const page = await context.newPage()
  await page.goto(base + p.url, { waitUntil: "load" })
  await page.waitForTimeout(1200) // boot window + entrances
  const layout = await page.evaluate(() => {
    const overflow = document.documentElement.scrollHeight - window.innerHeight
    const glides = document.getAnimations().filter((a) => {
      const kf = a.effect?.getKeyframes?.() ?? []
      return kf.some((k) => k.translate && k.translate !== "0px 0px" && k.composite === "add")
    }).length
    return { overflow, glides }
  })
  if (layout.overflow > 1) failures.push(`${p.id}: page is ${layout.overflow}px taller than the window (phantom scroll)`)
  if (layout.glides) failures.push(`${p.id}: ${layout.glides} element(s) gliding into place after load`)
  await page.addScriptTag({ content: axeSource })
  const axe = await page.evaluate(async () => {
    const r = await window.axe.run(document, { runOnly: { type: "tag", values: ["wcag2a", "wcag2aa"] } })
    return r.violations.filter((v) => v.impact === "serious" || v.impact === "critical").map((v) => `${v.id} (${v.impact}, ${v.nodes.length}): ${v.help}`)
  })
  for (const a of axe) failures.push(`${p.id}: a11y ${a}`)
  const file = `${p.id}.png`
  const shot = await page.screenshot({ fullPage: false })
  fs.writeFileSync(path.join(out, "latest", file), shot)
  const baselinePath = path.join(out, "baseline", file)
  if (update || !fs.existsSync(baselinePath)) fs.writeFileSync(baselinePath, shot)
  else if (!fs.readFileSync(baselinePath).equals(shot)) changed.push(p.id)
  await page.close()
  process.stdout.write(".")
}
await browser.close()
await server.close()

console.log(`\n\n${pages.length} pages checked.`)
if (changed.length) console.log(`\nChanged since baseline (review tests/visual/latest, accept with --update):\n  ${changed.join("\n  ")}`)
if (failures.length) {
  console.log(`\n✗ ${failures.length} problem(s):\n  ${failures.join("\n  ")}`)
  process.exit(1)
}
console.log("✓ layout and accessibility clean")
