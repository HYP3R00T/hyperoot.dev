/** Reveal each row once, while keeping server-rendered content visible without JavaScript. */
export function createScrollReveal(rows: HTMLElement[]) {
  const motion = matchMedia("(prefers-reduced-motion: reduce)")
  if (!("IntersectionObserver" in window)) return () => {}
  const reveal = (row: HTMLElement) => {
    row.dataset.reveal = "visible"
    observer.unobserve(row)
  }
  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) if (entry.isIntersecting) reveal(entry.target as HTMLElement)
    },
    { threshold: 0.05 },
  )
  const refresh = () => {
    for (const row of rows) {
      if (motion.matches) reveal(row)
      else if (row.hidden) observer.unobserve(row)
      else if (row.dataset.reveal !== "visible") {
        row.dataset.reveal = "pending"
        observer.observe(row)
      }
    }
  }
  const focus = (event: FocusEvent) => {
    if (!(event.target instanceof Element)) return
    const row = event.target.closest<HTMLElement>("[data-project-row]")
    if (row) reveal(row)
  }
  document.addEventListener("focusin", focus)
  motion.addEventListener("change", refresh)
  document.addEventListener(
    "astro:before-swap",
    () => {
      observer.disconnect()
      document.removeEventListener("focusin", focus)
      motion.removeEventListener("change", refresh)
    },
    { once: true },
  )
  return refresh
}
