import DefaultTheme from 'vitepress/theme'
import type { Theme } from 'vitepress'
import { enhanceAppWithTabs } from 'vitepress-plugin-tabs/client'
import { h } from 'vue'

import HomeExtra from './HomeExtra.vue'

import './custom.css'
import 'virtual:group-icons.css'

export default {
  extends: DefaultTheme,
  enhanceApp({ app }) {
    enhanceAppWithTabs(app)
  },
  Layout() {
    return h(DefaultTheme.Layout, null, {
      'home-features-before': () => h(HomeExtra),
    })
  },
} satisfies Theme
