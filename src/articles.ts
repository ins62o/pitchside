export type Article = {
  id: string
  title: string
  summary: string
  category: string
  section: 'news' | 'magazine'
  image: string
  imageAlt?: string
  imageCredit?: string
  author?: string
  status?: 'draft' | 'published' | 'archived'
  publishedAt?: string
  updatedAt?: string
  isSample?: boolean
  date: string
  readMinutes: number
  body: { heading?: string; paragraphs: string[]; image?: string; imageAlt?: string; caption?: string; youtubeUrl?: string }[]
}

export type ArticleFilter = { category?: string; query?: string; section?: Article['section'] }

const fieldNotes: Article['body'] = [
  { paragraphs: ['축구장의 하루는 킥오프보다 먼저 시작된다. 관중이 아직 들어서지 않은 시간, 터치라인 옆에서는 저마다의 준비가 이어진다. 누군가는 잔디를 살피고, 누군가는 장비를 옮기고, 누군가는 오늘의 첫 장면을 기다린다.', '경기를 설명하는 숫자만으로는 이 시간을 모두 담을 수 없다. 한 경기를 완성하는 사람들의 움직임과 경기장에 쌓이는 작은 순간들. 피치사이드는 그 가까이에서 이야기를 기록하려 한다.'] },
  { heading: '가장 가까운 곳에서 보는 축구', paragraphs: ['스탠드에서 내려다본 그라운드와 터치라인 옆에서 바라본 그라운드는 조금 다르다. 공을 기다리는 발끝, 서로를 부르는 목소리, 짧게 오가는 시선이 하나의 경기 안에 겹쳐진다.', '현장의 이야기는 그 차이를 발견하는 데서 시작된다. 경기 전과 후를 함께 보고, 그 안에 있는 사람에게 묻고, 답을 충분히 듣는 일이다.'] },
  { heading: '휘슬 뒤에 남은 이야기', paragraphs: ['경기가 끝나면 스코어는 기록으로 남는다. 하지만 그날을 기억하는 방식은 사람마다 다르다. 처음 경기장을 찾은 팬에게는 입장하던 순간이, 오래 팀을 따라온 팬에게는 마지막 응원가가 더 선명할지도 모른다.', '우리가 기록하고 싶은 것은 그 모든 장면이다. K리그1과 K리그2의 현장에서, 다음 주에도 다시 경기장을 찾게 만드는 이야기를 만나고 싶다.'] },
]

const fanStories: Article['body'] = [
  { paragraphs: ['원정석에는 여러 도시에서 시작된 하루가 모인다. 이른 시간 집을 나서고, 낯선 역에 내리고, 익숙한 유니폼을 발견하는 순간. 아직 공은 굴러가지 않았지만 축구는 이미 시작되고 있다.', '누군가에게 축구는 90분의 경기이고, 누군가에게는 한 주의 약속이다. 같은 팀을 응원한다는 이유로 함께 서 있는 사람들의 이야기를 따라가 본다.'] },
  { heading: '응원가가 이어주는 사람들', paragraphs: ['서로의 이름을 몰라도 함께 부를 수 있는 노래가 있다. 원정석의 응원가는 그날 처음 만난 사람들 사이에도 작은 연결을 만든다. 득점의 순간뿐 아니라, 실점 뒤에도 목소리는 이어진다.', '팬의 시간을 따라가면 경기 결과 밖에 있는 풍경이 보인다. 출발 전의 설렘, 하프타임의 대화, 돌아오는 길의 아쉬움까지. 그 모든 시간이 축구를 좋아하는 이유의 일부가 된다.'] },
  { heading: '우리 동네에 축구가 있다는 것', paragraphs: ['구단이 있는 도시는 주말마다 또 다른 표정을 갖는다. 경기장으로 향하는 길의 식당, 유니폼을 입은 사람들, 약속 장소가 되는 출입구. 지역과 팀의 관계는 그렇게 일상의 풍경에 스며든다.', '피치사이드는 선수와 감독의 이야기 옆에 이 장면들을 놓고 싶다. 축구를 만드는 사람과 축구를 사랑하는 사람, 그 사이에 있는 수많은 이야기를 천천히 기록한다.'] },
]

