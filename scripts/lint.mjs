import { readdir } from "node:fs/promises"
import { join } from "node:path"

const roots = ["apps", "packages", "scripts"]
const ignored = new Set(["node_modules", "target", ".next", "build"])
let failures = 0
async function walk(dir) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    if (ignored.has(entry.name)) continue
    const path = join(dir, entry.name)
    if (entry.isDirectory()) await walk(path)
    else if (/\.(ts|tsx|js|mjs)$/.test(entry.name)) {
      const source = await (await import("node:fs/promises")).readFile(path, "utf8")
      if (/^(<<<<<<<|=======|>>>>>>>)/m.test(source)) { console.error(`lint: merge conflict marker in ${path}`); failures++ }
    }
  }
}
for (const root of roots) await walk(root)
if (failures) process.exit(1)
console.log("lint: PASS")
