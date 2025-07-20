import { defineConfig } from 'vitepress'
import {
  groupIconMdPlugin,
  groupIconVitePlugin,
} from 'vitepress-plugin-group-icons'
import { tabsMarkdownPlugin } from 'vitepress-plugin-tabs'

export default defineConfig({
  title: 'hyperoot.dev',
  description: 'A VitePress Site',
  themeConfig: {
    siteTitle: 'Hyperoot',
    logo: '/assets/Logo.svg',
    footer: {
      message: 'Released under the MIT License.',
      copyright:
        'Copyright © 2025-present <a href="https://github.com/HYP3R00T">Hyperoot</a>',
    },
    search: {
      provider: 'local',
    },
    nav: [
      { text: 'Home', link: '/' },
      { text: 'Examples', link: '/markdown-examples' },
    ],

    sidebar: [
      {
        text: 'Examples',
        collapsed: true,
        items: [{ text: 'Markdown Examples', link: '/markdown-examples' }],
      },
    ],

    socialLinks: [{ icon: 'github', link: 'https://github.com/HYP3R00T' }],
  },
  markdown: {
    config(md) {
      md.use(groupIconMdPlugin)
      md.use(tabsMarkdownPlugin)
    },
  },
  vite: {
    plugins: [groupIconVitePlugin()],
    server: {
      watch: {
        usePolling: true, // Enable polling
        interval: 1000, // Check every 1000ms (adjust if needed)
      },
      host: '0.0.0.0', // Ensure the server binds to all interfaces
      port: 5555,
    },
  },
})
