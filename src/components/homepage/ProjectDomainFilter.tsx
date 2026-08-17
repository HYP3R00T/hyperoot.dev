import { useEffect, useMemo, useRef, useState } from 'react'

import { Button } from '@/components/ui/button'

interface Domain {
  label: string
  value: string
  count: number
}

interface ProjectDomainFilterProps {
  domains: Domain[]
  projectCount: number
}

export function ProjectDomainFilter({ domains, projectCount }: ProjectDomainFilterProps) {
  const [selectedDomain, setSelectedDomain] = useState('all')
  const [ready, setReady] = useState(false)
  const cardsRef = useRef<HTMLElement[]>([])
  const availableDomains = useMemo(() => new Set(['all', ...domains.map(({ value }) => value)]), [domains])
  const visibleCount =
    selectedDomain === 'all' ? projectCount : (domains.find(({ value }) => value === selectedDomain)?.count ?? 0)

  useEffect(() => {
    cardsRef.current = [...document.querySelectorAll<HTMLElement>('[data-project-archive-card]')]

    const initialUrl = new URL(window.location.href)
    const domainFromUrl = initialUrl.searchParams.get('domain')
    setSelectedDomain(domainFromUrl && availableDomains.has(domainFromUrl) ? domainFromUrl : 'all')
    setReady(true)

    const rememberArchiveView = (event: MouseEvent) => {
      if (!(event.target instanceof Element) || !event.target.closest('[data-project-case-study-link]')) return
      window.sessionStorage.setItem('projectArchiveReturnUrl', window.location.href)
    }

    document.addEventListener('click', rememberArchiveView)
    return () => document.removeEventListener('click', rememberArchiveView)
  }, [availableDomains])

  useEffect(() => {
    if (!ready) return

    const cards = cardsRef.current
    const matchingCards = cards.filter((card) => {
      const cardDomains = new Set((card.dataset.projectDomains ?? '').split('|').filter(Boolean))
      return selectedDomain === 'all' || cardDomains.has(selectedDomain)
    })
    const featured = matchingCards.find((card) => card.dataset.featuredCandidate === 'true')
    const filteredCards = featured ? [featured, ...matchingCards.filter((card) => card !== featured)] : matchingCards
    const grid = document.querySelector<HTMLElement>('#projects-grid')

    grid?.append(...filteredCards, ...cards.filter((card) => !filteredCards.includes(card)))
    for (const card of cards) card.hidden = !filteredCards.includes(card)

    const url = new URL(window.location.href)
    if (selectedDomain === 'all') url.searchParams.delete('domain')
    else url.searchParams.set('domain', selectedDomain)
    url.searchParams.delete('project-page')
    window.history.replaceState(window.history.state, '', url)
  }, [ready, selectedDomain])

  return (
    <div className="site-section-heading px-5 py-8 md:px-10 md:py-10 lg:px-15" data-project-filter>
      <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="font-mono text-[0.6875rem] tracking-[0.14em] text-accent-1 uppercase">Pick a domain</p>
          <p className="mt-2 text-sm text-foreground-3" aria-live="polite">
            Showing {visibleCount} projects
          </p>
        </div>

        <fieldset className="flex max-w-3xl flex-wrap gap-2" aria-label="Filter projects by domain">
          <Button
            type="button"
            variant={selectedDomain === 'all' ? 'secondary' : 'ghost'}
            size="sm"
            className="text-xs"
            aria-controls="projects-grid"
            aria-pressed={selectedDomain === 'all'}
            onClick={() => setSelectedDomain('all')}
          >
            All <span className="opacity-60">{projectCount}</span>
          </Button>
          {domains.map(({ label, value, count }) => (
            <Button
              key={value}
              type="button"
              variant={selectedDomain === value ? 'secondary' : 'ghost'}
              size="sm"
              className="text-xs"
              aria-controls="projects-grid"
              aria-pressed={selectedDomain === value}
              onClick={() => setSelectedDomain(value)}
            >
              {label} <span className="opacity-60">{count}</span>
            </Button>
          ))}
        </fieldset>
      </div>
    </div>
  )
}
