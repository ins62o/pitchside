import { useState } from 'react'
import type { CSSProperties } from 'react'
import { ActionButton } from 'seed-design/ui/action-button'
import MagazineShelf from './MagazineShelf'
import { BounceLetters, FadeIn, FillText, StackList } from './MagazineMotion'
import { useCoverScroll } from './magazine-scroll'
import { features, magazineUrl, photos } from './magazine-content'
import type { Photo } from './magazine-content'
import './MagazineLanding.css'

const stories = [
  { feature: features[0], images: [photos.cover, photos.objects, photos.fans] },
  { feature: features[1], images: [photos.fans, photos.stadium, photos.cover] },
  { feature: features[2], images: [photos.objects, photos.cover, photos.stadium] },
]

const aboutText = '승패만으로는 다 담을 수 없는 축구가 있습니다. 첫 유니폼을 입던 날, 원정 버스에서 만난 사람, 목이 쉬도록 부른 응원가. 피치사이드 팬 매거진은 경기장 곁에서 만나는 사람들의 이야기를 한 장씩 기록합니다. 당신의 토요일도 함께 펼쳐 볼까요?'

export function MagazineTopNav({ overlay = false }: { overlay?: boolean }) {
  return <header className={`jk-top${overlay ? ' is-overlay' : ''}`}>
    <FadeIn y={-20}>
      <nav className="jk-nav" aria-label="팬 매거진 메뉴">
        <ActionButton asChild className="ui-button jk-contact" variant="brandSolid" size="medium"><a href="#/">Articles <span aria-hidden="true">↗</span></a></ActionButton>
      </nav>
    </FadeIn>
  </header>
}

export function MagazineCover({ photo, title, page = 'home' }: { photo: Photo; title: string; page?: 'home' | 'detail' }) {
  const [failed, setFailed] = useState(false)
  const cover = useCoverScroll(page === 'home')
  return <section ref={cover} className={`mag-cover${page === 'home' ? ' is-scroll-cover is-editorial-hero' : ''}`} aria-label={`${title} 표지`}>
    <div className="mag-cover-image">{failed ? <div className="mag-cover-placeholder" role="img" aria-label="표지 사진 준비 중">pitchside.</div> : <img src={photo.src} alt={photo.alt} fetchPriority="high" onError={() => setFailed(true)} />}</div>
    {page === 'home' && <MagazineTopNav overlay />}
    {page === 'home' ? <FadeIn className="jk-hero-heading" delay={.15} y={40}><h1 className="hero-heading mag-cover-title jk-hero-title" aria-label={title}><BounceLetters text="PITCHSIDE" /></h1></FadeIn> : <h1 className="mag-cover-title">{title}</h1>}
  </section>
}

function ShelfSection() {
  return <section className="jk-shelf" id="mag-shelf" aria-labelledby="jk-shelf-heading">
    <h2 className="jk-shelf-heading" id="jk-shelf-heading">PITCHSIDE <span>MAGAZINE</span><span className="sr-only"> 이번 호 특집</span></h2>
    <MagazineShelf items={features} href={magazineUrl} />
  </section>
}

function About() {
  const corners = [
    { className: 'jk-deco-tl', photo: photos.cover, delay: .1, x: -80, tilt: '-8deg' },
    { className: 'jk-deco-bl', photo: photos.objects, delay: .25, x: -80, tilt: '6deg' },
    { className: 'jk-deco-tr', photo: photos.stadium, delay: .15, x: 80, tilt: '7deg' },
    { className: 'jk-deco-br', photo: photos.fans, delay: .3, x: 80, tilt: '-5deg' },
  ]
  return <section className="jk-about" id="mag-about" aria-labelledby="jk-about-heading">
    {corners.map(corner => <FadeIn key={corner.className} className={`jk-deco ${corner.className}`} delay={corner.delay} x={corner.x} y={0}>
      <img src={corner.photo.src} alt="" loading="lazy" style={{ '--tilt': corner.tilt } as CSSProperties} />
    </FadeIn>)}
    <div className="jk-about-inner">
      <div className="jk-about-copy">
        <FadeIn y={40}><h2 className="hero-heading jk-heading" id="jk-about-heading">About us</h2></FadeIn>
        <FillText className="jk-about-text" text={aboutText} />
      </div>
      <FadeIn delay={.2} y={20}><ActionButton asChild className="ui-button jk-contact" variant="brandSolid" size="medium"><a href="#/magazine/about">매거진 소개 보기</a></ActionButton></FadeIn>
    </div>
  </section>
}

function Contents() {
  return <section className="jk-contents" aria-labelledby="jk-contents-heading">
    <FadeIn y={40}><h2 className="jk-heading" id="jk-contents-heading">Contents<span className="sr-only"> 이번 호 목차</span></h2></FadeIn>
    <ol className="jk-contents-list">
      {features.map((feature, index) => <li key={feature.id}>
        <FadeIn delay={index * .1} y={30}>
          <a className="jk-contents-link" href={magazineUrl(feature.id)}>
            <span className="jk-contents-no" aria-hidden="true">{String(index + 1).padStart(2, '0')}</span>
            <div className="jk-contents-copy"><span>{feature.label}</span><h3>{feature.title}</h3><p>{feature.subtitle}</p></div>
            <span className="jk-contents-arrow" aria-hidden="true">↗</span>
          </a>
        </FadeIn>
      </li>)}
    </ol>
  </section>
}

function Stories() {
  return <section className="jk-projects" id="mag-stories" aria-labelledby="jk-stories-heading">
    <FadeIn y={40}><h2 className="hero-heading jk-heading" id="jk-stories-heading">Stories</h2></FadeIn>
    <StackList>{stories.map(({ feature, images: [top, bottom, tall] }, index) => <article className="jk-card" key={feature.id} aria-labelledby={`jk-story-${feature.id}`}>
      <div className="jk-card-top">
        <span className="jk-card-no" aria-hidden="true">{String(index + 1).padStart(2, '0')}</span>
        <div className="jk-card-meta"><h3 id={`jk-story-${feature.id}`}>{feature.title}</h3><span>{feature.subtitle}</span></div>
        <a className="jk-ghost" href={magazineUrl(feature.id)} aria-label={`${feature.title} 이야기 읽기`}>이야기 읽기</a>
      </div>
      <div className="jk-card-grid">
        <div className="jk-card-col"><img src={top.src} alt="" loading="lazy" /><img src={bottom.src} alt="" loading="lazy" /></div>
        <img src={tall.src} alt={tall.alt} loading="lazy" />
      </div>
    </article>)}</StackList>
  </section>
}

export default function MagazineLanding() {
  return <div className="mag-landing">
    <MagazineCover photo={photos.cover} title="피치사이드 매거진" />
    <ShelfSection />
    <About />
    <Contents />
    <Stories />
  </div>
}
