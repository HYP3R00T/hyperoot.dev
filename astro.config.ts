import { type RehypePlugins, unified } from "@astrojs/markdown-remark"
import mdx from "@astrojs/mdx"
import react from "@astrojs/react"
import tailwindcss from "@tailwindcss/vite"
import { defineConfig } from "astro/config"
import icon from "astro-icon"
import projectGitHubIntegration from "./src/lib/project-github-integration.mts"
import rehypeCodeBlocks from "./src/lib/rehype-code-blocks.mts"
import rehypeHeadingLinks from "./src/lib/rehype-heading-links.mts"

const rehypePlugins: RehypePlugins = [[rehypeCodeBlocks, { theme: "houston" }], rehypeHeadingLinks]

export default defineConfig({
  site: "https://hyperoot.dev",
  prefetch: true,

  markdown: {
    processor: unified({
      rehypePlugins,
    }),
    syntaxHighlight: false,
  },

  integrations: [
    projectGitHubIntegration(),
    icon({
      iconDir: "src/assets/icons",
      svgoOptions: {
        plugins: [
          {
            name: "convertColors",
            params: {
              currentColor: true,
            },
          },
        ],
      },
    }),
    mdx(),
    react(),
  ],

  vite: {
    plugins: [tailwindcss()],
    ssr: {
      external: ["picomatch", "tinyglobby", "fdir"],
    },
  },
})
