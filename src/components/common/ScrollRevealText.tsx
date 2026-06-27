import { useEffect, useMemo, useRef, useState } from 'react'

import { cn } from '@/lib/utils'

interface ScrollRevealTextProps {
  text: string
  className?: string
  wordClassName?: string
}

export default function ScrollRevealText({ text, className, wordClassName }: ScrollRevealTextProps) {
  const rootRef = useRef<HTMLParagraphElement>(null)
  const words = useMemo(() => {
    let cursor = 0

    return text
      .split(/\s+/)
      .filter(Boolean)
      .map((word) => {
        const position = text.indexOf(word, cursor)
        cursor = position + word.length

        return { id: `${word}-${position}`, value: word }
      })
  }, [text])
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const root = rootRef.current
    if (!root) return

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (prefersReducedMotion) {
      setProgress(1)
      return
    }

    let frame = 0

    const update = () => {
      frame = 0
      const rect = root.getBoundingClientRect()
      const viewport = window.innerHeight || 1
      const start = viewport * 0.9
      const end = viewport * 0.24
      const nextProgress = Math.min(1, Math.max(0, (start - rect.top) / (start - end)))
      setProgress(nextProgress)
    }

    const requestUpdate = () => {
      if (frame) return
      frame = window.requestAnimationFrame(update)
    }

    update()
    window.addEventListener('scroll', requestUpdate, { passive: true })
    window.addEventListener('resize', requestUpdate)

    return () => {
      window.removeEventListener('scroll', requestUpdate)
      window.removeEventListener('resize', requestUpdate)
      if (frame) window.cancelAnimationFrame(frame)
    }
  }, [])

  return (
    <p ref={rootRef} className={cn('font-display text-4xl leading-tight tracking-tighter md:text-6xl', className)}>
      {words.map((word, index) => {
        const total = Math.max(words.length - 1, 1)
        const threshold = index / total
        const localProgress = Math.min(1, Math.max(0, (progress - threshold * 0.72) / 0.28))
        const opacity = 0.18 + localProgress * 0.82
        const blur = (1 - localProgress) * 10

        return (
          <span
            key={word.id}
            className={cn(
              'inline-block pr-[0.25em] text-foreground-0 transition-[filter,opacity] duration-200',
              wordClassName,
            )}
            style={{ opacity, filter: `blur(${blur}px)` }}
          >
            {word.value}
          </span>
        )
      })}
    </p>
  )
}
