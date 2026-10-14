import assert from "node:assert/strict"
import { mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises"
import { tmpdir } from "node:os"
import { join } from "node:path"
import test from "node:test"
import { catalogMetrics, fetchExtensionInstalls, syncExtensionInstalls } from "../src/lib/catalog-metrics.mjs"

const response = (value, id = "settings-organizer") => ({
  ok: true,
  json: async () => ({
    results: [
      {
        extensions: [
          {
            publisher: { publisherName: "hyperoot" },
            extensionName: id,
            statistics: [{ statisticName: "install", value }],
          },
        ],
      },
    ],
  }),
})

async function fixture(t) {
  const root = await mkdtemp(join(tmpdir(), "catalog-metrics-"))
  t.after(() => rm(root, { recursive: true, force: true }))
  await mkdir(join(root, "content/projects"), { recursive: true })
  await mkdir(join(root, "data"))
  for (const [repo, draft] of [
    ["settings-organizer", false],
    ["hidden", true],
  ]) {
    await writeFile(join(root, `content/projects/${repo}.mdx`), `---\nrepo: HYP3R00T/${repo}\ndraft: ${draft}\n---\n`)
  }
  await writeFile(
    join(root, "data/vscode-extensions.json"),
    JSON.stringify({
      projects: [
        { repo: "HYP3R00T/settings-organizer", extension: "hyperoot.settings-organizer" },
        { repo: "HYP3R00T/hidden", extension: "hyperoot.hidden" },
      ],
    }),
  )
  await writeFile(
    join(root, "data/github-repositories.json"),
    JSON.stringify({
      version: 1,
      repositories: {
        "hyp3r00t/settings-organizer": { data: { stars: 5, forks: 1 } },
        "hyp3r00t/hidden": { data: { stars: 999, forks: 999 } },
      },
    }),
  )
  return root
}

test("reads install statistic, validates identity and counts", async () => {
  assert.equal(
    await fetchExtensionInstalls("hyperoot.settings-organizer", { fetchImpl: async () => response(1687) }),
    1687,
  )
  for (const value of [-1, "1687", 1.5])
    await assert.rejects(
      fetchExtensionInstalls("hyperoot.settings-organizer", { fetchImpl: async () => response(value) }),
    )
  await assert.rejects(
    fetchExtensionInstalls("hyperoot.settings-organizer", { fetchImpl: async () => response(12, "other") }),
  )
})

test("aggregates visible projects only; reuses daily cache and retains results on failure", async (t) => {
  const root = await fixture(t)
  const now = new Date("2026-10-14T12:00:00Z")
  let calls = 0
  const fetchImpl = async () => {
    calls++
    return response(1687)
  }
  await syncExtensionInstalls(root, { now, fetchImpl })
  await syncExtensionInstalls(root, { now, fetchImpl })
  assert.equal(calls, 1)
  assert.deepEqual(await catalogMetrics(root), { stars: 5, forks: 1, extensionCount: 1, installs: 1687 })
  await syncExtensionInstalls(root, {
    now: new Date("2026-10-15T12:01:00Z"),
    fetchImpl: async () => {
      throw new Error("Unavailable")
    },
    warn: () => {},
  })
  assert.equal((await catalogMetrics(root)).installs, 1687)
  const snapshot = await readFile(join(root, "data/extension-installs.json"), "utf8")
  await syncExtensionInstalls(root, {
    offline: true,
    fetchImpl: async () => {
      throw new Error("Must not fetch")
    },
  })
  assert.equal(await readFile(join(root, "data/extension-installs.json"), "utf8"), snapshot)
})

test("missing records render unavailable rather than fabricated zero totals", async (t) => {
  const root = await fixture(t)
  await writeFile(join(root, "data/github-repositories.json"), JSON.stringify({ version: 1, repositories: {} }))
  assert.deepEqual(await catalogMetrics(root), { stars: null, forks: null, extensionCount: 1, installs: null })
})
