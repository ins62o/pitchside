import { test } from 'node:test'
import assert from 'node:assert/strict'
import { selectArticles, relatedArticles } from '../src/reader-data.ts'
import type { ReaderArticle } from '../src/reader-data.ts'

const fixture: ReaderArticle[] = [
  { id: 'a', section: 'K리그', title: '터치라인의 시선', summary: '전방 압박을 풀어낸 패스', league: 'K리그1', kind: '전술 분석', author: '예시 기자', date: '2026-10-22', body: [] },
  { id: 'b', section: 'K리그', title: '원정석에서 부른 노래', summary: '우리가 경기를 기다리는 이유', league: 'K리그2', kind: '칼럼', author: '예시 기자', date: '2026-10-21', body: [] },
  { id: 'c', section: '대학/유스', title: '다음 패스를 준비하다', summary: 'K LEAGUE의 미드필더', league: '대학', kind: '인터뷰', author: '예시 기자', date: '2026-10-20', body: [] },
  { id: 'd', section: '축구종합', title: '두 번째 빌드업', summary: '압박 뒤에 남은 공간', league: '축구종합', kind: '전술 분석', author: '예시 기자', date: '2026-10-19', body: [] },
]

test('메뉴 분류로 기사를 거르고 기사가 없는 분류는 빈 목록을 돌려준다', () => {
  assert.deepEqual(selectArticles({ section: 'K리그' }, fixture).map(x => x.id), ['a', 'b'])
  assert.equal(selectArticles({ section: 'K3/K4' }, fixture).length, 0)
})
test('검색은 제목과 요약을 찾고 공백과 영문 대소문자를 정리한다', () => {
  assert.deepEqual(selectArticles({ query: '  압박  ' }, fixture).map(x => x.id), ['a', 'd'])
  assert.deepEqual(selectArticles({ query: 'k league' }, fixture).map(x => x.id), ['c'])
  assert.equal(selectArticles({ query: '예시 기자' }, fixture).length, 0)
})
test('검색과 필터를 조합하고 빈 검색어와 결과 없음도 처리한다', () => {
  assert.deepEqual(selectArticles({ section: '축구종합', query: '압박' }, fixture).map(x => x.id), ['d'])
  assert.equal(selectArticles({ query: '    ' }, fixture).length, 4)
  assert.equal(selectArticles({ section: '대학/유스', query: '노래' }, fixture).length, 0)
})
test('관련 기사는 현재 글을 제외하고 같은 분류, 리그, 유형 순으로 우선한다', () => {
  assert.deepEqual(relatedArticles(fixture[0], fixture).map(x => x.id), ['b', 'd', 'c'])
  assert.equal(relatedArticles(fixture[0], [fixture[0]]).length, 0)
  assert.deepEqual(fixture.map(x => x.id), ['a', 'b', 'c', 'd'])
})
