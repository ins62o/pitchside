import { useState } from 'react'
import type { ReactNode, RefObject } from 'react'
import type { ReaderArticle } from './reader-data'
import { parseMagazineText } from './magazine-text'
import QuoteShare from './QuoteShare'
import './MagazinePage.css'

const photos = {
  cover: { src: '/images/magazine-cover.png', alt: '관중석에서 초록색 머플러를 들어 올린 축구 팬의 뒷모습' },
  objects: { src: '/images/magazine-objects.png', alt: '경기장 좌석 위의 머플러와 유니폼, 티켓 두 장' },
  stadium: { src: '/images/stadium.png', alt: '조명이 켜진 축구장과 저녁 하늘' },
  fans: { src: '/images/fans.png', alt: '같은 방향을 바라보며 응원하는 축구 팬들' },
}
type Photo = typeof photos.cover
const features = [
  { id: 'saturday', title: '우리의 토요일', subtitle: '축구를 좋아하는 마음에 관하여', photo: photos.cover, wide: photos.fans, label: 'FAN CULTURE' },
  { id: 'away-end', title: '어디든, 함께', subtitle: '90분보다 긴 원정의 기록', photo: photos.fans, wide: photos.cover, label: 'AWAY DAYS' },
  { id: 'before-kickoff', title: '킥오프 전의 시간', subtitle: '경기장으로 향하는 마음', photo: photos.objects, wide: photos.stadium, label: 'MATCHDAY' },
  { id: 'our-town', title: '우리 동네의 축구', subtitle: '유니폼을 입고 자라는 동네', photo: photos.stadium, wide: photos.fans, label: 'LOCAL FOOTBALL' },
  { id: 'after-whistle', title: '휘슬이 울린 뒤', subtitle: '끝나지 않은 경기장의 이야기', photo: photos.fans, wide: photos.stadium, label: 'AFTER THE GAME' },
]
const magazineUrl = (id: string) => `#/magazine/${id}`

function MagazinePhoto({ photo, eager = false }: { photo: Photo; eager?: boolean }) {
  const [failed, setFailed] = useState(false)
  return <div className="mag-photo">{failed ? <span className="mag-photo-placeholder" role="img" aria-label="사진 준비 중">pitchside.</span> : <><img src={photo.src} alt={photo.alt} loading={eager ? 'eager' : 'lazy'} fetchPriority={eager ? 'high' : 'auto'} onError={() => setFailed(true)} /><span className="photo-watermark" aria-hidden="true">pitchside.</span></>}</div>
}

function MagazineNav({ themeControl, about = false }: { themeControl: ReactNode; about?: boolean }) {
  return <header className="mag-header">
    <nav className="mag-nav" aria-label="팬 매거진 메뉴"><a href="#/">← 기사 홈</a><a href="#/magazine" className="mag-nav-center">FAN MAGAZINE</a><div><a href="#/magazine/about" aria-current={about ? 'page' : undefined}>매거진 소개</a>{themeControl}</div></nav>
    <a href="#/magazine" className="mag-masthead" aria-label="Pitchside 매거진 홈">PITCHSIDE<span>경기장 바깥에도, 축구는 있다.</span></a>
  </header>
}

function MagazineFooter() {
  return <footer className="mag-footer"><a href="#/magazine" className="mag-footer-brand">PITCHSIDE</a><p>축구를 좋아하는 우리의 삶을 기록합니다.</p><div><a href="#/">기사 홈으로 ↗</a><small>© 2026 Pitchside</small></div></footer>
}

function MagazineHome() {
  const [active, setActive] = useState(0)
  const feature = features[active]
  return <>
    <section className="mag-cover-section" aria-label="매거진 특집">
      <a className="mag-cover" href={magazineUrl(feature.id)} aria-label={`${feature.title} 특집 읽기`}>
        <MagazinePhoto key={feature.id} photo={feature.wide} eager />
        <div className="mag-cover-shade" />
        <div className="mag-cover-copy"><p>{feature.subtitle}</p><h1>{feature.title}</h1><span>이야기 펼쳐보기 <span aria-hidden="true">↗</span></span></div>
      </a>
      <div className="mag-cover-controls"><p>피치사이드 팬 매거진 <span>2026 · 가을호</span></p><div aria-label="특집 선택" role="group">{features.slice(0, 3).map((item, index) => <button key={item.id} type="button" aria-label={`${item.title} 표지 보기`} aria-pressed={active === index} onClick={() => setActive(index)}>{String(index + 1).padStart(2, '0')}</button>)}</div></div>
    </section>
    <section className="mag-issues" id="mag-stories" aria-labelledby="mag-stories-heading">
      <div className="mag-section-heading"><h2 id="mag-stories-heading">이번 호에 담은 이야기</h2><p>경기장으로 향하는 마음부터, 집으로 돌아오는 길까지.</p></div>
      <div className="mag-issue-grid">{features.slice(1).map((item, index) => <article className="mag-issue" key={item.id}><a href={magazineUrl(item.id)} aria-labelledby={`mag-issue-${item.id}`}><div className="mag-issue-cover"><MagazinePhoto photo={item.photo} /><div className="mag-issue-shade" /><div className="mag-issue-print" aria-hidden="true"><span>PITCHSIDE</span><strong>{item.title}</strong><small>{item.label}</small></div></div><div className="mag-issue-caption"><span>0{index + 2}</span><div><h3 id={`mag-issue-${item.id}`}>{item.title}</h3><p>{item.subtitle}</p></div><span aria-hidden="true">↗</span></div></a></article>)}</div>
    </section>
    <section className="mag-editor-note"><p>FROM THE EDITORS</p><h2>우리가 좋아하는 건,<br />축구만은 아닐지도.</h2><div><p>첫 유니폼을 입던 날, 원정 버스에서 만난 사람,<br className="mag-desktop-break" /> 목이 쉬도록 부른 응원가. 승패만으로는 다 담을 수 없는<br className="mag-desktop-break" /> 우리의 축구를 한 장씩 기록합니다.</p><a href="#/magazine/about">피치사이드 매거진에 관하여 ↗</a></div></section>
  </>
}