export const articles: Article[] = [
  { id: 'before-kickoff', title: '킥오프 세 시간 전,\n경기장은 이미 움직인다', summary: '그라운드를 준비하는 사람들부터 첫 관중을 맞는 순간까지. 경기장 바깥에서 시작되는 K리그의 하루.', category: '현장노트', section: 'news', image: 'stadium', date: '2026.10.22', readMinutes: 5, body: fieldNotes },
  { id: 'touchline', title: '터치라인 옆에서 바라본\n또 하나의 경기', summary: '중계 화면에 담기지 않는 표정과 목소리. 현장에서 축구를 기록한다는 것.', category: 'K리그1', section: 'news', image: 'stadium', date: '2026.10.22', readMinutes: 4, body: fieldNotes },
  { id: 'saturday', title: '승격을 꿈꾸는 도시의 토요일', summary: 'K리그2의 주말, 그라운드와 관중석이 함께 써 내려가는 이야기.', category: 'K리그2', section: 'news', image: 'fans', date: '2026.10.21', readMinutes: 6, body: fanStories },
  { id: 'after-whistle', title: '마지막 휘슬 뒤,\n기자회견장으로 가는 길', summary: '경기 결과를 넘어 한 번 더 묻고 듣는 시간. 현장 보도의 다음 장면.', category: '현장노트', section: 'news', image: 'stadium', date: '2026.10.21', readMinutes: 4, body: fieldNotes },
  { id: 'same-match', title: '같은 경기, 서로 다른 시선', summary: '선수와 팬, 그리고 기자. 한 경기를 기억하는 여러 가지 방법.', category: '축구이야기', section: 'news', image: 'fans', date: '2026.10.20', readMinutes: 5, body: fanStories },
  { id: 'weekend', title: '주말의 90분을 준비하는 방식', summary: '다음 경기를 기다리는 시간도 축구의 일부라면. K리그1의 일상을 들여다본다.', category: 'K리그1', section: 'news', image: 'stadium', date: '2026.10.20', readMinutes: 5, body: fieldNotes },
  { id: 'second-division', title: '끝까지 뛰는 이유, K리그2의 또 다른 주말', summary: '같은 목표를 향해 달리는 선수와 팬들. 승격 경쟁 너머의 이야기를 기록한다.', category: 'K리그2', section: 'news', image: 'fans', date: '2026.10.19', readMinutes: 5, body: fanStories },
  { id: 'away-end', title: '원정석에서 만난,\n우리가 축구를 보는 이유', summary: '기차표 한 장, 낯선 도시, 익숙한 응원가. 90분보다 긴 원정의 기록.', category: '팬과 문화', section: 'magazine', image: 'fans', date: '2026.10.22', readMinutes: 8, body: fanStories },
  { id: 'our-town', title: '유니폼을 입고 자라는 동네', summary: '구단과 도시가 함께 쌓아가는 시간. 축구가 일상의 풍경이 되는 곳.', category: '로컬 풋볼', section: 'magazine', image: 'fans', date: '2026.10.21', readMinutes: 7, body: fanStories },
  { id: 'empty-stadium', title: '빈 경기장에 남아 있는 것들', summary: '모두가 떠난 그라운드에서 다음 경기를 기다리는 사람들을 만나다.', category: '피치 밖의 사람들', section: 'magazine', image: 'stadium', date: '2026.10.20', readMinutes: 6, body: fieldNotes },
]

export function filterArticles({ category, query = '', section }: ArticleFilter = {}, source: Article[] = articles): Article[] {
  const keyword = query.trim().toLocaleLowerCase('ko-KR')
  return source.filter((article) =>
    (!section || article.section === section) &&
    (!category || article.category === category) &&
    (!keyword || `${article.title} ${article.summary} ${article.category}`.toLocaleLowerCase('ko-KR').includes(keyword)),
  )
}
