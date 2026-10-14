import { fileURLToPath } from "node:url"
import { catalogMetrics, syncExtensionInstalls } from "../src/lib/catalog-metrics.mts"
import { packageMetrics, syncPackageDownloads } from "../src/lib/package-downloads.mts"

const root = fileURLToPath(new URL("../", import.meta.url))
await syncPackageDownloads(root, {
  force: process.argv.includes("--force"),
  offline: process.argv.includes("--offline"),
})
console.log(JSON.stringify(await packageMetrics(root), null, 2))
await syncExtensionInstalls(root, {
  force: process.argv.includes("--force"),
  offline: process.argv.includes("--offline"),
})
console.log(JSON.stringify(await catalogMetrics(root), null, 2))
