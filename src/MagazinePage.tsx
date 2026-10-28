import { useState } from 'react'
import type { ReactNode, RefObject } from 'react'
import { Badge, Text } from '@seed-design/react'
import { ActionButton } from 'seed-design/ui/action-button'
import { readerArticles } from './reader-data'
import { ArticleCategory, ArticleByline } from './ArticleMeta'
import './MagazinePage.css'

const photos = {
  cover: { src: '/images/magazine-cover.png', alt: '저녁 경기장의 관중석에서 초록색 머플러를 들어 올린 축구 팬의 뒷모습' },
  objects: { src: '/images/magazine-objects.png', alt: '경기장 좌석 위에 놓인 머플러와 유니폼, 티켓 두 장' },
  stadium: { src: '/images/stadium.png', alt: '조명이 켜진 축구장과 저녁 하늘' },
  fans: { src: '/images/fans.png', alt: '같은 방향을 바라보며 응원하는 축구 팬들' },
}
type Photo = typeof photos.cover
const gallery = [
  { photo: photos.fans, caption: '함께 부르는 응원가' },
  { photo: photos.objects, caption: '경기장에 가져가는 것들' },
  { photo: photos.stadium, caption: '조명이 켜지는 시간' },
  { photo: photos.cover, caption: '우리의 토요일' },
]
const features = readerArticles.filter(article => ['saturday', 'away-end', 'after-whistle'].includes(article.id))
const chapters = [
  { title: '경기장에 가는 날', text: '익숙한 길도 경기 날에는 조금 다르다. 킥오프 전부터 시작되는 우리의 주말.', id: 'before-kickoff' },
  { title: '어디든, 함께', text: '낯선 도시에서도 같은 노래를 부르는 사람들. 원정석에서 이어지는 이야기.', id: 'away-end' },
  { title: '축구 곁의 사람들', text: '그라운드 안팎에서 만나는 각자의 축구. 한 사람의 목소리로 들여다본 하루.', id: 'midfielder' },
  { title: '우리만의 주말', text: '머플러 하나, 유니폼 한 벌, 오래 부른 응원가. 축구가 일상이 되는 순간.', id: 'saturday' },
  { title: '휘슬이 울린 뒤', text: '경기는 끝나도 이야기는 남는다. 그날의 표정과 기억을 한 장씩 모은다.', id: 'after-whistle' },
]

function jumpTo(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth', block: 'start' })
}

function MagazinePhoto({ photo, portrait = false, eager = false }: { photo: Photo; portrait?: boolean; eager?: boolean }) {
  const [failed, setFailed] = useState(false)
  return <div className="mag-photo">{failed ? <span className="mag-photo-placeholder" role="img" aria-label="사진 준비 중">pitchside.</span> : <><img src={photo.src} alt={photo.alt} width={portrait ? 1024 : 1536} height={portrait ? 1536 : 1024} loading={eager ? 'eager' : 'lazy'} fetchPriority={eager ? 'high' : 'auto'} onError={() => setFailed(true)} /><span className="photo-watermark" aria-hidden="true">pitchside.</span></>}</div>
}

