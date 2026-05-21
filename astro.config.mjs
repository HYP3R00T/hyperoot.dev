// @ts-check

import mdx from '@astrojs/mdx'
import react from '@astrojs/react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'astro/config'
import AutoImport from 'astro-auto-import'
import icon from 'astro-icon'

export default defineConfig({
  site: 'https://hyperoot.dev',
  prefetch: true,

  markdown: {
    shikiConfig: {
      theme: 'poimandres',
    },
  },

  integrations: [
    icon({
      iconDir: 'src/assets/icons',
      svgoOptions: {
        plugins: [
          {
            name: 'convertColors',
            params: {
              currentColor: true,
            },
          },
        ],
      },
    }),
    AutoImport({
      imports: ['./src/components/core/Video.astro'],
    }),
    mdx(),
    react(),
  ],

  vite: {
    plugins: [tailwindcss()],
  },
})
