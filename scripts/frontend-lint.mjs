import { readdir, readFile } from "node:fs/promises"
import { join } from "node:path"
let failures = 0
async function walk(dir) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    if (["node_modules", ".next"].includes(entry.name)) continue
    const path = join(dir, entry.name)
    if (entry.isDirectory()) await walk(path)
    else if (/\.(ts|tsx)$/.test(entry.name)) {
      const source = await readFile(path, "utf8")
      if (/dangerouslySetInnerHTML/.test(source)) { console.error(`lint: unsafe HTML sink in ${path}`); failures++ }
    }
  }
}
await walk(".")
if (failures) process.exit(1)
console.log("frontend lint: PASS")
