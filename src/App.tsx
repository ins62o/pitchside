import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import type { FormEvent } from 'react'
import { Icon, Text, TextField } from '@seed-design/react'
import { ActionButton } from 'seed-design/ui/action-button'
import { ToggleButton } from 'seed-design/ui/toggle-button'
import { articleKinds, leagues, readerArticles, relatedArticles, selectArticles } from './reader-data'
import type { ReaderArticle, ReaderFilter } from './reader-data'
import MagazinePage from './MagazinePage'
import { ArticleViewSwitch, ThemeToggle } from './ReaderControls'
import type { ArticleViewProps } from './ReaderControls'
import { readReaderPreferences, saveReaderPreferences } from './reader-preferences'
import { ArticleCategory, ArticleByline } from './ArticleMeta'
import type { ArticleView } from './reader-preferences'
import './App.css'

const archiveUrl = ({ league, kind, query }: ReaderFilter = {}) => {
  const params = new URLSearchParams()
  if (league) params.set('league', league)
  if (kind) params.set('kind', kind)
  if (query?.trim()) params.set('q', query.trim())
  return `#/articles${params.size ? `?${params}` : ''}`
}
const storyUrl = (article: ReaderArticle, returnTo?: string) => `#/articles/${article.id}${returnTo ? `?from=${encodeURIComponent(returnTo)}` : ''}`

function Brand() {
  return <a className="wordmark" href="#/" aria-label="Pitchside 홈">pitchside<span aria-hidden="true">.</span></a>
}

function ArticleImage({ article, eager = false }: { article: ReaderArticle; eager?: boolean }) {
  const [failed, setFailed] = useState(false)
  if (!article.image || failed) return <div className="image-placeholder" role="img" aria-label="대표사진이 준비되지 않은 기사"><span aria-hidden="true">pitchside.</span><small>이미지 준비 중</small></div>
  return <><img src={article.image.src} alt={article.image.alt} width="1536" height="1024" loading={eager ? 'eager' : 'lazy'} fetchPriority={eager ? 'high' : 'auto'} onError={() => setFailed(true)} /><span className="photo-watermark" aria-hidden="true">pitchside.</span></>
}


function ArticleRows({ items, returnTo, headingLevel = 'h2', view }: { items: ReaderArticle[]; returnTo?: string; headingLevel?: 'h2' | 'h3'; view: ArticleView }) {
  const Heading = headingLevel
  return <div className="article-rows" data-view={view}>{items.map(article => <article className="article-row" key={article.id}>
    <div className="row-image"><ArticleImage article={article} /></div>
    <div className="row-copy"><ArticleCategory article={article} /><Heading><a className="card-link" href={storyUrl(article, returnTo)}>{article.title}</a></Heading><p>{article.summary}</p><ArticleByline article={article} /></div>
  </article>)}</div>
}

function HomePage() {
  const [lead, ...others] = readerArticles
  return <>
    <div className="home-heading"><Text as="h1" textStyle="t12Bold" id="front-heading">주요 기사</Text></div>
    <section className="front-page" aria-labelledby="front-heading">
      <article className="lead-article"><a href={storyUrl(lead)} className="lead-photo" aria-labelledby="lead-title"><ArticleImage article={lead} eager /><div className="lead-text"><h2 id="lead-title">{lead.title}</h2></div></a></article>
      <div className="front-related">{others.slice(0, 3).map(article => <article className="front-story" key={article.id}><a className="front-story-link" href={storyUrl(article)} aria-labelledby={`front-title-${article.id}`}><div className="front-story-image"><ArticleImage article={article} /></div><h3 id={`front-title-${article.id}`}>{article.title}</h3></a></article>)}</div>
    </section>
    <section className="latest-section" aria-labelledby="latest-heading"><div className="section-heading"><Text as="h2" textStyle="t9Bold" id="latest-heading">최신 기사</Text><a className="text-link" href="#/articles">전체 기사 보기</a></div><ArticleRows items={readerArticles.slice(4, 10)} headingLevel="h3" view="list" /></section>
  </>
}

