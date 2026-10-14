import { mkdir, readdir, readFile, rename, writeFile } from "node:fs/promises"
import { dirname, resolve } from "node:path"
import { parse } from "yaml"

export const SNAPSHOT_PATH = "data/github-repositories.json"
export const ACTIVE_DAYS = 30
const REPO_PATTERN = /^[a-z\d](?:[a-z\d-]*[a-z\d])?\/[a-z\d._-]+$/i

export async function readProjectSources(root) {
  const entries = []
  async function walk(directory) {
    for (const file of await readdir(directory, { withFileTypes: true })) {
      const path = resolve(directory, file.name)
      if (file.isDirectory()) await walk(path)
      else if (/\.mdx?$/.test(file.name)) {
        const text = await readFile(path, "utf8")
        const match = text.match(/^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)([\s\S]*)$/)
        if (!match) throw new Error(`Missing frontmatter: ${path}`)
        const data = parse(match[1])
        if (!data || !REPO_PATTERN.test(data.repo ?? "")) throw new Error(`Expected repo: owner/name in ${path}`)
        if (data.hasPage && !match[2].trim()) throw new Error(`hasPage requires a write-up in ${path}`)
        entries.push({ path, data })
      }
    }
  }
  await walk(resolve(root, "content/projects"))
  const seen = new Set()
  for (const { data } of entries) {
    const key = data.repo.toLowerCase()
    if (seen.has(key)) throw new Error(`Duplicate project repository: ${data.repo}`)
    seen.add(key)
  }
  return entries
}

export async function readSnapshot(root) {
  try {
    const snapshot = JSON.parse(await readFile(resolve(root, SNAPSHOT_PATH), "utf8"))
    if (snapshot.version !== 1 || !snapshot.repositories) throw new Error("Invalid GitHub snapshot")
    return snapshot
  } catch (error) {
    if (error.code === "ENOENT") return { version: 1, repositories: {} }
    throw error
  }
}

/** Fetch only public metadata; never serialize API credentials or the full response. */
export async function fetchRepository(repo, { fetchImpl = fetch, token = process.env.GITHUB_TOKEN } = {}) {
  const options = {
    headers: {
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2026-03-10",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    signal: AbortSignal.timeout(15000),
  }
  const response = await fetchImpl(`https://api.github.com/repos/${repo}`, options)
  if (!response.ok) throw new Error(`GitHub returned ${response.status} for ${repo}`)
  const data = await response.json()
  if (data.private || data.visibility === "private") throw new Error(`Repository is private: ${repo}`)
  if (!data.name || !data.html_url) throw new Error(`Invalid GitHub response for ${repo}`)
  let pullRequests = 0
  // open_issues_count includes PRs. per_page=1 makes the last page number the exact PR count.
  if (data.open_issues_count > 0) {
    const pulls = await fetchImpl(`https://api.github.com/repos/${repo}/pulls?state=open&per_page=1`, options)
    if (!pulls.ok) throw new Error(`GitHub returned ${pulls.status} while counting pull requests for ${repo}`)
    const lastPage = pulls.headers.get("link")?.match(/<([^>]+)>; rel="last"/)
    pullRequests = lastPage ? Number(new URL(lastPage[1]).searchParams.get("page")) : (await pulls.json()).length
  }
  let latestCommit = null
  if (data.default_branch) {
    const commitResponse = await fetchImpl(
      `https://api.github.com/repos/${repo}/commits/${encodeURIComponent(data.default_branch)}`,
      options,
    )
    if (commitResponse.status !== 409) {
      if (!commitResponse.ok)
        throw new Error(`GitHub returned ${commitResponse.status} while reading the latest commit for ${repo}`)
      const commit = await commitResponse.json()
      latestCommit = { sha: commit.sha, url: commit.html_url, date: commit.commit.committer.date }
    }
  }
  return {
    name: data.name,
    description: data.description ?? "",
    url: data.html_url,
    website: data.homepage || null,
    topics: data.topics ?? [],
    language: data.language ?? null,
    stars: data.stargazers_count,
    forks: data.forks_count,
    issues: Math.max(0, (data.open_issues_count ?? 0) - pullRequests),
    pullRequests,
    defaultBranch: data.default_branch ?? null,
    latestCommit,
    createdAt: data.created_at,
    pushedAt: data.pushed_at,
    archived: data.archived,
    fork: data.fork,
    template: data.is_template,
    license: data.license?.spdx_id ?? null,
  }
}

export async function syncRepositories(
  root,
  {
    force = false,
    offline = false,
    strict = false,
    fetchImpl = fetch,
    token,
    now = new Date(),
    warn = console.warn,
  } = {},
) {
  const sources = await readProjectSources(root)
  const previous = await readSnapshot(root)
  const repositories = {}
  let failures = 0
  for (const { data } of sources) {
    if (data.draft || data.private) continue
    const key = data.repo.toLowerCase()
    const cached = previous.repositories[key]
    if (
      offline ||
      (!force && cached && now.getTime() - Date.parse(cached.checkedAt ?? cached.fetchedAt) < 6 * 60 * 60 * 1000)
    ) {
      repositories[key] = cached ?? { status: "unavailable", fetchedAt: null, data: null }
      continue
    }
    try {
      repositories[key] = {
        status: "fresh",
        checkedAt: now.toISOString(),
        fetchedAt: now.toISOString(),
        data: await fetchRepository(data.repo, { fetchImpl, token }),
      }
    } catch (error) {
      failures++
      warn(`${error.message}; ${cached?.data ? "using the last successful snapshot" : "using local metadata only"}.`)
      repositories[key] = {
        status: cached?.data ? "stale" : "unavailable",
        checkedAt: now.toISOString(),
        fetchedAt: cached?.fetchedAt ?? null,
        data: cached?.data ?? null,
      }
    }
  }
  if (strict && failures) throw new Error(`Could not refresh ${failures} repositories`)
  const snapshot = { version: 1, repositories }
  const path = resolve(root, SNAPSHOT_PATH)
  if (!offline && JSON.stringify(previous) !== JSON.stringify(snapshot)) {
    await mkdir(dirname(path), { recursive: true })
    const temporaryPath = `${path}.${process.pid}.tmp`
    await writeFile(temporaryPath, `${JSON.stringify(snapshot, null, 2)}\n`)
    await rename(temporaryPath, path)
  }
  return snapshot
}

export function repositoryActivity(data, now = new Date()) {
  if (data?.archived || !data?.pushedAt) return false
  const age = now.getTime() - Date.parse(data.pushedAt)
  return age >= 0 && age <= ACTIVE_DAYS * 86400000
}

export function mergeProjectMetadata(local, record, now = new Date()) {
  const github = local.private ? undefined : record?.data
  return {
    ...local,
    title: local.title ?? github?.name ?? local.repo.split("/")[1],
    description: local.description ?? github?.description ?? "",
    technologies: local.technologies ?? github?.topics ?? [],
    domains: local.domains ?? [],
    sourceRepo: local.private ? undefined : (local.sourceRepo ?? github?.url ?? `https://github.com/${local.repo}`),
    website: local.website ?? github?.website ?? undefined,
    github: github ? { ...github, fetchedAt: record.fetchedAt } : undefined,
    syncStatus: record?.status ?? "unavailable",
    active: repositoryActivity(github ?? { pushedAt: local.lastUpdated ?? local.commit?.date }, now),
  }
}
