import type { CSSProperties, MouseEvent } from 'react'
import MagazineShelf from './MagazineShelf'
import { AutoRow, FadeIn, FillText, StackList } from './MagazineMotion'
import { features, magazineUrl, photos } from './magazine-content'
import type { Photo } from './magazine-content'
import './MagazineLanding.css'

type Tile = { photo: Photo; position: string } | { title: string; label: string; bg: string; fg: string }
const photoTile = (photo: Photo, position: string): Tile => ({ photo, position })
const textTile = (title: string, label: string, bg: string, fg: string): Tile => ({ title, label, bg, fg })

const firstRow: Tile[] = [
  photoTile(photos.fans, 'center 40%'),
  textTile('우리의 토요일', 'FAN CULTURE', '#713E48', '#F4EDE3'),
  photoTile(photos.stadium, 'center 60%'),
  photoTile(photos.cover, 'center 35%'),
  textTile('90분보다 긴 원정의 기록', 'AWAY DAYS', '#E9E2D3', '#292924'),
  photoTile(photos.objects, 'center 50%'),
  photoTile(photos.fans, 'center 75%'),
  textTile('킥오프 전의 시간', 'MATCHDAY', '#2E3A31', '#EDE7D9'),
  photoTile(photos.stadium, 'center 25%'),
  photoTile(photos.cover, 'center 70%'),
  textTile('경기장 바깥에도, 축구는 있다.', 'PITCHSIDE', '#C8B79C', '#2B2620'),
]
const secondRow: Tile[] = [
  photoTile(photos.objects, 'center 30%'),
  textTile('유니폼을 입고 자라는 동네', 'LOCAL FOOTBALL', '#262A33', '#E9E4D8'),
  photoTile(photos.cover, 'center 50%'),
  photoTile(photos.stadium, 'center 85%'),
  textTile('휘슬이 울린 뒤', 'AFTER THE GAME', '#713E48', '#F4EDE3'),
  photoTile(photos.fans, 'center 20%'),
  photoTile(photos.objects, 'center 75%'),
  textTile('어디든, 함께', 'AWAY DAYS', '#2E3A31', '#EDE7D9'),
  photoTile(photos.stadium, 'center 45%'),
  photoTile(photos.cover, 'center 20%'),
]

const stories = [
  { feature: features[0], images: [photos.cover, photos.objects, photos.fans] },
  { feature: features[1], images: [photos.fans, photos.stadium, photos.cover] },
  { feature: features[2], images: [photos.objects, photos.cover, photos.stadium] },
]

const aboutText = '승패만으로는 다 담을 수 없는 축구가 있습니다. 첫 유니폼을 입던 날, 원정 버스에서 만난 사람, 목이 쉬도록 부른 응원가. 피치사이드 팬 매거진은 경기장 곁에서 만나는 사람들의 이야기를 한 장씩 기록합니다. 당신의 토요일도 함께 펼쳐 볼까요?'

// 해시 라우팅을 쓰므로 페이지 안 이동은 주소를 바꾸지 않고 스크롤만 한다.
function jump(id: string) {
  return (event: MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault()
    const smooth = !window.matchMedia('(prefers-reduced-motion: reduce)').matches
    document.getElementById(id)?.scrollIntoView({ behavior: smooth ? 'smooth' : 'auto', block: 'start' })
  }
}

function MarqueeTile({ tile }: { tile: Tile }) {
  if ('photo' in tile) return <div className="jk-tile"><img src={tile.photo.src} alt="" loading="lazy" draggable={false} style={{ objectPosition: tile.position }} /></div>
  return <div className="jk-tile jk-tile-text" style={{ '--tile-bg': tile.bg, '--tile-fg': tile.fg } as CSSProperties}><small>{tile.label}</small><strong>{tile.title}</strong><span>PITCHSIDE</span></div>
}

// 매거진 모든 화면이 같은 상단 메뉴를 쓴다. 표지 화면에서는 섹션으로 스크롤하고, 그 밖의 화면에서는 페이지로 이동한다.
export function MagazineTopNav({ page = 'home' }: { page?: 'home' | 'about' | 'detail' }) {
  return <header className="jk-top">
    <FadeIn y={-20}>
      <nav className="jk-nav" aria-label="팬 매거진 메뉴">
        {page === 'home' ? <>
          <a href="#/magazine" onClick={jump('mag-about')}>About</a>
          <a href="#/magazine" onClick={jump('mag-shelf')}>Shelf</a>
          <a href="#/magazine" onClick={jump('mag-stories')}>Stories</a>
        </> : <>
          <a href="#/magazine">Magazine</a>
          <a href="#/magazine/about" aria-current={page === 'about' ? 'page' : undefined}>About</a>
        </>}
        <a href="#/">Articles <span aria-hidden="true">↗</span></a>
      </nav>
    </FadeIn>
    {page === 'home' && <h1 className="sr-only">피치사이드 팬 매거진 2026 가을호</h1>}
  </header>
}

function ShelfSection() {
  return <section className="jk-shelf" id="mag-shelf" aria-labelledby="jk-shelf-heading">
    <h2 className="sr-only" id="jk-shelf-heading">이번 호 특집</h2>
    <MagazineShelf items={features} href={magazineUrl} />
  </section>
}

function Marquee() {
  return <section className="jk-marquee" aria-label="매거진 사진">
    <AutoRow direction={1} duration={76}>{firstRow.map((tile, index) => <MarqueeTile tile={tile} key={index} />)}</AutoRow>
    <AutoRow direction={-1} duration={69}>{secondRow.map((tile, index) => <MarqueeTile tile={tile} key={index} />)}</AutoRow>
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
      <FadeIn delay={.2} y={20}><a className="jk-contact" href="#/magazine/about">매거진 소개 보기</a></FadeIn>
    </div>
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
    <MagazineTopNav />
    <About />
    <Marquee />
    <ShelfSection />
    <Stories />
  </div>
}
