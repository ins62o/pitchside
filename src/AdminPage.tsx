import { useEffect, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import type { Article } from './articles'
import { useCms } from './cms-context'
import { imageSource } from './cms-model'
import type { ArticleStatus } from './cms-model'
import { prepareImage } from './cms-image'
import './AdminPage.css'

const statusLabels = { draft: '작성 중', published: '발행됨', archived: '보관됨' }
const sectionLabels = { news: '메인 기사', magazine: '매거진' }

function emptyArticle(): Article {
  return { id: crypto.randomUUID(), title: '', summary: '', author: '', category: '현장노트', section: 'news', image: '', imageAlt: '', imageCredit: '', date: '', readMinutes: 1, status: 'draft', isSample: false, body: [{ paragraphs: [''] }] }
}

function formatDate(value?: string) {
  return value ? new Intl.DateTimeFormat('ko-KR', { timeZone: 'Asia/Seoul', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hour12: false }).format(new Date(value)) : '아직 저장하지 않음'
}

type EditorProps = {
  article?: Article
  onDirtyChange: (dirty: boolean) => void
  onNotify: (text: string) => void
  renderPreview: (article: Article) => ReactNode
}

function ArticleEditor({ article, onDirtyChange, onNotify, renderPreview }: EditorProps) {
  const { saveArticle } = useCms()
  const [form, setForm] = useState<Article>(() => article ? structuredClone(article) : emptyArticle())
  const [dirty, setDirty] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [preview, setPreview] = useState(false)
  const errorRef = useRef<HTMLDivElement>(null)
  const previewRef = useRef<HTMLDivElement>(null)
  const previewButton = useRef<HTMLButtonElement>(null)
  const previewOpened = useRef(false)
  const bodyEditor = useRef<HTMLElement>(null)
  const blockToFocus = useRef<number | null>(null)

  useEffect(() => {
    onDirtyChange(dirty)
    const preventLoss = (event: BeforeUnloadEvent) => { if (dirty) { event.preventDefault(); event.returnValue = '' } }
    window.addEventListener('beforeunload', preventLoss)
    return () => { onDirtyChange(false); window.removeEventListener('beforeunload', preventLoss) }
  }, [dirty, onDirtyChange])
  useEffect(() => { if (error) errorRef.current?.focus() }, [error])
  useEffect(() => {
    if (preview) { previewOpened.current = true; previewRef.current?.focus(); window.scrollTo({ top: 0 }) }
    else if (previewOpened.current) previewButton.current?.focus({ preventScroll: true })
  }, [preview])
  useEffect(() => {
    if (blockToFocus.current === null) return
    const blocks = bodyEditor.current?.querySelectorAll<HTMLElement>('.cms-block')
    const block = blocks?.[Math.min(blockToFocus.current, blocks.length - 1)]
    const target = block?.querySelector<HTMLElement>('input:not([type="file"]), textarea') || bodyEditor.current?.querySelector<HTMLElement>('.cms-add-block button')
    target?.focus()
    blockToFocus.current = null
  }, [form.body])

  function update(patch: Partial<Article>) {
    setForm(current => ({ ...current, ...patch }))
    setDirty(true)
    setError('')
  }
  function updateBlock(index: number, patch: Partial<Article['body'][number]>) {
    setForm(current => ({ ...current, body: current.body.map((block, i) => i === index ? { ...block, ...patch } : block) }))
    setDirty(true)
    setError('')
  }
  function addBlock(type: 'text' | 'image' | 'video') {
    const block = type === 'image' ? { paragraphs: [], image: '', imageAlt: '', caption: '' } : type === 'video' ? { paragraphs: [], youtubeUrl: '', caption: '' } : { paragraphs: [''] }
    update({ body: [...form.body, block] })
  }
  function removeBlock(index: number) {
    const block = form.body[index]
    if ((block.paragraphs.some(p => p.trim()) || block.heading || block.image || block.imageAlt || block.caption || block.youtubeUrl) && !window.confirm('이 본문 블록을 지울까요? 아직 저장한 원문은 바뀌지 않습니다.')) return
    blockToFocus.current = index
    update({ body: form.body.filter((_, i) => i !== index) })
  }
  async function upload(file: File | undefined, index?: number) {
    if (!file) return
    setBusy(true)
    setDirty(true)
    setError('')
    try {
      const image = await prepareImage(file)
      if (index === undefined) update({ image, imageAlt: '', imageCredit: '' })
      else updateBlock(index, { image, imageAlt: '' })
    } catch (err) { setError(err instanceof Error ? err.message : '사진을 올리지 못했습니다.') }
    finally { setBusy(false) }
  }
  async function save(status: ArticleStatus) {
    setBusy(true)
    setError('')
    try {
      const saved = await saveArticle(form, status)
      setForm(saved)
      setDirty(false)
      onDirtyChange(false)
      onNotify(status === 'published' ? '발행했습니다. 선택한 사이트에 글이 반영되었습니다.' : '임시저장했습니다. 독자 화면에는 공개되지 않습니다.')
      if (!article) window.location.hash = `#/admin/edit/${saved.id}`
    } catch (err) { setError(err instanceof Error ? err.message : '저장하지 못했습니다.') }
    finally { setBusy(false) }
  }

  if (preview) return <div className="cms-preview" ref={previewRef} tabIndex={-1}>
    <div className="cms-preview-bar"><div><strong>기사 미리보기</strong><span>현재 작성 중인 내용을 확인하는 화면입니다.</span></div><button type="button" className="cms-button" onClick={() => setPreview(false)}>편집으로 돌아가기</button></div>
    <div className="cms-reader-preview">{renderPreview({ ...form, title: form.title || '제목 없는 기사', date: form.date || '발행 전' })}</div>
  </div>

  return <>
    <div className="cms-editor-heading"><div><a href="#/admin" className="cms-back">← 콘텐츠 목록</a><h1>{article ? '이야기 편집하기' : '새 이야기 쓰기'}</h1><p>{busy ? '처리 중입니다…' : dirty ? '아직 저장하지 않은 변경사항이 있습니다.' : `저장 상태 · ${formatDate(form.updatedAt)}`}</p></div>
      <div className="cms-actions"><button ref={previewButton} type="button" className="cms-button" disabled={busy} onClick={() => setPreview(true)}>미리보기</button><button type="button" className="cms-button" disabled={busy} onClick={() => save(form.status === 'published' ? 'published' : 'draft')}>{form.status === 'published' ? '변경 저장' : '임시저장'}</button>{form.status !== 'published' && <button type="button" className="cms-button cms-primary" disabled={busy} onClick={() => save('published')}>발행하기 ↗</button>}</div>
    </div>
    {error && <div ref={errorRef} tabIndex={-1} className="cms-error" role="alert">{error}</div>}
    <fieldset className="cms-editor-grid" disabled={busy}><legend className="cms-sr-only">기사 작성</legend>
      <div className="cms-writing">
        <section className="cms-paper">
          <label htmlFor="article-title">기사 제목 <span>최대 180자</span></label><textarea className="cms-title-input" id="article-title" placeholder="어떤 이야기를 전할까요?" value={form.title} maxLength={180} rows={2} onChange={e => update({ title: e.target.value })} />
          <label htmlFor="article-summary">기사 요약 <span>목록과 기사 첫머리에 표시됩니다.</span></label><textarea id="article-summary" placeholder="이 기사를 소개하는 두세 문장을 적어주세요." value={form.summary} maxLength={600} rows={3} onChange={e => update({ summary: e.target.value })} />
        </section>
        <section className="cms-body-editor" ref={bodyEditor}><div className="cms-section-title"><h2>본문</h2><span>{form.body.length}개 블록</span></div>
          {form.body.map((block, index) => {
            const imageBlock = block.image !== undefined
            const videoBlock = block.youtubeUrl !== undefined
            return <section className="cms-block" key={index} aria-label={`본문 블록 ${index + 1}`}>
              <div className="cms-block-heading"><strong>{String(index + 1).padStart(2, '0')} <span>{imageBlock ? '사진' : videoBlock ? '유튜브 영상' : '본문'}</span></strong><button type="button" onClick={() => removeBlock(index)} aria-label={`본문 블록 ${index + 1} 삭제`}>블록 삭제</button></div>
              {imageBlock ? <><label className="cms-upload"><input type="file" accept="image/jpeg,image/png,image/webp" aria-label={`본문 사진 ${index + 1} 선택`} onChange={e => { void upload(e.target.files?.[0], index); e.target.value = '' }} />{block.image ? <img src={imageSource(block.image)} alt={block.imageAlt || '업로드한 본문 사진 미리보기'} /> : <span>＋ 본문 사진 선택</span>}</label><label htmlFor={`alt-${index}`}>사진 설명</label><input id={`alt-${index}`} placeholder="사진 속 장면을 설명해주세요." value={block.imageAlt || ''} onChange={e => updateBlock(index, { imageAlt: e.target.value })} /><label htmlFor={`caption-${index}`}>사진 캡션·출처</label><input id={`caption-${index}`} value={block.caption || ''} placeholder="사진 아래에 표시할 설명 또는 촬영자" onChange={e => updateBlock(index, { caption: e.target.value })} /></> : videoBlock ? <><label htmlFor={`video-${index}`}>유튜브 링크</label><input id={`video-${index}`} type="url" placeholder="https://www.youtube.com/watch?v=…" value={block.youtubeUrl || ''} onChange={e => updateBlock(index, { youtubeUrl: e.target.value })} /><label htmlFor={`video-title-${index}`}>영상 설명</label><input id={`video-title-${index}`} placeholder="어떤 영상인지 알려주세요." value={block.caption || ''} onChange={e => updateBlock(index, { caption: e.target.value })} /></> : <><label htmlFor={`heading-${index}`}>소제목 <span>선택</span></label><input id={`heading-${index}`} placeholder="필요한 경우 소제목을 적어주세요." value={block.heading || ''} onChange={e => updateBlock(index, { heading: e.target.value })} /><label htmlFor={`body-${index}`}>본문 <span>빈 줄로 문단을 나눌 수 있습니다.</span></label><textarea id={`body-${index}`} rows={9} placeholder="경기장에서 만난 이야기를 기록해주세요." value={block.paragraphs.join('\n\n')} onChange={e => updateBlock(index, { paragraphs: e.target.value.split(/\n\s*\n/) })} /></>}
            </section>
          })}
          <div className="cms-add-block"><span>이야기에 더하기</span><div><button type="button" onClick={() => addBlock('text')} disabled={form.body.length >= 50}>＋ 본문</button><button type="button" onClick={() => addBlock('image')} disabled={form.body.length >= 50}>＋ 사진</button><button type="button" onClick={() => addBlock('video')} disabled={form.body.length >= 50}>＋ 유튜브 영상</button></div></div>
        </section>
      </div>
      <aside className="cms-settings">
        <section className="cms-panel"><div className="cms-panel-heading"><h2>발행 설정</h2><span className={`cms-status ${form.status || 'draft'}`}>{statusLabels[form.status || 'draft']}</span></div>
          <label htmlFor="article-section">게시 위치</label><select id="article-section" value={form.section} onChange={e => update({ section: e.target.value as Article['section'], category: e.target.value === 'magazine' ? '팬과 문화' : '현장노트' })}><option value="news">메인 기사</option><option value="magazine">매거진</option></select>
          <label htmlFor="article-category">분류</label><input id="article-category" list="article-categories" value={form.category} maxLength={60} onChange={e => update({ category: e.target.value })} /><datalist id="article-categories">{['K리그1', 'K리그2', '현장노트', '축구이야기', '팬과 문화', '로컬 풋볼', '피치 밖의 사람들'].map(category => <option key={category} value={category} />)}</datalist>
          <label htmlFor="article-author">작성자</label><input id="article-author" placeholder="기자명 또는 필자명" value={form.author || ''} maxLength={80} onChange={e => update({ author: e.target.value })} />
          <label className="cms-checkbox"><input type="checkbox" checked={!!form.isSample} onChange={e => update({ isSample: e.target.checked })} />샘플 콘텐츠로 표시</label>
          <p className="cms-help">발행하면 {form.section === 'news' ? '메인 기사 목록과' : '매거진 목록과'} 검색 결과에 표시됩니다.</p>
          {form.status === 'published' && <button type="button" className="cms-withdraw" onClick={() => save('draft')}>발행 취소하고 초안으로 전환</button>}
        </section>
        <section className="cms-panel"><h2>대표사진</h2><p className="cms-help">기사 목록과 본문 상단에 사용합니다.</p><label className="cms-upload cms-cover"><input type="file" accept="image/jpeg,image/png,image/webp" aria-label="대표사진 선택" onChange={e => { void upload(e.target.files?.[0]); e.target.value = '' }} />{form.image ? <><img src={imageSource(form.image)} alt={form.imageAlt || '업로드한 대표사진 미리보기'} /><span className="cms-photo-replace">사진 바꾸기</span></> : <span>＋ 대표사진 선택</span>}</label><p className="cms-help">JPG·PNG·WebP, 최대 10MB. 웹에 맞게 크기를 최적화합니다.</p><label htmlFor="article-image-alt">사진 설명</label><input id="article-image-alt" placeholder="예: 터치라인에서 바라본 경기장" value={form.imageAlt || ''} onChange={e => update({ imageAlt: e.target.value })} /><label htmlFor="article-credit">캡션·촬영자</label><input id="article-credit" placeholder="예: 사진=홍길동 기자" value={form.imageCredit || ''} onChange={e => update({ imageCredit: e.target.value })} /></section>
      </aside>
    </fieldset>
  </>
}

function ContentList({ initialStatus, onNotify }: { initialStatus: string; onNotify: (text: string) => void }) {
  const { documents, saveArticle } = useCms()
  const [query, setQuery] = useState('')
  const [section, setSection] = useState('all')
  const [working, setWorking] = useState('')
  const [error, setError] = useState('')
  const contentPanel = useRef<HTMLElement>(null)
  const focusAfterChange = useRef(false)
  useEffect(() => {
    if (!working && focusAfterChange.current) {
      const target = contentPanel.current?.querySelector<HTMLElement>('.cms-content-title') || contentPanel.current
      target?.focus()
      focusAfterChange.current = false
    }
  }, [documents, working])
  const filtered = documents.filter(article =>
    (initialStatus === 'all' ? article.status !== 'archived' : article.status === initialStatus) &&
    (section === 'all' || article.section === section) &&
    `${article.title} ${article.author} ${article.category}`.toLowerCase().includes(query.trim().toLowerCase()),
  ).sort((a, b) => (b.updatedAt || '').localeCompare(a.updatedAt || ''))
  async function changeStatus(article: Article, status: ArticleStatus) {
    setWorking(article.id)
    setError('')
    try { await saveArticle(article, status); focusAfterChange.current = true; onNotify(status === 'archived' ? '보관함으로 옮겼습니다. 독자 화면에서는 내려갔습니다.' : '초안으로 복원했습니다. 편집 후 다시 발행할 수 있습니다.') }
    catch (err) { setError(err instanceof Error ? err.message : '상태를 변경하지 못했습니다.') }
    finally { setWorking('') }
  }
  function backup() {
    const url = URL.createObjectURL(new Blob([JSON.stringify({ version: 1, exportedAt: new Date().toISOString(), articles: documents }, null, 2)], { type: 'application/json' }))
    const anchor = document.createElement('a')
    anchor.href = url; anchor.download = 'pitchside-content-backup.json'; anchor.click()
    setTimeout(() => URL.revokeObjectURL(url), 10_000)
  }
  return <>
    <div className="cms-list-heading"><div><span className="cms-eyebrow">EDITORIAL WORKSPACE</span><h1>{initialStatus === 'all' ? '콘텐츠 관리' : initialStatus === 'archived' ? '보관함' : statusLabels[initialStatus as ArticleStatus]}</h1><p>현장에서 시작된 이야기를, 독자에게 전하세요.</p></div><a href="#/admin/new" className="cms-button cms-primary">＋ 새 글 쓰기</a></div>
    <div className="cms-statistics">{[{ label: '전체 콘텐츠', value: documents.filter(x => x.status !== 'archived').length }, { label: '발행한 글', value: documents.filter(x => x.status === 'published').length }, { label: '작성 중', value: documents.filter(x => x.status === 'draft').length }, { label: '발행한 매거진', value: documents.filter(x => x.status === 'published' && x.section === 'magazine').length }].map(item => <div key={item.label}><span>{item.label}</span><strong>{item.value}<small>편</small></strong></div>)}</div>
    <section className="cms-content-panel" ref={contentPanel} tabIndex={-1}><div className="cms-list-toolbar"><div className="cms-list-tabs"><a href="#/admin" aria-current={initialStatus === 'all' ? 'page' : undefined}>전체</a><a href="#/admin/drafts" aria-current={initialStatus === 'draft' ? 'page' : undefined}>작성 중</a><a href="#/admin/published" aria-current={initialStatus === 'published' ? 'page' : undefined}>발행됨</a></div><div className="cms-list-filters"><label className="cms-sr-only" htmlFor="content-section">게시 위치 필터</label><select id="content-section" value={section} onChange={e => setSection(e.target.value)}><option value="all">모든 게시 위치</option><option value="news">메인 기사</option><option value="magazine">매거진</option></select><label className="cms-sr-only" htmlFor="content-query">콘텐츠 검색</label><input id="content-query" type="search" placeholder="제목·작성자로 검색" value={query} onChange={e => setQuery(e.target.value)} /></div></div>
      {error && <div className="cms-error" role="alert">{error}</div>}
      <div className="cms-table-scroll"><table className="cms-table"><caption className="cms-sr-only">저장된 콘텐츠 {filtered.length}편</caption><thead><tr><th scope="col">콘텐츠</th><th scope="col">작성자</th><th scope="col">상태</th><th scope="col">최근 저장</th><th scope="col">관리</th></tr></thead><tbody>{filtered.map(article => <tr key={article.id}><td><a className="cms-content-title" href={`#/admin/edit/${article.id}`}>{article.title || '제목 없는 기사'}</a><div className="cms-row-meta"><span>{sectionLabels[article.section]}</span><span>{article.category || '미분류'}</span>{article.isSample && <span className="cms-sample-tag">샘플</span>}</div></td><td>{article.author || '미입력'}</td><td><span className={`cms-status ${article.status || 'draft'}`}>{statusLabels[article.status || 'draft']}</span></td><td className="cms-date">{formatDate(article.updatedAt)}</td><td><div className="cms-row-actions"><a href={`#/admin/edit/${article.id}`}>편집</a>{article.status === 'published' && <a href={`#/articles/${article.id}`} aria-label={`${article.title} 독자 화면 보기`}>보기 ↗</a>}<button type="button" disabled={!!working} onClick={() => changeStatus(article, article.status === 'archived' ? 'draft' : 'archived')}>{working === article.id ? '처리 중…' : article.status === 'archived' ? '복원' : '보관'}</button></div></td></tr>)}</tbody></table></div>
      {!filtered.length && <div className="cms-list-empty"><h2>{initialStatus === 'archived' ? '보관한 글이 없습니다.' : query ? '검색 결과가 없습니다.' : '아직 이곳에 저장한 글이 없습니다.'}</h2><p>{query ? '다른 제목이나 작성자 이름으로 검색해보세요.' : '새 이야기를 작성하거나 다른 목록을 확인해보세요.'}</p></div>}
      <div className="cms-table-footer"><span>{filtered.length}편의 콘텐츠</span><button type="button" onClick={backup}>전체 콘텐츠 백업 다운로드 ↓</button></div>
    </section>
  </>
}

export function AdminPage({ path, onDirtyChange, renderPreview }: { path: string; onDirtyChange: (dirty: boolean) => void; renderPreview: (article: Article) => ReactNode }) {
  const { documents } = useCms()
  const [notice, setNotice] = useState('')
  const editingId = path.startsWith('/admin/edit/') ? path.slice('/admin/edit/'.length) : ''
  const article = documents.find(item => item.id === editingId)
  const isNew = path === '/admin/new'
  const editing = isNew || !!editingId
  const status = path === '/admin/drafts' ? 'draft' : path === '/admin/published' ? 'published' : path === '/admin/archive' ? 'archived' : 'all'
  return <div className="cms-shell"><a className="skip-link" href="#cms-content" onClick={e => { e.preventDefault(); document.getElementById('cms-content')?.focus() }}>관리 본문으로 바로가기</a>
    <aside className="cms-sidebar"><a className="cms-brand" href="#/admin">pitchside<span>.</span></a><span className="cms-workspace-label">EDITORIAL STUDIO</span><nav aria-label="관리자 메뉴"><a href="#/admin" className={!editing && status !== 'archived' ? 'selected' : ''}>콘텐츠 관리 <span>↗</span></a><a href="#/admin/new" className={isNew ? 'selected' : ''}>새 글 쓰기 <span>＋</span></a><a href="#/admin/archive" className={status === 'archived' ? 'selected' : ''}>보관함</a></nav><div className="cms-sidebar-bottom"><span className="cms-local-dot" /> 로컬 작업공간<p>이 브라우저에 저장됩니다.</p></div></aside>
    <div className="cms-main"><header className="cms-topbar"><div>Pitchside <span>/</span> 콘텐츠 작업공간</div><div><a href="#/">메인 사이트 ↗</a><a href="#/magazine">매거진 ↗</a></div></header><main id="cms-content" className="cms-content" tabIndex={-1}><div className="cms-local-notice"><strong>로컬 CMS 프리뷰</strong><span>글과 사진은 현재 브라우저에 저장됩니다. 브라우저 데이터를 지우면 삭제되므로 중요한 글은 백업해주세요.</span></div>{notice && <div className="cms-success" role="status"><span>{notice}</span><button type="button" aria-label="저장 안내 닫기" onClick={() => setNotice('')}>×</button></div>}{editing ? editingId && !article ? <div className="cms-list-empty"><h1>저장된 글을 찾을 수 없습니다.</h1><a href="#/admin">콘텐츠 목록으로 돌아가기</a></div> : <ArticleEditor key={editingId || 'new'} article={article} onDirtyChange={onDirtyChange} onNotify={setNotice} renderPreview={renderPreview} /> : <ContentList key={status} initialStatus={status} onNotify={setNotice} />}</main><footer className="cms-footer">PITCHSIDE EDITORIAL STUDIO<span>경기장 가까이, 축구의 깊이.</span></footer></div>
  </div>
}
