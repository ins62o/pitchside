// 팬 매거진 지면이 함께 쓰는 사진과 특집 목록. 사진과 원고는 예시 자료이며 발행 전 실제 취재 자료로 교체한다.
export const photos = {
  cover: { src: '/images/magazine-cover.png', alt: '관중석에서 초록색 머플러를 들어 올린 축구 팬의 뒷모습' },
  objects: { src: '/images/magazine-objects.png', alt: '경기장 좌석 위의 머플러와 유니폼, 티켓 두 장' },
  stadium: { src: '/images/stadium.png', alt: '조명이 켜진 축구장과 저녁 하늘' },
  fans: { src: '/images/fans.png', alt: '같은 방향을 바라보며 응원하는 축구 팬들' },
}
export type Photo = typeof photos.cover

export const features = [
  { id: 'saturday', title: '우리의 토요일', subtitle: '축구를 좋아하는 마음에 관하여', photo: photos.cover, wide: photos.fans, label: 'FAN CULTURE', name: '팬 문화', description: '응원가와 머플러, 같은 토요일을 기다리는 사람들. 관중석이 만들어 온 문화를 기록합니다.' },
  { id: 'away-end', title: '어디든, 함께', subtitle: '90분보다 긴 원정의 기록', photo: photos.fans, wide: photos.cover, label: 'AWAY DAYS', name: '원정', description: '기차표 한 장과 낯선 도시, 익숙한 응원가. 경기장까지 이어지는 긴 원정길을 따라갑니다.' },
  { id: 'before-kickoff', title: '킥오프 전의 시간', subtitle: '경기장으로 향하는 마음', photo: photos.objects, wide: photos.stadium, label: 'MATCHDAY', name: '경기일', description: '킥오프 몇 시간 전부터 경기장은 움직입니다. 경기일의 풍경과 그 안의 사람들을 담습니다.' },
  { id: 'our-town', title: '우리 동네의 축구', subtitle: '유니폼을 입고 자라는 동네', photo: photos.stadium, wide: photos.fans, label: 'LOCAL FOOTBALL', name: '동네 축구', description: '구단과 도시가 함께 쌓아 가는 시간. 축구가 일상의 풍경이 되는 동네를 찾아갑니다.' },
  { id: 'after-whistle', title: '휘슬이 울린 뒤', subtitle: '끝나지 않은 경기장의 이야기', photo: photos.fans, wide: photos.stadium, label: 'AFTER THE GAME', name: '경기 뒤', description: '마지막 휘슬이 울린 뒤에도 이야기는 이어집니다. 빈 경기장과 집으로 돌아가는 길을 기록합니다.' },
]
export type Feature = (typeof features)[number]

export const magazineUrl = (id: string) => `#/magazine/${id}`
