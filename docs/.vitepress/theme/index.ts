import DefaultTheme from 'vitepress/theme'
import type { Theme } from 'vitepress'
import { enhanceAppWithTabs } from 'vitepress-plugin-tabs/client'
import HomeAbout from './components/HomeAbout.vue'
import HomeFeatures from './components/HomeFeatures.vue'

import './custom.css'
import 'virtual:group-icons.css'

export default {
  extends: DefaultTheme,
  enhanceApp({ app }) {
    enhanceAppWithTabs(app),
      app.component('HomeAbout', HomeAbout),
      app.component('HomeFeatures', HomeFeatures)
  },
} satisfies Theme
