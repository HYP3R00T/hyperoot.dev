import type { CollectionEntry } from "astro:content"

export function compareProjects(a: CollectionEntry<"projects">, b: CollectionEntry<"projects">) {
  const recent = (Date.parse(b.data.github?.pushedAt ?? "") || 0) - (Date.parse(a.data.github?.pushedAt ?? "") || 0)
  return recent || (a.data.order ?? 999) - (b.data.order ?? 999) || a.data.title.localeCompare(b.data.title)
}
