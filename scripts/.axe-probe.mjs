import fs from "node:fs"
import { createServer } from "vite"
import { chromium } from "playwright-core"
const root = "/Users/jacopospina/Projects/vita"
const server = await createServer({ root, logLevel: "error", server: { port: 0 } }); await server.listen()
const base = server.resolvedUrls.local[0].replace(/\/$/, "")
const browser = await chromium.launch({ channel: "chrome", headless: true })
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: "reduce" })
for (const url of process.argv.slice(2)) {
  const page = await ctx.newPage(); await page.goto(base + url, { waitUntil: "load" }); await page.waitForTimeout(1200)
  await page.addScriptTag({ content: fs.readFileSync(root + "/node_modules/axe-core/axe.min.js", "utf8") })
  const r = await page.evaluate(async () => (await window.axe.run(document, { runOnly: { type: "tag", values: ["wcag2a", "wcag2aa"] } })).violations.filter((v) => ["serious", "critical"].includes(v.impact)).map((v) => ({ id: v.id, nodes: v.nodes.map((n) => n.html.slice(0, 120) + " :: " + (n.any[0]?.message ?? n.all[0]?.message ?? n.none[0]?.message ?? "").slice(0, 130)) })))
  console.log("==", url); for (const v of r) { console.log(" ", v.id); for (const n of v.nodes.slice(0, 4)) console.log("    ", n) }
  await page.close()
}
await browser.close(); await server.close()
