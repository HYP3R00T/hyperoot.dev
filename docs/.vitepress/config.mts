import { defineConfig } from 'vitepress'
import {
  groupIconMdPlugin,
  groupIconVitePlugin,
} from 'vitepress-plugin-group-icons'
import { tabsMarkdownPlugin } from 'vitepress-plugin-tabs'

export default defineConfig({
  title: 'hyperoot.dev',
  description: 'A VitePress Site',
  lastUpdated: true,
  cleanUrls: true,
  head: [['link', { rel: 'icon', href: '/favicon.ico' }]],
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
  themeConfig: {
    siteTitle: 'Hyperoot',
    logo: '/Logo.svg',
    socialLinks: [{ icon: 'github', link: 'https://github.com/HYP3R00T' }],
    editLink: {
      pattern: 'https://github.com/HYP3R00T/hyperoot.dev/edit/main/docs/:path',
    },
    footer: {
      message: 'Released under the MIT License.',
      copyright:
        'Copyright © 2025-present <a href="https://github.com/HYP3R00T">Hyperoot</a>',
    },
    search: {
      provider: 'local',
    },
    outline: 'deep',
    nav: [
      { text: 'Home', link: '/' },
      { text: 'Learn', link: '/learn/start-here' },
      {
        text: 'Projects',
        items: [
          { text: 'Homelab', link: 'https://github.com/HYP3R00T/homelab' },
          { text: 'Dotfiles', link: 'https://github.com/HYP3R00T/.dotfiles' },
        ],
      },
    ],
    sidebar: {
      learn: [
        {
          text: 'Start Here',
          link: '/learn/start-here',
        },
        {
          text: 'Environment Setup',
          collapsed: true,
          items: [
            {
              text: 'Mise-en-place',
              collapsed: true,
              items: [
                {
                  text: 'Getting Started',
                  link: '/learn/mise-en-place/01-getting-started.md',
                },
                {
                  text: 'Installing tools',
                  link: '/learn/mise-en-place/02-installing-tools.md',
                },
                {
                  text: 'Configuration',
                  link: '/learn/mise-en-place/03-configuration.md',
                },
              ],
            },
          ],
        },
      ],
      homelab: [
        {
          text: 'Homelab Overview',
          link: '/homelab/intro',
        },
      ],
    },
  },
})
