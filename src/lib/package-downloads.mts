import { mkdir, readFile, rename, writeFile } from "node:fs/promises"
import { dirname, resolve } from "node:path"
import { readProjectSources } from "./github-projects.mts"

import { errorMessage, isMissingFile, type SyncOptions } from "./project-data.mts"

interface DownloadRecord {
  totalDownloads: number
  fetchedAt: string
}
interface DownloadSnapshot {
  version: 1
  packages: Record<string, DownloadRecord>
}
interface PackageRegistry {
  projects: { repo: string; packages: string[] }[]
}
class DownloadError extends Error {
  constructor(message: string, publicStatus: number) {
    super(message)
    this.status = publicStatus
  }
  status: number
}

export const DOWNLOAD_SNAPSHOT_PATH = "data/package-downloads.json"
const DAY = 24 * 60 * 60 * 1000
const sleep = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms))
const validCount = (count: unknown): count is number =>
  typeof count === "number" && Number.isSafeInteger(count) && count >= 0

export async function selectedPackages(root: string) {
  const sources = await readProjectSources(root)
  const visible = new Set(sources.filter(({ data }) => !data.draft).map(({ data }) => data.repo.toLowerCase()))
  const registry = JSON.parse(await readFile(resolve(root, "data/pypi-packages.json"), "utf8")) as PackageRegistry
  return [
    ...new Set(
      registry.projects
        .filter((project) => visible.has(project.repo.toLowerCase()))
        .flatMap((project) => project.packages)
        .map((name) => name.toLowerCase().replace(/[-_.]+/g, "-")),
    ),
  ].sort()
}

export async function readDownloadSnapshot(root: string): Promise<DownloadSnapshot> {
  try {
    const snapshot = JSON.parse(await readFile(resolve(root, DOWNLOAD_SNAPSHOT_PATH), "utf8"))
    if (snapshot.version !== 1 || !snapshot.packages) throw new Error("Invalid package download snapshot")
    return snapshot
  } catch (error) {
    if (isMissingFile(error)) return { version: 1, packages: {} }
    throw error
  }
}

export async function fetchPackageDownloads(
  name: string,
  {
    key,
    fetchImpl = fetch,
    sleepImpl = sleep,
  }: { key: string; fetchImpl?: typeof fetch; sleepImpl?: (ms: number) => Promise<void> },
) {
  for (let attempt = 0; attempt < 3; attempt++) {
    const response = await fetchImpl(`https://api.pepy.tech/api/v2/projects/${encodeURIComponent(name)}`, {
      headers: { "X-API-Key": key },
      signal: AbortSignal.timeout(20000),
    })
    if (response.status === 429 && attempt < 2) {
      const retry = Number(
        response.headers.get("X-Rate-Limit-Retry-After-Seconds") ?? response.headers.get("Retry-After"),
      )
      await sleepImpl((Number.isFinite(retry) && retry > 0 ? retry : 60) * 1000 + 200)
      continue
    }
    if (!response.ok) {
      throw new DownloadError(`Pepy returned ${response.status} for ${name}`, response.status)
    }
    const data = await response.json()
    if (
      String(data.id)
        .toLowerCase()
        .replace(/[-_.]+/g, "-") !== name ||
      !validCount(data.total_downloads)
    )
      throw new Error(`Invalid Pepy download total for ${name}`)
    const remaining = response.headers.get("X-Rate-Limit-Remaining")
    return { totalDownloads: data.total_downloads, remaining: remaining === null ? null : Number(remaining) }
  }
  throw new Error(`Could not fetch downloads for ${name}`)
}

export async function syncPackageDownloads(
  root: string,
  {
    key = process.env.PEPY_API_KEY,
    offline = false,
    force = false,
    now = new Date(),
    fetchImpl = fetch,
    sleepImpl = sleep,
    warn = console.warn,
  }: SyncOptions & { key?: string; sleepImpl?: (ms: number) => Promise<void> } = {},
) {
  const names = await selectedPackages(root)
  const previous = await readDownloadSnapshot(root)
  const packages: DownloadSnapshot["packages"] = {}
  let waitBeforeNext = false
  let authenticationFailed = false
  for (const name of names) {
    const cached = previous.packages[name]
    const fresh = validCount(cached?.totalDownloads) && now.getTime() - Date.parse(cached.fetchedAt) < DAY
    if (offline || !key || (!force && fresh) || authenticationFailed) {
      if (cached) packages[name] = cached
      continue
    }
    if (waitBeforeNext) await sleepImpl(13000)
    try {
      const data = await fetchPackageDownloads(name, { key, fetchImpl, sleepImpl })
      packages[name] = { totalDownloads: data.totalDownloads, fetchedAt: now.toISOString() }
      // Use the documented burst allowance only while the server reports available tokens.
      waitBeforeNext = !(data.remaining !== null && Number.isFinite(data.remaining) && data.remaining > 0)
    } catch (error) {
      if (cached) packages[name] = cached
      warn(`${errorMessage(error)}; ${cached ? "keeping the saved total" : "download total unavailable"}.`)
      waitBeforeNext = true
      if (error instanceof DownloadError && (error.status === 401 || error.status === 403)) authenticationFailed = true
    }
  }
  const snapshot: DownloadSnapshot = { version: 1, packages }
  if (!offline && JSON.stringify(snapshot) !== JSON.stringify(previous)) {
    const path = resolve(root, DOWNLOAD_SNAPSHOT_PATH)
    await mkdir(dirname(path), { recursive: true })
    const temporaryPath = `${path}.${process.pid}.tmp`
    await writeFile(temporaryPath, `${JSON.stringify(snapshot, null, 2)}\n`)
    await rename(temporaryPath, path)
  }
  return snapshot
}

export async function packageMetrics(root: string, now = new Date()) {
  const names = await selectedPackages(root)
  const snapshot = await readDownloadSnapshot(root)
  const records = names.map((name) => snapshot.packages[name])
  const complete = records.every(
    (record) => validCount(record?.totalDownloads) && Number.isFinite(Date.parse(record?.fetchedAt)),
  )
  const total = complete ? records.reduce((sum, record) => sum + record.totalDownloads, 0) : null
  const fetchedAt =
    complete && records.length
      ? new Date(Math.min(...records.map((record) => Date.parse(record.fetchedAt)))).toISOString()
      : null
  return {
    packageCount: names.length,
    totalDownloads: validCount(total) ? total : null,
    fetchedAt,
    stale: fetchedAt ? now.getTime() - Date.parse(fetchedAt) >= DAY : false,
  }
}
