type Point3D = {
  x: number
  y: number
  z: number
}

type ParticleShape = Point3D[]

const TAU = Math.PI * 2
const GOLDEN_ANGLE = Math.PI * (3 - Math.sqrt(5))

const clamp = (value: number, minimum: number, maximum: number) => Math.min(maximum, Math.max(minimum, value))

const randomAt = (seed: number) => {
  const value = Math.sin(seed * 12.9898) * 43758.5453
  return value - Math.floor(value)
}

const createSphere = (count: number): ParticleShape =>
  Array.from({ length: count }, (_, index) => {
    const y = 1 - (index / Math.max(count - 1, 1)) * 2
    const radius = Math.sqrt(Math.max(0, 1 - y * y))
    const angle = index * GOLDEN_ANGLE

    return {
      x: Math.cos(angle) * radius,
      y,
      z: Math.sin(angle) * radius,
    }
  })

const createCube = (count: number): ParticleShape =>
  Array.from({ length: count }, (_, index) => {
    const first = randomAt(index * 2 + 1) * 2 - 1
    const second = randomAt(index * 2 + 2) * 2 - 1
    const face = index % 6

    if (face === 0) return { x: -0.82, y: first * 0.82, z: second * 0.82 }
    if (face === 1) return { x: 0.82, y: first * 0.82, z: second * 0.82 }
    if (face === 2) return { x: first * 0.82, y: -0.82, z: second * 0.82 }
    if (face === 3) return { x: first * 0.82, y: 0.82, z: second * 0.82 }
    if (face === 4) return { x: first * 0.82, y: second * 0.82, z: -0.82 }
    return { x: first * 0.82, y: second * 0.82, z: 0.82 }
  })

const createTorus = (count: number): ParticleShape =>
  Array.from({ length: count }, (_, index) => {
    const majorAngle = index * GOLDEN_ANGLE
    const minorAngle = ((index * 37) % count) * (TAU / count)
    const radius = 0.67 + 0.28 * Math.cos(minorAngle)

    return {
      x: radius * Math.cos(majorAngle),
      y: 0.28 * Math.sin(minorAngle),
      z: radius * Math.sin(majorAngle),
    }
  })

const easeInOutCubic = (value: number) => (value < 0.5 ? 4 * value * value * value : 1 - (-2 * value + 2) ** 3 / 2)

