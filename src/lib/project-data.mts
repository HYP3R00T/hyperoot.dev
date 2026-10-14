/** Build-only metadata; never imported by browser scripts. */
export interface ProjectSourceData {
  repo: string
  draft?: boolean
  private?: boolean
  hasPage?: boolean
  title?: string
  description?: string
  technologies?: string[]
  domains?: string[]
  sourceRepo?: string
  website?: string
  lastUpdated?: string
  commit?: { date?: string }
  [key: string]: unknown
}
export interface RepositoryData {
  name: string
  description: string
  url: string
  website: string | null
  topics: string[]
  language: string | null
  stars: number
  forks: number
  issues: number
  pullRequests: number
  defaultBranch: string | null
  latestCommit: { sha: string; url: string; date: string } | null
  commitCount?: number
  createdAt: string
  pushedAt: string
  archived: boolean
  fork: boolean
  template: boolean
  license: string | null
}
export interface RepositoryRecord {
  status: "fresh" | "stale" | "unavailable"
  checkedAt?: string
  fetchedAt: string | null
  data: RepositoryData | null
}
export interface RepositorySnapshot {
  version: 1
  repositories: Record<string, RepositoryRecord>
}
export interface SyncOptions {
  offline?: boolean
  force?: boolean
  now?: Date
  fetchImpl?: typeof fetch
  warn?: (message: string) => void
}
export function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error)
}
export function isMissingFile(error: unknown): boolean {
  return error instanceof Error && "code" in error && error.code === "ENOENT"
}