function MagazineText({ text }: { text: string }) {
  return <>{parseMagazineText(text).map((part, index) => part.style === 'bold' ? <strong key={index}>{part.text}</strong> : part.style === 'underline' ? <u key={index}>{part.text}</u> : part.text)}</>
}

function MagazineDetail({ article }: { article: ReaderArticle }) {
  const feature = features.find(item => item.id === article.id)
  const [cover, wide] = feature ? [feature.photo, feature.wide] : [photos.cover, photos.stadium]
  const quote = article.body.find(section => section.quote)?.quote
  const source = { title: feature?.title ?? article.title, author: article.author, date: article.date, quote: quote?.text ?? article.summary }
  return <article className="mag-detail">
    <header className="mag-detail-heading"><a href="#/magazine">매거진으로 돌아가기</a><p>{feature?.subtitle ?? article.kind}</p><h1>{feature?.title ?? article.title}</h1><div>{article.author} 기자 <span>·</span> {article.date.replaceAll('-', '.')}</div></header>
    <figure className="mag-detail-hero"><MagazinePhoto photo={wide} eager /><figcaption>{article.image?.caption}</figcaption></figure>
    <QuoteShare source={source}>
      <div className="mag-detail-intro"><p>{article.summary}</p><span aria-hidden="true">✳</span></div>
      <div className="mag-body">{article.body.map((section, index) => <section key={index}>
        {section.heading && <h2>{section.heading}</h2>}
        {section.paragraphs.map((paragraph, paragraphIndex) => <p key={paragraphIndex}><MagazineText text={index === 0 && paragraphIndex === 0 ? `**${paragraph}**` : paragraph} /></p>)}
        {section.quote && <blockquote><p><u>{section.quote.text}</u></p><cite>{section.quote.speaker}</cite></blockquote>}
        {index === 1 && <figure className="mag-inline-image"><MagazinePhoto photo={cover} /><figcaption>관중석 안팎에서 이어지는 우리의 축구.</figcaption></figure>}
      </section>)}</div>
    </QuoteShare>
    <div className="mag-detail-end"><p>{article.author} 기자</p><a href="#/magazine">다른 이야기 펼쳐보기 ↗</a></div>
    <aside className="mag-next-story"><p>함께 읽는 이야기</p><a href={magazineUrl(features.find(item => item.id !== article.id)!.id)}>{features.find(item => item.id !== article.id)!.title}<span aria-hidden="true">↗</span></a></aside>
  </article>
}

function MagazineAbout() {
  return <article className="mag-about"><header><p>ABOUT PITCHSIDE</p><h1>축구를 좋아하는<br />우리의 삶을 기록합니다.</h1></header><MagazinePhoto photo={photos.fans} eager /><div className="mag-about-body"><p>승패만으로는 다 담을 수 없는 축구가 있습니다. 첫 유니폼을 입던 날, 원정 버스에서 만난 사람, 목이 쉬도록 부른 응원가.</p><p>피치사이드 팬 매거진은 경기장 곁에서 만나는 사람들의 이야기를 모은 지면입니다. 축구를 좋아하는 우리의 시선으로 그라운드 바깥의 시간을 바라봅니다.</p><h2>경기장 가까이, 사람들 곁에서.</h2><p>멀리서 평가하기보다 곁에서 바라봅니다. 응원하는 팀이 달라도 같은 토요일을 보내는 사람들의 이야기를 나란히 놓습니다.</p><a href="#/magazine">이번 호 읽으러 가기 ↗</a></div></article>
}

export default function MagazinePage({ page, article, mainRef, themeControl }: { page: 'home' | 'about' | 'detail'; article?: ReaderArticle; mainRef: RefObject<HTMLElement | null>; themeControl: ReactNode }) {
  return <div className="magazine">
    <a className="skip-link" href="#magazine-content" onClick={event => { event.preventDefault(); mainRef.current?.focus() }}>본문으로 바로가기</a>
    <MagazineNav themeControl={themeControl} about={page === 'about'} />
    <main id="magazine-content" ref={mainRef} tabIndex={-1}>{page === 'home' ? <MagazineHome /> : page === 'about' ? <MagazineAbout /> : article ? <MagazineDetail article={article} /> : <section className="mag-missing"><h1>이야기를 찾을 수 없습니다.</h1><a href="#/magazine">매거진으로 돌아가기 ↗</a></section>}</main>
    <MagazineFooter />
  </div>
}
