import assert from "node:assert/strict"
import { mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises"
import { tmpdir } from "node:os"
import { join } from "node:path"
import test from "node:test"
import {
  DOWNLOAD_SNAPSHOT_PATH,
  fetchPackageDownloads,
  packageMetrics,
  selectedPackages,
  syncPackageDownloads,
} from "../src/lib/package-downloads.mts"

const now = new Date("2026-10-14T00:00:00Z")
async function fixture(t, snapshot) {
  const root = await mkdtemp(join(tmpdir(), "hyperoot-downloads-"))
  t.after(() => rm(root, { recursive: true, force: true }))
  await mkdir(join(root, "content/projects"), { recursive: true })
  await mkdir(join(root, "data"))
  await writeFile(join(root, "content/projects/public.mdx"), "---\nrepo: example/tool\n---\n")
  await writeFile(join(root, "content/projects/hidden.mdx"), "---\nrepo: example/hidden\ndraft: true\n---\n")
  await writeFile(
    join(root, "data/pypi-packages.json"),
    JSON.stringify({
      projects: [
        { repo: "Example/Tool", packages: ["Tool_Core", "tool-core", "tool"] },
        { repo: "example/hidden", packages: ["hidden"] },
      ],
    }),
  )
  if (snapshot) await writeFile(join(root, DOWNLOAD_SNAPSHOT_PATH), JSON.stringify({ version: 1, packages: snapshot }))
  return root
}
const response = (name, total, remaining = "9") =>
  new Response(JSON.stringify({ id: name, total_downloads: total }), {
    headers: remaining === null ? {} : { "X-Rate-Limit-Remaining": remaining },
  })

test("package selection excludes drafts and deduplicates normalized PyPI names", async (t) => {
  assert.deepEqual(await selectedPackages(await fixture(t)), ["tool", "tool-core"])
})

test("cached totals avoid requests for 24 hours, then refresh", async (t) => {
  const root = await fixture(t, {
    tool: { totalDownloads: 5, fetchedAt: now.toISOString() },
    "tool-core": { totalDownloads: 10, fetchedAt: now.toISOString() },
  })
  await syncPackageDownloads(root, {
    key: "test-key",
    now: new Date(now.getTime() + 23 * 3600000),
    fetchImpl: () => assert.fail("Fresh cache fetched"),
  })
  const requests = []
  await syncPackageDownloads(root, {
    key: "test-key",
    now: new Date(now.getTime() + 24 * 3600000),
    fetchImpl: async (url) => {
      const name = url.split("/").at(-1)
      requests.push(name)
      return response(name, 20)
    },
  })
  assert.equal(requests.length, 2)
  assert.equal((await packageMetrics(root, now)).totalDownloads, 40)
  assert.ok(!(await readFile(join(root, DOWNLOAD_SNAPSHOT_PATH), "utf8")).includes("test-key"))
})

test("failed refresh retains totals and timestamps without pretending they are fresh", async (t) => {
  const root = await fixture(t, {
    tool: { totalDownloads: 5, fetchedAt: now.toISOString() },
    "tool-core": { totalDownloads: 10, fetchedAt: now.toISOString() },
  })
  const later = new Date(now.getTime() + 2 * 86400000)
  await syncPackageDownloads(root, {
    key: "test-key",
    now: later,
    fetchImpl: async () => new Response(null, { status: 503 }),
    sleepImpl: async () => {},
    warn: () => {},
  })
  const metrics = await packageMetrics(root, later)
  assert.equal(metrics.totalDownloads, 15)
  assert.equal(metrics.fetchedAt, now.toISOString())
  assert.equal(metrics.stale, true)
})

test("a missing package total never becomes a misleading partial aggregate", async (t) => {
  const root = await fixture(t, { tool: { totalDownloads: 5, fetchedAt: now.toISOString() } })
  assert.equal((await packageMetrics(root, now)).totalDownloads, null)
  await syncPackageDownloads(root, { offline: true, fetchImpl: () => assert.fail("Offline request") })
})

test("server quota allows burst requests; absent headers use conservative spacing", async (t) => {
  for (const remaining of ["9", null]) {
    const root = await fixture(t)
    const waits = []
    await syncPackageDownloads(root, {
      key: "test-key",
      now,
      sleepImpl: async (ms) => waits.push(ms),
      fetchImpl: async (url) => response(url.split("/").at(-1), 1, remaining),
    })
    assert.deepEqual(waits, remaining === null ? [13000] : [])
  }
})

test("429 retries honor Pepy's retry header", async () => {
  let attempts = 0
  const waits = []
  const result = await fetchPackageDownloads("tool", {
    key: "test-key",
    sleepImpl: async (ms) => waits.push(ms),
    fetchImpl: async () =>
      ++attempts === 1
        ? new Response(null, { status: 429, headers: { "X-Rate-Limit-Retry-After-Seconds": "12" } })
        : response("tool", 8),
  })
  assert.equal(result.totalDownloads, 8)
  assert.deepEqual(waits, [12200])
})

test("wrong package names and invalid totals are rejected", async () => {
  for (const [name, total] of [
    ["other", 5],
    ["tool", -1],
    ["tool", 1.5],
  ])
    await assert.rejects(
      fetchPackageDownloads("tool", { key: "test-key", fetchImpl: async () => response(name, total) }),
      /Invalid Pepy/,
    )
})

test("an invalid key stops further API calls", async (t) => {
  const root = await fixture(t)
  let calls = 0
  await syncPackageDownloads(root, {
    key: "test-key",
    now,
    warn: () => {},
    fetchImpl: async () => {
      calls++
      return new Response(null, { status: 401 })
    },
  })
  assert.equal(calls, 1)
})