function ArchivePage({ params, route, view, onViewChange }: { params: URLSearchParams; route: string } & ArticleViewProps) {
  const league = params.get('league') || ''
  const heading = league === 'K리그1' ? '정상을 향한 경쟁, K리그1' : league === 'K리그2' ? '승격을 향한 도전, K리그2' : '우리 축구의 모든 이야기'
  const kind = params.get('kind') || ''
  const query = params.get('q') || ''
  const [input, setInput] = useState(query)
  const [searchOpen, setSearchOpen] = useState(!!query || params.get('focus') === 'search')
  const searchToggle = useRef<HTMLButtonElement>(null)
  const searchInput = useRef<HTMLInputElement>(null)
  const resultsTitle = useRef<HTMLHeadingElement>(null)
  const items = selectArticles({ league, kind, query })
  const active = !!(league || kind || query)

  useEffect(() => {
    if (searchOpen) searchInput.current?.focus({ preventScroll: true })
  }, [searchOpen])

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const target = archiveUrl({ league, kind, query: input })
    if (window.location.hash === target) resultsTitle.current?.focus()
    else window.location.hash = target
  }
  function clearSearch() {
    setInput('')
    const target = archiveUrl({ league, kind })
    if (window.location.hash !== target) window.location.hash = `${target}${target.includes('?') ? '&' : '?'}focus=search`
    else searchInput.current?.focus()
  }
  return <div className="archive-page">
    <div className="archive-heading"><h1>{heading}</h1><ActionButton ref={searchToggle} className="search-toggle" variant="ghost" layout="iconOnly" size="small" type="button" aria-label={searchOpen ? '기사 검색 닫기' : '기사 검색 열기'} aria-expanded={searchOpen} aria-controls="article-search-panel" onClick={() => setSearchOpen(open => !open)}><Icon svg={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><circle cx="10.5" cy="10.5" r="6.5" /><path d="m15.5 15.5 4.5 4.5" /></svg>} /></ActionButton></div>
    <div id="article-search-panel" className="archive-search-panel" data-open={searchOpen} inert={!searchOpen} aria-hidden={!searchOpen}><div className="archive-search-clip">
    <form className="archive-search" role="search" onSubmit={submit} onKeyDown={event => {
      if (event.key === 'Escape') {
        event.preventDefault()
        setSearchOpen(false)
        searchToggle.current?.focus()
      }
    }}>
        <div className="search-controls">
          <TextField.Root className="search-input" variant="outline" size="medium" value={input} onValueChange={setInput}>
            <TextField.Input ref={searchInput} data-article-search aria-label="기사 검색" type="search" maxLength={120} placeholder="찾고 싶은 기사 제목이나 내용을 입력하세요" />
          </TextField.Root>
          {input && <ActionButton className="ui-button clear-search" variant="neutralOutline" size="medium" type="button" onClick={clearSearch}>검색어 지우기</ActionButton>}
          <ActionButton className="ui-button search-submit" variant="brandSolid" size="medium" type="submit">검색</ActionButton>
        </div>
    </form>
    </div></div>
    <div className="archive-filters"><div className="kind-filters" role="group" aria-label="기사 유형">{['', ...articleKinds].map(value => <ToggleButton className="ui-button type-filter" variant="neutralWeak" size="small" key={value || 'all'} pressed={kind === value} onPressedChange={() => { window.location.hash = archiveUrl({ league, kind: value, query }) }}>{value || '전체'}</ToggleButton>)}</div>{active && <a className="reset-link" href="#/articles">초기화</a>}</div>
    <div className="results-heading"><h2 ref={resultsTitle} tabIndex={-1}>{query ? `‘${query}’ 검색 결과` : league || '전체 기사'} <span>{items.length}건</span></h2><div className="results-actions"><ArticleViewSwitch view={view} onViewChange={onViewChange} /></div></div>
    <p className="sr-only" role="status">{league} {kind} {query ? `${query} 검색 결과` : '기사'} {items.length}건</p>
    {items.length ? <ArticleRows items={items} returnTo={route} view={view} /> : <div className="no-results"><h2>조건에 맞는 기사가 없습니다.</h2><p>검색어를 줄이거나 다른 리그·기사 유형을 선택해보세요.</p><ActionButton asChild className="ui-button outline-link" variant="neutralOutline" size="medium"><a href="#/articles">모든 기사 다시 보기</a></ActionButton></div>}
  </div>
}

