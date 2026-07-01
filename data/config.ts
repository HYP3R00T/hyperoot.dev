import placeholder1 from '@/assets/placeholder1.png'
import type { NavItem, SiteConfig } from '@/lib/types'

export const SITE: SiteConfig = {
  website: 'https://hyperoot.dev',
  author: 'Rajesh',
  repo: 'https://github.com/HYP3R00T/hyperoot.dev',
  title: 'Hyperoot Labs',
  description: 'A focused catalog of Hyperoot projects, tools, templates, and case studies.',
  image: placeholder1,
  imageAlt: 'Check out hyperoot.dev',
  contentType: 'Portfolio',
  twitterHandle: '@HYP3R00T',
  pageSize: 10,
  lang: 'en',
}

export const navItems: NavItem[] = [
  {
    href: '/#projects',
    label: 'Projects',
    children: [
      { href: 'https://celestialdocs.hyperoot.dev', label: 'CelestialDocs', blank: true },
      { href: 'https://voicepad.hyperoot.dev/', label: 'VoicePad', blank: true },
      { href: 'https://utilityhub.hyperoot.dev', label: 'UtilityHub', blank: true },
    ],
  },
  { href: 'https://github.com/HYP3R00T', label: 'GitHub', blank: true },
  { href: 'https://rajeshdas.dev', label: 'Personal', blank: true, special: true },
]

export const SOCIAL_LINKS = [
  {
    name: 'github',
    href: 'https://github.com/HYP3R00T',
    active: true,
    linkTitle: 'Visit my GitHub profile',
  },
  {
    name: 'linkedin',
    href: 'https://linkedin.com/in/rajesh-kumar-das',
    active: true,
    linkTitle: 'Connect with me on LinkedIn',
  },
  {
    name: 'mail',
    href: 'mailto:hello@rajeshdas.dev',
    active: true,
    linkTitle: 'Send me an email',
  },
]
