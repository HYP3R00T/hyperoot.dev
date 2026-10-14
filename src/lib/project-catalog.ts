import type { CollectionEntry } from "astro:content"

export const PROJECT_DOMAINS = [
  "Templates",
  "CLI Tools",
  "Libraries",
  "Automation",
  "DevOps",
  "AI",
  "Extensions",
  "Web",
] as const

export function projectUpdatedAt(data: CollectionEntry<"projects">["data"]) {
  return data.github?.pushedAt ?? data.lastUpdated ?? data.github?.latestCommit?.date ?? data.commit?.date
}

export function compareProjects(a: CollectionEntry<"projects">, b: CollectionEntry<"projects">) {
  const recent = (Date.parse(projectUpdatedAt(b.data) ?? "") || 0) - (Date.parse(projectUpdatedAt(a.data) ?? "") || 0)
  return recent || (a.data.order ?? 999) - (b.data.order ?? 999) || a.data.title.localeCompare(b.data.title)
}