function ArticlePage({ article, params }: { article: ReaderArticle; params: URLSearchParams }) {
  const candidate = params.get('from') || ''
  const returnTo = candidate === '/magazine' || candidate === '/articles' || candidate.startsWith('/articles?') ? `#${candidate}` : '#/articles'
  const returnLabel = candidate === '/magazine' ? '팬 매거진' : '기사 목록'
  return <article className="story-page">
    <header className="story-heading"><ArticleCategory article={article} /><h1>{article.title}</h1><ArticleByline article={article} readingTime /></header>
    <figure className="story-figure"><div className="story-image"><ArticleImage article={article} eager /></div><figcaption>{article.image?.caption}</figcaption></figure>
    <div className="story-body">{article.body.map((section, i) => <section key={i}>{section.heading && <h2>{section.heading}</h2>}{section.paragraphs.map((paragraph, j) => <p key={j}>{paragraph}</p>)}{section.quote && <figure className="pull-quote"><blockquote><p>{section.quote.text}</p></blockquote><figcaption>{section.quote.speaker}</figcaption></figure>}</section>)}<div className="story-end"><p>{article.author} 기자</p><a href={returnTo} className="text-link">{returnLabel}으로</a></div></div>
    <section className="related-section" aria-labelledby="related-heading"><div className="section-heading"><h2 id="related-heading">이어서 읽는 이야기</h2></div><div className="related-grid">{relatedArticles(article).map(item => <article key={item.id}><ArticleCategory article={item} /><h3><a className="card-link" href={storyUrl(item, returnTo.slice(1))}>{item.title}</a></h3><p>{item.summary}</p><ArticleByline article={item} /></article>)}</div></section>
  </article>
}

function NotFound() {
  return <section className="not-found"><p className="publication-label">404</p><h1>기사를 찾을 수 없습니다.</h1><p>주소를 확인하거나 기사 목록에서 다른 이야기를 만나보세요.</p><ActionButton asChild className="ui-button outline-link" variant="neutralOutline" size="medium"><a href="#/articles">기사 목록으로 이동</a></ActionButton></section>
}

