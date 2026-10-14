import { defineCollection } from "astro:content"
import { z } from "astro/zod"
import { mergeProjectMetadata, SNAPSHOT_PATH, syncRepositories } from "@/lib/github-projects.mts"
import { localContentLoader } from "@/lib/local-content-loader"
import type { RepositorySnapshot } from "@/lib/project-data.mts"

let projectSnapshot: RepositorySnapshot = { version: 1, repositories: {} }
const projects = defineCollection({
  loader: localContentLoader({
    base: "./content/projects",
    prepare: async (root) => {
      projectSnapshot = await syncRepositories(root, { offline: process.env.PROJECTS_OFFLINE === "1" })
    },
    transformData: async (data) => {
      return mergeProjectMetadata(data, projectSnapshot.repositories[String(data.repo).toLowerCase()])
    },
    watchFiles: [SNAPSHOT_PATH],
  }),
  schema: ({ image }) =>
    z.object({
      repo: z.string().regex(/^[a-z\d](?:[a-z\d-]*[a-z\d])?\/[a-z\d._-]+$/i),
      title: z.string(),
      description: z.string(),
      technologies: z.array(z.string()).default([]),
      domains: z.array(z.string()).default([]),
      icon: z.string().optional(),
      order: z.number().optional(),
      startDate: z.date().optional(),
      endDate: z.date().optional(),
      featured: z.boolean().optional().default(false),
      draft: z.boolean().optional().default(false),
      images: z.array(image()).optional(),
      imageAlt: z.string().optional(),
      openSource: z.boolean().default(true),
      private: z.boolean().optional().default(false),
      sourceRepo: z.url().optional(),
      website: z.url().optional(),
      links: z.array(z.object({ label: z.string().min(1), url: z.url() })).default([]),
      hasPage: z.boolean().optional().default(false),
      active: z.boolean(),
      lastUpdated: z.iso.datetime().optional(),
      commit: z
        .object({
          sha: z.string().regex(/^[a-f\d]{7,40}$/i),
          branch: z.string().optional(),
          date: z.iso.datetime().optional(),
        })
        .optional(),
      syncStatus: z.enum(["fresh", "stale", "unavailable"]),
      github: z
        .object({
          name: z.string(),
          description: z.string(),
          url: z.url(),
          website: z.string().nullable(),
          topics: z.array(z.string()),
          language: z.string().nullable(),
          stars: z.number().int().nonnegative(),
          forks: z.number().int().nonnegative(),
          issues: z.number().int().nonnegative().optional(),
          pullRequests: z.number().int().nonnegative().optional(),
          commitCount: z.number().int().nonnegative().optional(),
          defaultBranch: z.string().nullable().optional(),
          latestCommit: z
            .object({ sha: z.string().regex(/^[a-f\d]{40}$/i), url: z.url(), date: z.iso.datetime() })
            .nullable()
            .optional(),
          createdAt: z.iso.datetime(),
          pushedAt: z.iso.datetime().nullable(),
          archived: z.boolean(),
          fork: z.boolean(),
          template: z.boolean(),
          license: z.string().nullable(),
          fetchedAt: z.iso.datetime(),
        })
        .optional(),
    }),
})

export const collections = { projects }
