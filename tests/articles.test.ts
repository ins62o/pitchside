import assert from 'node:assert/strict'
import test from 'node:test'
import { articles, filterArticles } from '../src/articles.ts'

test('K리그2 분류는 다른 분류의 기사를 포함하지 않는다', () => {
  const result = filterArticles({ category: 'K리그2' })
  assert.ok(result.length > 0)
  assert.ok(result.every((article) => article.category === 'K리그2'))
})

test('검색은 제목과 요약을 함께 찾고 앞뒤 공백을 무시한다', () => {
  const article = articles.find((item) => item.id === 'away-end')!
  assert.ok(article)
  assert.ok(filterArticles({ query: '  원정석  ' }).includes(article))
  assert.ok(filterArticles({ query: '응원가' }).includes(article))
})

test('매거진 필터와 검색을 함께 적용하고 결과가 없으면 빈 목록을 반환한다', () => {
  const result = filterArticles({ section: 'magazine', query: '축구' })
  assert.ok(result.length > 0)
  assert.ok(result.every((article) => article.section === 'magazine'))
  assert.deepEqual(filterArticles({ query: '존재하지않는검색어' }), [])
})
