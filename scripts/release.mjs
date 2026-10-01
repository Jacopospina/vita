#!/usr/bin/env node
/**
 * pnpm release <major|minor|patch> — bump package.json, regenerate the changelog, commit and tag vX.Y.Z locally.
 * Pushing (and publishing) stays a deliberate, separate step.
 */
import fs from "node:fs"
import path from "node:path"
import { execFileSync } from "node:child_process"

const level = process.argv[2]
if (!["major", "minor", "patch"].includes(level)) { console.error("usage: pnpm release <major|minor|patch>"); process.exit(1) }
const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..")
const run = (cmd, args) => execFileSync(cmd, args, { cwd: root, stdio: "inherit" })
if (execFileSync("git", ["status", "--porcelain"], { cwd: root, encoding: "utf8" }).trim()) { console.error("Commit or stash your changes first."); process.exit(1) }

const pkgPath = path.join(root, "package.json")
const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf8"))
const [ma, mi, pa] = pkg.version.split(".").map(Number)
const next = level === "major" ? `${ma + 1}.0.0` : level === "minor" ? `${ma}.${mi + 1}.0` : `${ma}.${mi}.${pa + 1}`
pkg.version = next
fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + "\n")
run("git", ["add", "package.json"])
run("git", ["commit", "-q", "-m", `Release v${next}`])
run("git", ["tag", "-a", `v${next}`, "-m", `Corpus v${next}`])
run("node", ["scripts/build-changelog.mjs"])
run("git", ["add", "CHANGELOG.md", "docs/foundations/whats-new.md"])
run("git", ["commit", "-q", "-m", `Changelog for v${next}`])
console.log(`✓ v${next} tagged locally. Push with tags when ready.`)
