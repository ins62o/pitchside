import assert from 'node:assert/strict'
import test from 'node:test'
import { articles } from '../src/articles.ts'
import { prepareArticle, publicArticles, validateArticle, youtubeEmbed } from '../src/cms-model.ts'
import type { Article } from '../src/articles.ts'

const draft = (): Article => ({ ...structuredClone(articles[0]), id: 'cms-test', author: '테스트 기자', status: 'draft', isSample: false, imageAlt: '경기장 전경' })

test('독자 화면에는 발행한 글만 최신 발행 순서로 나타난다', () => {
  const list: Article[] = [
    { ...draft(), id: 'old', status: 'published', publishedAt: '2026-10-20T00:00:00Z' },
    { ...draft(), id: 'draft' },
    { ...draft(), id: 'archive', status: 'archived' },
    { ...draft(), id: 'new', status: 'published', publishedAt: '2026-10-22T00:00:00Z' },
  ]
  assert.deepEqual(publicArticles(list).map(x => x.id), ['new', 'old'])
})

test('제목 없는 초안은 저장할 수 있지만 발행할 수 없다', () => {
  const item = { ...draft(), title: '', summary: '', author: '', image: '', body: [] }
  assert.deepEqual(validateArticle(item, 'draft'), [])
  assert.ok(validateArticle(item, 'published').some(x => x.includes('제목')))
  assert.ok(validateArticle(item, 'published').some(x => x.includes('본문')))
})

test('발행할 때 기자명과 사진 대체 설명이 필요하다', () => {
  assert.ok(validateArticle({ ...draft(), author: '' }, 'published').some(x => x.includes('작성자')))
  assert.ok(validateArticle({ ...draft(), imageAlt: '' }, 'published').some(x => x.includes('사진 설명')))
  assert.deepEqual(validateArticle(draft(), 'published'), [])
})

test('첫 발행 시간을 기록하고 수정이나 발행 취소 때 보존한다', () => {
  const now = '2026-10-22T11:00:00.000Z'
  const item = prepareArticle(draft(), 'published', now)
  assert.equal(item.status, 'published')
  assert.equal(item.publishedAt, now)
  assert.equal(item.author, '테스트 기자')
  assert.equal(item.date, '2026.10.22')
  const edited = prepareArticle(item, 'draft', '2026-10-23T11:00:00.000Z')
  assert.equal(edited.status, 'draft')
  assert.equal(edited.publishedAt, now)
  assert.equal(edited.updatedAt, '2026-10-23T11:00:00.000Z')
  assert.equal(item.status, 'published')
})

test('유튜브 주소만 안전한 임베드 주소로 변환한다', () => {
  const expected = 'https://www.youtube-nocookie.com/embed/aqz-KE-bpKQ'
  assert.equal(youtubeEmbed('https://www.youtube.com/watch?v=aqz-KE-bpKQ'), expected)
  assert.equal(youtubeEmbed('https://youtu.be/aqz-KE-bpKQ?t=5'), expected)
  assert.equal(youtubeEmbed('https://youtube.com/shorts/aqz-KE-bpKQ'), expected)
  assert.equal(youtubeEmbed('https://youtube.com.evil.test/watch?v=aqz-KE-bpKQ'), null)
  assert.equal(youtubeEmbed('javascript:alert(1)'), null)
})

test('실행 가능한 이미지와 잘못된 영상 링크는 저장하지 않는다', () => {
  assert.ok(validateArticle({ ...draft(), image: 'javascript:alert(1)' }, 'draft').length)
  assert.ok(validateArticle({ ...draft(), body: [{ paragraphs: [], youtubeUrl: 'https://example.com/video' }] }, 'draft').length)
})