const initParticleCanvas = (canvas: HTMLCanvasElement) => {
  if (canvas.dataset.particlesReady === 'true') return

  const context = canvas.getContext('2d')
  const field = canvas.closest<HTMLElement>('[data-particle-field]')
  if (!context || !field) return

  canvas.dataset.particlesReady = 'true'

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)')
  const compactViewport = window.matchMedia('(max-width: 767px)')
  const particleCount = compactViewport.matches ? 380 : 760
  const shapes = [createSphere(particleCount), createCube(particleCount), createTorus(particleCount)]
  const cycleDuration = 8000
  const morphDelay = 2200
  const morphDuration = 4300

  let width = 0
  let height = 0
  let animationFrame: number | undefined
  let isVisible = true
  let pointerX = 0
  let pointerY = 0
  let targetPointerX = 0
  let targetPointerY = 0
  let accentColor = ''
  let quietColor = ''

  const readColors = () => {
    const styles = getComputedStyle(canvas)
    accentColor = styles.getPropertyValue('--accent-1').trim()
    quietColor = styles.getPropertyValue('--foreground-3').trim()
  }

  const resize = () => {
    const bounds = canvas.getBoundingClientRect()
    const pixelRatio = Math.min(window.devicePixelRatio || 1, 1.75)
    width = Math.max(1, bounds.width)
    height = Math.max(1, bounds.height)
    canvas.width = Math.round(width * pixelRatio)
    canvas.height = Math.round(height * pixelRatio)
    context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0)
    readColors()
  }

  const draw = (time: number, staticFrame = false) => {
    context.clearRect(0, 0, width, height)

    const cycle = staticFrame ? 0 : Math.floor(time / cycleDuration)
    const phase = staticFrame ? 0 : time % cycleDuration
    const progress = staticFrame ? 0 : easeInOutCubic(clamp((phase - morphDelay) / morphDuration, 0, 1))
    const currentShape = shapes[cycle % shapes.length] ?? shapes[0]
    const nextShape = shapes[(cycle + 1) % shapes.length] ?? shapes[0]
    if (!currentShape || !nextShape) return

    pointerX += (targetPointerX - pointerX) * 0.045
    pointerY += (targetPointerY - pointerY) * 0.045

    const rotationY = staticFrame ? -0.42 : time * 0.000075 + pointerX * 0.24
    const rotationX = staticFrame ? 0.25 : -0.18 + Math.sin(time * 0.00012) * 0.07 - pointerY * 0.18
    const cosY = Math.cos(rotationY)
    const sinY = Math.sin(rotationY)
    const cosX = Math.cos(rotationX)
    const sinX = Math.sin(rotationX)
    const scale = Math.min(width, height) * 0.35
    const cameraDistance = 3.7

    for (let index = 0; index < particleCount; index += 1) {
      const origin = currentShape[index]
      const destination = nextShape[index]
      if (!origin || !destination) continue

      const x = origin.x + (destination.x - origin.x) * progress
      const y = origin.y + (destination.y - origin.y) * progress
      const z = origin.z + (destination.z - origin.z) * progress

      const rotatedX = x * cosY - z * sinY
      const rotatedZ = x * sinY + z * cosY
      const rotatedY = y * cosX - rotatedZ * sinX
      const depth = y * sinX + rotatedZ * cosX
      const perspective = cameraDistance / (cameraDistance - depth)
      const screenX = width / 2 + rotatedX * scale * perspective
      const screenY = height / 2 + rotatedY * scale * perspective
      const depthRatio = clamp((depth + 1.2) / 2.4, 0, 1)
      const radius = (index % 17 === 0 ? 1.65 : 0.95) * perspective

      context.beginPath()
      context.arc(screenX, screenY, radius, 0, TAU)
      context.fillStyle = index % 11 === 0 ? accentColor : quietColor
      context.globalAlpha = index % 11 === 0 ? 0.9 : 0.2 + depthRatio * 0.55
      context.fill()
    }

    context.globalAlpha = 1
  }

  const canAnimate = () => isVisible && !document.hidden && !reducedMotion.matches

  const animate = (time: number) => {
    animationFrame = undefined
    if (!canAnimate()) return
    draw(time)
    animationFrame = window.requestAnimationFrame(animate)
  }

  const stop = () => {
    if (animationFrame === undefined) return
    window.cancelAnimationFrame(animationFrame)
    animationFrame = undefined
  }

  const start = () => {
    stop()
    if (reducedMotion.matches) {
      draw(0, true)
      return
    }
    if (canAnimate()) animationFrame = window.requestAnimationFrame(animate)
  }

  const handlePointerMove = (event: PointerEvent) => {
    const bounds = field.getBoundingClientRect()
    targetPointerX = clamp(((event.clientX - bounds.left) / bounds.width) * 2 - 1, -1, 1)
    targetPointerY = clamp(((event.clientY - bounds.top) / bounds.height) * 2 - 1, -1, 1)
  }

  const resetPointer = () => {
    targetPointerX = 0
    targetPointerY = 0
  }

  const resizeObserver = new ResizeObserver(() => {
    resize()
    if (reducedMotion.matches) draw(0, true)
  })
  const visibilityObserver = new IntersectionObserver(
    ([entry]) => {
      isVisible = Boolean(entry?.isIntersecting)
      start()
    },
    { threshold: 0.05 },
  )
  const themeObserver = new MutationObserver(() => {
    readColors()
    if (reducedMotion.matches) draw(0, true)
  })

  const handleVisibilityChange = () => start()
  const handleMotionChange = () => start()

  resizeObserver.observe(canvas)
  visibilityObserver.observe(canvas)
  themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })
  field.addEventListener('pointermove', handlePointerMove)
  field.addEventListener('pointerleave', resetPointer)
  document.addEventListener('visibilitychange', handleVisibilityChange)
  reducedMotion.addEventListener('change', handleMotionChange)

  resize()
  start()

  return () => {
    stop()
    resizeObserver.disconnect()
    visibilityObserver.disconnect()
    themeObserver.disconnect()
    field.removeEventListener('pointermove', handlePointerMove)
    field.removeEventListener('pointerleave', resetPointer)
    document.removeEventListener('visibilitychange', handleVisibilityChange)
    reducedMotion.removeEventListener('change', handleMotionChange)
    delete canvas.dataset.particlesReady
  }
}

const activeCanvases = new Map<HTMLCanvasElement, () => void>()
let lifecycleReady = false

const setupParticleCanvases = () => {
  for (const canvas of document.querySelectorAll<HTMLCanvasElement>('[data-hero-particles]')) {
    if (activeCanvases.has(canvas)) continue
    const cleanup = initParticleCanvas(canvas)
    if (cleanup) activeCanvases.set(canvas, cleanup)
  }
}

const cleanupParticleCanvases = () => {
  for (const cleanup of activeCanvases.values()) cleanup()
  activeCanvases.clear()
}

export const initHeroParticles = () => {
  if (!lifecycleReady) {
    document.addEventListener('astro:page-load', setupParticleCanvases)
    document.addEventListener('astro:before-swap', cleanupParticleCanvases)
    lifecycleReady = true
  }

  setupParticleCanvases()
}
