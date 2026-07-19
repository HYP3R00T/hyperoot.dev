import { defineCollection } from 'astro:content'
import { z } from 'astro/zod'
import { localContentLoader } from '@/lib/local-content-loader'

const components = defineCollection({
  loader: localContentLoader({ base: './content/components' }),
  schema: z.object({
    title: z.string(),
    description: z.string().optional(),
    category: z.string().optional(),
  }),
})

const projects = defineCollection({
  loader: localContentLoader({ base: './content/projects' }),
  schema: ({ image }) =>
    z.object({
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
      sourceRepo: z.string().optional(),
      website: z.string().optional(),
      hasPage: z.boolean().optional().default(false),
    }),
})

export const collections = { components, projects }
