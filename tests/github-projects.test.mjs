import assert from "node:assert/strict"
import { mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises"
import { tmpdir } from "node:os"
import { join } from "node:path"
import test from "node:test"
import {
  fetchRepository,
  mergeProjectMetadata,
  readProjectSources,
  repositoryActivity,
  SNAPSHOT_PATH,
  syncRepositories,
} from "../src/lib/github-projects.mjs"

const now = new Date("2026-10-13T00:00:00Z")
const githubResponse = {
  name: "tool",
  html_url: "https://github.com/example/tool",
  description: "GitHub description",
  homepage: "https://example.com",
  topics: ["python"],
  language: "Python",
  stargazers_count: 5,
  forks_count: 2,
  created_at: "2025-01-01T00:00:00Z",
  pushed_at: "2026-10-12T00:00:00Z",
  archived: false,
  fork: false,
  is_template: false,
  private: false,
  license: { spdx_id: "MIT" },
}
const fetchSuccess = async () => new Response(JSON.stringify(githubResponse))

async function fixture(t) {
  const root = await mkdtemp(join(tmpdir(), "hyperoot-projects-"))
  t.after(() => rm(root, { recursive: true, force: true }))
  await mkdir(join(root, "content/projects"), { recursive: true })
  await writeFile(
    join(root, "content/projects/tool.mdx"),
    "---\nrepo: example/tool\ntitle: Local title\nhasPage: false\n---\n",
  )
  return root
}

test("local overrides win, while omitted metadata falls back to GitHub", async () => {
  const data = await fetchRepository("example/tool", { fetchImpl: fetchSuccess })
  const record = { status: "fresh", fetchedAt: now.toISOString(), data }
  const project = mergeProjectMetadata(
    {
      repo: "example/tool",
      title: "My title",
      description: "",
      website: "https://local.example",
      technologies: [],
      links: [{ label: "Docs", url: "https://docs.example" }],
    },
    record,
    now,
  )
  assert.equal(project.title, "My title")
  assert.equal(project.description, "")
  assert.equal(project.website, "https://local.example")
  assert.deepEqual(project.technologies, [])
  assert.equal(project.links[0].label, "Docs")
  assert.equal(project.github.stars, 5)
  const fallback = mergeProjectMetadata({ repo: "example/tool" }, record, now)
  assert.equal(fallback.title, "tool")
  assert.deepEqual(fallback.technologies, ["python"])
})

test("activity uses push dates and archival takes precedence", () => {
  assert.equal(repositoryActivity(null, now), "unknown")
  assert.equal(repositoryActivity({ pushedAt: "2026-07-15T00:00:00Z" }, now), "recently-active")
  assert.equal(repositoryActivity({ pushedAt: "2026-07-14T23:59:59Z" }, now), "quiet")
  assert.equal(repositoryActivity({ ...githubResponse, archived: true }, now), "archived")
})

test("refresh failure preserves successful metadata and its original fetch time", async (t) => {
  const root = await fixture(t)
  const first = await syncRepositories(root, { force: true, fetchImpl: fetchSuccess, now })
  const warnings = []
  const failed = await syncRepositories(root, {
    force: true,
    fetchImpl: async () => new Response(null, { status: 503 }),
    now: new Date("2026-10-14T00:00:00Z"),
    warn: (message) => warnings.push(message),
  })
  assert.equal(failed.repositories["example/tool"].status, "stale")
  assert.deepEqual(failed.repositories["example/tool"].data, first.repositories["example/tool"].data)
  assert.equal(failed.repositories["example/tool"].fetchedAt, now.toISOString())
  assert.equal(warnings.length, 1)
  const disk = JSON.parse(await readFile(join(root, SNAPSHOT_PATH), "utf8"))
  assert.deepEqual(disk, failed)
})

test("offline mode makes no requests; new unavailable projects remain usable", async (t) => {
  const root = await fixture(t)
  const snapshot = await syncRepositories(root, {
    offline: true,
    fetchImpl: () => assert.fail("Network request in offline mode"),
  })
  const project = mergeProjectMetadata(
    { repo: "example/tool", title: "Local title" },
    snapshot.repositories["example/tool"],
    now,
  )
  assert.equal(project.title, "Local title")
  assert.equal(project.activity, "unknown")
  assert.equal(project.syncStatus, "unavailable")
  assert.equal(project.github, undefined)
})

test("private repository responses cannot enter the public snapshot", async () => {
  await assert.rejects(
    fetchRepository("example/tool", {
      fetchImpl: async () => new Response(JSON.stringify({ ...githubResponse, private: true })),
    }),
    /private/,
  )
})

test("dev reloads reuse recent fetch attempts, and forced sync retries", async (t) => {
  const root = await fixture(t)
  let requests = 0
  const unavailable = async () => {
    requests++
    return new Response(null, { status: 404 })
  }
  const options = { now, fetchImpl: unavailable, warn: () => {} }
  await syncRepositories(root, options)
  await syncRepositories(root, options)
  assert.equal(requests, 1)
  await syncRepositories(root, { ...options, force: true })
  assert.equal(requests, 2)
})

test("authored private projects remain visible without fetching or exposing repository links", async (t) => {
  const root = await fixture(t)
  await writeFile(
    join(root, "content/projects/tool.mdx"),
    "---\nrepo: example/tool\ntitle: Private tool\nprivate: true\n---\n",
  )
  const snapshot = await syncRepositories(root, { fetchImpl: () => assert.fail("Private repository fetched") })
  assert.deepEqual(snapshot.repositories, {})
  const project = mergeProjectMetadata({ repo: "example/tool", private: true, title: "Private tool" }, undefined, now)
  assert.equal(project.title, "Private tool")
  assert.equal(project.sourceRepo, undefined)
  assert.equal(project.github, undefined)
})

test("hasPage requires a body and repositories cannot be duplicated", async (t) => {
  const root = await fixture(t)
  const path = join(root, "content/projects/tool.mdx")
  await writeFile(path, "---\nrepo: example/tool\nhasPage: true\n---\n")
  await assert.rejects(readProjectSources(root), /write-up/)
  await writeFile(path, "---\nrepo: example/tool\nhasPage: true\n---\nA write-up.\n")
  await writeFile(join(root, "content/projects/duplicate.mdx"), "---\nrepo: Example/Tool\n---\n")
  await assert.rejects(readProjectSources(root), /Duplicate/)
})
