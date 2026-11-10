import { useEffect, useRef, useState } from 'react'
import type { CSSProperties } from 'react'
import './MagazineShelf.css'

export type ShelfItem = { id: string; title: string; subtitle: string; label: string; photo: { src: string; alt: string } }
type Controls = { step: (n: number) => void; go: (index: number) => void; open: () => void }

// 인쇄된 책등 색. 사진처럼 테마와 관계없이 같은 색을 유지한다.
const SPINE_COLORS = [
  { bg: '#713E48', fg: '#F4EDE3' },
  { bg: '#E9E2D3', fg: '#292924' },
  { bg: '#2E3A31', fg: '#EDE7D9' },
  { bg: '#C8B79C', fg: '#2B2620' },
  { bg: '#262A33', fg: '#E9E4D8' },
]
const EASE = 'cubic-bezier(.2,.8,.2,1)'
const SHEET_EASE = 'cubic-bezier(.76,0,.18,1)'
const LEAN = -4.5
const STORE = 'pitchside-magazine-shelf'

const smooth = (x: number) => x * x * (3 - 2 * x)
const clamp01 = (x: number) => (x < 0 ? 0 : x > 1 ? 1 : x)
const mod = (a: number, n: number) => ((a % n) + n) % n
// 펼친 표지가 양옆 책등을 절반씩 밀어내는 연속 함수
const bump = (r: number) => (Math.abs(r) < 1 ? (r + Math.sin(Math.PI * r) / Math.PI) / 2 : Math.sign(r) * 0.5)
const pad = (index: number) => String(index + 1).padStart(2, '0')

function readStart(count: number) {
  try {
    const value = Number(sessionStorage.getItem(STORE))
    return Number.isInteger(value) && value >= 0 && value < count ? value : 0
  } catch {
    return 0
  }
}
function saveStart(index: number) {
  try { sessionStorage.setItem(STORE, String(index)) } catch { /* 저장할 수 없어도 선반은 동작한다 */ }
}

type Tape = { v: number; el: HTMLElement; sp: HTMLElement; cv: HTMLElement; lift: number; shown: boolean; tf: string; z: number; shadeSpine: number; shadeCover: number }

