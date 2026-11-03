import { useEffect, useRef, useState } from 'react'
import type { CSSProperties, ReactNode } from 'react'
import { cardPalettes, createQuoteCard, prepareQuote, quoteLength } from './quote-card'
import type { QuoteSource } from './quote-card'
import './QuoteShare.css'

function CloseIcon() {
  return <svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round"><path d="m6 6 12 12M18 6 6 18" /></svg>
}

function QuoteComposer({ source, initialText, onClose }: { source: QuoteSource; initialText: string; onClose: () => void }) {
  const dialog = useRef<HTMLDialogElement>(null)
  const [text, setText] = useState(initialText)
  const [palette, setPalette] = useState(0)
  const [large, setLarge] = useState(false)
  const [image, setImage] = useState<{ url: string; file: File } | null>(null)
  const [message, setMessage] = useState('')
  const [sharing, setSharing] = useState(false)
  const validText = prepareQuote(text)
  const count = quoteLength(text.replace(/\s+/g, ' ').trim())
  const renderKey = `${validText ?? ''}:${palette}:${large}`
  const [readyKey, setReadyKey] = useState('')
  const ready = !!image && readyKey === renderKey && !!validText
  const canShare = !!image && typeof navigator.canShare === 'function' && navigator.canShare({ files: [image.file] })

  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null
    const element = dialog.current
    element?.showModal()
    const overflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      element?.close()
      document.body.style.overflow = overflow
      previous?.focus({ preventScroll: true })
    }
  }, [])

  useEffect(() => {
    if (!validText) return
    let active = true
    createQuoteCard(source, validText, palette, large).then(blob => {
      if (!active) return
      const objectUrl = URL.createObjectURL(blob)
      setImage({ url: objectUrl, file: new File([blob], 'pitchside-story.png', { type: 'image/png' }) })
      setReadyKey(renderKey)
    }).catch(error => {
      if (active) setMessage(error instanceof RangeError ? error.message : '이미지를 만들지 못했습니다. 잠시 후 다시 시도해주세요.')
    })
    return () => { active = false }
  }, [source, validText, palette, large, renderKey])

  useEffect(() => () => { if (image) URL.revokeObjectURL(image.url) }, [image])

  function download() {
    if (!ready) return
    const link = document.createElement('a')
    link.href = image.url
    link.download = 'pitchside-story.png'
    link.click()
    setMessage('저장한 이미지를 인스타그램 스토리에서 선택해주세요.')
  }

  async function share() {
    if (!ready || !canShare || sharing) return
    setSharing(true)
    setMessage('')
    try {
      // Prepare the file before the tap so mobile browsers retain user activation.
      await navigator.share({ files: [image.file] })
    } catch (error) {
      if (!(error instanceof Error && error.name === 'AbortError')) setMessage('공유 메뉴를 열지 못했습니다. 이미지 저장을 이용해주세요.')
    } finally { setSharing(false) }
  }

  return <dialog ref={dialog} className="quote-dialog" aria-labelledby="quote-dialog-title" aria-describedby="quote-dialog-description" onCancel={event => { event.preventDefault(); onClose() }} onClick={event => { if (event.target === event.currentTarget) onClose() }}>
    <div className="quote-composer">
      <header className="quote-composer-heading"><h2 id="quote-dialog-title">문장 카드</h2><button className="quote-close" type="button" onClick={onClose} aria-label="문장 카드 닫기" autoFocus><CloseIcon /></button></header>
      <div className="quote-composer-grid">
        <figure className="quote-preview-area"><div className="quote-preview" aria-busy={!ready}>{image ? <img src={image.url} alt="선택한 문장으로 만든 카드 미리보기" width="1080" height="1920" /> : <p>미리보기 준비 중…</p>}</div></figure>
        <div className="quote-options">
          <p id="quote-dialog-description" className="sr-only">문장과 카드 색상을 선택한 뒤 이미지를 저장하거나 공유하세요.</p>
          <label className="quote-label" htmlFor="quote-text">문장 <span aria-live="polite" data-invalid={count > 240}>{count} / 240</span></label>
          <textarea id="quote-text" value={text} rows={4} onChange={event => { setText(event.target.value); setMessage('') }} aria-invalid={!validText} aria-describedby={!validText ? 'quote-text-error' : undefined} />
          {!validText && <p id="quote-text-error" className="quote-error">1~240자 이내의 문장을 입력해주세요.</p>}
          <div className="quote-style-controls">
            <div className="quote-style-heading"><span aria-hidden="true">카드 색상</span><button type="button" className="quote-font-button" aria-pressed={large} title={large ? '기본 크기로 보기' : '글자 크게 보기'} onClick={() => { setLarge(value => !value); setMessage('') }}>글자 크게</button></div>
            <fieldset className="quote-colors"><legend className="sr-only">카드 색상</legend>{cardPalettes.map((color, index) => <label key={color.id} style={{ '--swatch': color.panel } as CSSProperties}><input type="radio" name="quote-color" value={color.id} checked={palette === index} onChange={() => { setPalette(index); setMessage('') }} /><span className="quote-color-dot" /><span>{color.name}</span></label>)}</fieldset>
          </div>
          <div className="quote-export" data-pending={!!validText && !ready}><button type="button" className="quote-primary" data-unavailable={!canShare || !validText} disabled={!ready || !canShare || sharing} onClick={share}>{sharing ? '공유 중…' : '공유하기'}</button><button type="button" className="quote-secondary" data-unavailable={!image || !validText} disabled={!ready || sharing} onClick={download}>이미지 저장</button></div>
          <p className="quote-status" role="status">{message}</p>
        </div>
      </div>
    </div>
  </dialog>
}

