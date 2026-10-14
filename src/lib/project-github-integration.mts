import { resolve } from "node:path"
import { fileURLToPath } from "node:url"
import type { AstroIntegration } from "astro"
import { syncExtensionInstalls } from "./catalog-metrics.mts"
import { syncRepositories } from "./github-projects.mts"
import { syncPackageDownloads } from "./package-downloads.mts"
import { isMissingFile } from "./project-data.mts"

export default function projectGitHubIntegration(): AstroIntegration {
  return {
    name: "hyperoot-github-projects",
    hooks: {
      "astro:config:setup": async ({ command, config, logger }) => {
        const root = fileURLToPath(config.root)
        try {
          process.loadEnvFile(resolve(root, ".env"))
        } catch (error) {
          if (!isMissingFile(error)) throw error
        }
        await syncRepositories(root, {
          force: command === "build",
          offline: process.env.PROJECTS_OFFLINE === "1",
          warn: (message) => logger.warn(message),
        })
        const metricsOptions = {
          offline: process.env.PROJECTS_OFFLINE === "1",
          warn: (message: string) => logger.warn(message),
        }
        await Promise.all([syncPackageDownloads(root, metricsOptions), syncExtensionInstalls(root, metricsOptions)])
      },
    },
  }
}
