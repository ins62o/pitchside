import { Children, useEffect, useRef, useState } from 'react'
import type { CSSProperties, PointerEvent, ReactNode } from 'react'
import { onScrollFrame } from './magazine-scroll'

const clamp = (value: number) => Math.min(1, Math.max(0, value))
const reducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches

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

export function BounceLetters({ text }: { text: string }) {
  const element = useRef<HTMLSpanElement>(null)
  useEffect(() => {
    const target = element.current
    if (!target) return
    const motion = window.matchMedia('(prefers-reduced-motion: reduce)')
    const stop = () => target.getAnimations({ subtree: true }).forEach(animation => animation.cancel())
    const update = () => { if (motion.matches) stop() }
    motion.addEventListener('change', update)
    return () => { motion.removeEventListener('change', update); stop() }
  }, [])
  const bounce = (event: PointerEvent<HTMLSpanElement>) => {
    if (event.pointerType !== 'mouse' || reducedMotion()) return
    const letter = event.currentTarget.firstElementChild as HTMLElement
    letter.getAnimations().forEach(animation => animation.cancel())
    letter.animate([
      { transform: 'translateY(0)', offset: 0 },
      { transform: 'translateY(-.04em)', offset: .4 },
      { transform: 'translateY(.002em)', offset: .8 },
      { transform: 'translateY(0)', offset: 1 },
    ], { duration: 420, easing: 'ease-out' })
  }
  return <span ref={element} aria-hidden="true">{Array.from(text).map((letter, index) => <span className="jk-hero-letter" key={index} onPointerEnter={bounce}><span>{letter}</span></span>)}</span>
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

// 문장이 화면의 80% 지점에서 들어와 20% 지점을 지날 때까지 글자를 채운다.
export function FillText({ text, className = '' }: { text: string; className?: string }) {
  const element = useRef<HTMLParagraphElement>(null)
  useEffect(() => {
    const target = element.current
    if (!target) return
    const motion = window.matchMedia('(prefers-reduced-motion: reduce)')
    let previous = -1
    const update = () => {
      const box = target.getBoundingClientRect()
      const progress = motion.matches ? 1 : clamp((window.innerHeight * .8 - box.top) / (box.height + window.innerHeight * .6))
      if (progress === previous) return
      previous = progress
      target.style.setProperty('--fill-progress', `${progress}`)
    }
    const stop = onScrollFrame(update)
    motion.addEventListener('change', update)
    return () => {
      stop()
      motion.removeEventListener('change', update)
      target.style.removeProperty('--fill-progress')
    }
  }, [])
  const letters = Array.from(text)
  return <p ref={element} className={`mag-fill ${className}`} style={{ '--char-count': letters.length } as CSSProperties}><span className="sr-only">{text}</span><span aria-hidden="true">{letters.map((letter, index) => <span key={index} style={{ '--char-index': index } as CSSProperties}>{letter}</span>)}</span></p>
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
