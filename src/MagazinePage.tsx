import { useEffect, useState } from 'react'
import type { RefObject } from 'react'
import MagazineLanding, { MagazineCover, MagazineTopNav } from './MagazineLanding'
import { features, magazineUrl, photos } from './magazine-content'
import type { Photo } from './magazine-content'
import type { ReaderArticle } from './reader-data'
import { parseMagazineText } from './magazine-text'
import QuoteShare from './QuoteShare'
import './MagazinePage.css'

function MagazinePhoto({ photo, eager = false }: { photo: Photo; eager?: boolean }) {
  const [failed, setFailed] = useState(false)
  return <div className="mag-photo">{failed ? <span className="mag-photo-placeholder" role="img" aria-label="사진 준비 중">pitchside.</span> : <><img src={photo.src} alt={photo.alt} loading={eager ? 'eager' : 'lazy'} fetchPriority={eager ? 'high' : 'auto'} onError={() => setFailed(true)} /><span className="photo-watermark" aria-hidden="true">pitchside.</span></>}</div>
}

function MagazineFooter() {
  return <footer className="mag-footer"><a href="#/magazine" className="mag-footer-brand mag-gradient">PITCHSIDE</a><small>© 2026 Pitchside</small></footer>
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
    <MagazineCover photo={cover} title={feature?.title ?? article.title} page="detail" />
    <div className="mag-detail-paper">
    <figure className="mag-detail-hero"><MagazinePhoto photo={wide} /><figcaption>{article.image?.caption}</figcaption></figure>
    <header className="mag-detail-heading"><p>{feature?.label ?? article.kind}</p>{feature && <p className="mag-detail-sub">{feature.subtitle}</p>}<div>{article.author} 기자 <span>·</span> {article.date.replaceAll('-', '.')}</div></header>
    <QuoteShare source={source}>
      <div className="mag-detail-intro"><p>{article.summary}</p></div>
      <div className="mag-body">{article.body.map((section, index) => <section key={index}>
        {section.heading && <h2>{section.heading}</h2>}
        {section.paragraphs.map((paragraph, paragraphIndex) => <p key={paragraphIndex}><MagazineText text={index === 0 && paragraphIndex === 0 ? `**${paragraph}**` : paragraph} /></p>)}
        {section.quote && <blockquote><p><u>{section.quote.text}</u></p><cite>{section.quote.speaker}</cite></blockquote>}
        {index === 1 && <figure className="mag-inline-image"><MagazinePhoto photo={cover} /><figcaption>관중석 안팎에서 이어지는 우리의 축구.</figcaption></figure>}
      </section>)}</div>
    </QuoteShare>
    <div className="mag-detail-end"><p>{article.author} 기자</p><a className="jk-ghost" href="#/magazine">다른 이야기 펼쳐보기</a></div>
    <aside className="mag-next-story"><p>Next story</p><a href={magazineUrl(features.find(item => item.id !== article.id)!.id)}><span className="mag-gradient">{features.find(item => item.id !== article.id)!.title}</span><span aria-hidden="true">↗</span></a></aside>
    </div>
  </article>
}

function MagazineAbout() {
  return <article className="mag-about"><header><p>ABOUT PITCHSIDE</p><h1 className="mag-gradient">축구를 좋아하는<br />우리의 삶을 기록합니다.</h1></header><MagazinePhoto photo={photos.fans} eager /><div className="mag-about-body"><p>승패만으로는 다 담을 수 없는 축구가 있습니다. 첫 유니폼을 입던 날, 원정 버스에서 만난 사람, 목이 쉬도록 부른 응원가.</p><p>피치사이드 팬 매거진은 경기장 곁에서 만나는 사람들의 이야기를 모은 지면입니다. 축구를 좋아하는 우리의 시선으로 그라운드 바깥의 시간을 바라봅니다.</p><h2>경기장 가까이, 사람들 곁에서.</h2><p>멀리서 평가하기보다 곁에서 바라봅니다. 응원하는 팀이 달라도 같은 토요일을 보내는 사람들의 이야기를 나란히 놓습니다.</p><a className="jk-contact" href="#/magazine">이번 호 읽으러 가기</a></div></article>
}

export default function MagazinePage({ page, article, mainRef }: { page: 'home' | 'about' | 'detail'; article?: ReaderArticle; mainRef: RefObject<HTMLElement | null> }) {
  const landing = page === 'home'
  const light = page === 'detail'
  // 메인은 어둡게, 상세는 밝게 고정하고 기사 사이트의 저장된 테마는 유지한다.
  useEffect(() => {
    const root = document.documentElement
    const meta = document.querySelector<HTMLMetaElement>('meta[name="theme-color"]')
    const previous = meta?.content
    root.classList.add('magazine-root')
    root.classList.toggle('magazine-light', light)
    meta?.setAttribute('content', light ? '#FFFFFF' : '#0C0C0C')
    return () => {
      root.classList.remove('magazine-root', 'magazine-light')
      if (meta && previous) meta.content = previous
    }
  }, [light])
  return <div className={`magazine${landing ? ' is-landing' : light ? ' is-detail' : ''}`}>
    <a className="skip-link" href="#magazine-content" onClick={event => { event.preventDefault(); mainRef.current?.focus() }}>본문으로 바로가기</a>
    {!landing && (!light || !article) && <MagazineTopNav />}
    <main id="magazine-content" ref={mainRef} tabIndex={-1}>{landing ? <MagazineLanding /> : page === 'about' ? <MagazineAbout /> : article ? <MagazineDetail article={article} /> : <section className="mag-missing"><h1>이야기를 찾을 수 없습니다.</h1><a href="#/magazine">매거진으로 돌아가기 ↗</a></section>}</main>
    <MagazineFooter />
  </div>
}
