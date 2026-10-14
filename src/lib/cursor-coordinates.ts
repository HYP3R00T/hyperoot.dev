/** A decorative viewport ruler, shown only over empty space with a mouse. */
export function setupCursorCoordinates() {
  const overlay = document.querySelector<HTMLElement>("[data-cursor-coordinates]")
  const xLabel = overlay?.querySelector<HTMLElement>("[data-cursor-x]")
  const yLabel = overlay?.querySelector<HTMLElement>("[data-cursor-y]")
  if (!overlay || !xLabel || !yLabel) return
  const pointer = matchMedia("(hover: hover) and (pointer: fine)")
  const motion = matchMedia("(prefers-reduced-motion: reduce)")
  const lifecycle = new AbortController()
  const options = { signal: lifecycle.signal, passive: true }
  const context =
    "a, button, input, select, textarea, [role=menu], [role=tooltip], .lab-header, .lab-footer, .catalog-hero, .catalog-controls, .catalog-section-heading, [data-project-row], .project-story"
  let frame = 0
  let position: { x: number; y: number } | undefined
  const hide = () => {
    overlay.dataset.visible = "false"
    position = undefined
  }
  const update = () => {
    frame = 0
    if (!position || !pointer.matches || motion.matches) return hide()
    const { x, y } = position
    const target = document.elementFromPoint(x, y)
    if (!target || target.closest(context)) {
      overlay.dataset.visible = "false"
      return
    }
    overlay.style.setProperty("--cursor-x", `${x}px`)
    overlay.style.setProperty("--cursor-y", `${y}px`)
    xLabel.textContent = `X ${Math.round(x)}`
    yLabel.textContent = `Y ${Math.round(y)}`
    overlay.dataset.visible = "true"
  }
  const requestUpdate = () => {
    if (!frame) frame = requestAnimationFrame(update)
  }
  document.addEventListener(
    "pointermove",
    (event) => {
      if (event.pointerType !== "mouse") return hide()
      position = { x: event.clientX, y: event.clientY }
      requestUpdate()
    },
    options,
  )
  window.addEventListener("scroll", requestUpdate, options)
  window.addEventListener("resize", hide, options)
  window.addEventListener("blur", hide, options)
  document.addEventListener("pointerleave", hide, options)
  document.addEventListener("keydown", hide, options)
  document.addEventListener("visibilitychange", hide, options)
  pointer.addEventListener("change", hide, options)
  motion.addEventListener("change", hide, options)
  document.addEventListener(
    "astro:before-swap",
    () => {
      lifecycle.abort()
      cancelAnimationFrame(frame)
      hide()
    },
    { once: true },
  )
}
