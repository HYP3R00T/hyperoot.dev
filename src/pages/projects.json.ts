import { getCollection } from "astro:content"
import { compareProjects } from "@/lib/project-catalog"

export const prerender = true

export async function GET() {
  const projects = (await getCollection("projects"))
    .filter((project) => !project.data.draft)
    .sort(compareProjects)
    .map(({ id, data }) => ({
      id,
      repo: data.repo,
      title: data.title,
      description: data.description,
      technologies: data.technologies,
      domains: data.domains,
      featured: data.featured,
      hasPage: data.hasPage,
      pageUrl: data.hasPage ? `/${id}/` : null,
      sourceRepo: data.sourceRepo,
      website: data.website ?? null,
      links: data.links,
      activity: data.activity,
      syncStatus: data.syncStatus,
      github: data.github ?? null,
    }))
  return new Response(JSON.stringify(projects), { headers: { "Content-Type": "application/json" } })
}
