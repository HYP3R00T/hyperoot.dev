import { readFile, rename, writeFile } from "node:fs/promises"
import { resolve } from "node:path"
import { readProjectSources, readSnapshot } from "./github-projects.mts"

import { errorMessage, isMissingFile, type SyncOptions } from "./project-data.mts"

interface InstallRecord {
  installs: number
  fetchedAt: string
}
interface InstallSnapshot {
  version: 1
  extensions: Record<string, InstallRecord>
}
interface ExtensionRegistry {
  projects: { repo: string; extension: string }[]
}
interface GalleryExtension {
  publisher?: { publisherName: string }
  extensionName: string
  statistics?: { statisticName: string; value: number }[]
}

const DAY = 86400000
const validCount = (value: unknown): value is number =>
  typeof value === "number" && Number.isSafeInteger(value) && value >= 0
const PATH = "data/extension-installs.json"

async function visibleRepositories(root: string) {
  return new Set(
    (await readProjectSources(root))
      .filter(({ data }) => !data.draft && !data.private)
      .map(({ data }) => data.repo.toLowerCase()),
  )
}

export async function selectedExtensions(root: string) {
  const visible = await visibleRepositories(root)
  const registry = JSON.parse(await readFile(resolve(root, "data/vscode-extensions.json"), "utf8")) as ExtensionRegistry
  return [
    ...new Set(
      registry.projects
        .filter(({ repo }) => visible.has(repo.toLowerCase()))
        .map(({ extension }) => extension.toLowerCase()),
    ),
  ].sort()
}

async function readInstalls(root: string): Promise<InstallSnapshot> {
  try {
    const snapshot = JSON.parse(await readFile(resolve(root, PATH), "utf8"))
    if (snapshot.version !== 1 || !snapshot.extensions) throw new Error("Invalid extension snapshot")
    return snapshot
  } catch (error) {
    if (isMissingFile(error)) return { version: 1, extensions: {} }
    throw error
  }
}

export async function fetchExtensionInstalls(id: string, { fetchImpl = fetch }: Pick<SyncOptions, "fetchImpl"> = {}) {
  const response = await fetchImpl("https://marketplace.visualstudio.com/_apis/public/gallery/extensionquery", {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json;api-version=7.2-preview.1" },
    body: JSON.stringify({ filters: [{ criteria: [{ filterType: 7, value: id }] }], flags: 256 }),
    signal: AbortSignal.timeout(20000),
  })
  if (!response.ok) throw new Error(`Marketplace returned ${response.status} for ${id}`)
  const data = (await response.json()) as { results?: { extensions?: GalleryExtension[] }[] }
  const extension = data.results
    ?.flatMap((result) => result.extensions ?? [])
    .find((item) => `${item.publisher?.publisherName}.${item.extensionName}`.toLowerCase() === id)
  const installs = extension?.statistics?.find((stat) => stat.statisticName === "install")?.value
  if (!validCount(installs)) throw new Error(`Invalid Marketplace install count for ${id}`)
  return installs
}

export async function syncExtensionInstalls(
  root: string,
  { offline = false, force = false, now = new Date(), fetchImpl = fetch, warn = console.warn }: SyncOptions = {},
) {
  const ids = await selectedExtensions(root)
  const previous = await readInstalls(root)
  const extensions: InstallSnapshot["extensions"] = {}
  for (const id of ids) {
    const cached = previous.extensions[id]
    const fresh = validCount(cached?.installs) && now.getTime() - Date.parse(cached.fetchedAt) < DAY
    if (cached) extensions[id] = cached
    if (offline || (!force && fresh)) continue
    try {
      extensions[id] = { installs: await fetchExtensionInstalls(id, { fetchImpl }), fetchedAt: now.toISOString() }
    } catch (error) {
      warn(`${errorMessage(error)}; keeping saved metrics where available.`)
    }
  }
  const snapshot: InstallSnapshot = { version: 1, extensions }
  if (!offline && JSON.stringify(snapshot) !== JSON.stringify(previous)) {
    const path = resolve(root, PATH)
    const temporary = `${path}.${process.pid}.tmp`
    await writeFile(temporary, `${JSON.stringify(snapshot, null, 2)}\n`)
    await rename(temporary, path)
  }
  return snapshot
}

export async function catalogMetrics(root: string) {
  const visible = await visibleRepositories(root)
  const repositories = (await readSnapshot(root)).repositories
  const records = [...visible].map((repo) => repositories[repo]?.data)
  const total = (field: "stars" | "forks") => {
    const counts = records.map((record) => record?.[field])
    return counts.every(validCount) ? counts.reduce((sum, count) => sum + count, 0) : null
  }
  const ids = await selectedExtensions(root)
  const saved = (await readInstalls(root)).extensions
  const installs = ids.every((id) => validCount(saved[id]?.installs))
    ? ids.reduce((sum, id) => sum + saved[id].installs, 0)
    : null
  return { stars: total("stars"), forks: total("forks"), extensionCount: ids.length, installs }
}
