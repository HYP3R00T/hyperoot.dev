import { ArrowLeft, ArrowRight } from 'lucide-react'
import type { ReactNode } from 'react'
import { useEffect, useId, useRef } from 'react'

import { cn } from '@/lib/utils'

interface CarouselProps {
  label: string
  labelId?: string
  intervalMs?: number
  itemSelector?: string
  className?: string
  trackClassName?: string
  children: ReactNode
}

export default function Carousel({
  label,
  labelId,
  intervalMs = 5200,
  itemSelector = '[data-carousel-item]',
  className,
  trackClassName,
  children,
}: CarouselProps) {
  const generatedId = useId()
  const carouselId = labelId ?? `carousel-${generatedId}`
  const rootRef = useRef<HTMLDivElement>(null)
  const trackRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const root = rootRef.current
    const track = trackRef.current
    if (!root || !track) return

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const getGap = () => Number.parseFloat(window.getComputedStyle(track).columnGap || '0') || 0
    const getStep = () => track.querySelector<HTMLElement>(itemSelector)?.offsetWidth ?? track.clientWidth

    const scrollByStep = (direction: 1 | -1) => {
      const step = getStep() + getGap()
      const maxScroll = track.scrollWidth - track.clientWidth - 4
      const atEnd = track.scrollLeft >= maxScroll
      const atStart = track.scrollLeft <= 4

      if (direction === 1 && atEnd) {
        track.scrollTo({ left: 0, behavior: 'smooth' })
        return
      }

      if (direction === -1 && atStart) {
        track.scrollTo({ left: track.scrollWidth, behavior: 'smooth' })
        return
      }

      track.scrollBy({ left: step * direction, behavior: 'smooth' })
    }

    const previous = root.querySelector<HTMLButtonElement>('[data-carousel-prev]')
    const next = root.querySelector<HTMLButtonElement>('[data-carousel-next]')
    const onPrevious = () => scrollByStep(-1)
    const onNext = () => scrollByStep(1)

    previous?.addEventListener('click', onPrevious)
    next?.addEventListener('click', onNext)

    if (prefersReducedMotion || intervalMs <= 0) {
      return () => {
        previous?.removeEventListener('click', onPrevious)
        next?.removeEventListener('click', onNext)
      }
    }

    let interval = window.setInterval(() => scrollByStep(1), intervalMs)
    const pause = () => window.clearInterval(interval)
    const resume = () => {
      window.clearInterval(interval)
      interval = window.setInterval(() => scrollByStep(1), intervalMs)
    }

    root.addEventListener('pointerenter', pause)
    root.addEventListener('pointerleave', resume)
    root.addEventListener('focusin', pause)
    root.addEventListener('focusout', resume)

    return () => {
      previous?.removeEventListener('click', onPrevious)
      next?.removeEventListener('click', onNext)
      root.removeEventListener('pointerenter', pause)
      root.removeEventListener('pointerleave', resume)
      root.removeEventListener('focusin', pause)
      root.removeEventListener('focusout', resume)
      window.clearInterval(interval)
    }
  }, [intervalMs, itemSelector])

  return (
    <div ref={rootRef} className={cn('w-full min-w-0', className)} data-carousel>
      <div className="mb-4 flex items-center justify-between gap-4 px-1">
        <p id={carouselId} className="font-mono text-xs tracking-widest text-foreground-2 uppercase">
          {label}
        </p>
        <div className="hidden gap-2 sm:flex">
          <button
            type="button"
            className="rounded-md border border-border/80 bg-background-1 p-2 text-foreground-1 transition-colors hover:bg-background-0 hover:text-accent-1"
            aria-label={`Previous ${label.toLowerCase()}`}
            data-carousel-prev
          >
            <ArrowLeft className="size-4" strokeWidth={1.8} aria-hidden="true" />
          </button>
          <button
            type="button"
            className="rounded-md border border-border/80 bg-background-1 p-2 text-foreground-1 transition-colors hover:bg-background-0 hover:text-accent-1"
            aria-label={`Next ${label.toLowerCase()}`}
            data-carousel-next
          >
            <ArrowRight className="size-4" strokeWidth={1.8} aria-hidden="true" />
          </button>
        </div>
      </div>

      <section
        ref={trackRef}
        className={cn(
          'grid auto-cols-[minmax(17rem,86%)] grid-flow-col gap-4 overflow-x-auto px-1 scroll-px-1 scroll-smooth snap-x snap-mandatory pb-1 scrollbar-none sm:auto-cols-[calc((100%-1rem)/2)] lg:auto-cols-[calc((100%-1.5rem)/2)] lg:gap-6 sm:[&::-webkit-scrollbar]:hidden',
          trackClassName,
        )}
        aria-labelledby={carouselId}
        data-carousel-track
      >
        {children}
      </section>
    </div>
  )
}
