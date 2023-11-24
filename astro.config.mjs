import { defineConfig } from "astro/config";
import mdx from "@astrojs/mdx";

export default defineConfig({
  site: "https://hyperoot.dev",
  integrations: [mdx()],
  markdown: {
    syntaxHighlight: "shiki",
    shikiConfig: {
      theme: "css-variables",
      wrap: true,
    },
  },
  prefetch: true,
});
