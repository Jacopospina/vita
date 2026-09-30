#!/usr/bin/env node
/**
 * Claude Code PostToolUse hook: audits the file an agent just edited.
 * Exit code 2 feeds the violations back to the agent so it fixes them immediately.
 */
import { spawnSync } from "node:child_process"
import path from "node:path"
import fs from "node:fs"

let input = ""
process.stdin.on("data", (c) => (input += c))
process.stdin.on("end", () => {
  let file
  try {
    const data = JSON.parse(input)
    file = data.tool_input?.file_path ?? data.tool_input?.path
  } catch {
    process.exit(0)
  }
  if (!file || !/\.(tsx|jsx|ts|js|css)$/.test(file) || !fs.existsSync(file)) process.exit(0)
  const here = path.dirname(new URL(import.meta.url).pathname)
  const r = spawnSync(process.execPath, [path.join(here, "corpus-audit.mjs"), path.relative(process.cwd(), file)], { encoding: "utf8" })
  if (r.status === 0) process.exit(0)
  process.stderr.write(
    `${r.stdout}\nCorpus design-system violations in ${file}. Fix them by reusing Corpus components and tokens ` +
      `(read .corpus/docs/components/choosing-components.md). Do not add local components or raw values. ` +
      `If a designer explicitly approved an exception, add: // corpus-allow <rule>: <reason> — approved by @name\n`,
  )
  process.exit(2)
})