export default function App() {
  const [preferences, setPreferences] = useState(readReaderPreferences)
  const viewProps: ArticleViewProps = { view: preferences.view, onViewChange: view => setPreferences(current => ({ ...current, view })) }
  const themeControl = <ThemeToggle theme={preferences.theme} onToggle={() => setPreferences(current => ({ ...current, theme: current.theme === 'light' ? 'dark' : 'light' }))} />

  useLayoutEffect(() => {
    const dark = preferences.theme === 'dark'
    document.documentElement.dataset.seedColorMode = dark ? 'dark-only' : 'light-only'
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', dark ? '#191B1F' : '#F5F4F0')
    document.querySelector('meta[name="color-scheme"]')?.setAttribute('content', preferences.theme)
    saveReaderPreferences(preferences)
  }, [preferences])

  // shortcut: local previews retain hash routing; publish with real article URLs and per-page metadata.
  const [route, setRoute] = useState(window.location.hash.slice(1) || '/')
  const previousRoute = useRef(route)
  const main = useRef<HTMLElement>(null)
  const [path, search = ''] = route.split('?')
  const params = new URLSearchParams(search)
  const article = path.startsWith('/articles/') ? readerArticles.find(item => item.id === path.slice(10)) : undefined
  const archive = path === '/articles'
  const currentLeague = archive ? params.get('league') : article?.league

  useLayoutEffect(() => {
    if (!('IntersectionObserver' in window) || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const cards = main.current?.querySelectorAll<HTMLElement>('.lead-article, .front-story, .article-rows[data-view=gallery] .article-row, .related-grid > article')
    if (!cards?.length) return

    const observer = new IntersectionObserver(entries => {
      entries.filter(entry => entry.isIntersecting).forEach((entry, index) => {
        const card = entry.target as HTMLElement
        card.style.setProperty('--reveal-delay', Math.min(index, 5) * 120 + 'ms')
        card.dataset.reveal = 'visible'
        observer.unobserve(card)
      })
    }, { threshold: 0.06, rootMargin: '0px 0px -12px 0px' })

    cards.forEach(card => {
      card.dataset.reveal = 'pending'
      observer.observe(card)
    })
    return () => {
      observer.disconnect()
      cards.forEach(card => {
        delete card.dataset.reveal
        card.style.removeProperty('--reveal-delay')
      })
    }
  }, [route, preferences.view])

  useEffect(() => {
    const navigate = () => {
      const next = window.location.hash.slice(1) || '/'
      // Keep older reader bookmarks useful without exposing the previous editing UI.
      const [oldPath, oldSearch = ''] = next.split('?')
      const oldParams = new URLSearchParams(oldSearch)
      if (oldPath === '/search' || (oldPath === '/' && oldParams.has('category'))) {
        const category = oldParams.get('category') || ''
        window.location.replace(archiveUrl({ query: oldParams.get('q') || '', league: leagues.includes(category as typeof leagues[number]) ? category : '' }))
        return
      }
      setRoute(next)
    }
    window.addEventListener('hashchange', navigate)
    navigate()
    return () => window.removeEventListener('hashchange', navigate)
  }, [])
  useEffect(() => {
    if (previousRoute.current !== route) {
      window.scrollTo({ top: 0, behavior: 'instant' })
      if (new URLSearchParams(route.split('?')[1]).get('focus') !== 'search') main.current?.focus({ preventScroll: true })
      previousRoute.current = route
    }
    if (new URLSearchParams(route.split('?')[1]).get('focus') === 'search') document.querySelector<HTMLInputElement>('[data-article-search]')?.focus({ preventScroll: true })
  }, [route])
  useEffect(() => {
    document.title = 'pitchside'
    const description = document.querySelector<HTMLMetaElement>('meta[name="description"]')
    if (description) description.content = article?.summary || 'K리그1과 K리그2의 경기, 사람, 전술을 읽는 Pitchside. 경기장 가까이에서 우리 축구의 이야기를 전합니다.'
  }, [article, archive, path])

  if (path === '/magazine') return <MagazinePage mainRef={main} themeControl={themeControl} />

  return <div className="pitchside-reader">
    <a className="skip-link" href="#main-content" onClick={event => { event.preventDefault(); main.current?.focus() }}>본문으로 바로가기</a>
    <header className="site-header"><div className="header-inner"><Brand /><div className="header-actions">{themeControl}<ActionButton asChild variant="brandOutline" size="medium" className="header-magazine"><a href="#/magazine">팬 매거진<span aria-hidden="true">↗</span></a></ActionButton></div></div><nav className="primary-nav" aria-label="주 메뉴"><div className="nav-inner"><a href="#/" aria-current={path === '/' ? 'page' : undefined}>홈</a><a href={archiveUrl(archive ? { kind: params.get('kind') || '', query: params.get('q') || '' } : {})} aria-current={archive && !currentLeague ? 'page' : undefined}>전체 기사</a>{leagues.map(league => <a key={league} href={archiveUrl({ league, ...(archive ? { kind: params.get('kind') || '', query: params.get('q') || '' } : {}) })} aria-current={currentLeague === league ? 'page' : undefined}>{league}</a>)}</div></nav></header>
    <main className="page-container" id="main-content" ref={main} tabIndex={-1} key={route}>{path === '/' ? <HomePage /> : archive ? <ArchivePage params={params} route={route} {...viewProps} /> : article ? <ArticlePage article={article} params={params} /> : <NotFound />}</main>
    <footer className="site-footer"><div className="footer-inner"><Brand /><p className="footer-copyright">© 2026 Pitchside</p></div></footer>
  </div>
}
