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
  ignoreDeadLinks: true,
  head: [['link', { rel: 'icon', href: '/favicon.ico' }]],
  markdown: {
    config(md) {
      md.use(groupIconMdPlugin)
      md.use(tabsMarkdownPlugin)
    },
  },
  vite: {
    plugins: [groupIconVitePlugin()],
  },
  themeConfig: {
    siteTitle: 'Hyperoot',
    logo: '/Logo.svg',
    socialLinks: [
      { icon: 'github', link: 'https://github.com/HYP3R00T' },
      { icon: 'youtube', link: 'https://youtube.com/@hyperoot' },
      {
        icon: {
          svg: `<svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <title>LinkedIn</title>
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853
                           0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.047c.477-.9
                           1.637-1.852 3.372-1.852 3.606 0 4.271 2.372 4.271 5.455v6.288zM5.337
                           7.433a2.062 2.062 0 1 1 0-4.124 2.062 2.062 0 0 1 0 4.124zM7.119
                           20.452H3.554V9h3.565v11.452zM22.225 0H1.771C.792 0 0
                           .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2
                           24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222
                           0h.003z"/>
                </svg>`,
        },
        link: 'https://linkedin.com/in/rajesh-kumar-das',
      },
    ],
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
          {
            text: 'Celestial Docs',
            link: 'https://celestialdocs.hyperoot.dev/',
          },
          {
            text: 'Cost Cutter',
            link: 'https://github.com/HYP3R00T/CostCutter',
          },
          {
            text: 'Python-Template',
            link: '/python-template/setup.md',
          },
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
          link: '/homelab/intro.md',
        },
      ],
      'python-template': [
        {
          text: 'Setup',
          link: '/python-template/setup.md',
        },
      ],
    },
  },
})