export default function MagazineShelf({ items, href }: { items: ShelfItem[]; href: (id: string) => string }) {
  const count = items.length
  const copies = Math.max(3, Math.ceil(30 / count))
  const total = count * copies
  const [start] = useState(() => readStart(count))
  const [active, setActive] = useState(start)
  const root = useRef<HTMLElement>(null)
  const controls = useRef<Controls | null>(null)

  useEffect(() => {
    const section = root.current
    if (!section) return
    const q = <T extends Element>(selector: string) => section.querySelector<T>(selector)!
    const shelf = q<HTMLElement>('.mag-shelf')
    const stage = q<HTMLElement>('.mag-shelf-stage')
    const play = q<HTMLElement>('.mag-shelf-play')
    const cursor = q<HTMLElement>('.mag-shelf-cursor')
    const sheet = q<HTMLElement>('.mag-shelf-sheet')
    const probe = q<HTMLElement>('.mag-shelf-probe')
    const indicator = q<HTMLElement>('.mag-shelf-index .ind')
    const tabs = [...section.querySelectorAll<HTMLElement>('.mag-shelf-index button')]
    const masks = [...section.querySelectorAll<HTMLElement>('.shelf-mask')]
    const tapes: Tape[] = [...stage.querySelectorAll<HTMLElement>('.shelf-tape')].map((el, v) => ({
      v, el, sp: el.children[0] as HTMLElement, cv: el.children[1] as HTMLElement,
      lift: 0, shown: true, tf: '', z: -1, shadeSpine: -1, shadeCover: -1,
    }))
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const half = total / 2
    const wrapR = (r: number) => { r = mod(r, total); return r >= half ? r - total : r }

    let H = 0, ws = 0, d = 0, gap = 0
    const F = (r: number) => r * (ws + gap) + (d - ws + 1.6 * gap) * bump(r)

    let s = count * Math.floor(copies / 2) + start
    let T = s
    let hover = -1, current = -1
    let mx = 0, my = 0, cx = 0, cy = 0, inside = false, overButton = false
    let tiltX = 0, tiltY = 0, dragging = false, suppressClick = false, opening = false
    let last = performance.now(), raf = 0, running = false, wheelTimer = 0
    let down: { id: number; x: number; T0: number } | null = null

    function measure() {
      H = probe.getBoundingClientRect().height
      ws = H * 0.15
      d = H * 210 / 297
      gap = H * 0.035
      section!.style.setProperty('--h', `${H}px`)
      section!.style.setProperty('--ws', `${ws}px`)
      section!.style.setProperty('--d', `${d}px`)
      for (const tape of tapes) tape.tf = ''
    }

    function swap(mask: HTMLElement, text: string, dir: number, instant: boolean) {
      const span = document.createElement('span')
      span.textContent = text
      if (instant || reduce) { mask.replaceChildren(span); return }
      for (const old of [...mask.children] as HTMLElement[]) {
        if (old.dataset.leaving) continue
        old.dataset.leaving = '1'
        old.setAttribute('aria-hidden', 'true')
        const from = getComputedStyle(old).transform
        old.animate([{ transform: from === 'none' ? 'translateY(0)' : from }, { transform: `translateY(${-dir * 105}%)` }], { duration: 650, easing: EASE, fill: 'both' })
          .onfinish = () => old.remove()
      }
      mask.append(span)
      span.animate([{ transform: `translateY(${dir * 105}%)` }, { transform: 'translateY(0)' }], { duration: 650, easing: EASE, fill: 'both' })
    }

    function placeIndicator(index: number, instant: boolean) {
      const tab = tabs[index]
      if (!tab) return
      if (instant) indicator.style.transition = 'none'
      indicator.style.width = `${tab.offsetWidth}px`
      indicator.style.transform = `translateX(${tab.offsetLeft}px)`
      if (instant) { void indicator.offsetWidth; indicator.style.transition = '' }
    }

    function show(index: number, dir: number, instant: boolean) {
      current = index
      const item = items[index]
      swap(masks[0], item.title, dir, instant)
      swap(masks[1], item.subtitle, dir, instant)
      swap(masks[2], `${pad(index)} · ${item.label}`, dir, instant)
      placeIndicator(index, instant)
      setActive(index)
    }

    function nearestTape() {
      let best = tapes[0], distance = Infinity
      for (const tape of tapes) {
        const r = Math.abs(wrapR(tape.v - s))
        if (r < distance) { distance = r; best = tape }
      }
      return best
    }

    // 화면에 투영된 표지 영역에서 기울기를 되돌려 실제 표지 크기를 구한다.
    function coverRect() {
      const box = nearestTape().cv.getBoundingClientRect()
      const angle = Math.abs(LEAN) * Math.PI / 180, c = Math.cos(angle), sn = Math.sin(angle), den = c * c - sn * sn
      const w = Math.max(10, (box.width * c - box.height * sn) / den)
      const h = Math.max(10, (box.height * c - box.width * sn) / den)
      const x = box.left + box.width / 2, y = box.top + box.height / 2
      return { x, y, inset: `inset(${y - h / 2}px ${window.innerWidth - x - w / 2}px ${window.innerHeight - y - h / 2}px ${x - w / 2}px round 2px)` }
    }

    function open() {
      if (opening) return
      opening = true
      T = Math.round(T)
      const index = mod(Math.round(s), count)
      saveStart(index)
      const rect = coverRect()
      sheet.style.transformOrigin = `${rect.x}px ${rect.y}px`
      sheet.style.visibility = 'visible'
      const animation = sheet.animate(
        [{ clipPath: rect.inset, transform: `rotate(${LEAN}deg)` }, { clipPath: 'inset(0px 0px 0px 0px round 0px)', transform: 'rotate(0deg)' }],
        { duration: reduce ? 1 : 1050, easing: SHEET_EASE, fill: 'both' })
      animation.onfinish = () => { window.location.hash = href(items[index].id) }
    }

    const step = (n: number) => { if (!opening) T = Math.round(T) + n }
    const go = (index: number) => {
      if (opening) return
      const from = Math.round(T)
      let diff = mod(index - from, count)
      if (diff > count / 2) diff -= count
      T = from + diff
    }
    controls.current = { step, go, open }

    function frame(now: number) {
      const dt = Math.min(0.05, (now - last) / 1000)
      last = now

      const follow = reduce ? 1 : 1 - Math.exp(-(dragging ? 18 : 5.2) * dt)
      s += (T - s) * follow
      if (Math.abs(T - s) < 1e-4) s = T
      if (Math.abs(s) > 4 * total) { const shift = Math.round(s / total) * total; s -= shift; T -= shift }

      const index = mod(Math.round(s), count)
      if (index !== current) show(index, Math.sign(T - s) || 1, false)

      const box = shelf.getBoundingClientRect()
      const centerX = box.left + box.width / 2, centerY = box.top + box.height / 2
      const settled = Math.abs(T - s) < 0.3
      const onCover = inside && !opening && settled && Math.abs(mx - centerX) < 0.55 * d && Math.abs(my - centerY) < 0.55 * H

      const targetY = onCover ? (mx - centerX) / (0.55 * d) * 9 : inside ? (mx - centerX) / box.width * 5 : 0
      const targetX = onCover ? -(my - centerY) / (H / 2) * 6 : 0
      const tiltFollow = 1 - Math.exp(-7 * dt)
      tiltY += (targetY - tiltY) * tiltFollow
      tiltX += (targetX - tiltX) * tiltFollow

      const liftFollow = reduce ? 1 : 1 - Math.exp(-12 * dt)
      const limit = box.width / 2 + 1.5 * d
      for (const tape of tapes) {
        const r = wrapR(tape.v - s)
        const x = F(r)
        if (Math.abs(x) > limit) {
          if (tape.shown) { tape.el.style.visibility = 'hidden'; tape.shown = false }
          tape.lift = 0
          continue
        }
        if (!tape.shown) { tape.el.style.visibility = ''; tape.shown = true }
        const target = hover === tape.v && Math.abs(r) > 0.5 && !opening ? 1 : 0
        tape.lift += (target - tape.lift) * liftFollow
        if (Math.abs(target - tape.lift) < 1e-3) tape.lift = target
        const o = smooth(Math.max(0, 1 - Math.abs(r)))
        const y = -o * 0.025 * H - tape.lift * 0.045 * H
        const tf = `translate3d(${x.toFixed(2)}px,${y.toFixed(2)}px,${(o * 0.2 * H).toFixed(2)}px) rotateZ(${(LEAN * o).toFixed(3)}deg) rotateX(${(tiltX * o).toFixed(3)}deg) rotateY(${(-90 * o + tiltY * o).toFixed(3)}deg)`
        if (tf !== tape.tf) { tape.el.style.transform = tf; tape.tf = tf }
        const z = Math.round(100 - Math.abs(r) * 4)
        if (z !== tape.z) { tape.el.style.zIndex = String(z); tape.z = z }
        const shadeSpine = Math.round(o * 550) / 1000, shadeCover = Math.round((1 - o) * 500) / 1000
        if (shadeSpine !== tape.shadeSpine) { tape.sp.style.setProperty('--shade', String(shadeSpine)); tape.shadeSpine = shadeSpine }
        if (shadeCover !== tape.shadeCover) { tape.cv.style.setProperty('--shade', String(shadeCover)); tape.shadeCover = shadeCover }
      }

      const playScale = opening ? 0 : smooth(clamp01(1 - Math.abs(T - s) * 3))
      play.style.transform = `scale(${playScale.toFixed(4)})`
      play.style.pointerEvents = playScale > 0.5 ? '' : 'none'

      const cursorFollow = 1 - Math.exp(-16 * dt)
      cx += (mx - cx) * cursorFollow
      cy += (my - cy) * cursorFollow
      cursor.style.transform = `translate3d(${cx.toFixed(2)}px,${cy.toFixed(2)}px,0)`
      const overSpine = hover !== -1 && Math.abs(wrapR(hover - s)) > 0.5
      const state = opening ? '' : onCover ? 'open' : overSpine ? 'spine' : overButton ? 'button' : ''
      if (cursor.dataset.state !== state) cursor.dataset.state = state

      raf = requestAnimationFrame(frame)
    }

    function run() {
      if (running) return
      running = true
      last = performance.now()
      raf = requestAnimationFrame(frame)
    }
    function stop() {
      running = false
      cancelAnimationFrame(raf)
    }

    const cleanups: (() => void)[] = []
    const listen = <K extends keyof HTMLElementEventMap>(target: HTMLElement | Window, type: K, handler: (event: HTMLElementEventMap[K]) => void, options?: AddEventListenerOptions) => {
      target.addEventListener(type, handler as EventListener, options)
      cleanups.push(() => target.removeEventListener(type, handler as EventListener, options))
    }

    tapes.forEach(tape => {
      listen(tape.el, 'pointerenter', () => { hover = tape.v })
      listen(tape.el, 'pointerleave', () => { if (hover === tape.v) hover = -1 })
      listen(tape.el, 'click', () => {
        if (suppressClick) { suppressClick = false; return }
        if (opening) return
        if (Math.abs(wrapR(tape.v - s)) < 0.5) { open(); return }
        T = Math.round(T + wrapR(tape.v - T))
      })
    })

    listen(shelf, 'pointerdown', event => {
      if (opening || (event.pointerType === 'mouse' && event.button !== 0)) return
      down = { id: event.pointerId, x: event.clientX, T0: T }
    })
    listen(window, 'pointermove', event => {
      mx = event.clientX
      my = event.clientY
      if (!down || event.pointerId !== down.id) return
      const dx = event.clientX - down.x
      if (!dragging && Math.abs(dx) > 5) dragging = true
      if (dragging) T = down.T0 - dx / (ws + gap)
    })
    const endDrag = (event: PointerEvent) => {
      if (!down || event.pointerId !== down.id) return
      down = null
      if (!dragging) return
      dragging = false
      T = Math.round(T)
      suppressClick = true
      window.setTimeout(() => { suppressClick = false }, 0)
    }
    listen(window, 'pointerup', endDrag)
    listen(window, 'pointercancel', endDrag)

    listen(section, 'pointerenter', event => {
      if (event.pointerType !== 'mouse') return
      inside = true
      mx = cx = event.clientX
      my = cy = event.clientY
      cursor.dataset.visible = 'true'
    })
    listen(section, 'pointerleave', () => { inside = false; hover = -1; delete cursor.dataset.visible })
    listen(section, 'pointerover', event => {
      const target = event.target instanceof Element ? event.target : null
      overButton = !!target?.closest('button') && !target.closest('.mag-shelf')
    })

    // 가로 스크롤만 선반을 넘기고, 세로 스크롤은 페이지 스크롤로 남긴다.
    listen(shelf, 'wheel', event => {
      if (opening || Math.abs(event.deltaX) <= Math.abs(event.deltaY)) return
      event.preventDefault()
      const unit = event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? window.innerHeight : 1
      T += event.deltaX * unit / (ws + gap) * 0.5
      window.clearTimeout(wheelTimer)
      wheelTimer = window.setTimeout(() => { T = Math.round(T) }, 160)
    }, { passive: false })

    listen(section, 'keydown', event => {
      if (event.key === 'ArrowLeft') { event.preventDefault(); step(-1) }
      else if (event.key === 'ArrowRight') { event.preventDefault(); step(1) }
      else if (event.key === 'Enter' && event.target === shelf) { event.preventDefault(); open() }
    })

    listen(window, 'resize', () => { measure(); placeIndicator(current, true) })
    document.fonts?.ready.then(() => { if (current >= 0) placeIndicator(current, true) })

    const observer = new IntersectionObserver(([entry]) => { if (entry.isIntersecting) run(); else stop() })
    observer.observe(section)

    measure()
    show(mod(Math.round(s), count), 1, true)
    run()

    return () => {
      stop()
      observer.disconnect()
      window.clearTimeout(wheelTimer)
      cleanups.forEach(cleanup => cleanup())
      sheet.getAnimations().forEach(animation => animation.cancel())
      controls.current = null
    }
  }, [items, href, count, copies, total, start])

  return <section ref={root} className="mag-shelf-section" aria-label="이번 호 이야기 선반">
    <div className="mag-shelf-index" role="group" aria-label="이야기 선택">
      <span className="ind" aria-hidden="true" />
      {items.map((item, index) => <button key={item.id} type="button" className={active === index ? 'on' : undefined} aria-pressed={active === index} aria-label={`${pad(index)} ${item.title}`} onClick={() => controls.current?.go(index)}>{pad(index)}</button>)}
    </div>
    <div className="mag-shelf-wrap">
      <div className="mag-shelf" tabIndex={0} role="group" aria-roledescription="선반" aria-label="이야기 선반. 좌우 화살표로 넘기고 Enter로 펼칩니다.">
        <div className="mag-shelf-stage" aria-hidden="true">
          {Array.from({ length: total }, (_, v) => {
            const index = v % count
            const item = items[index]
            const color = SPINE_COLORS[index % SPINE_COLORS.length]
            return <div className="shelf-tape" key={v}>
              <div className="shelf-face shelf-sp" style={{ '--sp-bg': color.bg, '--sp-fg': color.fg } as CSSProperties}>
                <span className="no">{pad(index)}</span>
                <span className="ph"><img src={item.photo.src} alt="" draggable={false} /></span>
                <span className="tt">{item.title}</span>
                <span className="mk">p.</span>
              </div>
              <div className="shelf-face shelf-cv">
                <img src={item.photo.src} alt="" draggable={false} />
                <span className="shade" />
                <span className="print">
                  <span className="mast">PITCHSIDE</span>
                  <span className="issue">FAN MAGAZINE · 2026 AUTUMN</span>
                  <strong className="ttl">{item.title}</strong>
                  <span className="sub">{item.subtitle}</span>
                  <span className="lb">{item.label}</span>
                </span>
              </div>
            </div>
          })}
        </div>
      </div>
      <button type="button" className="mag-shelf-play" aria-label={`${items[active].title} 펼치기`} onClick={() => controls.current?.open()}>
        <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true"><path d="M1.5 .5 11.5 6 1.5 11.5Z" fill="currentColor" /></svg>
      </button>
    </div>
    <div className="mag-shelf-row">
      <button type="button" className="mag-shelf-arrow" aria-label="이전 이야기" onClick={() => controls.current?.step(-1)}>
        <svg width="18" height="10" viewBox="0 0 18 10" fill="none" stroke="currentColor" strokeWidth="1.2" aria-hidden="true"><path d="M5 1 1 5l4 4M1 5h16" /></svg>
      </button>
      <div className="mag-shelf-caption" aria-live="polite">
        <div className="shelf-mask shelf-title" />
        <div className="shelf-mask shelf-sub" />
        <div className="shelf-mask shelf-meta" />
      </div>
      <button type="button" className="mag-shelf-arrow" aria-label="다음 이야기" onClick={() => controls.current?.step(1)}>
        <svg width="18" height="10" viewBox="0 0 18 10" fill="none" stroke="currentColor" strokeWidth="1.2" aria-hidden="true"><path d="m13 1 4 4-4 4m4-4H1" /></svg>
      </button>
    </div>
    <div className="mag-shelf-probe" aria-hidden="true" />
    <div className="mag-shelf-cursor" aria-hidden="true"><span className="ring" /><span className="dot" /><span className="label"><span>OPEN</span><span>펼치기</span></span></div>
    <div className="mag-shelf-sheet" aria-hidden="true" />
  </section>
}
