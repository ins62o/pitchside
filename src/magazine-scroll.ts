import { useEffect, useRef } from 'react'

export function onScrollFrame(update: () => void) {
  let frame = 0
  const run = () => { frame = 0; update() }
  const request = () => { if (!frame) frame = requestAnimationFrame(run) }
  window.addEventListener('scroll', request, { passive: true })
  window.addEventListener('resize', request)
  update()
  return () => {
    window.removeEventListener('scroll', request)
    window.removeEventListener('resize', request)
    cancelAnimationFrame(frame)
  }
}

export function useCoverScroll(enabled: boolean) {
  const element = useRef<HTMLElement>(null)
  useEffect(() => {
    const target = element.current
    if (!enabled || !target) return
    const motion = window.matchMedia('(prefers-reduced-motion: reduce)')
    let previous = -1
    const update = () => {
      const box = target.getBoundingClientRect()
      const passed = motion.matches ? 0 : Math.max(0, Math.min(box.height, -box.top))
      if (passed === previous) return
      previous = passed
      target.style.setProperty('--cover-scroll', `${passed}px`)
    }
    const stop = onScrollFrame(update)
    motion.addEventListener('change', update)
    return () => {
      stop()
      motion.removeEventListener('change', update)
      target.style.removeProperty('--cover-scroll')
    }
  }, [enabled])
  return element
}