export default function MagazinePage({ mainRef, themeControl }: { mainRef: RefObject<HTMLElement | null>; themeControl: ReactNode }) {
  return <div className="magazine">
    <a className="skip-link" href="#magazine-content" onClick={event => { event.preventDefault(); mainRef.current?.focus() }}>본문으로 바로가기</a>
    <header className="mag-nav">
      <div className="mag-nav-inner">
        <a className="wordmark" href="#/" aria-label="Pitchside 홈">pitchside<span aria-hidden="true">.</span></a>
        {themeControl}
        <nav aria-label="팬 매거진 메뉴">
          <ActionButton variant="ghost" size="small" type="button" onClick={() => jumpTo('mag-about')}>매거진 소개</ActionButton>
          <ActionButton variant="ghost" size="small" type="button" onClick={() => jumpTo('mag-stories')}>이번 호</ActionButton>
          <ActionButton variant="ghost" size="small" type="button" onClick={() => jumpTo('mag-scenes')}>팬의 장면</ActionButton>
          <ActionButton asChild variant="brandOutline" size="medium"><a href="#/">기사 홈 <span aria-hidden="true">↗</span></a></ActionButton>
        </nav>
      </div>
    </header>
    <main className="mag-container" id="magazine-content" ref={mainRef} tabIndex={-1}>
      <section className="mag-hero" aria-labelledby="mag-title">
        <div className="mag-hero-copy">
          <Badge.Root variant="outline" tone="brand" size="large"><Badge.Label>팬 매거진 · 2026년 10월호</Badge.Label></Badge.Root>
          <h1 id="mag-title">축구가 끝나도,<br />우리의 이야기는<br className="mag-title-break" /> 계속된다.</h1>
          <p>90분 바깥의 축구.<br />경기장으로 향하는 마음과 그곳에 남은 우리의 이야기.</p>
          <ActionButton className="mag-primary-action" variant="brandSolid" size="large" type="button" onClick={() => jumpTo('mag-stories')}>이번 호 펼쳐보기 <span aria-hidden="true">↗</span></ActionButton>
        </div>
        <figure className="mag-cover"><MagazinePhoto photo={photos.cover} portrait eager /><figcaption>경기장 곁에서 만나는, 축구를 좋아하는 우리의 모습.</figcaption></figure>
      </section>

      <section className="mag-scenes" id="mag-scenes" aria-labelledby="mag-scenes-heading">
        <div className="mag-section-heading"><Text as="h2" textStyle="t9Bold" id="mag-scenes-heading">팬의 장면</Text></div>
        <div className="mag-gallery">{gallery.map(({ photo, caption }) => <figure key={photo.src}><MagazinePhoto photo={photo} portrait={photo === photos.cover} /><figcaption>{caption}</figcaption></figure>)}</div>
      </section>

      <section className="mag-about" id="mag-about" aria-labelledby="mag-about-heading">
        <div><Text as="h2" textStyle="t9Bold" id="mag-about-heading">축구를 좋아하는 우리의 삶을 기록합니다.</Text><p>승패만으로는 다 담을 수 없는 축구가 있습니다. 첫 유니폼을 입던 날, 원정 버스에서 만난 사람, 목이 쉬도록 부른 응원가. 피치사이드 팬 매거진은 축구를 좋아하는 우리의 삶을 기록합니다.</p></div>
        <ActionButton variant="neutralWeak" size="medium" type="button" onClick={() => jumpTo('mag-chapters')}>우리가 담는 이야기 <span aria-hidden="true">↓</span></ActionButton>
      </section>

      <section className="mag-chapters" id="mag-chapters" aria-labelledby="mag-chapters-heading">
        <div className="mag-section-heading"><Text as="h2" textStyle="t9Bold" id="mag-chapters-heading">다섯 가지 시선</Text></div>
        <div className="mag-chapter-list">{chapters.map((chapter, index) => <a href={`#/articles/${chapter.id}?from=%2Fmagazine`} className="mag-chapter" key={chapter.id}><span className="mag-chapter-number" aria-hidden="true">{String(index + 1).padStart(2, '0')}</span><div><h3>{chapter.title}</h3><p>{chapter.text}</p></div><span className="mag-chapter-arrow" aria-hidden="true">↗</span></a>)}</div>
      </section>

      <section className="mag-stories" id="mag-stories" aria-labelledby="mag-stories-heading">
        <div className="mag-section-heading"><Text as="h2" textStyle="t9Bold" id="mag-stories-heading">이번 호 이야기</Text><span>2026년 10월 · 창간호</span></div>
        <div className="mag-features">{features.map(article => <article className="mag-feature" key={article.id}>
          <a href={`#/articles/${article.id}?from=%2Fmagazine`} aria-labelledby={`mag-story-${article.id}`}>
            <MagazinePhoto photo={article.image || photos.stadium} />
            <div className="mag-feature-copy"><ArticleCategory article={article} /><h3 id={`mag-story-${article.id}`}>{article.title}</h3><p>{article.summary}</p><ArticleByline article={article} /><span className="mag-read-link">이야기 읽기 <span aria-hidden="true">↗</span></span></div>
          </a>
        </article>)}</div>
        <div className="mag-endnote"><p>다음 주말에도, 우리는 경기장에서.</p><ActionButton asChild variant="brandOutline" size="medium"><a href="#/articles">더 많은 축구 이야기 <span aria-hidden="true">↗</span></a></ActionButton></div>
      </section>
    </main>
    <footer className="mag-footer"><div><a className="wordmark" href="#/" aria-label="Pitchside 홈">pitchside<span aria-hidden="true">.</span></a><small>© 2026 Pitchside</small></div></footer>
  </div>
}