export default function QuoteShare({ source, children }: { source: QuoteSource; children: ReactNode }) {
  const content = useRef<HTMLDivElement>(null)
  const [selected, setSelected] = useState('')
  const [composing, setComposing] = useState<string | null>(null)
  const [reachedEnd, setReachedEnd] = useState(false)
  const contentEnd = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>
    function update() {
      clearTimeout(timer)
      timer = setTimeout(() => {
        const selection = window.getSelection()
        const range = selection?.rangeCount ? selection.getRangeAt(0) : null
        setSelected(selection && !selection.isCollapsed && range && content.current?.contains(range.commonAncestorContainer) ? selection.toString().replace(/\s+/g, ' ').trim() : '')
      }, 180)
    }
    document.addEventListener('selectionchange', update)
    return () => { clearTimeout(timer); document.removeEventListener('selectionchange', update) }
  }, [])

  useEffect(() => {
    if (!contentEnd.current || !('IntersectionObserver' in window)) return
    // Include the area above the viewport so jumping past the article end also counts.
    const observer = new IntersectionObserver(([entry]) => setReachedEnd(entry.isIntersecting), { rootMargin: `${document.documentElement.scrollHeight}px 0px -80px 0px` })
    observer.observe(contentEnd.current)
    return () => observer.disconnect()
  }, [])

  const validSelection = prepareQuote(selected)
  function open(text: string) {
    setComposing(text)
    setSelected('')
    window.getSelection()?.removeAllRanges()
  }

  return <>
    <div ref={content} className="quote-selectable">{children}<span ref={contentEnd} className="quote-content-end" aria-hidden="true" /></div>
    {!selected && reachedEnd && <aside className="quote-invitation" aria-label="문장 카드 안내">
      <button className="quote-invitation-compact" type="button" onClick={() => open(source.quote)}><span aria-hidden="true">“</span> 문장 카드 만들기 <span aria-hidden="true">”</span></button>
    </aside>}
    {selected && composing === null && <div className="quote-selection-bar" role="region" aria-label="선택한 문장 공유"><span>{validSelection ? '이 문장을 간직할까요?' : '240자 이내로 선택해주세요'}</span><button className="quote-selection-create" type="button" disabled={!validSelection} onPointerDown={event => { if (event.pointerType === 'mouse') event.preventDefault() }} onClick={() => validSelection && open(validSelection)}>카드 만들기</button><button className="quote-selection-close" type="button" aria-label="문장 공유 닫기" onClick={() => { setSelected(''); window.getSelection()?.removeAllRanges() }}><CloseIcon /></button></div>}
    {composing !== null && <QuoteComposer source={source} initialText={composing} onClose={() => setComposing(null)} />}
  </>
}
