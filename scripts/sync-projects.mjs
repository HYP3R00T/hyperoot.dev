import { fileURLToPath } from "node:url"
import { syncRepositories } from "../src/lib/github-projects.mjs"

const root = fileURLToPath(new URL("../", import.meta.url))
const snapshot = await syncRepositories(root, {
  force: true,
  offline: process.argv.includes("--offline"),
  strict: process.argv.includes("--strict"),
})
console.log(`Loaded metadata for ${Object.keys(snapshot.repositories).length} project repositories.`)
