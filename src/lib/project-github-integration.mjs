import { resolve } from "node:path"
import { fileURLToPath } from "node:url"
import { syncExtensionInstalls } from "./catalog-metrics.mjs"
import { syncRepositories } from "./github-projects.mjs"
import { syncPackageDownloads } from "./package-downloads.mjs"

export default function projectGitHubIntegration() {
  return {
    name: "hyperoot-github-projects",
    hooks: {
      "astro:config:setup": async ({ command, config, logger }) => {
        const root = fileURLToPath(config.root)
        try {
          process.loadEnvFile(resolve(root, ".env"))
        } catch (error) {
          if (error.code !== "ENOENT") throw error
        }
        await syncRepositories(root, {
          force: command === "build",
          offline: process.env.PROJECTS_OFFLINE === "1",
          warn: (message) => logger.warn(message),
        })
        await syncPackageDownloads(root, {
          offline: process.env.PROJECTS_OFFLINE === "1",
          warn: (message) => logger.warn(message),
        })
        await syncExtensionInstalls(root, {
          offline: process.env.PROJECTS_OFFLINE === "1",
          warn: (message) => logger.warn(message),
        })
      },
    },
  }
}
