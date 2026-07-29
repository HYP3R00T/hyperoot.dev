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
  pageSize: 12,
  lang: 'en',
}

export const navItems: NavItem[] = [
  { href: '/#projects', label: 'Projects' },
  { href: 'https://rajeshdas.dev', label: 'Contact', blank: true },
]

export const SOCIAL_LINKS = [
  {
    name: 'github',
    href: 'https://github.com/HYP3R00T',
    active: true,
    linkTitle: 'Visit the Hyperoot GitHub profile',
  },
  {
    name: 'linkedin',
    href: 'https://linkedin.com/in/rajesh-kumar-das',
    active: true,
    linkTitle: 'Connect with Rajesh on LinkedIn',
  },
  {
    name: 'mail',
    href: 'mailto:hello@rajeshdas.dev',
    active: true,
    linkTitle: 'Send Rajesh an email',
  },
]
