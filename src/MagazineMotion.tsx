import { Children, useEffect, useRef, useState } from 'react'
import type { CSSProperties, ReactNode } from 'react'

const clamp = (value: number) => Math.min(1, Math.max(0, value))
const reducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches

function onScrollFrame(update: () => void) {
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

export function FadeIn({ children, className = '', delay = 0, x = 0, y = 30 }: { children: ReactNode; className?: string; delay?: number; x?: number; y?: number }) {
  const element = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    if (!element.current) return
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return
      setVisible(true)
      observer.disconnect()
    }, { rootMargin: '50px' })
    observer.observe(element.current)
    return () => observer.disconnect()
  }, [])
  return <div ref={element} className={`mag-fade ${className}`} data-visible={visible} style={{ '--fade-delay': `${delay}s`, '--fade-x': `${x}px`, '--fade-y': `${y}px` } as CSSProperties}>{children}</div>
}

export function Magnet({ children, className = '', padding = 150, strength = 3 }: { children: ReactNode; className?: string; padding?: number; strength?: number }) {
  const element = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (reducedMotion() || !window.matchMedia('(hover: hover) and (pointer: fine)').matches) return
    const move = (event: MouseEvent) => {
      const target = element.current
      if (!target) return
      const box = target.getBoundingClientRect()
      const near = event.clientX > box.left - padding && event.clientX < box.right + padding && event.clientY > box.top - padding && event.clientY < box.bottom + padding
      target.style.transition = near ? 'transform .3s ease-out' : 'transform .6s ease-in-out'
      target.style.transform = near ? `translate3d(${(event.clientX - (box.left + box.width / 2)) / strength}px,${(event.clientY - (box.top + box.height / 2)) / strength}px,0)` : ''
    }
    window.addEventListener('mousemove', move, { passive: true })
    return () => window.removeEventListener('mousemove', move)
  }, [padding, strength])
  return <div ref={element} className={className} style={{ willChange: 'transform' }}>{children}</div>
}

export function ScrollText({ text, className = '' }: { text: string; className?: string }) {
  const element = useRef<HTMLParagraphElement>(null)
  useEffect(() => {
    const target = element.current
    if (!target || reducedMotion()) return
    const letters = target.querySelectorAll<HTMLElement>('[data-letter]')
    return onScrollFrame(() => {
      const box = target.getBoundingClientRect()
      const height = window.innerHeight
      // 문단이 화면을 다 지나기 전에 읽을 수 있도록 진행의 75% 지점에서 모두 밝힌다.
      const progress = clamp((height * .8 - box.top) / (box.height + height * .6) / .75)
      letters.forEach((letter, index) => {
        letter.style.opacity = String(.2 + .8 * clamp(progress * letters.length - index))
      })
    })
  }, [text])
  return <p ref={element} className={className}><span className="sr-only">{text}</span><span aria-hidden="true">{Array.from(text).map((letter, index) => <span data-letter key={index}>{letter}</span>)}</span></p>
}

export function ScrollRow({ children, direction = 1 }: { children: ReactNode; direction?: 1 | -1 }) {
  const row = useRef<HTMLDivElement>(null)
  const track = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (reducedMotion()) return
    return onScrollFrame(() => {
      if (!row.current || !track.current) return
      const offset = (window.innerHeight - row.current.getBoundingClientRect().top) * .3
      track.current.style.transform = `translate3d(calc(-33.333% + ${direction * offset}px),0,0)`
    })
  }, [direction])
  return <div className="mag-row" ref={row}><div className="mag-row-track" ref={track}>{[0, 1, 2].map(copy => <div className="mag-row-set" key={copy} aria-hidden={copy > 0 || undefined}>{children}</div>)}</div></div>
}

export function StackList({ children }: { children: ReactNode }) {
  const list = useRef<HTMLDivElement>(null)
  const total = Children.count(children)
  useEffect(() => {
    if (reducedMotion()) return
    return onScrollFrame(() => {
      const target = list.current
      if (!target) return
      const items = target.querySelectorAll<HTMLElement>(':scope > .mag-stack-item')
      if (items.length < 2) return
      // 아이템은 sticky로 붙어 있으므로 위치 계산은 흐름을 따르는 목록 상단을 기준으로 한다.
      const step = items[0].offsetHeight + parseFloat(getComputedStyle(target).rowGap)
      const passed = (parseFloat(getComputedStyle(items[0]).top) - target.getBoundingClientRect().top) / step
      items.forEach((item, index) => {
        const remaining = total - 1 - index
        if (!remaining) return
        const scale = 1 - remaining * .03 * clamp((passed - index) / remaining)
        ;(item.firstElementChild as HTMLElement).style.transform = `scale(${scale})`
      })
    })
  }, [total])
  return <div className="mag-stack" ref={list}>{Children.map(children, (child, index) => <div className="mag-stack-item" style={{ '--stack-index': index } as CSSProperties}>{child}</div>)}</div>
}
